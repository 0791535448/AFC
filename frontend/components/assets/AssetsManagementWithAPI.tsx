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
  Download, 
  Upload, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  Monitor,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  ArrowUpDown,
  FileSpreadsheet,
  FileText
} from 'lucide-react'
import { MassUpload } from './MassUpload'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import axios from 'axios'

interface Asset {
  id: number
  asset_tag: string
  serial_number: string
  device_type: string
  make: string
  model: string
  status: string
  location: string
  assigned_to: string
  purchase_date: string
  warranty_expiry: string
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ColumnFilter {
  [key: string]: string
}

const API_BASE_URL = 'http://localhost:8001'

export const AssetsManagementWithAPI: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Asset; direction: 'asc' | 'desc' } | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [message, setMessage] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/hardware`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        }
      })
      setAssets(response.data)
      setFilteredAssets(response.data)
    } catch (error) {
      console.error('Error fetching assets:', error)
      setMessage('Error loading assets')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = assets.length
    const active = assets.filter(a => a.status === 'Active').length
    const underRepair = assets.filter(a => a.status === 'Under Repair').length
    const retired = assets.filter(a => a.status === 'Retired').length

    return { total, active, underRepair, retired }
  }, [assets])

  // Apply filters and search
  useEffect(() => {
    let filtered = assets

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        Object.values(asset).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(asset =>
          asset[key as keyof Asset]?.toString().toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    setFilteredAssets(filtered)
    setCurrentPage(1)
  }, [assets, searchTerm, columnFilters, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key: keyof Asset) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const handleDeleteAsset = (id: number) => {
    const asset = assets.find(a => a.id === id)
    if (asset) {
      setAssetToDelete(id)
      setDeleteConfirmOpen(true)
    }
  }

  const confirmDeleteAsset = async () => {
    if (assetToDelete) {
      try {
        await axios.delete(`${API_BASE_URL}/hardware/${assetToDelete}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
          }
        })
        
        // Refresh assets list
        await fetchAssets()
        
        setMessage('Asset deleted successfully')
        setTimeout(() => setMessage(''), 3000)
        setAssetToDelete(null)
        setDeleteConfirmOpen(false)
      } catch (error) {
        console.error('Error deleting asset:', error)
        setMessage('Error deleting asset')
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const cancelDeleteAsset = () => {
    setAssetToDelete(null)
    setDeleteConfirmOpen(false)
  }

  const exportToCSV = () => {
    const headers = ['Asset Tag', 'Serial Number', 'Device Type', 'Make', 'Model', 'Status', 'Location', 'Assigned To', 'Purchase Date', 'Warranty Expiry', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredAssets.map(asset => [
        asset.asset_tag,
        asset.serial_number,
        asset.device_type,
        asset.make,
        asset.model,
        asset.status,
        asset.location,
        asset.assigned_to,
        asset.purchase_date,
        asset.warranty_expiry,
        `"${asset.notes?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assets.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    setMessage('Assets exported to CSV successfully')
    setTimeout(() => setMessage(''), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Under Repair': return 'bg-orange-100 text-orange-800'
      case 'Retired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading assets...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Repair</p>
                <p className="text-2xl font-bold text-orange-600">{stats.underRepair}</p>
              </div>
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retired</p>
                <p className="text-2xl font-bold text-gray-600">{stats.retired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => fetchAssets()}>
                <Plus className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assets List</CardTitle>
          <CardDescription>
            Showing {paginatedAssets.length} of {filteredAssets.length} assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('asset_tag')}>
                      Asset Tag
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('serial_number')}>
                      Serial Number
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('device_type')}>
                      Device Type
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('make')}>
                      Make
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('model')}>
                      Model
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('status')}>
                      Status
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('location')}>
                      Location
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('assigned_to')}>
                      Assigned To
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{asset.asset_tag}</td>
                    <td className="p-2">{asset.serial_number}</td>
                    <td className="p-2">{asset.device_type}</td>
                    <td className="p-2">{asset.make}</td>
                    <td className="p-2">{asset.model}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="p-2">{asset.location}</td>
                    <td className="p-2">{asset.assigned_to}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAsset(asset)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="items-per-page">Items per page:</Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Asset"
        description={`Are you sure you want to delete this asset? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteAsset}
        onCancel={cancelDeleteAsset}
        variant="destructive"
      />
    </div>
  )
}
