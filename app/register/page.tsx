"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Shield, CheckCircle, XCircle } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  // Password strength validation
  const validatePassword = (password: string) => {
    const feedback = []
    let strength = 0

    if (password.length >= 8) {
      strength += 20
    } else {
      feedback.push("At least 8 characters required")
    }

    if (/[A-Z]/.test(password)) {
      strength += 20
    } else {
      feedback.push("Add uppercase letters")
    }

    if (/[a-z]/.test(password)) {
      strength += 20
    } else {
      feedback.push("Add lowercase letters")
    }

    if (/\d/.test(password)) {
      strength += 20
    } else {
      feedback.push("Add numbers")
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 20
    } else {
      feedback.push("Add special characters")
    }

    setPasswordStrength(strength)
    setPasswordFeedback(feedback)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "password") {
      validatePassword(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (passwordStrength < 80) {
      setError("Password does not meet security requirements")
      setIsLoading(false)
      return
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          captchaToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Registration successful! Please check your email to verify your account.")
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        })
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
      } else {
        setError(data.error || "Registration failed")
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
      }
    } catch (err) {
      setError("Network error. Please try again.")
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Weak"
    if (passwordStrength < 80) return "Medium"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up with enterprise-grade security</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {formData.password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Password Strength:</span>
                    <span
                      className={`font-medium ${
                        passwordStrength < 40
                          ? "text-red-600"
                          : passwordStrength < 80
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {getStrengthText()}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />
                  {passwordFeedback.length > 0 && (
                    <div className="space-y-1">
                      {passwordFeedback.map((feedback, index) => (
                        <div key={index} className="flex items-center text-sm text-red-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          {feedback}
                        </div>
                      ))}
                    </div>
                  )}
                  {passwordStrength === 100 && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Password meets all requirements
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                onChange={setCaptchaToken}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
