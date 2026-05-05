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
  Monitor,
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Settings,
  Calendar,
  FileText,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface HardwareIssue {
  id: string
  device: string
  deviceType: string
  assetTag: string
  problem: string
  status: 'pending' | 'in_progress' | 'solved'
  personAttending: string
  action: string
  reportedDate: string
  resolvedDate?: string
  priority: 'low' | 'medium' | 'high'
  department: string
  notes: string
}

interface Task {
  id: string
  hardwareId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'completed'
  assignedTo: string
  dueDate: string
  createdDate: string
  priority: 'low' | 'medium' | 'high'
}

export const HardwareManagement: React.FC = () => {
  const [hardwareIssues, setHardwareIssues] = useState<HardwareIssue[]>([
    {
      id: '1',
      device: 'Dell Latitude 7420',
      deviceType: 'Laptop',
      assetTag: 'ICT001',
      problem: 'Screen flickering intermittently',
      status: 'pending',
      personAttending: '',
      action: '',
      reportedDate: '2024-04-27',
      priority: 'medium',
      department: 'IT',
      notes: 'User reports screen flickers when moving laptop'
    },
    {
      id: '2',
      device: 'HP LaserJet Pro',
      deviceType: 'Printer',
      assetTag: 'ICT002',
      problem: 'Paper jam in tray 2',
      status: 'in_progress',
      personAttending: 'John Doe',
      action: 'Cleaned paper rollers, updated firmware',
      reportedDate: '2024-04-26',
      priority: 'high',
      department: 'Finance',
      notes: 'Critical printer for department operations'
    },
    {
      id: '3',
      device: 'Cisco Router',
      deviceType: 'Router',
      assetTag: 'ICT003',
      problem: 'Intermittent network connectivity',
      status: 'solved',
      personAttending: 'Jane Smith',
      action: 'Replaced faulty network cable, reset router configuration',
      reportedDate: '2024-04-25',
      resolvedDate: '2024-04-26',
      priority: 'high',
      department: 'IT',
      notes: 'Issue resolved after hardware replacement'
    },
    {
      id: '4',
      device: 'LG Monitor',
      deviceType: 'Monitor',
      assetTag: 'ICT004',
      problem: 'No display signal',
      status: 'pending',
      personAttending: '',
      action: '',
      reportedDate: '2024-04-27',
      priority: 'low',
      department: 'Reception',
      notes: 'Monitor powers on but shows no signal'
    }
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      hardwareId: '2',
      title: 'Replace printer paper rollers',
      description: 'Order and install new paper rollers for HP LaserJet Pro',
      status: 'todo',
      assignedTo: 'John Doe',
      dueDate: '2024-04-30',
      createdDate: '2024-04-27',
      priority: 'high'
    },
    {
      id: '2',
      hardwareId: '3',
      title: 'Document network fix',
      description: 'Create documentation for router troubleshooting steps',
      status: 'completed',
      assignedTo: 'Jane Smith',
      dueDate: '2024-04-28',
      createdDate: '2024-04-26',
      priority: 'medium'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    deviceType: '',
    priority: '',
    department: '',
    personAttending: ''
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingIssue, setEditingIssue] = useState<HardwareIssue | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Auto-generate tasks from actions
  useEffect(() => {
    const newTasks: Task[] = []
    
    hardwareIssues.forEach(issue => {
      if (issue.action && issue.status === 'in_progress') {
        // Check if task already exists for this action
        const existingTask = tasks.find(task => 
          task.hardwareId === issue.id && 
          task.title.toLowerCase().includes(issue.action.toLowerCase().substring(0, 20))
        )
        
        if (!existingTask) {
          newTasks.push({
            id: `task-${Date.now()}-${issue.id}`,
            hardwareId: issue.id,
            title: `Complete action: ${issue.action.substring(0, 50)}${issue.action.length > 50 ? '...' : ''}`,
            description: `Complete the following action for ${issue.device}: ${issue.action}`,
            status: 'todo',
            assignedTo: issue.personAttending || 'Unassigned',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdDate: new Date().toISOString().split('T')[0],
            priority: issue.priority
          })
        }
      }
    })
    
    if (newTasks.length > 0) {
      setTasks(prev => [...prev, ...newTasks])
      setMessage(`${newTasks.length} tasks auto-generated from actions`)
      setTimeout(() => setMessage(''), 3000)
    }
  }, [hardwareIssues])

  const filteredIssues = useMemo(() => {
    return hardwareIssues.filter(issue => {
      const matchesSearch = searchTerm === '' || 
        issue.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.personAttending.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filters.status === '' || filters.status === 'all' || issue.status === filters.status
      const matchesDeviceType = filters.deviceType === '' || filters.deviceType === 'all' || issue.deviceType === filters.deviceType
      const matchesPriority = filters.priority === '' || filters.priority === 'all' || issue.priority === filters.priority
      const matchesDepartment = filters.department === '' || filters.department === 'all' || issue.department === filters.department
      const matchesPerson = filters.personAttending === '' || 
        issue.personAttending.toLowerCase().includes(filters.personAttending.toLowerCase())

      return matchesSearch && matchesStatus && matchesDeviceType && matchesPriority && matchesDepartment && matchesPerson
    })
  }, [hardwareIssues, searchTerm, filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'solved': return 'bg-green-100 text-green-800'
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'in_progress': return <PlayCircle className="h-4 w-4" />
      case 'solved': return <CheckCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleAddIssue = (newIssue: Omit<HardwareIssue, 'id'>) => {
    const issue: HardwareIssue = {
      ...newIssue,
      id: (hardwareIssues.length + 1).toString()
    }
    setHardwareIssues(prev => [...prev, issue])
    setMessage('Hardware issue added successfully')
    setIsAddModalOpen(false)
    setTimeout(() => setMessage(''), 3000)
  }

  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [issueToDelete, setIssueToDelete] = useState<string | null>(null)
  const [updateConfirmOpen, setUpdateConfirmOpen] = useState(false)
  const [issueToUpdate, setIssueToUpdate] = useState<HardwareIssue | null>(null)

  const handleDeleteIssue = (id: string) => {
    const issue = hardwareIssues.find(i => i.id === id)
    if (issue) {
      setIssueToDelete(id)
      setDeleteConfirmOpen(true)
    }
  }

  const confirmDeleteIssue = () => {
    if (issueToDelete) {
      setHardwareIssues(prev => prev.filter(issue => issue.id !== issueToDelete))
      setTasks(prev => prev.filter(task => task.hardwareId !== issueToDelete))
      setMessage('Hardware issue deleted successfully')
      setTimeout(() => setMessage(''), 3000)
      setIssueToDelete(null)
    }
  }

  const cancelDeleteIssue = () => {
    setIssueToDelete(null)
  }

  const handleUpdateIssue = (updatedIssue: HardwareIssue) => {
    setHardwareIssues(prev => prev.map(issue => 
      issue.id === updatedIssue.id ? updatedIssue : issue
    ))
    setMessage('Hardware issue updated successfully')
    setIsEditModalOpen(false)
    setEditingIssue(null)
    setTimeout(() => setMessage(''), 3000)
  }

  const confirmUpdateIssue = () => {
    if (issueToUpdate) {
      setHardwareIssues(prev => prev.map(issue => 
        issue.id === issueToUpdate.id ? issueToUpdate : issue
      ))
      setMessage('Hardware issue updated successfully')
      setIsEditModalOpen(false)
      setEditingIssue(null)
      setIssueToUpdate(null)
    }
  }

  const cancelUpdateIssue = () => {
    setIsEditModalOpen(false)
    setIssueToUpdate(null)
  }

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const stats = useMemo(() => {
    const total = hardwareIssues.length
    const pending = hardwareIssues.filter(i => i.status === 'pending').length
    const inProgress = hardwareIssues.filter(i => i.status === 'in_progress').length
    const solved = hardwareIssues.filter(i => i.status === 'solved').length
    const highPriority = hardwareIssues.filter(i => i.priority === 'high').length

    return { total, pending, inProgress, solved, highPriority }
  }, [hardwareIssues])

  const paginatedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredIssues.slice(startIndex, endIndex)
  }, [filteredIssues, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.solved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hardware Issues</CardTitle>
              <CardDescription>Manage and track hardware maintenance issues</CardDescription>
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
                    Report Issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-indigo-50 border-indigo-200">
                  <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-indigo-800 text-xl font-bold">Report Hardware Issue</DialogTitle>
                        <DialogDescription className="text-indigo-700 text-base">
                          Enter the details for the new hardware issue
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="pt-6">
                    <HardwareIssueForm onSubmit={handleAddIssue} onCancel={() => setIsAddModalOpen(false)} />
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
              placeholder="Search by device, problem, asset tag, assigned to, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-device-type">Device Type</Label>
                <Select value={filters.deviceType} onValueChange={(value) => handleFilter('deviceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Laptop">Laptop</SelectItem>
                    <SelectItem value="Desktop">Desktop</SelectItem>
                    <SelectItem value="Monitor">Monitor</SelectItem>
                    <SelectItem value="Printer">Printer</SelectItem>
                    <SelectItem value="Router">Router</SelectItem>
                    <SelectItem value="Switch">Switch</SelectItem>
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
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-department">Department</Label>
                <Select value={filters.department} onValueChange={(value) => handleFilter('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Reception">Reception</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-person">Person Attending</Label>
                <Input
                  placeholder="Filter by person"
                  value={filters.personAttending}
                  onChange={(e) => handleFilter('personAttending', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Hardware Issues Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Tag
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Person Attending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {issue.ticketNumber || `HW-${issue.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4 text-gray-500" />
                          <span>{issue.device}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.assetTag}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={issue.problem}>
                          {issue.problem}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getCategoryColor(issue.category)}>
                          {issue.category?.toUpperCase() || ''}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.personAttending || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={issue.action}>
                          {issue.action || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.reportedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingIssue(issue)
                              setIsEditModalOpen(true)
                            }}
                            className="mr-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIssue(issue.id)}
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredIssues.length)} of {filteredIssues.length} results
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

            {filteredIssues.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hardware issues found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Issue Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-indigo-50 border-indigo-200">
          <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Edit2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-indigo-800 text-xl font-bold">Edit Hardware Issue</DialogTitle>
                <DialogDescription className="text-indigo-700 text-base">
                  Update the hardware issue information and save changes
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingIssue && (
            <HardwareIssueForm
              issue={editingIssue}
              onSubmit={(issue) => handleUpdateIssue(issue as HardwareIssue)}
              onCancel={() => {
                setIsEditModalOpen(false)
                setEditingIssue(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Hardware Issue"
        description={`Are you sure you want to delete this hardware issue? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteIssue}
        onCancel={cancelDeleteIssue}
        variant="hardware"
      />

      {/* Update Confirmation Dialog */}
      <ConfirmDialog
        open={updateConfirmOpen}
        onOpenChange={setUpdateConfirmOpen}
        title="Update Hardware Issue"
        description={`Are you sure you want to update this hardware issue? The changes will be saved immediately.`}
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={confirmUpdateIssue}
        onCancel={cancelUpdateIssue}
        variant="update"
      />
    </div>
  )
}

// Hardware Issue Form Component
interface HardwareIssueFormProps {
  issue?: HardwareIssue
  onSubmit: (issue: Omit<HardwareIssue, 'id'> | HardwareIssue) => void
  onCancel: () => void
}

const HardwareIssueForm: React.FC<HardwareIssueFormProps> = ({ issue, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<HardwareIssue, 'id'>>({
    device: issue?.device || '',
    deviceType: issue?.deviceType || '',
    assetTag: issue?.assetTag || '',
    problem: issue?.problem || '',
    status: issue?.status || 'pending',
    personAttending: issue?.personAttending || '',
    action: issue?.action || '',
    reportedDate: issue?.reportedDate || new Date().toISOString().split('T')[0],
    resolvedDate: issue?.resolvedDate || '',
    priority: issue?.priority || 'medium',
    department: issue?.department || '',
    notes: issue?.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (issue) {
      onSubmit({ ...formData, id: issue.id })
    } else {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof Omit<HardwareIssue, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="device">Device *</Label>
          <Input
            id="device"
            value={formData.device}
            onChange={(e) => handleInputChange('device', e.target.value)}
            placeholder="Device name"
            required
          />
        </div>
        <div>
          <Label htmlFor="assetTag">Asset Tag *</Label>
          <Input
            id="assetTag"
            value={formData.assetTag}
            onChange={(e) => handleInputChange('assetTag', e.target.value)}
            placeholder="ICT001"
            required
          />
        </div>
        <div>
          <Label htmlFor="deviceType">Device Type *</Label>
          <Select value={formData.deviceType} onValueChange={(value) => handleInputChange('deviceType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select device type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Laptop">Laptop</SelectItem>
              <SelectItem value="Desktop">Desktop</SelectItem>
              <SelectItem value="Monitor">Monitor</SelectItem>
              <SelectItem value="Printer">Printer</SelectItem>
              <SelectItem value="Router">Router</SelectItem>
              <SelectItem value="Switch">Switch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Department *</Label>
          <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Reception">Reception</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
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
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="personAttending">Person Attending</Label>
          <Input
            id="personAttending"
            value={formData.personAttending}
            onChange={(e) => handleInputChange('personAttending', e.target.value)}
            placeholder="Assign to person"
          />
        </div>
        <div>
          <Label htmlFor="reportedDate">Reported Date *</Label>
          <Input
            id="reportedDate"
            type="date"
            value={formData.reportedDate}
            onChange={(e) => handleInputChange('reportedDate', e.target.value)}
            required
          />
        </div>
        {formData.status === 'solved' && (
          <div>
            <Label htmlFor="resolvedDate">Resolved Date</Label>
            <Input
              id="resolvedDate"
              type="date"
              value={formData.resolvedDate}
              onChange={(e) => handleInputChange('resolvedDate', e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="problem">Problem Description *</Label>
          <textarea
            id="problem"
            value={formData.problem}
            onChange={(e) => handleInputChange('problem', e.target.value)}
            placeholder="Describe the problem..."
            className="w-full p-2 border rounded-md min-h-[80px]"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="action">Action Taken</Label>
          <textarea
            id="action"
            value={formData.action}
            onChange={(e) => handleInputChange('action', e.target.value)}
            placeholder="Describe the action taken to resolve the problem..."
            className="w-full p-2 border rounded-md min-h-[80px]"
          />
        </div>
        
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional notes..."
            className="w-full p-2 border rounded-md min-h-[60px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {issue ? 'Update Issue' : 'Report Issue'}
        </Button>
      </div>
    </form>
  )
}
