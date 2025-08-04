import mongoose, { Schema, type Document } from "mongoose"

export interface ILoginAttempt extends Document {
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  failureReason?: string
  attemptedAt: Date
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
  failureReason: {
    type: String,
    enum: ["INVALID_CREDENTIALS", "ACCOUNT_LOCKED", "EMAIL_NOT_VERIFIED", "CAPTCHA_FAILED"],
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
})

// Create indexes separately
LoginAttemptSchema.index({ email: 1, attemptedAt: -1 })
LoginAttemptSchema.index({ ipAddress: 1, attemptedAt: -1 })
LoginAttemptSchema.index({ success: 1, attemptedAt: -1 })
LoginAttemptSchema.index({ attemptedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

export const LoginAttempt =
  mongoose.models.LoginAttempt || mongoose.model<ILoginAttempt>("LoginAttempt", LoginAttemptSchema)
