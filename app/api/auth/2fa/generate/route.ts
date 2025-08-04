import { type NextRequest, NextResponse } from "next/server"
import speakeasy from "speakeasy"
import QRCode from "qrcode"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    // Get user from token (you'd implement proper auth middleware)
    const accessToken = request.cookies.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || "your-secret-key") as any

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SecureAuth (${decoded.email})`,
      issuer: "SecureAuth",
      length: 32,
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
    })
  } catch (error) {
    console.error("2FA generation error:", error)
    return NextResponse.json({ error: "Failed to generate 2FA setup" }, { status: 500 })
  }
}
