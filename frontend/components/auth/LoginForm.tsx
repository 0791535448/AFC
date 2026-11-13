'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Shield, Lock, KeyRound } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000'

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request')
  const [forgotIdentifier, setForgotIdentifier] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('reset_token')
    if (token) {
      setResetToken(token)
      setForgotStep('reset')
      setForgotOpen(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(username, password)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError('')
    setForgotMessage('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier })
      })
      const data = await res.json()
      if (res.ok) {
        setForgotMessage(data.message || 'If an account exists, a reset code has been sent.')
        setForgotStep('reset')
      } else {
        setForgotError(data.detail || 'Something went wrong. Please try again.')
      }
    } catch {
      setForgotError('Cannot connect to server. Please check your connection.')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.')
      return
    }
    setForgotLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, new_password: newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        setForgotMessage('Password reset successfully. You can now sign in with your new password.')
        setForgotStep('request')
        setNewPassword('')
        setConfirmPassword('')
        setResetToken('')
      } else {
        setForgotError(data.detail || 'Reset failed. Please try again.')
      }
    } catch {
      setForgotError('Cannot connect to server. Please check your connection.')
    } finally {
      setForgotLoading(false)
    }
  }

  const closeForgot = () => {
    setForgotOpen(false)
    setForgotStep('request')
    setForgotError('')
    setForgotMessage('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ICT Infrastructure System
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access the infrastructure management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setForgotOpen(true); setForgotMessage(''); setForgotError('') }}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </form>

        </CardContent>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={(open) => { if (!open) closeForgot(); else setForgotOpen(true) }}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <KeyRound className="h-5 w-5 text-blue-600" />
              <span>Reset Password</span>
            </DialogTitle>
            <DialogDescription>
              {forgotStep === 'request'
                ? 'Enter your username or email to receive a reset code.'
                : 'Enter the 6-digit reset code you received and choose a new password.'}
            </DialogDescription>
          </DialogHeader>

          {forgotMessage && forgotStep === 'request' && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{forgotMessage}</AlertDescription>
            </Alert>
          )}
          {forgotError && (
            <Alert variant="destructive">
              <AlertDescription>{forgotError}</AlertDescription>
            </Alert>
          )}

          {forgotStep === 'request' ? (
            <form onSubmit={handleForgotRequest} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="forgot-identifier">Username or Email</Label>
                <Input
                  id="forgot-identifier"
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="Enter your username or email"
                  required
                  disabled={forgotLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={forgotLoading}>
                {forgotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="reset-token">Reset Code (OTP)</Label>
                <Input
                  id="reset-token"
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  required
                  disabled={forgotLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  disabled={forgotLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  disabled={forgotLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={forgotLoading}>
                {forgotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reset Password
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
