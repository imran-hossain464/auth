import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 })

    // Clear authentication cookies
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
    })

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
    })

    // In production, you might want to:
    // 1. Add the tokens to a blacklist
    // 2. Log the logout event
    // 3. Clear any session data from database

    return response
  } catch (error) {
    console.error("Logout error:", error)

    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
