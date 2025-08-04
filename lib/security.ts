import crypto from "crypto"
import type { NextRequest } from "next/server"
import { SecurityEvent } from "@/models/SecurityEvent"
import { connectDB } from "@/lib/mongodb"

// Password strength validation
export function validatePasswordStrength(password: string): {
  score: number
  feedback: string[]
  isValid: boolean
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 20
  } else {
    feedback.push("Password must be at least 8 characters long")
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 20
  } else {
    feedback.push("Password must contain at least one uppercase letter")
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 20
  } else {
    feedback.push("Password must contain at least one lowercase letter")
  }

  // Number check
  if (/\d/.test(password)) {
    score += 20
  } else {
    feedback.push("Password must contain at least one number")
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 20
  } else {
    feedback.push("Password must contain at least one special character")
  }

  // Common password patterns check
  const commonPatterns = [/123456/, /password/i, /qwerty/i, /admin/i, /letmein/i]

  const hasCommonPattern = commonPatterns.some((pattern) => pattern.test(password))
  if (hasCommonPattern) {
    score -= 10
    feedback.push("Password contains common patterns")
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    feedback,
    isValid: score >= 80 && feedback.length === 0,
  }
}

// Generate secure random token
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

// Hash sensitive data
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

// Rate limiting helper
export class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number; blocked: boolean }>()

  check(
    identifier: string,
    maxAttempts = 5,
    windowMs: number = 15 * 60 * 1000,
    blockDurationMs: number = 30 * 60 * 1000,
  ): { allowed: boolean; attemptsLeft: number; resetTime: number } {
    const now = Date.now()
    const record = this.store.get(identifier)

    if (!record || now > record.resetTime) {
      this.store.set(identifier, { count: 1, resetTime: now + windowMs, blocked: false })
      return { allowed: true, attemptsLeft: maxAttempts - 1, resetTime: now + windowMs }
    }

    if (record.blocked) {
      return { allowed: false, attemptsLeft: 0, resetTime: record.resetTime }
    }

    if (record.count >= maxAttempts) {
      record.blocked = true
      record.resetTime = now + blockDurationMs
      return { allowed: false, attemptsLeft: 0, resetTime: record.resetTime }
    }

    record.count++
    return {
      allowed: true,
      attemptsLeft: maxAttempts - record.count,
      resetTime: record.resetTime,
    }
  }

  reset(identifier: string): void {
    this.store.delete(identifier)
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .trim()
    .substring(0, 1000) // Limit length
}

// Extract client IP
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return request.ip || "unknown"
}

// CSRF token generation and validation
export class CSRFProtection {
  private static secret = process.env.CSRF_SECRET || "default-csrf-secret"

  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString()
    const data = `${sessionId}:${timestamp}`
    const signature = crypto.createHmac("sha256", this.secret).update(data).digest("hex")

    return Buffer.from(`${data}:${signature}`).toString("base64")
  }

  static validateToken(token: string, sessionId: string): boolean {
    try {
      const decoded = Buffer.from(token, "base64").toString()
      const [session, timestamp, signature] = decoded.split(":")

      if (session !== sessionId) {
        return false
      }

      // Check if token is not older than 1 hour
      const tokenAge = Date.now() - Number.parseInt(timestamp)
      if (tokenAge > 60 * 60 * 1000) {
        return false
      }

      const expectedSignature = crypto.createHmac("sha256", this.secret).update(`${session}:${timestamp}`).digest("hex")

      return signature === expectedSignature
    } catch {
      return false
    }
  }
}

// Security event logger
export interface SecurityEventData {
  userId?: string
  eventType: string
  description: string
  ipAddress: string
  userAgent?: string
  metadata?: Record<string, any>
}

export class SecurityLogger {
  static async logEvent(event: SecurityEventData): Promise<void> {
    try {
      await connectDB()

      const securityEvent = new SecurityEvent({
        userId: event.userId,
        eventType: event.eventType,
        description: event.description,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata,
      })

      await securityEvent.save()

      // Also log to console for development
      console.log("Security Event:", {
        ...event,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to log security event:", error)
    }
  }

  static async logLoginAttempt(
    email: string,
    success: boolean,
    ipAddress: string,
    userAgent?: string,
    failureReason?: string,
  ): Promise<void> {
    await this.logEvent({
      eventType: success ? "LOGIN_SUCCESS" : "LOGIN_FAILED",
      description: success ? "Successful login" : `Failed login: ${failureReason}`,
      ipAddress,
      userAgent,
      metadata: { email, failureReason },
    })
  }
}
