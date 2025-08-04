import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { LoginAttempt } from "@/models/LoginAttempt"
import { RateLimiter, SecurityLogger, getClientIP } from "@/lib/security"

// Input validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
  captchaToken: z.string().optional(),
})

const rateLimiter = new RateLimiter()

// Verify reCAPTCHA
async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!token) return true // CAPTCHA not required for first few attempts

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    })

    const data = await response.json()
    return data.success && data.score > 0.5
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const ip = getClientIP(request)
    const userAgent = request.headers.get("user-agent") || ""

    // Rate limiting
    const rateLimit = rateLimiter.check(ip, 5, 15 * 60 * 1000, 30 * 60 * 1000)

    if (!rateLimit.allowed) {
      await SecurityLogger.logEvent({
        eventType: "LOGIN_RATE_LIMIT_EXCEEDED",
        description: "Login rate limit exceeded",
        ipAddress: ip,
        userAgent,
      })

      return NextResponse.json(
        { error: "Too many failed login attempts. Account temporarily locked." },
        { status: 429 },
      )
    }

    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Check recent failed attempts for this email
    const recentFailedAttempts = await LoginAttempt.countDocuments({
      email: validatedData.email.toLowerCase(),
      success: false,
      attemptedAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
    })

    // Require CAPTCHA after 2 failed attempts
    if (recentFailedAttempts >= 2 && validatedData.captchaToken) {
      const isValidCaptcha = await verifyRecaptcha(validatedData.captchaToken)
      if (!isValidCaptcha) {
        return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 400 })
      }
    }

    // Find user
    const user = await User.findOne({ email: validatedData.email.toLowerCase() })

    // Log login attempt
    const loginAttempt = new LoginAttempt({
      email: validatedData.email.toLowerCase(),
      ipAddress: ip,
      userAgent,
      success: false,
      failureReason: "INVALID_CREDENTIALS",
    })

    if (!user) {
      await loginAttempt.save()
      await SecurityLogger.logEvent({
        eventType: "LOGIN_FAILED",
        description: "Login attempt with non-existent email",
        ipAddress: ip,
        userAgent,
        metadata: { email: validatedData.email, reason: "USER_NOT_FOUND" },
      })

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      await loginAttempt.save()
      await SecurityLogger.logEvent({
        userId: user._id.toString(),
        eventType: "LOGIN_BLOCKED",
        description: "Login attempt on locked account",
        ipAddress: ip,
        userAgent,
      })

      return NextResponse.json({ error: "Account is temporarily locked" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)

    if (!isValidPassword) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        await SecurityLogger.logEvent({
          userId: user._id.toString(),
          eventType: "ACCOUNT_LOCKED",
          description: "Account locked due to multiple failed login attempts",
          ipAddress: ip,
          userAgent,
        })
      }

      await user.save()
      await loginAttempt.save()

      await SecurityLogger.logEvent({
        userId: user._id.toString(),
        eventType: "LOGIN_FAILED",
        description: "Login failed - invalid password",
        ipAddress: ip,
        userAgent,
        metadata: { failedAttempts: user.failedLoginAttempts },
      })

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if email is verified
    if (!user.emailVerified) {
      await loginAttempt.save()
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 401 })
    }

    // Successful login - reset failed attempts and update user
    user.failedLoginAttempts = 0
    user.accountLockedUntil = undefined
    user.lastLogin = new Date()
    user.lastLoginIP = ip
    await user.save()

    // Log successful login attempt
    loginAttempt.success = true
    loginAttempt.failureReason = undefined
    await loginAttempt.save()

    // Generate JWT tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    }

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: validatedData.rememberMe ? "30d" : "1d",
    })

    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
      {
        expiresIn: "30d",
      },
    )

    // Set secure cookies
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
      { status: 200 },
    )

    // Set HTTP-only cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: validatedData.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
    })

    // Reset rate limit on successful login
    rateLimiter.reset(ip)

    // Log successful login
    await SecurityLogger.logEvent({
      userId: user._id.toString(),
      eventType: "LOGIN_SUCCESS",
      description: "User logged in successfully",
      ipAddress: ip,
      userAgent,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 })
  }
}
