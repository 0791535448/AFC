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
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  Monitor,
  Wrench,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Upload,
  X
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { NewAssetForm } from '@/components/assets/NewAssetForm'
import { EditAssetForm } from '@/components/assets/EditAssetForm'
import { AssetMassUpload } from './AssetMassUpload'
import axios from 'axios'

interface Asset {
  id: number
  asset_code: string
  asset_name: string
  asset_category: string
  asset_type: string
  brand: string
  serial_number: string
  model_number: string
  warranty_start: string
  warranty_end: string
  maintenance_contract: boolean
  contract_expiry: string
  location: string
  department: string
  assigned_user: string
  asset_status: string
  condition_rating: string
  last_inspection: string
  next_inspection: string
  notes: string
  barcode: string
  qr_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ColumnFilter {
  [key: string]: string
}

const assetCategories = [
  'Computer', 'Office Equipment', 'Network Equipment', 'Display Equipment', 
  'Storage', 'Peripheral', 'Mobile Device', 'Server', 'Other'
]

const assetConditions = ['Excellent', 'Good', 'Fair', 'Poor']
const assetStatuses = ['Active', 'Inactive', 'Under Maintenance', 'Retired', 'Lost', 'Stolen']

export const AssetsManagementClean: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Asset; direction: 'asc' | 'desc' } | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isMassUploadModalOpen, setIsMassUploadModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<number | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null)

  const API_BASE_URL = 'http://localhost:8001'

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/dev/assets`)
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
    const active = assets.filter(a => a.asset_status === 'Active').length
    const underMaintenance = assets.filter(a => a.asset_status === 'Under Maintenance').length
    const retired = assets.filter(a => a.asset_status === 'Retired').length

    return { total, active, underMaintenance, retired }
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

  const handleAddAsset = async (newAsset: any) => {
    try {
      // Add missing required fields
      const assetData = {
        ...newAsset,
        is_active: true
      }
      
      const response = await axios.post(`${API_BASE_URL}/dev/assets`, assetData)
      
      // Refresh assets list
      await fetchAssets()
      
      setMessage('Asset added successfully')
      setIsAddModalOpen(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error adding asset:', error)
      setMessage('Error adding asset')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleMassUpload = async (uploadedAssets: any[]) => {
    try {
      // Refresh assets list to show newly uploaded assets
      await fetchAssets()
      
      setMessage(`${uploadedAssets.length} assets uploaded successfully`)
      setIsMassUploadModalOpen(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error in mass upload:', error)
      setMessage('Error processing mass upload')
      setTimeout(() => setMessage(''), 3000)
    }
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
        await axios.delete(`${API_BASE_URL}/dev/assets/${assetToDelete}`)
        
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

  const handleEditAsset = (asset: Asset) => {
    setAssetToEdit(asset)
    setEditModalOpen(true)
  }

  const handleUpdateAsset = async (updatedAsset: Partial<Asset>) => {
    if (!assetToEdit) return

    try {
      await axios.put(`${API_BASE_URL}/dev/assets/${assetToEdit.id}`, updatedAsset)
      
      // Refresh assets list
      await fetchAssets()
      
      setMessage('Asset updated successfully')
      setTimeout(() => setMessage(''), 3000)
      setEditModalOpen(false)
      setAssetToEdit(null)
    } catch (error) {
      console.error('Error updating asset:', error)
      setMessage('Error updating asset')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const cancelEditAsset = () => {
    setEditModalOpen(false)
    setAssetToEdit(null)
  }

  const exportToCSV = () => {
    const headers = ['Asset Code', 'Asset Name', 'Category', 'Brand', 'Status', 'Location', 'Department', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredAssets.map(asset => [
        asset.asset_code,
        asset.asset_name,
        asset.asset_category,
        asset.brand,
        asset.asset_status,
        asset.location,
        asset.department,
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
      case 'Under Maintenance': return 'bg-orange-100 text-orange-800'
      case 'Retired': return 'bg-gray-100 text-gray-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      case 'Lost': return 'bg-red-100 text-red-800'
      case 'Stolen': return 'bg-red-100 text-red-800'
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
                <p className="text-sm font-medium text-gray-600">Under Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">{stats.underMaintenance}</p>
              </div>
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
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
              <Button onClick={fetchAssets}>
                <Plus className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isMassUploadModalOpen} onOpenChange={setIsMassUploadModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Mass Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-indigo-50 border-indigo-200 max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Upload className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-indigo-800 text-xl font-bold">Mass Upload Assets</DialogTitle>
                        <DialogDescription className="text-indigo-700 text-base">
                          Upload multiple assets using a CSV file
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="pt-6">
                    <AssetMassUpload onAssetsUploaded={handleMassUpload} onCancel={() => setIsMassUploadModalOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-indigo-50 border-indigo-200 max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Plus className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-indigo-800 text-xl font-bold">Add New Asset</DialogTitle>
                        <DialogDescription className="text-indigo-700 text-base">
                          Enter the details for the new asset
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="pt-6">
                    <NewAssetForm onSubmit={handleAddAsset} onCancel={() => setIsAddModalOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
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
                    <Button variant="ghost" size="sm" onClick={() => handleSort('asset_code')}>
                      Tag
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('asset_name')}>
                      Asset Name
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('asset_category')}>
                      Category
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('asset_type')}>
                      Type
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('brand')}>
                      Brand
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
                    <Button variant="ghost" size="sm" onClick={() => handleSort('location')}>
                      Location
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('assigned_user')}>
                      Assigned To
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('asset_status')}>
                      Status
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{asset.asset_code}</td>
                    <td className="p-2 font-medium">{asset.asset_name}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {asset.asset_category}
                      </Badge>
                    </td>
                    <td className="p-2">{asset.asset_type}</td>
                    <td className="p-2">{asset.brand}</td>
                    <td className="p-2">{asset.serial_number || '-'}</td>
                    <td className="p-2">{asset.location}</td>
                    <td className="p-2">{asset.assigned_user || 'Unassigned'}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(asset.asset_status)}>
                        {asset.asset_status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAsset(asset)}
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

      {/* Edit Asset Form */}
      {editModalOpen && assetToEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Edit Asset
              <Button variant="ghost" size="sm" onClick={cancelEditAsset}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Update asset information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditAssetForm
              asset={assetToEdit}
              onSubmit={handleUpdateAsset}
              onCancel={cancelEditAsset}
            />
          </CardContent>
        </Card>
      )}

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
