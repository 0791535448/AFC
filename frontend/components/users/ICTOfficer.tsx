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
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Cpu,
  Award,
  Activity,
  Clock,
  Monitor,
  Wrench,
  Database,
  Lock,
  Wifi,
  Server
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface ICTOfficer {
  id: number
  username: string
  email: string
  full_name: string
  phone?: string
  department: string
  role: 'Technician' | 'ICT Officer' | 'Senior ICT Officer' | 'ICT Intern'
  specialization: 'Network' | 'Hardware' | 'Software' | 'Security' | 'Database' | 'General'
  skills: string[]
  certifications: string[]
  experience_level: 'Junior' | 'Mid-level' | 'Senior' | 'Lead'
  is_active: boolean
  on_call: boolean
  created_at: string
  last_login?: string
  assigned_equipment: number
  tickets_assigned: number
  tickets_resolved: number
  avg_resolution_time: string
}

interface ICTOfficerProps {
  role?: 'ICT Officer' | 'Senior ICT Officer' | 'ICT Intern'
  title?: string
}

export const ICTOfficer: React.FC<ICTOfficerProps> = ({ role = 'ICT Officer', title }) => {
  const [officers, setOfficers] = useState<ICTOfficer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    specialization: '',
    experience_level: '',
    status: ''
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingOfficer, setEditingOfficer] = useState<ICTOfficer | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [officerToDelete, setOfficerToDelete] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadOfficers()
  }, [])

  const loadOfficers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users?t=' + Date.now())
      if (response.ok) {
        const data = await response.json()
        const users = data.users || []
        setOfficers(users.filter((u: any) => u.role === role))
      } else {
        setOfficers([])
        setMessage('Error loading ICT officers')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error loading ICT officers:', error)
      setOfficers([])
      setMessage('Error loading ICT officers')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const filteredOfficers = useMemo(() => {
    return officers.filter(officer => {
      const matchesSearch = searchTerm === '' || 
        officer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSpecialization = filters.specialization === '' || officer.specialization === filters.specialization
      const matchesExperience = filters.experience_level === '' || officer.experience_level === filters.experience_level
      const matchesStatus = filters.status === '' || 
        (filters.status === 'active' && officer.is_active) ||
        (filters.status === 'inactive' && !officer.is_active)

      return matchesSearch && matchesSpecialization && matchesExperience && matchesStatus
    })
  }, [officers, searchTerm, filters])

  const paginatedOfficers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredOfficers.slice(startIndex, endIndex)
  }, [filteredOfficers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage)

  const getSpecializationColor = (specialization: string) => {
    switch (specialization) {
      case 'Network': return 'bg-blue-100 text-blue-800'
      case 'Hardware': return 'bg-orange-100 text-orange-800'
      case 'Software': return 'bg-green-100 text-green-800'
      case 'Security': return 'bg-red-100 text-red-800'
      case 'Database': return 'bg-purple-100 text-purple-800'
      case 'General': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'Junior': return 'bg-green-100 text-green-800'
      case 'Mid-level': return 'bg-blue-100 text-blue-800'
      case 'Senior': return 'bg-purple-100 text-purple-800'
      case 'Lead': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getSpecializationIcon = (specialization: string) => {
    switch (specialization) {
      case 'Network': return <Wifi className="h-4 w-4" />
      case 'Hardware': return <Wrench className="h-4 w-4" />
      case 'Software': return <Monitor className="h-4 w-4" />
      case 'Security': return <Lock className="h-4 w-4" />
      case 'Database': return <Database className="h-4 w-4" />
      case 'General': return <Cpu className="h-4 w-4" />
      default: return <Cpu className="h-4 w-4" />
    }
  }

  const handleAddOfficer = async (newOfficer: ICTOfficerFormData) => {
    try {
      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOfficer)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to create ICT officer')
      }
      await loadOfficers()
      setMessage('ICT Officer created successfully')
      setIsAddModalOpen(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error creating ICT officer:', error)
      setMessage(error instanceof Error ? error.message : 'Error creating ICT officer')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleUpdateOfficer = async (updatedOfficer: (ICTOfficer | Omit<ICTOfficer, 'id' | 'created_at'>) & { password?: string }) => {
    const officerId = (updatedOfficer as ICTOfficer).id
    if (!officerId) return
    try {
      const response = await fetch(`http://localhost:8000/api/users/${officerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOfficer)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to update ICT officer')
      }
      await loadOfficers()
      setMessage('ICT Officer updated successfully')
      setIsEditModalOpen(false)
      setEditingOfficer(null)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating ICT officer:', error)
      setMessage(error instanceof Error ? error.message : 'Error updating ICT officer')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDeleteOfficer = (id: number) => {
    const officer = officers.find(o => o.id === id)
    if (officer) {
      setOfficerToDelete(id)
      setDeleteConfirmOpen(true)
    }
  }

  const confirmDeleteOfficer = async () => {
    if (officerToDelete) {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${officerToDelete}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete ICT officer')
        await loadOfficers()
        setMessage('ICT Officer deleted successfully')
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        console.error('Error deleting ICT officer:', error)
        setMessage('Error deleting ICT officer')
        setTimeout(() => setMessage(''), 3000)
      } finally {
        setOfficerToDelete(null)
        setDeleteConfirmOpen(false)
      }
    }
  }

  const cancelDeleteOfficer = () => {
    setOfficerToDelete(null)
  }

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleOfficerStatus = (officer: ICTOfficer) => {
    const updatedOfficer = { ...officer, is_active: !officer.is_active }
    handleUpdateOfficer(updatedOfficer)
  }

  const toggleOnCall = (officer: ICTOfficer) => {
    const updatedOfficer = { ...officer, on_call: !officer.on_call }
    handleUpdateOfficer(updatedOfficer)
  }

  const stats = useMemo(() => {
    const total = officers.length
    const active = officers.filter(o => o.is_active).length
    const onCall = officers.filter(o => o.on_call).length
    const senior = officers.filter(o => o.experience_level === 'Senior' || o.experience_level === 'Lead').length
    const totalTickets = officers.reduce((sum, o) => sum + o.tickets_resolved, 0)

    return { total, active, onCall, senior, totalTickets }
  }, [officers])

  return (
    <div className="space-y-6 bg-blue-50 min-h-screen p-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Officers</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">On Call</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.onCall}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Senior/Lead</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.senior}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Tickets Resolved</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalTickets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-blue-100 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-800">{title || 'ICT Officers'}</CardTitle>
              <CardDescription className="text-blue-700">Manage ICT officers and technical staff</CardDescription>
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
                    New {title || 'ICT Officer'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-indigo-50 border-indigo-200">
                  <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Cpu className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-indigo-800 text-xl font-bold">Create {title || 'ICT Officer'}</DialogTitle>
                        <DialogDescription className="text-indigo-700 text-base">
                          Enter the details for the new ICT officer
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="pt-6">
                    <ICTOfficerForm defaultRole={role} onSubmit={handleAddOfficer} onCancel={() => setIsAddModalOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by username, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="filter-specialization">Specialization</Label>
                <Select value={filters.specialization} onValueChange={(value) => handleFilter('specialization', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-experience">Experience Level</Label>
                <Select value={filters.experience_level} onValueChange={(value) => handleFilter('experience_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Mid-level">Mid-level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOfficers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Cpu className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{officer.full_name}</div>
                            <div className="text-sm text-gray-500">@{officer.username}</div>
                            <div className="text-xs text-gray-400">{officer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {getSpecializationIcon(officer.specialization)}
                          </div>
                          <Badge className={getSpecializationColor(officer.specialization)}>
                            {officer.specialization}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getExperienceColor(officer.experience_level)}>
                          {officer.experience_level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {officer.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {officer.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{officer.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <Badge className={getStatusColor(officer.is_active)}>
                            {officer.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {officer.on_call && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              On Call
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 text-gray-400 mr-2" />
                            {officer.tickets_resolved}/{officer.tickets_assigned}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Avg: {officer.avg_resolution_time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOfficerStatus(officer)}
                            title={officer.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {officer.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOnCall(officer)}
                            title={officer.on_call ? 'Remove from On-Call' : 'Set On-Call'}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingOfficer(officer)
                              setIsEditModalOpen(true)
                            }}
                            className="mr-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOfficer(officer.id)}
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

            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOfficers.length)} of {filteredOfficers.length} results
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

            {filteredOfficers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No {title || 'ICT Officers'} found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-indigo-50 border-indigo-200">
          <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Edit2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-indigo-800 text-xl font-bold">Edit {title || 'ICT Officer'}</DialogTitle>
                <DialogDescription className="text-indigo-700 text-base">
                  Update the ICT officer information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingOfficer && (
            <div className="pt-6">
              <ICTOfficerForm
                officer={editingOfficer}
                defaultRole={role}
                onSubmit={handleUpdateOfficer}
                onCancel={() => {
                  setIsEditModalOpen(false)
                  setEditingOfficer(null)
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={`Delete ${title || 'ICT Officer'}`}
        description={`Are you sure you want to delete this ICT officer? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteOfficer}
        onCancel={cancelDeleteOfficer}
        variant="destructive"
      />
    </div>
  )
}

interface ICTOfficerFormData extends Omit<ICTOfficer, 'id' | 'created_at'> {
  password?: string
  id?: number
  created_at?: string
}

interface ICTOfficerFormProps {
  officer?: ICTOfficer
  defaultRole?: ICTOfficerFormData['role']
  onSubmit: (officer: ICTOfficerFormData) => void
  onCancel: () => void
}

const ICTOfficerForm: React.FC<ICTOfficerFormProps> = ({ officer, defaultRole = 'ICT Officer', onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ICTOfficerFormData>({
    username: officer?.username || '',
    email: officer?.email || '',
    full_name: officer?.full_name || '',
    phone: officer?.phone || '',
    department: officer?.department || 'IT Department',
    role: officer?.role || defaultRole,
    specialization: officer?.specialization || 'General',
    skills: officer?.skills || [],
    certifications: officer?.certifications || [],
    experience_level: officer?.experience_level || 'Junior',
    is_active: officer?.is_active ?? true,
    on_call: officer?.on_call ?? false,
    last_login: officer?.last_login || '',
    assigned_equipment: officer?.assigned_equipment || 0,
    tickets_assigned: officer?.tickets_assigned || 0,
    tickets_resolved: officer?.tickets_resolved || 0,
    avg_resolution_time: officer?.avg_resolution_time || '0 hours',
    password: ''
  })

  const [skillInput, setSkillInput] = useState('')
  const [certInput, setCertInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (officer) {
      onSubmit({ ...formData, id: officer.id, created_at: officer.created_at })
    } else {
      onSubmit({ ...formData, id: 0, created_at: '' })
    }
  }

  const handleInputChange = (field: keyof ICTOfficerFormData, value: string | boolean | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const addCert = () => {
    if (certInput.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certInput.trim()]
      }))
      setCertInput('')
    }
  }

  const removeCert = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technician">Technician</SelectItem>
              <SelectItem value="ICT Officer">ICT Officer</SelectItem>
              <SelectItem value="Senior ICT Officer">Senior ICT Officer</SelectItem>
              <SelectItem value="ICT Intern">ICT Intern</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="specialization">Specialization *</Label>
          <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Network">Network</SelectItem>
              <SelectItem value="Hardware">Hardware</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
              <SelectItem value="Database">Database</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="experience_level">Experience Level *</Label>
          <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Junior">Junior</SelectItem>
              <SelectItem value="Mid-level">Mid-level</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="is_active">Status</Label>
          <Select value={formData.is_active ? 'active' : 'inactive'} onValueChange={(value) => handleInputChange('is_active', value === 'active')}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="on_call">On Call Status</Label>
          <Select value={formData.on_call ? 'on-call' : 'not-on-call'} onValueChange={(value) => handleInputChange('on_call', value === 'on-call')}>
            <SelectTrigger>
              <SelectValue placeholder="Select on-call status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on-call">On Call</SelectItem>
              <SelectItem value="not-on-call">Not On Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="password">Password {officer ? '(leave blank to keep current)' : '*'}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder={officer ? 'Enter new password' : 'Enter password'}
            required={!officer}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="skills">Skills</Label>
        <div className="flex space-x-2 mb-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add skill"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <Button type="button" onClick={addSkill}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, index) => (
            <Badge key={index} variant="outline" className="flex items-center space-x-1">
              <span>{skill}</span>
              <button type="button" onClick={() => removeSkill(index)} className="ml-1 text-red-500 hover:text-red-700">×</button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="certifications">Certifications</Label>
        <div className="flex space-x-2 mb-2">
          <Input
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            placeholder="Add certification"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
          />
          <Button type="button" onClick={addCert}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.certifications.map((cert, index) => (
            <Badge key={index} variant="outline" className="flex items-center space-x-1">
              <Award className="h-3 w-3 mr-1" />
              <span>{cert}</span>
              <button type="button" onClick={() => removeCert(index)} className="ml-1 text-red-500 hover:text-red-700">×</button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {officer ? `Update ${defaultRole}` : `Create ${defaultRole}`}
        </Button>
      </div>
    </form>
  )
}
