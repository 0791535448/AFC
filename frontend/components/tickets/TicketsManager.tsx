'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { TicketComments } from '@/components/tickets/TicketComments'
import { Edit2, Download, Printer } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000'

interface FaultReport {
  id: number
  ticket_number: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  reported_by: string
  assigned_to: string | null
  department: string
  asset_tag: string
  resolution_notes: string
  resolved_at: string | null
  created_at: string
}

interface PortalUser {
  id: number
  username: string
  full_name: string
  role: string
}

const faultCategories = ['hardware', 'software', 'network', 'account', 'other']
const faultPriorities = ['Low', 'Medium', 'High', 'Critical']
const ticketStatuses = ['Submitted', 'In Progress', 'Resolved', 'Closed']

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Submitted': return 'bg-blue-100 text-blue-800'
    case 'In Progress': return 'bg-yellow-100 text-yellow-800'
    case 'Resolved': return 'bg-green-100 text-green-800'
    case 'Closed': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'hardware': return 'bg-orange-100 text-orange-800'
    case 'software': return 'bg-blue-100 text-blue-800'
    case 'network': return 'bg-purple-100 text-purple-800'
    case 'account': return 'bg-teal-100 text-teal-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'bg-red-100 text-red-800'
    case 'High': return 'bg-orange-100 text-orange-800'
    case 'Medium': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

interface TicketsManagerProps {
  showFilters?: boolean
}

export const TicketsManager: React.FC<TicketsManagerProps> = ({ showFilters = true }) => {
  const { user } = useAuth()
  const [reports, setReports] = useState<FaultReport[]>([])
  const [users, setUsers] = useState<PortalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingTicket, setEditingTicket] = useState<FaultReport | null>(null)
  const [ticketForm, setTicketForm] = useState({
    status: 'Submitted', priority: 'Medium', resolution_notes: '', assigned_to: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 4000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [reportsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/fault-reports?t=${Date.now()}`),
        fetch(`${API_BASE_URL}/api/users?t=${Date.now()}`)
      ])
      if (reportsRes.ok) setReports((await reportsRes.json()).fault_reports || [])
      if (usersRes.ok) setUsers((await usersRes.json()).users || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredReports = useMemo(() => {
    return reports.filter(r =>
      (statusFilter === 'all' || r.status === statusFilter) &&
      (categoryFilter === 'all' || r.category === categoryFilter)
    )
  }, [reports, statusFilter, categoryFilter])

  const openTicketEdit = (ticket: FaultReport) => {
    setEditingTicket(ticket)
    setTicketForm({
      status: ticket.status,
      priority: ticket.priority,
      resolution_notes: ticket.resolution_notes || '',
      assigned_to: ticket.assigned_to || ''
    })
  }

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTicket) return
    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/fault-reports/${editingTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to update ticket')
      }
      showMessage('Ticket updated successfully')
      setEditingTicket(null)
      await loadData()
    } catch (error) {
      console.error('Error updating ticket:', error)
      showMessage(error instanceof Error ? error.message : 'Error updating ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Ticket', 'Subject', 'Description', 'Reported By', 'Assigned To', 'Department', 'Type', 'Priority', 'Status', 'Asset Tag', 'Resolution Notes', 'Date Reported', 'Resolved At']
    const rows = filteredReports.map(t => [
      t.ticket_number, t.subject, t.description, t.reported_by, t.assigned_to || '',
      t.department, t.category, t.priority, t.status, t.asset_tag,
      t.resolution_notes, t.created_at, t.resolved_at || ''
    ])
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printTickets = () => {
    const rows = filteredReports.map(t => `
      <tr>
        <td>${t.ticket_number}</td><td>${t.subject}</td><td>${t.reported_by}</td>
        <td>${t.assigned_to || 'Unassigned'}</td><td>${t.category}</td><td>${t.priority}</td>
        <td>${t.status}</td><td>${new Date(t.created_at).toLocaleDateString()}</td>
      </tr>`).join('')
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Support Tickets</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { font-size: 18px; } p.sub { color: #666; font-size: 12px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
        th { background: #f0f0f0; }
      </style></head><body>
      <h1>AFC — ICT Support Tickets</h1>
      <p class="sub">Exported ${new Date().toLocaleString()} • ${filteredReports.length} ticket(s)</p>
      <table><thead><tr>
        <th>Ticket</th><th>Subject</th><th>Reported By</th><th>Assigned To</th>
        <th>Type</th><th>Priority</th><th>Status</th><th>Date</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <script>window.onload = () => { window.print(); }</script>
      </body></html>`)
    win.document.close()
  }

  return (
    <>
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">{message}</div>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>All registered ICT issues — update status and repair progress</CardDescription>
            </div>
            {showFilters && (
              <div className="flex items-center space-x-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {faultCategories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {ticketStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportCSV} disabled={filteredReports.length === 0}>
                  <Download className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={printTickets} disabled={filteredReports.length === 0}>
                  <Printer className="h-4 w-4 mr-1" /> PDF
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : filteredReports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tickets found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ticket.ticket_number}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                        {ticket.asset_tag && <p className="text-xs text-gray-500">Asset: {ticket.asset_tag}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ticket.reported_by}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{ticket.assigned_to || <span className="text-gray-400">Unassigned</span>}</td>
                      <td className="px-4 py-3"><Badge className={getCategoryColor(ticket.category)}>{ticket.category}</Badge></td>
                      <td className="px-4 py-3"><Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge></td>
                      <td className="px-4 py-3"><Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <TicketComments
                            reportId={ticket.id}
                            ticketLabel={`${ticket.ticket_number} — ${ticket.subject}`}
                            currentUsername={user?.username || ''}
                            currentName={user?.full_name || ''}
                            readOnly={ticket.status === 'Resolved' || ticket.status === 'Closed'}
                          />
                          <Button variant="ghost" size="sm" onClick={() => openTicketEdit(ticket)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Ticket Modal */}
      <Dialog open={!!editingTicket} onOpenChange={(open) => !open && setEditingTicket(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Update Ticket {editingTicket?.ticket_number}</DialogTitle>
            <DialogDescription>{editingTicket?.subject}</DialogDescription>
          </DialogHeader>
          {editingTicket && (
            <form onSubmit={handleUpdateTicket} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status (repair progress) *</Label>
                  <Select value={ticketForm.status} onValueChange={(v) => setTicketForm(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ticketStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select value={ticketForm.priority} onValueChange={(v) => setTicketForm(prev => ({ ...prev, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {faultPriorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Assigned To (officer)</Label>
                  <Select value={ticketForm.assigned_to} onValueChange={(v) => setTicketForm(prev => ({ ...prev, assigned_to: v }))}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      {users.filter(u => ['Technician', 'ICT Officer', 'Senior ICT Officer', 'ICT Intern'].includes(u.role)).map(u => (
                        <SelectItem key={u.id} value={u.username}>{u.full_name} (@{u.username})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Resolution Notes</Label>
                  <textarea
                    value={ticketForm.resolution_notes}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, resolution_notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What was done to resolve the issue..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingTicket(null)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>Update Ticket</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
