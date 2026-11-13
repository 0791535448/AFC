'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { KeyRound, Loader2 } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000'

interface ChangePasswordDialogProps {
  username: string
  variant?: 'icon' | 'button'
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ username, variant = 'icon' }) => {
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const reset = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          current_password: currentPassword,
          new_password: newPassword
        })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message || 'Password changed successfully')
        setTimeout(() => { setOpen(false); reset() }, 1500)
      } else {
        setError(data.detail || 'Failed to change password')
      }
    } catch {
      setError('Cannot connect to server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900" title="Change password">
            <KeyRound className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <KeyRound className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <KeyRound className="h-5 w-5 text-blue-600" />
            <span>Change Password</span>
          </DialogTitle>
          <DialogDescription>Update the password for your account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="bg-green-50 border-green-200"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}
          <div className="space-y-2">
            <Label htmlFor="cp-current">Current Password</Label>
            <Input id="cp-current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-new">New Password</Label>
            <Input id="cp-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-confirm">Confirm New Password</Label>
            <Input id="cp-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Change Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
