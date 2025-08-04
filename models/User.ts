import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password: string
  emailVerified: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  backupCodes?: string[]
  role: "user" | "admin"
  failedLoginAttempts?: number
  accountLockedUntil?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  lastLogin?: Date
  lastPasswordChange: Date
  registrationIP?: string
  lastLoginIP?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      index: true,
    },
    emailVerificationExpires: {
      type: Date,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
    },
    backupCodes: [
      {
        type: String,
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      index: true,
    },
    passwordResetExpires: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    registrationIP: {
      type: String,
    },
    lastLoginIP: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
UserSchema.index({ emailVerificationToken: 1 })
UserSchema.index({ passwordResetToken: 1 })
UserSchema.index({ accountLockedUntil: 1 })

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
