'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import {
  Monitor,
  Home,
  Ticket,
  Plus,
  LogOut,
  User,
  CheckCircle,
  Clock,
  Package,
  Edit2,
  ClipboardList,
  MonitorSmartphone,
  FileText,
  Wrench,
  ChevronRight
} from 'lucide-react'
import { IssueNotesContent, RepairFormContent } from '@/components/reports/ReportsContent'

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
  department?: string
}

interface Asset {
  id: number
  asset_code: string
  asset_name: string
  brand: string
  serial_number: string
  location: string
  assigned_user: string
  asset_status: string
  acknowledged_at: string | null
}

const faultCategories = ['hardware', 'software', 'network', 'account', 'other']
const faultPriorities = ['Low', 'Medium', 'High', 'Critical']
const ticketStatuses = ['Submitted', 'In Progress', 'Resolved', 'Closed']

export const OfficerPortal: React.FC = () => {
  const { user, logout } = useAuth()
  const [reports, setReports] = useState<FaultReport[]>([])
  const [users, setUsers] = useState<PortalUser[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeSection, setActiveSection] = useState('overview')
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { id: 'tickets', label: 'Support Tickets', icon: <Ticket className="h-4 w-4" /> },
    { id: 'equipment', label: 'Equipment', icon: <Package className="h-4 w-4" /> },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="h-4 w-4" />,
      children: [
        { id: 'issue-notes', label: 'Issue Notes', icon: <FileText className="h-4 w-4" /> },
        { id: 'repair-form', label: 'Repair Form', icon: <Wrench className="h-4 w-4" /> }
      ]
    }
  ]

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId])
  }

  // Register issue modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    subject: '', description: '', category: 'hardware', priority: 'Medium',
    asset_tag: '', reported_by: ''
  })

  // Ticket update modal
  const [editingTicket, setEditingTicket] = useState<FaultReport | null>(null)
  const [ticketForm, setTicketForm] = useState({
    status: 'Submitted', priority: 'Medium', resolution_notes: '', assigned_to: ''
  })

  // Issue equipment modal
  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [issueForm, setIssueForm] = useState({ asset_id: '', assigned_to: '' })

  const [submitting, setSubmitting] = useState(false)

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 4000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [reportsRes, usersRes, assetsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/fault-reports?t=${Date.now()}`),
        fetch(`${API_BASE_URL}/api/users?t=${Date.now()}`),
        fetch(`${API_BASE_URL}/dev/assets?t=${Date.now()}`)
      ])
      if (reportsRes.ok) setReports((await reportsRes.json()).fault_reports || [])
      if (usersRes.ok) setUsers((await usersRes.json()).users || [])
      if (assetsRes.ok) setAssets(await assetsRes.json())
    } catch (error) {
      console.error('Error loading officer data:', error)
      showMessage('Error loading data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredReports = useMemo(() => {
    if (statusFilter === 'all') return reports
    return reports.filter(r => r.status === statusFilter)
  }, [reports, statusFilter])

  const stats = useMemo(() => ({
    total: reports.length,
    open: reports.filter(r => ['Submitted', 'In Progress'].includes(r.status)).length,
    resolved: reports.filter(r => ['Resolved', 'Closed'].includes(r.status)).length,
    unassigned: reports.filter(r => !r.assigned_to && ['Submitted', 'In Progress'].includes(r.status)).length
  }), [reports])

  const handleRegisterIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/fault-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registerForm,
          assigned_to: user?.username || '',
          department: users.find(u => u.username === registerForm.reported_by)?.department || ''
        })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to register issue')
      }
      showMessage('Issue registered successfully')
      setIsRegisterOpen(false)
      setRegisterForm({ subject: '', description: '', category: 'hardware', priority: 'Medium', asset_tag: '', reported_by: '' })
      await loadData()
    } catch (error) {
      console.error('Error registering issue:', error)
      showMessage(error instanceof Error ? error.message : 'Error registering issue')
    } finally {
      setSubmitting(false)
    }
  }

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

  const handleIssueEquipment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueForm.asset_id || !issueForm.assigned_to) {
      showMessage('Please select both an asset and a user')
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/${issueForm.asset_id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: issueForm.assigned_to })
      })
      if (!response.ok) throw new Error('Failed to assign asset')
      showMessage('Equipment issued successfully')
      setIsIssueOpen(false)
      setIssueForm({ asset_id: '', assigned_to: '' })
      await loadData()
    } catch (error) {
      console.error('Error issuing equipment:', error)
      showMessage('Error issuing equipment')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-purple-100 text-purple-800'
      case 'Admin': return 'bg-blue-100 text-blue-800'
      case 'Technician': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const sectionTitles: Record<string, { title: string; subtitle: string }> = {
    overview: { title: 'Dashboard', subtitle: 'Overview of ICT support operations' },
    tickets: { title: 'Support Tickets', subtitle: 'All registered ICT issues' },
    equipment: { title: 'Equipment', subtitle: 'ICT equipment assignments' },
    'issue-notes': { title: 'Issue Notes', subtitle: 'Repair and maintenance records' },
    'repair-form': { title: 'Repair Form', subtitle: 'Computer repair and maintenance memo' }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-green-700 shadow-lg flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-green-600 flex items-center space-x-2">
          <div className="p-2 bg-white rounded-lg">
            <Monitor className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <span className="font-semibold text-white block">ICT System</span>
            <span className="text-xs text-green-200">Officer Portal</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <div key={item.id}>
              <Button
                variant={activeSection === item.id || item.children?.some(c => c.id === activeSection) ? 'default' : 'ghost'}
                className={`w-full justify-start ${activeSection === item.id || item.children?.some(c => c.id === activeSection)
                  ? 'bg-white text-green-800 hover:bg-green-50'
                  : 'text-green-50 hover:bg-green-600 hover:text-white'}`}
                onClick={() => {
                  if (item.children) {
                    toggleMenu(item.id)
                  } else {
                    setActiveSection(item.id)
                  }
                }}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
                {item.children && (
                  <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${expandedMenus.includes(item.id) ? 'rotate-90' : ''}`} />
                )}
              </Button>
              {item.children && (expandedMenus.includes(item.id) || item.children.some(c => c.id === activeSection)) && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.id}
                      variant={activeSection === child.id ? 'default' : 'ghost'}
                      size="sm"
                      className={`w-full justify-start ${activeSection === child.id
                        ? 'bg-white text-green-800 hover:bg-green-50'
                        : 'text-green-50 hover:bg-green-600 hover:text-white'}`}
                      onClick={() => setActiveSection(child.id)}
                    >
                      {child.icon}
                      <span className="ml-2">{child.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-green-600">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-700 text-sm font-medium">{user?.full_name?.charAt(0) || 'O'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <Badge className={getRoleColor(user?.role || '')}>{user?.role}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full text-green-50 hover:bg-green-600 hover:text-white">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sectionTitles[activeSection]?.title}</h1>
              <p className="text-sm text-gray-600">{sectionTitles[activeSection]?.subtitle}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MonitorSmartphone className="h-4 w-4 mr-2" />
                    Issue Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>Issue ICT Equipment</DialogTitle>
                    <DialogDescription>Assign an asset to a user. They will be asked to acknowledge receipt.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleIssueEquipment} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Asset *</Label>
                      <Select value={issueForm.asset_id} onValueChange={(v) => setIssueForm(prev => ({ ...prev, asset_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                        <SelectContent>
                          {assets.map(a => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {a.asset_code} — {a.asset_name} ({a.brand || 'N/A'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>User *</Label>
                      <Select value={issueForm.assigned_to} onValueChange={(v) => setIssueForm(prev => ({ ...prev, assigned_to: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                        <SelectContent>
                          {users.map(u => (
                            <SelectItem key={u.id} value={u.username}>
                              {u.full_name} (@{u.username})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsIssueOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={submitting}>Issue Equipment</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Register Issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>Register ICT Issue</DialogTitle>
                    <DialogDescription>Create a support ticket on behalf of a user.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleRegisterIssue} className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Reported By (User) *</Label>
                        <Select value={registerForm.reported_by} onValueChange={(v) => setRegisterForm(prev => ({ ...prev, reported_by: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                          <SelectContent>
                            {users.map(u => (
                              <SelectItem key={u.id} value={u.username}>
                                {u.full_name} (@{u.username})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select value={registerForm.category} onValueChange={(v) => setRegisterForm(prev => ({ ...prev, category: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {faultCategories.map(c => (
                              <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Subject *</Label>
                        <Input
                          value={registerForm.subject}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="e.g., Printer not working"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Priority *</Label>
                        <Select value={registerForm.priority} onValueChange={(v) => setRegisterForm(prev => ({ ...prev, priority: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {faultPriorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Asset Tag (optional)</Label>
                        <Input
                          value={registerForm.asset_tag}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, asset_tag: e.target.value }))}
                          placeholder="e.g., ICT001"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Description *</Label>
                        <textarea
                          value={registerForm.description}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe the issue..."
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={submitting || !registerForm.reported_by}>
                        {submitting ? 'Registering...' : 'Register Issue'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Stats - overview */}
          {activeSection === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                      </div>
                      <Ticket className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Open</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Resolved/Closed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Unassigned</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.unassigned}</p>
                      </div>
                      <ClipboardList className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Welcome, {user?.full_name}!</CardTitle>
                  <CardDescription>
                    Use the sidebar to manage support tickets, register issues, or issue ICT equipment.
                  </CardDescription>
                </CardHeader>
              </Card>
            </>
          )}

          {/* Support Tickets */}
          {(activeSection === 'overview' || activeSection === 'tickets') && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Support Tickets</CardTitle>
                    <CardDescription>All registered ICT issues — update status and repair progress</CardDescription>
                  </div>
                  {activeSection === 'tickets' && (
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {ticketStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                            <td className="px-4 py-3"><Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge></td>
                            <td className="px-4 py-3"><Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge></td>
                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <Button variant="ghost" size="sm" onClick={() => openTicketEdit(ticket)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Equipment Assignments */}
          {(activeSection === 'overview' || activeSection === 'equipment') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Equipment Assignments
                </CardTitle>
                <CardDescription>Assets currently assigned to users</CardDescription>
              </CardHeader>
              <CardContent>
                {assets.filter(a => a.assigned_user).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No equipment currently assigned.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assets.filter(a => a.assigned_user).map(asset => (
                      <div key={asset.id} className="border rounded-lg p-4">
                        <p className="font-medium text-gray-900">
                          {asset.asset_name} <span className="text-gray-500 font-normal">({asset.asset_code})</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {asset.brand || 'N/A'} • S/N: {asset.serial_number || 'N/A'} • {asset.location || 'No location'}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge className={asset.acknowledged_at ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {asset.acknowledged_at ? 'Acknowledged' : 'Pending acknowledgment'}
                          </Badge>
                          <span className="text-xs text-gray-500">→ {asset.assigned_user}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Issue Notes */}
          {activeSection === 'issue-notes' && <IssueNotesContent />}

          {/* Repair Form */}
          {activeSection === 'repair-form' && <RepairFormContent />}

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
                          {users.filter(u => ['Technician', 'ICT Officer'].includes(u.role)).map(u => (
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
        </main>
      </div>
    </div>
  )
}
