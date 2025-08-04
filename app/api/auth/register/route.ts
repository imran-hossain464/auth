import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { RateLimiter, SecurityLogger, getClientIP } from "@/lib/security"
import { EmailService } from "@/lib/email"
import { generateSecureToken } from "@/lib/security"

// Input validation schema
const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain uppercase letter")
      .regex(/[a-z]/, "Password must contain lowercase letter")
      .regex(/\d/, "Password must contain number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain special character"),
    confirmPassword: z.string(),
    captchaToken: z.string().min(1, "CAPTCHA verification required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const rateLimiter = new RateLimiter()

// Verify reCAPTCHA
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    })

    const data = await response.json()
    return data.success && data.score > 0.5 // For reCAPTCHA v3
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Rate limiting
    const ip = getClientIP(request)
    const rateLimit = rateLimiter.check(ip, 5, 15 * 60 * 1000) // 5 attempts per 15 minutes

    if (!rateLimit.allowed) {
      await SecurityLogger.logEvent({
        eventType: "RATE_LIMIT_EXCEEDED",
        description: "Registration rate limit exceeded",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || undefined,
      })

      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Verify reCAPTCHA
    const isValidCaptcha = await verifyRecaptcha(validatedData.captchaToken)
    if (!isValidCaptcha) {
      return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() })

    if (existingUser) {
      await SecurityLogger.logEvent({
        eventType: "REGISTRATION_DUPLICATE_EMAIL",
        description: "Attempted registration with existing email",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || undefined,
        metadata: { email: validatedData.email },
      })

      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds)

    // Generate email verification token
    const emailVerificationToken = generateSecureToken()
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const newUser = new User({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
      emailVerified: false,
      twoFactorEnabled: false,
      role: "user",
      registrationIP: ip,
      lastLoginIP: ip,
    })

    await newUser.save()

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(
        validatedData.email,
        `${validatedData.firstName} ${validatedData.lastName}`,
        emailVerificationToken,
      )
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Don't fail registration if email fails
    }

    // Log successful registration
    await SecurityLogger.logEvent({
      userId: newUser._id.toString(),
      eventType: "USER_REGISTERED",
      description: "New user registered successfully",
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      metadata: { email: validatedData.email },
    })

    // Reset rate limit on successful registration
    rateLimiter.reset(ip)

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        userId: newUser._id.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
