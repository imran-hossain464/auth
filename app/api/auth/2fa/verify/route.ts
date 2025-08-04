import { type NextRequest, NextResponse } from "next/server"
import speakeasy from "speakeasy"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { generateSecureToken } from "@/lib/security"
import { EmailService } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get user from token
    const accessToken = request.cookies.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || "your-secret-key") as any
    const body = await request.json()

    const { token, secret } = body

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 2, // Allow 2 time steps of variance
    })

    if (!verified) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => generateSecureToken(4).toUpperCase())

    // Update user in database
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.twoFactorEnabled = true
    user.twoFactorSecret = secret
    user.backupCodes = backupCodes
    await user.save()

    // Send confirmation email
    try {
      await EmailService.sendTwoFactorEnabledEmail(user.email, `${user.firstName} ${user.lastName}`)
    } catch (emailError) {
      console.error("Failed to send 2FA enabled email:", emailError)
    }

    return NextResponse.json({
      message: "Two-factor authentication enabled successfully",
      backupCodes,
    })
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 })
  }
}
