"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, Shield, Copy, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TwoFactorSetupPage() {
  const [step, setStep] = useState(1)
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    generateQRCode()
  }, [])

  const generateQRCode = async () => {
    try {
      const response = await fetch("/api/auth/2fa/generate", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
      } else {
        setError("Failed to generate QR code")
      }
    } catch (err) {
      setError("Network error occurred")
    }
  }

  const verifyAndEnable2FA = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: verificationCode,
          secret: secret,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setBackupCodes(data.backupCodes)
        setSuccess("Two-factor authentication enabled successfully!")
        setStep(3)
      } else {
        setError(data.error || "Verification failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAllBackupCodes = () => {
    const codes = backupCodes.join("\n")
    navigator.clipboard.writeText(codes)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Two-Factor Authentication Setup</h1>
          <p className="text-gray-600 mt-2">Secure your account with an additional layer of protection</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Step 1: Scan QR Code */}
        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Step 1: Install Authenticator App</CardTitle>
              <CardDescription>Download and install an authenticator app on your mobile device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Recommended Apps</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Google Authenticator</li>
                    <li>• Microsoft Authenticator</li>
                    <li>• Authy</li>
                    <li>• 1Password</li>
                  </ul>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">QR Code</h3>
                  {qrCode ? (
                    <div className="flex justify-center">
                      <img src={qrCode || "/placeholder.svg"} alt="2FA QR Code" className="w-32 h-32" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 animate-pulse mx-auto rounded"></div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium">Manual Entry Key</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">{secret}</code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(secret)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Use this key if you can't scan the QR code</p>
              </div>

              <Button onClick={() => setStep(2)} className="w-full">
                I've Added the Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Step 2: Verify Setup</CardTitle>
              <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-gray-500 text-center">Enter the 6-digit code from your authenticator app</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={verifyAndEnable2FA}
                  disabled={verificationCode.length !== 6 || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Step 3: Save Backup Codes</CardTitle>
              <CardDescription>
                Store these backup codes in a safe place. You can use them to access your account if you lose your
                phone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm font-medium">Backup Codes</Label>
                  <Button variant="outline" size="sm" onClick={copyAllBackupCodes}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">{code}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Each backup code can only be used once. Store them securely and don't
                  share them with anyone.
                </AlertDescription>
              </Alert>

              <Link href="/dashboard">
                <Button className="w-full">Complete Setup</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
