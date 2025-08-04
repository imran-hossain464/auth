"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, User, Settings, LogOut, CheckCircle, AlertTriangle, Smartphone, Key, Activity } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [securityStatus, setSecurityStatus] = useState({
    emailVerified: true,
    twoFactorEnabled: false,
    lastLogin: new Date().toISOString(),
    loginAttempts: 0,
  })

  useEffect(() => {
    // Simulate fetching user data
    setUser({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "user",
      createdAt: "2024-01-15",
    })
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleEnable2FA = () => {
    // Redirect to 2FA setup
    window.location.href = "/dashboard/2fa-setup"
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">SecureAuth</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.firstName}</span>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and security status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg">{user.email}</p>
                    {securityStatus.emailVerified && (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-lg capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verification</span>
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Auth</span>
                  {securityStatus.twoFactorEnabled ? (
                    <Badge variant="secondary" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Password Strength</span>
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Strong
                  </Badge>
                </div>
              </div>

              {!securityStatus.twoFactorEnabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Enable 2FA for enhanced security</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleEnable2FA}
                className="w-full"
                variant={securityStatus.twoFactorEnabled ? "outline" : "default"}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                {securityStatus.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent login and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Successful login</span>
                  </div>
                  <span className="text-sm text-gray-500">Just now</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Password changed</span>
                  </div>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Failed login attempt</span>
                  </div>
                  <span className="text-sm text-gray-500">1 week ago</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Account created</span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Activity className="h-4 w-4 mr-2" />
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
