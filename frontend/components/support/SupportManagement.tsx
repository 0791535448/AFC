'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Headphones,
  AlertTriangle,
  User,
  Settings,
  Calendar,
  FileText,
  PlayCircle,
  CheckCircle,
  Clock,
  Star,
  Mail,
  Activity,
  MessageSquare
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  category: 'hardware' | 'software' | 'network' | 'account' | 'other'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  requester: string
  requesterEmail: string
  requesterDepartment: string
  assignedTo: string
  createdAt: string
  resolvedAt?: string
  estimatedResolution?: string
  satisfaction?: number
  notes: string
  attachments: string[]
}

export const SupportManagement: React.FC = () => {
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      ticketNumber: 'SUP-2024-001',
      subject: 'Laptop not connecting to network',
      description: 'User unable to connect to company WiFi network with their Dell laptop',
      category: 'network',
      priority: 'high',
      status: 'in_progress',
      requester: 'John Smith',
      requesterEmail: 'john.smith@company.com',
      requesterDepartment: 'Sales',
      assignedTo: 'IT Support Team',
      createdAt: '2024-04-27',
      estimatedResolution: '2024-04-28',
      satisfaction: undefined,
      notes: 'User reports intermittent connection issues',
      attachments: []
    },
    {
      id: '2',
      ticketNumber: 'SUP-2024-002',
      subject: 'Software installation request',
      description: 'Need Adobe Creative Suite installed on design workstation',
      category: 'software',
      priority: 'medium',
      status: 'open',
      requester: 'Sarah Johnson',
      requesterEmail: 'sarah.j@company.com',
      requesterDepartment: 'Marketing',
      assignedTo: '',
      createdAt: '2024-04-27',
      estimatedResolution: '2024-04-29',
      satisfaction: undefined,
      notes: 'License available in software inventory',
      attachments: ['license_request.pdf']
    },
    {
      id: '3',
      ticketNumber: 'SUP-2024-003',
      subject: 'Printer not working',
      description: 'HP LaserJet in Finance department not printing',
      category: 'hardware',
      priority: 'critical',
      status: 'resolved',
      requester: 'Mike Wilson',
      requesterEmail: 'mike.w@company.com',
      requesterDepartment: 'Finance',
      assignedTo: 'IT Support Team',
      createdAt: '2024-04-26',
      resolvedAt: '2024-04-27',
      satisfaction: 5,
      notes: 'Replaced toner cartridge and cleaned printer heads',
      attachments: []
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    assignedTo: ''
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const filteredTickets = useMemo(() => {
    return supportTickets.filter(ticket => {
      const matchesSearch = searchTerm === '' || 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filters.status === '' || ticket.status === filters.status
      const matchesCategory = filters.category === '' || ticket.category === filters.category
      const matchesPriority = filters.priority === '' || ticket.priority === filters.priority
      const matchesAssignedTo = filters.assignedTo === '' || 
        ticket.assignedTo.toLowerCase().includes(filters.assignedTo.toLowerCase())

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesAssignedTo
    })
  }, [supportTickets, searchTerm, filters])

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredTickets.slice(startIndex, endIndex)
  }, [filteredTickets, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hardware': return 'bg-purple-100 text-purple-800'
      case 'software': return 'bg-blue-100 text-blue-800'
      case 'network': return 'bg-green-100 text-green-800'
      case 'account': return 'bg-orange-100 text-orange-800'
      case 'other': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddTicket = (newTicket: Omit<SupportTicket, 'id' | 'ticketNumber'>) => {
    const ticketNumber = `SUP-2024-${String(supportTickets.length + 1).padStart(3, '0')}`
    const ticket: SupportTicket = {
      ...newTicket,
      id: (supportTickets.length + 1).toString(),
      ticketNumber
    }
    setSupportTickets(prev => [...prev, ticket])
    setMessage('Support ticket created successfully')
    setIsAddModalOpen(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleUpdateTicket = (updatedTicket: SupportTicket) => {
    setSupportTickets(prev => prev.map(ticket => 
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    ))
    setMessage('Support ticket updated successfully')
    setIsEditModalOpen(false)
    setEditingTicket(null)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteTicket = (id: string) => {
    const ticket = supportTickets.find(t => t.id === id)
    if (ticket) {
      setTicketToDelete(id)
      setDeleteConfirmOpen(true)
    }
  }

  const confirmDeleteTicket = () => {
    if (ticketToDelete) {
      setSupportTickets(prev => prev.filter(ticket => ticket.id !== ticketToDelete))
      setMessage('Support ticket deleted successfully')
      setTimeout(() => setMessage(''), 3000)
      setTicketToDelete(null)
    }
  }

  const cancelDeleteTicket = () => {
    setTicketToDelete(null)
  }

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const stats = useMemo(() => {
    const total = supportTickets.length
    const open = supportTickets.filter(t => t.status === 'open').length
    const inProgress = supportTickets.filter(t => t.status === 'in_progress').length
    const resolved = supportTickets.filter(t => t.status === 'resolved').length
    const critical = supportTickets.filter(t => t.priority === 'critical').length
    const avgSatisfaction = supportTickets
      .filter(t => t.satisfaction !== undefined)
      .reduce((acc, t) => acc + (t.satisfaction || 0), 0) / 
      supportTickets.filter(t => t.satisfaction !== undefined).length || 0

    return { total, open, inProgress, resolved, critical, avgSatisfaction }
  }, [supportTickets])

  return (
    <div className="space-y-6 bg-green-50 min-h-screen p-6">
      {/* Success Message */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Tickets</CardTitle>
            <Headphones className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Open</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.open}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Avg Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {stats.avgSatisfaction.toFixed(1)} ⭐
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-green-100 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-green-800">Support Tickets</CardTitle>
              <CardDescription className="text-green-700">Manage and track support requests</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-indigo-50 border-indigo-200">
                  <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Headphones className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-indigo-800 text-xl font-bold">Create Support Ticket</DialogTitle>
                        <DialogDescription className="text-indigo-700 text-base">
                          Enter the details for the new support ticket
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="pt-6">
                    <SupportTicketForm onSubmit={handleAddTicket} onCancel={() => setIsAddModalOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search by ticket number, subject, requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-category">Category</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilter('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-priority">Priority</Label>
                <Select value={filters.priority} onValueChange={(value) => handleFilter('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-assigned">Assigned To</Label>
                <Input
                  placeholder="Filter by assignee"
                  value={filters.assignedTo}
                  onChange={(e) => handleFilter('assignedTo', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Support Tickets Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.ticketNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={ticket.subject}>
                          {ticket.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{ticket.requester}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getCategoryColor(ticket.category)}>
                          {ticket.category.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.assignedTo || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTicket(ticket)
                              setIsEditModalOpen(true)
                            }}
                            className="mr-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTicket(ticket.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} results
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className="w-8"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {filteredTickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No support tickets found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Ticket Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-indigo-50 border-indigo-200">
          <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Edit2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-indigo-800 text-xl font-bold">Edit Support Ticket</DialogTitle>
                <DialogDescription className="text-indigo-700 text-base">
                  Update the support ticket information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingTicket && (
            <div className="pt-6">
              <SupportTicketForm
                ticket={editingTicket}
                onSubmit={handleUpdateTicket}
                onCancel={() => {
                  setIsEditModalOpen(false)
                  setEditingTicket(null)
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Support Ticket"
        description={`Are you sure you want to delete this support ticket? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTicket}
        onCancel={cancelDeleteTicket}
        variant="destructive"
      />
    </div>
  )
}

// Support Ticket Form Component
interface SupportTicketFormProps {
  ticket?: SupportTicket
  onSubmit: (ticket: SupportTicket) => void
  onCancel: () => void
}

const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ ticket, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<SupportTicket, 'id' | 'ticketNumber'>>({
    subject: ticket?.subject || '',
    description: ticket?.description || '',
    category: ticket?.category || 'other',
    priority: ticket?.priority || 'medium',
    status: ticket?.status || 'open',
    requester: ticket?.requester || '',
    requesterEmail: ticket?.requesterEmail || '',
    requesterDepartment: ticket?.requesterDepartment || '',
    assignedTo: ticket?.assignedTo || '',
    createdAt: ticket?.createdAt || new Date().toISOString().split('T')[0],
    resolvedAt: ticket?.resolvedAt || '',
    estimatedResolution: ticket?.estimatedResolution || '',
    satisfaction: ticket?.satisfaction || undefined,
    notes: ticket?.notes || '',
    attachments: ticket?.attachments || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticket) {
      onSubmit({ ...formData, id: ticket.id, ticketNumber: ticket.ticketNumber })
    } else {
      onSubmit({ ...formData, id: '', ticketNumber: '' })
    }
  }

  const handleInputChange = (field: keyof Omit<SupportTicket, 'id' | 'ticketNumber'>, value: string | number | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="Enter ticket subject"
            required
          />
        </div>
        <div>
          <Label htmlFor="requester">Requester Name *</Label>
          <Input
            id="requester"
            value={formData.requester}
            onChange={(e) => handleInputChange('requester', e.target.value)}
            placeholder="Enter requester name"
            required
          />
        </div>
        <div>
          <Label htmlFor="requesterEmail">Requester Email *</Label>
          <Input
            id="requesterEmail"
            type="email"
            value={formData.requesterEmail}
            onChange={(e) => handleInputChange('requesterEmail', e.target.value)}
            placeholder="Enter requester email"
            required
          />
        </div>
        <div>
          <Label htmlFor="requesterDepartment">Department *</Label>
          <Select value={formData.requesterDepartment} onValueChange={(value) => handleInputChange('requesterDepartment', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority *</Label>
          <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => handleInputChange('assignedTo', e.target.value)}
            placeholder="Assign to support staff"
          />
        </div>
        <div>
          <Label htmlFor="createdAt">Created Date *</Label>
          <Input
            id="createdAt"
            type="date"
            value={formData.createdAt}
            onChange={(e) => handleInputChange('createdAt', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="estimatedResolution">Estimated Resolution</Label>
          <Input
            id="estimatedResolution"
            type="date"
            value={formData.estimatedResolution}
            onChange={(e) => handleInputChange('estimatedResolution', e.target.value)}
          />
        </div>
        {(formData.status === 'resolved' || formData.status === 'closed') && (
          <div>
            <Label htmlFor="resolvedAt">Resolved Date</Label>
            <Input
              id="resolvedAt"
              type="date"
              value={formData.resolvedAt}
              onChange={(e) => handleInputChange('resolvedAt', e.target.value)}
            />
          </div>
        )}
        {formData.status === 'resolved' && (
          <div>
            <Label htmlFor="satisfaction">Satisfaction Rating</Label>
            <Select value={formData.satisfaction?.toString() || ''} onValueChange={(value) => handleInputChange('satisfaction', value ? parseInt(value) : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Select satisfaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Very Poor</SelectItem>
                <SelectItem value="2">2 - Poor</SelectItem>
                <SelectItem value="3">3 - Average</SelectItem>
                <SelectItem value="4">4 - Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Description *</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the issue in detail..."
            className="w-full p-2 border rounded-md min-h-[100px]"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes or resolution steps..."
            className="w-full p-2 border rounded-md min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {ticket ? 'Update Ticket' : 'Create Ticket'}
        </Button>
      </div>
    </form>
  )
}
