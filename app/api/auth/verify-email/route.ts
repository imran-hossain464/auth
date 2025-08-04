import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { SecurityLogger, getClientIP } from "@/lib/security"

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { token } = verifyEmailSchema.parse(body)
    const ip = getClientIP(request)

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    })

    if (!user) {
      await SecurityLogger.logEvent({
        eventType: "EMAIL_VERIFICATION_FAILED",
        description: "Invalid or expired email verification token",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || undefined,
        metadata: { token },
      })

      return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 })
    }

    // Update user
    user.emailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    // Log successful verification
    await SecurityLogger.logEvent({
      userId: user._id.toString(),
      eventType: "EMAIL_VERIFIED",
      description: "Email address verified successfully",
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Email verification failed" }, { status: 500 })
  }
}
