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
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  Shield,
  Calendar
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Branch {
  id: number
  branch_name: string
  branch_code: string
  location_address: string
  contact_person: string
  contact_phone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface User {
  id: number
  username: string
  email: string
  full_name: string
  phone?: string
  department?: string
  role: 'Super Admin' | 'Admin' | 'Technician' | 'ICT Officer' | 'User'
  is_active: boolean
  created_at: string
  last_login?: string
}

interface BranchWithUsers extends Branch {
  user_count: number
  users: User[]
}

export const Departments: React.FC = () => {
  const [branches, setBranches] = useState<BranchWithUsers[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<BranchWithUsers | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load branches
      const branchResponse = await fetch('http://localhost:8000/api/branches?t=' + Date.now())
      if (branchResponse.ok) {
        const branchData = await branchResponse.json()
        const branchesList = branchData.branches || []
        
        // Load users
        const userResponse = await fetch('http://localhost:8000/api/users?t=' + Date.now())
        let usersList: User[] = []
        if (userResponse.ok) {
          const userData = await userResponse.json()
          usersList = userData.users || []
        }

        // Combine branches with user counts
        const branchesWithUsers: BranchWithUsers[] = branchesList.map((branch: Branch) => {
          const branchUsers = usersList.filter(user => user.department === branch.branch_name)
          return {
            ...branch,
            user_count: branchUsers.length,
            users: branchUsers
          }
        })

        setBranches(branchesWithUsers)
        setUsers(usersList)
      } else {
        setBranches([])
        setUsers([])
        setMessage('Error loading departments')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setBranches([])
      setUsers([])
      setMessage('Error loading departments')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesSearch = searchTerm === '' || 
        branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.branch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.location_address.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === '' || 
        (filterStatus === 'active' && branch.is_active) ||
        (filterStatus === 'inactive' && !branch.is_active)

      return matchesSearch && matchesStatus
    })
  }, [branches, searchTerm, filterStatus])

  const paginatedBranches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredBranches.slice(startIndex, endIndex)
  }, [filteredBranches, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage)

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-red-100 text-red-800'
      case 'Admin': return 'bg-purple-100 text-purple-800'
      case 'Technician': return 'bg-green-100 text-green-800'
      case 'User': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleBranchClick = (branch: BranchWithUsers) => {
    setSelectedBranch(branch)
  }

  const handleBackToList = () => {
    setSelectedBranch(null)
  }

  const stats = useMemo(() => {
    const total = branches.length
    const active = branches.filter(b => b.is_active).length
    const totalUsers = branches.reduce((sum, b) => sum + b.user_count, 0)
    const avgUsers = total > 0 ? Math.round(totalUsers / total) : 0

    return { total, active, totalUsers, avgUsers }
  }, [branches])

  if (selectedBranch) {
    return (
      <div className="space-y-6 bg-blue-50 min-h-screen p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBackToList}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Departments
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedBranch.branch_name}</h1>
              <p className="text-sm text-gray-600">{selectedBranch.branch_code} - {selectedBranch.location_address}</p>
            </div>
          </div>
          <Badge className={getStatusColor(selectedBranch.is_active)}>
            {selectedBranch.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{selectedBranch.user_count}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Contact Person</CardTitle>
              <Phone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-blue-900">{selectedBranch.contact_person}</div>
              <div className="text-xs text-blue-700">{selectedBranch.contact_phone}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Branch Code</CardTitle>
              <Building className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{selectedBranch.branch_code}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Users in {selectedBranch.branch_name}</CardTitle>
            <CardDescription className="text-blue-700">
              Manage users assigned to this department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedBranch.users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(user.is_active)}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {user.last_login || 'Never'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedBranch.users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users assigned to this department.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-blue-50 min-h-screen p-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
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
            <CardTitle className="text-sm font-medium text-blue-800">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Avg Users/Dept</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.avgUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-100 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-800">Departments</CardTitle>
              <CardDescription className="text-blue-700">
                Manage departments (branches) and their users
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by department name, code, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <Label htmlFor="filter-status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBranches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleBranchClick(branch)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Building className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{branch.branch_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Badge variant="outline">{branch.branch_code}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          {branch.location_address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{branch.contact_person}</div>
                          <div className="text-xs text-gray-500">{branch.contact_phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium">{branch.user_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(branch.is_active)}>
                          {branch.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleBranchClick(branch); }}>
                          <Users className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBranches.length)} of {filteredBranches.length} results
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

            {filteredBranches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No departments found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
