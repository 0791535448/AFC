'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MessageSquare, Send, Loader2 } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000'

interface Comment {
  id: number
  report_id: number
  author: string
  author_name: string
  message: string
  archived?: number
  created_at: string
}

interface TicketCommentsProps {
  reportId: number
  ticketLabel: string
  currentUsername: string
  currentName: string
  readOnly?: boolean
}

export const TicketComments: React.FC<TicketCommentsProps> = ({ reportId, ticketLabel, currentUsername, currentName, readOnly = false }) => {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const loadComments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/fault-reports/${reportId}/comments?username=${encodeURIComponent(currentUsername)}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    if (open) loadComments()
  }, [open, reportId])

  const sendReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/fault-reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentUsername, author_name: currentName, message: reply.trim() })
      })
      if (res.ok) {
        setReply('')
        await loadComments()
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-1" />
          Messages
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle>Ticket Conversation</DialogTitle>
          <DialogDescription>{ticketLabel}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-2 min-h-[200px]">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No messages yet. Start the conversation below.</p>
          ) : (
            comments.map(c => {
              const mine = c.author === currentUsername
              return (
                <div key={c.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} ${c.archived ? 'opacity-60' : ''}`}>
                    <p className="text-xs opacity-75 mb-1">
                      {c.author_name || c.author} • {new Date(c.created_at).toLocaleString()}
                      {c.archived ? ' • archived' : ''}
                    </p>
                    <p className="whitespace-pre-wrap">{c.message}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        {readOnly ? (
          <p className="text-xs text-gray-500 text-center pt-2 border-t">This ticket is solved — the conversation is archived.</p>
        ) : (
          <div className="flex space-x-2 pt-2 border-t">
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendReply()}
              disabled={sending}
            />
            <Button onClick={sendReply} disabled={sending || !reply.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
