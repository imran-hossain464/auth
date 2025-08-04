import mongoose, { Schema, type Document } from "mongoose"

export interface ISecurityEvent extends Document {
  userId?: string
  eventType: string
  description: string
  ipAddress: string
  userAgent?: string
  metadata?: Record<string, any>
  createdAt: Date
}

const SecurityEventSchema = new Schema<ISecurityEvent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      "USER_REGISTERED",
      "LOGIN_SUCCESS",
      "LOGIN_FAILED",
      "LOGIN_BLOCKED",
      "ACCOUNT_LOCKED",
      "PASSWORD_CHANGED",
      "EMAIL_VERIFIED",
      "TWO_FACTOR_ENABLED",
      "TWO_FACTOR_DISABLED",
      "SUSPICIOUS_ACTIVITY",
      "RATE_LIMIT_EXCEEDED",
      "REGISTRATION_DUPLICATE_EMAIL",
      "EMAIL_VERIFICATION_FAILED",
    ],
  },
  description: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create indexes separately
SecurityEventSchema.index({ userId: 1, createdAt: -1 })
SecurityEventSchema.index({ eventType: 1, createdAt: -1 })
SecurityEventSchema.index({ ipAddress: 1, createdAt: -1 })
SecurityEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

export const SecurityEvent =
  mongoose.models.SecurityEvent || mongoose.model<ISecurityEvent>("SecurityEvent", SecurityEventSchema)
