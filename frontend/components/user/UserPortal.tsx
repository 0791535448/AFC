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
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog'
import { TicketComments } from '@/components/tickets/TicketComments'
import {
  Monitor,
  Home,
  ClipboardList,
  Package,
  Plus,
  LogOut,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Ticket
} from 'lucide-react'

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
  department: string
  asset_tag: string
  resolution_notes: string
  resolved_at: string | null
  created_at: string
}

interface AssignedAsset {
  id: number
  asset_code: string
  asset_name: string
  brand: string
  serial_number: string
  location: string
  asset_status: string
  acknowledged_at: string | null
}

const faultCategories = ['hardware', 'software', 'network', 'account', 'other']
const faultPriorities = ['Low', 'Medium', 'High', 'Critical']

export const UserPortal: React.FC = () => {
  const { user, logout } = useAuth()
  const [reports, setReports] = useState<FaultReport[]>([])
  const [assets, setAssets] = useState<AssignedAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [acknowledging, setAcknowledging] = useState<number | null>(null)
  const [ackAsset, setAckAsset] = useState<AssignedAsset | null>(null)
  const [signature, setSignature] = useState('')
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10))
  const [ackDialogOpen, setAckDialogOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { id: 'reports', label: 'My Issue Reports', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'equipment', label: 'My Equipment', icon: <Package className="h-4 w-4" /> }
  ]

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'hardware',
    priority: 'Medium',
    asset_tag: ''
  })

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 4000)
  }

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [reportsRes, assetsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/fault-reports?reported_by=${encodeURIComponent(user.username)}&t=${Date.now()}`),
        fetch(`${API_BASE_URL}/dev/assets?t=${Date.now()}`)
      ])

      if (reportsRes.ok) {
        const data = await reportsRes.json()
        setReports(data.fault_reports || [])
      }

      if (assetsRes.ok) {
        const data = await assetsRes.json()
        const mine = (data || []).filter((a: any) => {
          const assignee = (a.assigned_user || '').toString().toLowerCase()
          return assignee && (assignee === user.username.toLowerCase() || assignee === (user.full_name || '').toLowerCase())
        })
        setAssets(mine)
      }
    } catch (error) {
      console.error('Error loading portal data:', error)
      showMessage('Error loading data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = useMemo(() => ({
    total: reports.length,
    open: reports.filter(r => ['Submitted', 'In Progress'].includes(r.status)).length,
    resolved: reports.filter(r => ['Resolved', 'Closed'].includes(r.status)).length,
    equipment: assets.length,
    unacknowledged: assets.filter(a => !a.acknowledged_at).length
  }), [reports, assets])

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/fault-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reported_by: user.username,
          department: user.department || ''
        })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to submit report')
      }
      showMessage('Issue report submitted successfully')
      setIsReportModalOpen(false)
      setFormData({ subject: '', description: '', category: 'hardware', priority: 'Medium', asset_tag: '' })
      await loadData()
    } catch (error) {
      console.error('Error submitting report:', error)
      showMessage(error instanceof Error ? error.message : 'Error submitting report')
    } finally {
      setSubmitting(false)
    }
  }

  const openAcknowledgeDialog = (asset: AssignedAsset) => {
    setAckAsset(asset)
    setSignature(user?.full_name || '')
    setReceivedDate(new Date().toISOString().slice(0, 10))
    setAckDialogOpen(true)
  }

  const handleAcknowledge = async () => {
    if (!ackAsset) return
    if (!signature.trim()) {
      showMessage('Please type your full name as your signature')
      return
    }
    if (!receivedDate) {
      showMessage('Please enter the date you received the equipment')
      return
    }
    setAcknowledging(ackAsset.id)
    try {
      const response = await fetch(`${API_BASE_URL}/api/assets/${ackAsset.id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signature.trim(), received_date: receivedDate })
      })
      if (!response.ok) throw new Error('Failed to acknowledge')
      showMessage('Equipment receipt acknowledged — signature recorded on the issue note')
      setAckDialogOpen(false)
      setAckAsset(null)
      await loadData()
    } catch (error) {
      console.error('Error acknowledging asset:', error)
      showMessage('Error acknowledging equipment')
    } finally {
      setAcknowledging(null)
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
    overview: { title: 'Dashboard', subtitle: 'Overview of your ICT support activity' },
    reports: { title: 'My Issue Reports', subtitle: 'ICT issues you have submitted' },
    equipment: { title: 'My Equipment', subtitle: 'Assets assigned to you' }
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
            <span className="text-xs text-green-200">User Portal</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'default' : 'ghost'}
              className={activeSection === item.id
                ? 'w-full justify-start bg-white text-green-800 hover:bg-green-50'
                : 'w-full justify-start text-green-50 hover:bg-green-600 hover:text-white'}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-green-600">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-700 text-sm font-medium">{user?.full_name?.charAt(0) || 'U'}</span>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sectionTitles[activeSection]?.title}</h1>
              <p className="text-sm text-gray-600">{sectionTitles[activeSection]?.subtitle}</p>
            </div>
            <div className="flex items-center space-x-2">
              {user?.username && <NotificationBell username={user.username} />}
              {user?.username && user?.role === 'Super Admin' && <ChangePasswordDialog username={user.username} />}
              <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Report an Issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogDescription>Describe the issue and our ICT team will assist you.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitReport} className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="e.g., Laptop not connecting to network"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {faultCategories.map(c => (
                              <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority *</Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {faultPriorities.map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="asset_tag">Asset Tag (optional)</Label>
                        <Input
                          id="asset_tag"
                          value={formData.asset_tag}
                          onChange={(e) => setFormData(prev => ({ ...prev, asset_tag: e.target.value }))}
                          placeholder="e.g., ICT001"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description *</Label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the problem in detail..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Report'}
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

          {/* Stats - shown on overview */}
          {activeSection === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">My Tickets</p>
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
                        <p className="text-sm font-medium text-gray-600">Open Tickets</p>
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
                        <p className="text-sm font-medium text-gray-600">Resolved</p>
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
                        <p className="text-sm font-medium text-gray-600">My Equipment</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.equipment}</p>
                        {stats.unacknowledged > 0 && (
                          <p className="text-xs text-orange-600 flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {stats.unacknowledged} awaiting acknowledgment
                          </p>
                        )}
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Welcome, {user?.full_name}!</CardTitle>
                  <CardDescription>
                    Use the sidebar to report ICT issues, track your tickets, or view your assigned equipment.
                  </CardDescription>
                </CardHeader>
              </Card>
            </>
          )}

          {/* My Issue Reports */}
          {(activeSection === 'overview' || activeSection === 'reports') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  My Issue Reports
                </CardTitle>
                <CardDescription>ICT issue tickets you have submitted</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading...</p>
                ) : reports.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No issue reports yet. Click "Report an Issue" to submit one.</p>
                ) : (
                  <div className="space-y-3">
                    {reports.map(report => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{report.subject}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {report.ticket_number} • {new Date(report.created_at).toLocaleDateString()}
                              {report.asset_tag ? ` • Asset: ${report.asset_tag}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                            <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
                          </div>
                        </div>
                        {report.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{report.description}</p>
                        )}
                        {report.resolution_notes && (
                          <p className="text-sm text-green-700 mt-2 bg-green-50 rounded p-2">
                            Resolution: {report.resolution_notes}
                          </p>
                        )}
                        <div className="mt-3">
                          <TicketComments
                            reportId={report.id}
                            ticketLabel={`${report.ticket_number} — ${report.subject}`}
                            currentUsername={user?.username || ''}
                            currentName={user?.full_name || ''}
                            readOnly={report.status === 'Resolved' || report.status === 'Closed'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* My Equipment */}
          {(activeSection === 'overview' || activeSection === 'equipment') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  My Assigned Equipment
                </CardTitle>
                <CardDescription>Assets assigned to you — acknowledge receipt of new equipment</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading...</p>
                ) : assets.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No equipment is currently assigned to you.</p>
                ) : (
                  <div className="space-y-3">
                    {assets.map(asset => (
                      <div key={asset.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {asset.asset_name} <span className="text-gray-500 font-normal">({asset.asset_code})</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {asset.brand || 'Unknown brand'} • S/N: {asset.serial_number || 'N/A'} • {asset.location || 'No location'}
                          </p>
                          <div className="mt-1">
                            <Badge className={getStatusColor(asset.asset_status === 'Active' ? 'Resolved' : 'Submitted')}>
                              {asset.asset_status}
                            </Badge>
                          </div>
                        </div>
                        {asset.acknowledged_at ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledged {new Date(asset.acknowledged_at).toLocaleDateString()}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => openAcknowledgeDialog(asset)}
                            disabled={acknowledging === asset.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {acknowledging === asset.id ? 'Acknowledging...' : 'Acknowledge Receipt'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Acknowledge Receipt / Signature Dialog */}
      <Dialog open={ackDialogOpen} onOpenChange={setAckDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Acknowledge Receipt of Equipment</DialogTitle>
            <DialogDescription>
              Confirm receipt of <strong>{ackAsset?.asset_name}</strong> ({ackAsset?.asset_code})
              by signing below. Your signature will be recorded on the issue note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="ack-signature">Signature (type your full name) *</Label>
              <Input
                id="ack-signature"
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="e.g., Jane Njeri"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ack-date">Date Received *</Label>
              <Input
                id="ack-date"
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAckDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAcknowledge} disabled={acknowledging !== null || !signature.trim() || !receivedDate}>
                {acknowledging !== null ? 'Signing...' : 'Sign & Acknowledge'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
