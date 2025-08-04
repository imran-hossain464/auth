import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Key, Eye, UserCheck, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">SecureAuth</h1>
          </div>
          <nav className="flex space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Enterprise-Grade Security</h2>
          <p className="text-xl text-gray-600 mb-8">
            Complete authentication system with 20+ security features including 2FA, rate limiting, CSRF protection, and
            more.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="px-8 bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Security Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Lock className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Strong Password Policy</CardTitle>
              <CardDescription>
                Enforced minimum length, special characters, and strength validation using zxcvbn
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Key className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Password Hashing</CardTitle>
              <CardDescription>Secure bcrypt hashing with salt rounds for password storage</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>CAPTCHA Protection</CardTitle>
              <CardDescription>Google reCAPTCHA v3 integration to prevent bot abuse</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <UserCheck className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>Mandatory email verification before account activation</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>TOTP-based 2FA using authenticator apps for enhanced security</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Eye className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>Brute-force protection with intelligent rate limiting</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Additional Features */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Additional Security Measures</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4">Web Security</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• HTTPS-only enforcement</li>
                <li>• Content Security Policy (CSP)</li>
                <li>• XSS protection with input sanitization</li>
                <li>• CSRF protection on all forms</li>
                <li>• Secure HTTP headers with Helmet</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Session & Access Control</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• JWT with expiry and refresh tokens</li>
                <li>• Secure cookie handling</li>
                <li>• Role-based access control (RBAC)</li>
                <li>• Auto-logout on inactivity</li>
                <li>• Comprehensive audit logging</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 SecureAuth. Built with Next.js, MongoDB, and enterprise security practices.</p>
        </div>
      </footer>
    </div>
  )
}
