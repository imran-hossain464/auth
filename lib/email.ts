import nodemailer from "nodemailer" // fixed mismatched quotes

// Email configuration
const transporter = nodemailer.createTransport({ // fixed method name
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Email templates
const emailTemplates = {
  verification: (name: string, token: string) => ({
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">SecureAuth</h1>
        </div>
        
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            Thank you for registering with SecureAuth. To complete your registration and secure your account, 
            please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}" 
               style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; 
                      border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
            If the button doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style="color: #2563eb; font-size: 14px; word-break: break-all;">
            ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              <strong>Security Notice:</strong> This verification link will expire in 24 hours for your security.
            </p>
            <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">
              If you didn't create an account with SecureAuth, you can safely ignore this email.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            This is an automated message from SecureAuth. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name: string, token: string) => ({
    subject: "Reset Your Password - SecureAuth",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">SecureAuth</h1>
        </div>
        
        <div style="background-color: #fef2f2; padding: 30px; border-radius: 8px; border: 1px solid #fecaca;">
          <h2 style="color: #991b1b; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #7f1d1d; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #7f1d1d; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password for your SecureAuth account. If you made this request, 
            click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}" 
               style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; 
                      border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #991b1b; font-size: 14px; line-height: 1.5;">
            If the button doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style="color: #dc2626; font-size: 14px; word-break: break-all;">
            ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fecaca;">
            <p style="color: #991b1b; font-size: 14px; margin: 0;">
              <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security.
            </p>
            <p style="color: #991b1b; font-size: 14px; margin: 10px 0 0 0;">
              If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            This is an automated message from SecureAuth. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),

  twoFactorEnabled: (name: string) => ({
    subject: "Two-Factor Authentication Enabled - SecureAuth",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0;">SecureAuth</h1>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 30px; border-radius: 8px; border: 1px solid #bbf7d0;">
          <h2 style="color: #065f46; margin-top: 0;">Two-Factor Authentication Enabled</h2>
          <p style="color: #047857; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #047857; font-size: 16px; line-height: 1.5;">
            Two-factor authentication has been successfully enabled on your SecureAuth account. 
            Your account is now more secure with this additional layer of protection.
          </p>
          
          <div style="background-color: #dcfce7; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">What this means:</h3>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              <li>You'll need to enter a code from your authenticator app when signing in</li>
              <li>Your account is protected even if someone knows your password</li>
              <li>You have backup codes saved for emergency access</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #bbf7d0;">
            <p style="color: #047857; font-size: 14px; margin: 0;">
              <strong>Security Alert:</strong> If you didn't enable 2FA, please contact our support team immediately.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            This is an automated message from SecureAuth. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),

  suspiciousActivity: (name: string, activity: string, ipAddress: string) => ({
    subject: "Security Alert: Suspicious Activity Detected - SecureAuth",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">SecureAuth</h1>
        </div>
        
        <div style="background-color: #fef2f2; padding: 30px; border-radius: 8px; border: 1px solid #fecaca;">
          <h2 style="color: #991b1b; margin-top: 0;">🚨 Security Alert</h2>
          <p style="color: #7f1d1d; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #7f1d1d; font-size: 16px; line-height: 1.5;">
            We detected suspicious activity on your SecureAuth account that requires your immediate attention.
          </p>
          
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #991b1b; margin-top: 0; font-size: 18px;">Activity Details:</h3>
            <p style="color: #7f1d1d; margin: 5px 0;"><strong>Activity:</strong> ${activity}</p>
            <p style="color: #7f1d1d; margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
            <p style="color: #7f1d1d; margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="color: #7f1d1d; font-size: 16px; line-height: 1.5;">
            <strong>If this was you:</strong> You can ignore this email.
          </p>
          
          <p style="color: #7f1d1d; font-size: 16px; line-height: 1.5;">
            <strong>If this wasn't you:</strong> Please take immediate action to secure your account:
          </p>
          
          <ul style="color: #7f1d1d; margin: 10px 0; padding-left: 20px;">
            <li>Change your password immediately</li>
            <li>Enable two-factor authentication if not already enabled</li>
            <li>Review your recent account activity</li>
            <li>Check for any unauthorized changes</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; 
                      border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Secure My Account
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            This is an automated security alert from SecureAuth. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),
}

// Email service class
export class EmailService {
  static async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const template = emailTemplates.verification(name, token)

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "SecureAuth <noreply@secureauth.com>",
      to: email,
      subject: template.subject,
      html: template.html,
    })
  }

  static async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const template = emailTemplates.passwordReset(name, token)

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "SecureAuth <noreply@secureauth.com>",
      to: email,
      subject: template.subject,
      html: template.html,
    })
  }

  static async sendTwoFactorEnabledEmail(email: string, name: string): Promise<void> {
    const template = emailTemplates.twoFactorEnabled(name)

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "SecureAuth <noreply@secureauth.com>",
      to: email,
      subject: template.subject,
      html: template.html,
    })
  }

  static async sendSuspiciousActivityEmail(
    email: string,
    name: string,
    activity: string,
    ipAddress: string,
  ): Promise<void> {
    const template = emailTemplates.suspiciousActivity(name, activity, ipAddress)

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "SecureAuth <noreply@secureauth.com>",
      to: email,
      subject: template.subject,
      html: template.html,
    })
  }
}
