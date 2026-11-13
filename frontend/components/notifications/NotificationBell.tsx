'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck, AlertCircle, Info, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const API_BASE_URL = 'http://localhost:8000'

interface Notification {
  id: number
  username: string
  title: string
  message: string
  type: string
  is_read: number
  created_at: string
}

const typeIcon = (type: string) => {
  switch (type) {
    case 'issue': return <AlertCircle className="h-4 w-4 text-orange-500" />
    case 'assignment': return <UserPlus className="h-4 w-4 text-blue-500" />
    default: return <Info className="h-4 w-4 text-green-600" />
  }
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface NotificationBellProps {
  username: string
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ username }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    if (!username) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?username=${encodeURIComponent(username)}&t=${Date.now()}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnread(data.unread || 0)
      }
    } catch {
      // silently ignore polling errors
    }
  }, [username])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markRead = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'PUT' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch { /* ignore */ }
  }

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all?username=${encodeURIComponent(username)}`, { method: 'PUT' })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
      setUnread(0)
    } catch { /* ignore */ }
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-900" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[480px] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-gray-500 hover:text-gray-700">
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No notifications</p>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.is_read) markRead(n.id); }}
                  className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-gray-50 flex items-start space-x-3 ${n.is_read ? 'opacity-60' : ''}`}
                >
                  <div className="mt-0.5 flex-shrink-0">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.is_read ? 'font-normal text-gray-600' : 'font-semibold text-gray-900'}`}>{n.title}</p>
                    <p className="text-sm text-gray-600 truncate">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
