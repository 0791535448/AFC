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
  Lock,
  Activity,
  KeyRound
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  phone?: string
  department?: string
  role: 'Super Admin' | 'Admin' | 'Technician' | 'ICT Officer' | 'Senior ICT Officer' | 'ICT Intern' | 'User'
  is_active: boolean
  created_at: string
  last_login?: string
}

interface AllUsersProps {
  fixedRole?: string
  title?: string
}

export const AllUsers: React.FC<AllUsersProps> = ({ fixedRole, title }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: ''
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [branchList, setBranchList] = useState<any[]>([])
  const [resetUser, setResetUser] = useState<User | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // Load users and branches from API
  useEffect(() => {
    loadUsers()
    loadBranches()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users?t=' + Date.now())
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setUsers([])
        setMessage('Error loading users')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
      setMessage('Error loading users')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const loadBranches = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/branches?t=' + Date.now())
      if (response.ok) {
        const data = await response.json()
        setBranchList(data.branches || [])
      }
    } catch (error) {
      console.error('Error loading branches:', error)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = (filters.role === '' || user.role === filters.role) && (!fixedRole || user.role === fixedRole)
      const matchesDepartment = filters.department === '' || user.department === filters.department
      const matchesStatus = filters.status === '' || 
        (filters.status === 'active' && user.is_active) ||
        (filters.status === 'inactive' && !user.is_active)

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus
    })
  }, [users, searchTerm, filters])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-red-100 text-red-800'
      case 'Admin': return 'bg-purple-100 text-purple-800'
      case 'Technician': return 'bg-green-100 text-green-800'
      case 'ICT Officer': return 'bg-teal-100 text-teal-800'
      case 'Senior ICT Officer': return 'bg-emerald-100 text-emerald-800'
      case 'ICT Intern': return 'bg-sky-100 text-sky-800'
      case 'User': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const handleAddUser = async (newUser: UserFormData) => {
    try {
      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to create user')
      }
      await loadUsers()
      setMessage('User created successfully')
      setIsAddModalOpen(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error creating user:', error)
      setMessage(error instanceof Error ? error.message : 'Error creating user')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleUpdateUser = async (updatedUser: (User | Omit<User, 'id' | 'created_at'>) & { password?: string }) => {
    const userId = (updatedUser as User).id
    if (!userId) return
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to update user')
      }
      await loadUsers()
      setMessage('User updated successfully')
      setIsEditModalOpen(false)
      setEditingUser(null)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating user:', error)
      setMessage(error instanceof Error ? error.message : 'Error updating user')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetUser) return
    setResetLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/users/${resetUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to reset password')
      }
      setMessage(`Password reset for ${resetUser.username}`)
      setResetDialogOpen(false)
      setResetUser(null)
      setResetPassword('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error resetting password')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setResetLoading(false)
    }
  }

  const handleDeleteUser = (id: number) => {
    const user = users.find(u => u.id === id)
    if (user) {
      setUserToDelete(id)
      setDeleteConfirmOpen(true)
    }
  }

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${userToDelete}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete user')
        await loadUsers()
        setMessage('User deleted successfully')
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        console.error('Error deleting user:', error)
        setMessage('Error deleting user')
        setTimeout(() => setMessage(''), 3000)
      } finally {
        setUserToDelete(null)
        setDeleteConfirmOpen(false)
      }
    }
  }

  const cancelDeleteUser = () => {
    setUserToDelete(null)
  }

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleUserStatus = (user: User) => {
    const updatedUser = { ...user, is_active: !user.is_active }
    handleUpdateUser(updatedUser)
  }

  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter(u => u.is_active).length
    const inactive = users.filter(u => !u.is_active).length
    const admins = users.filter(u => u.role === 'Super Admin' || u.role === 'Admin').length

    return { total, active, inactive, admins }
  }, [users])

  return (
    <div className="space-y-6 bg-blue-50 min-h-screen p-6">
      {/* Success Message */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Users</CardTitle>
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
            <CardTitle className="text-sm font-medium text-blue-800">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Admins</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-blue-100 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-800">{title || 'All Users'}</CardTitle>
              <CardDescription className="text-blue-700">Manage system users and permissions</CardDescription>
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
                    New User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-indigo-50 border-indigo-200">
                  <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-indigo-800 text-xl font-bold">Create New User</DialogTitle>
                        <DialogDescription className="text-indigo-700 text-base">
                          Enter the details for the new user
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="pt-6">
                    <UserForm onSubmit={handleAddUser} onCancel={() => setIsAddModalOpen(false)} branchList={branchList} />
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
              placeholder="Search by username, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="filter-role">Role</Label>
                <Select value={filters.role} onValueChange={(value) => handleFilter('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="ICT Officer">ICT Officer</SelectItem>
                    <SelectItem value="Senior ICT Officer">Senior ICT Officer</SelectItem>
                    <SelectItem value="ICT Intern">ICT Intern</SelectItem>
                    <SelectItem value="User">User</SelectItem>
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
                    {branchList.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.branch_name}>
                        {branch.branch_name}
                      </SelectItem>
                    ))}
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

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          {user.department || 'N/A'}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user)}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setResetUser(user)
                              setResetPassword('')
                              setResetDialogOpen(true)
                            }}
                            title="Reset password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user)
                              setIsEditModalOpen(true)
                            }}
                            className="mr-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} results
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

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Modal */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <KeyRound className="h-5 w-5 text-indigo-600" />
              <span>Reset Password</span>
            </DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{resetUser?.full_name}</strong> (@{resetUser?.username})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="reset-new-password">New Password</Label>
              <Input
                id="reset-new-password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                disabled={resetLoading}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)} disabled={resetLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={resetLoading}>
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-indigo-50 border-indigo-200">
          <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Edit2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-indigo-800 text-xl font-bold">Edit User</DialogTitle>
                <DialogDescription className="text-indigo-700 text-base">
                  Update the user information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingUser && (
            <div className="pt-6">
              <UserForm
                user={editingUser}
                onSubmit={handleUpdateUser}
                onCancel={() => {
                  setIsEditModalOpen(false)
                  setEditingUser(null)
                }}
                branchList={branchList}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete User"
        description={`Are you sure you want to delete this user? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteUser}
        onCancel={cancelDeleteUser}
        variant="destructive"
      />
    </div>
  )
}

// User Form Component
interface UserFormData extends Omit<User, 'id' | 'created_at'> {
  password?: string
  id?: number
  created_at?: string
}

interface UserFormProps {
  user?: User
  onSubmit: (user: UserFormData) => void
  onCancel: () => void
  branchList?: any[]
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, branchList = [] }) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: user?.username || '',
    email: user?.email || '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || 'User',
    is_active: user?.is_active ?? true,
    last_login: user?.last_login || '',
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      onSubmit({ ...formData, id: user.id, created_at: user.created_at })
    } else {
      onSubmit({ ...formData, id: 0, created_at: '' })
    }
  }

  const handleInputChange = (field: keyof (Omit<User, 'id' | 'created_at'> & { password?: string }), value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <Label htmlFor="department">Department *</Label>
          <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {branchList.length > 0 ? (
                branchList.map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.branch_name}>
                    {branch.branch_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="IT Department">IT Department</SelectItem>
              )}
              <SelectItem value="Finance Department">Finance Department</SelectItem>
              <SelectItem value="Head Office">Head Office</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Super Admin">Super Admin</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Technician">Technician</SelectItem>
              <SelectItem value="ICT Officer">ICT Officer</SelectItem>
              <SelectItem value="Senior ICT Officer">Senior ICT Officer</SelectItem>
              <SelectItem value="ICT Intern">ICT Intern</SelectItem>
              <SelectItem value="User">User</SelectItem>
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
          <Label htmlFor="password">Password {user ? '(leave blank to keep current)' : '*'}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder={user ? 'Enter new password' : 'Enter password'}
            required={!user}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  )
}
