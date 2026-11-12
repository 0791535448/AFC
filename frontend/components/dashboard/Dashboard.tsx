'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminDashboard } from './AdminDashboard'
import { UserPortal } from '@/components/user/UserPortal'
import { OfficerPortal } from '@/components/user/OfficerPortal'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()

  // Admin users get the admin panel
  if (user?.role === 'Admin' || user?.role === 'Super Admin') {
    return <AdminDashboard />
  }

  // ICT Officers get the ticket/equipment management portal
  if (user?.role === 'ICT Officer') {
    return <OfficerPortal />
  }

  // All other roles (User, Technician) get the self-service portal
  return <UserPortal />
}
