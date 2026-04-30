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
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { NewAssetForm } from './NewAssetForm'
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
  purchase_date: string
  purchase_cost: number
  current_value: number
  depreciation_rate: number
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

// Make to Models mapping
const makeToModels: Record<string, string[]> = {
  'Dell': ['Inspiron', 'Latitude', 'XPS', 'OptiPlex', 'Vostro'],
  'HP': ['Pavilion', 'EliteBook', 'ProBook', 'Spectre', 'Omen'],
  'Lenovo': ['ThinkPad', 'IdeaPad', 'Legion', 'Yoga'],
  'Canon': ['EOS', 'PowerShot', 'Pixma', 'imageCLASS'],
  'Epson': ['EcoTank', 'WorkForce', 'Expression', 'L'],
  'LG': ['Gram', 'Ultra', 'V', 'G', 'OLED'],
  'Samsung': ['Galaxy Book', 'Galaxy Tab', 'Galaxy Watch', 'Galaxy Buds'],
  'Cisco': ['Router', 'Switch', 'Access Point', 'Firewall', 'IP Phone']
}

interface ColumnFilter {
  [key: string]: string
}

// Asset categories for dropdown
const assetCategories = [
  'Computer', 'Office Equipment', 'Network Equipment', 'Display Equipment', 
  'Storage', 'Peripheral', 'Mobile Device', 'Server', 'Other'
]

const assetConditions = ['Excellent', 'Good', 'Fair', 'Poor']
const assetStatuses = ['Active', 'Inactive', 'Under Maintenance', 'Retired', 'Lost', 'Stolen']

export const AssetsManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
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
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null)

  const API_BASE_URL = 'http://localhost:8001'

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/assets`, {
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
    const active = assets.filter(a => a.asset_status === 'Active').length
    const underMaintenance = assets.filter(a => a.asset_status === 'Under Maintenance').length
    const retired = assets.filter(a => a.asset_status === 'Retired').length
    const totalValue = assets.reduce((sum, a) => sum + (a.purchase_cost || 0), 0)

    return { total, active, underMaintenance, retired, totalValue }
  }, [assets])

  // Apply filters and search
  useEffect(() => {
    let filtered = assets

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        Object.values(asset).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(asset =>
          asset[key as keyof Asset].toString().toLowerCase().includes(value.toLowerCase())
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
      
      const response = await axios.post(`${API_BASE_URL}/assets`, assetData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        }
      })
      
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

  const handleUpdateAsset = async (updatedAsset: Asset) => {
    // For now, just show message - update endpoint would need to be implemented
    setMessage('Asset update functionality coming soon')
    setTimeout(() => setMessage(''), 3000)
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
        await axios.delete(`${API_BASE_URL}/assets/${assetToDelete}`, {
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
  }

  const exportToCSV = () => {
    const headers = ['Asset Tag', 'Serial Number', 'Device Type', 'Make', 'Model', 'Status', 'Location', 'Assigned To', 'Purchase Date', 'Warranty Expiry', 'Purchase Cost', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredAssets.map(asset => [
        asset.assetTag,
        asset.serialNumber,
        asset.deviceType,
        asset.make,
        asset.model,
        asset.status,
        asset.location,
        asset.assignedTo,
        asset.purchaseDate,
        asset.warrantyExpiry,
        asset.purchaseCost,
        `"${asset.notes.replace(/"/g, '""')}"`
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

  const exportToPDF = () => {
    // For PDF export, we'll create a simple HTML table and trigger print
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const html = `
        <html>
          <head>
            <title>Assets Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Assets Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Serial Number</th>
                  <th>Device Type</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Assigned To</th>
                  <th>Purchase Date</th>
                  <th>Warranty Expiry</th>
                  <th>Purchase Cost</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAssets.map(asset => `
                  <tr>
                    <td>${asset.assetTag}</td>
                    <td>${asset.serialNumber}</td>
                    <td>${asset.deviceType}</td>
                    <td>${asset.make}</td>
                    <td>${asset.model}</td>
                    <td>${asset.status}</td>
                    <td>${asset.location}</td>
                    <td>${asset.assignedTo}</td>
                    <td>${asset.purchaseDate}</td>
                    <td>${asset.warrantyExpiry}</td>
                    <td>$${asset.purchaseCost}</td>
                    <td>${asset.notes}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
      setMessage('Assets exported to PDF successfully')
      setTimeout(() => setMessage(''), 3000)
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <p className="text-sm font-medium text-gray-600">Retired</p>
                <p className="text-2xl font-bold text-gray-600">{stats.retired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">${stats.totalValue.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
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
              <Button variant="outline" onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={fetchAssets}>
                <Plus className="h-4 w-4 mr-2" />
                Refresh
              </Button>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-indigo-50 border-indigo-200">
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

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Column Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filter-deviceType">Device Type</Label>
                <Input
                  id="filter-deviceType"
                  placeholder="Filter by device type"
                  value={columnFilters.deviceType || ''}
                  onChange={(e) => handleColumnFilter('deviceType', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filter-make">Make</Label>
                <Input
                  id="filter-make"
                  placeholder="Filter by make"
                  value={columnFilters.make || ''}
                  onChange={(e) => handleColumnFilter('make', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select
                  value={columnFilters.status || 'all'}
                  onValueChange={(value) => handleColumnFilter('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Repair">Under Repair</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-location">Location</Label>
                <Input
                  id="filter-location"
                  placeholder="Filter by location"
                  value={columnFilters.location || ''}
                  onChange={(e) => handleColumnFilter('location', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                      Code
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
                    <Button variant="ghost" size="sm" onClick={() => handleSort('brand')}>
                      Brand
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
                  <th className="text-left p-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('condition_rating')}>
                      Condition
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{asset.asset_code}</td>
                    <td className="p-2">
                      <div className="max-w-xs">
                        <div className="font-medium">{asset.asset_name}</div>
                        <div className="text-xs text-gray-500">{asset.serial_number}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {asset.asset_category}
                      </Badge>
                    </td>
                    <td className="p-2">{asset.brand}</td>
                    <td className="p-2">{asset.assigned_user || 'Unassigned'}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(asset.asset_status)}>
                        {asset.asset_status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={asset.condition_rating === 'Excellent' ? 'default' : 'secondary'} className="text-xs">
                        {asset.condition_rating}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="text-right">
                        <div className="font-medium">${asset.current_value || asset.purchase_cost}</div>
                        {asset.current_value && asset.current_value !== asset.purchase_cost && (
                          <div className="text-xs text-gray-500">
                            {((asset.current_value / asset.purchase_cost) * 100).toFixed(0)}% of original
                          </div>
                        )}
                      </div>
                    </td>
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

      {/* Edit Asset Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-indigo-50 border-indigo-200">
          <DialogHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 -mx-6 px-6 pt-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Edit2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-indigo-800 text-xl font-bold">Edit Asset</DialogTitle>
                <DialogDescription className="text-indigo-700 text-base">
                  Update asset information and save changes
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {editingAsset && (
            <div className="pt-6">
              <AssetForm
                asset={editingAsset}
                onSubmit={(asset) => handleUpdateAsset(asset as Asset)}
                onCancel={() => {
                  setIsEditModalOpen(false)
                  setEditingAsset(null)
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

// Asset Form Component
interface AssetFormProps {
  asset?: Asset
  onSubmit: (asset: Omit<Asset, 'id'> | Asset) => void
  onCancel: () => void
}

const AssetForm: React.FC<AssetFormProps> = ({ asset, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Asset, 'id'>>({
    assetTag: asset?.assetTag || '',
    serialNumber: asset?.serialNumber || '',
    deviceType: asset?.deviceType || '',
    make: asset?.make || '',
    model: asset?.model || '',
    status: asset?.status || 'Active',
    location: asset?.location || '',
    assignedTo: asset?.assignedTo || '',
    purchaseDate: asset?.purchaseDate || '',
    warrantyExpiry: asset?.warrantyExpiry || '',
    purchaseCost: asset?.purchaseCost || 0,
    notes: asset?.notes || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get available models based on selected make
  const availableModels = formData.make ? makeToModels[formData.make] || [] : []

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.assetTag.trim()) {
      newErrors.assetTag = 'Asset tag is required'
    } else if (!/^AFC\d{3,}$/.test(formData.assetTag)) {
      newErrors.assetTag = 'Asset tag must start with AFC followed by numbers (e.g., AFC001)'
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required'
    }

    if (!formData.deviceType) {
      newErrors.deviceType = 'Device type is required'
    }

    if (!formData.make) {
      newErrors.make = 'Make is required'
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }

    if (formData.purchaseCost < 0) {
      newErrors.purchaseCost = 'Purchase cost must be a positive number'
    }

    if (formData.purchaseDate && formData.warrantyExpiry) {
      const purchaseDate = new Date(formData.purchaseDate)
      const warrantyExpiry = new Date(formData.warrantyExpiry)
      if (warrantyExpiry <= purchaseDate) {
        newErrors.warrantyExpiry = 'Warranty expiry must be after purchase date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      if (asset) {
        onSubmit({ ...formData, id: asset.id })
      } else {
        onSubmit(formData)
      }
    }
  }

  const handleInputChange = (field: keyof Omit<Asset, 'id'>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-blue-600" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assetTag">Asset Tag *</Label>
          <Input
            id="assetTag"
            value={formData.assetTag}
            onChange={(e) => handleInputChange('assetTag', e.target.value)}
            placeholder="AFC001"
            required
            className={errors.assetTag ? 'border-red-500' : ''}
          />
          {errors.assetTag && (
            <p className="text-red-500 text-sm mt-1">{errors.assetTag}</p>
          )}
        </div>
        <div>
          <Label htmlFor="serialNumber">Serial Number *</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => handleInputChange('serialNumber', e.target.value)}
            placeholder="Enter serial number"
            required
            className={errors.serialNumber ? 'border-red-500' : ''}
          />
          {errors.serialNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.serialNumber}</p>
          )}
        </div>
        <div>
          <Label htmlFor="deviceType">Device Type *</Label>
          <Select
            value={formData.deviceType}
            onValueChange={(value) => handleInputChange('deviceType', value)}
          >
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
              <SelectItem value="Scanner">Scanner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="make">Make *</Label>
          <Select
            value={formData.make}
            onValueChange={(value) => {
              handleInputChange('make', value)
              // Clear model when make changes
              if (value !== formData.make) {
                setFormData(prev => ({ ...prev, model: '' }))
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dell">Dell</SelectItem>
              <SelectItem value="HP">HP</SelectItem>
              <SelectItem value="Lenovo">Lenovo</SelectItem>
              <SelectItem value="Canon">Canon</SelectItem>
              <SelectItem value="Epson">Epson</SelectItem>
              <SelectItem value="LG">LG</SelectItem>
              <SelectItem value="Samsung">Samsung</SelectItem>
              <SelectItem value="Cisco">Cisco</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="model">Model *</Label>
          <Select
            value={formData.model}
            onValueChange={(value) => handleInputChange('model', value)}
            disabled={!formData.make}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.make ? "Select model" : "Select make first"} />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.model && (
            <p className="text-red-500 text-sm mt-1">{errors.model}</p>
          )}
        </div>
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Under Repair">Under Repair</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location *</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => handleInputChange('location', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IT Department">IT Department</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Head Office">Head Office</SelectItem>
              <SelectItem value="Reception">Reception</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Storage">Storage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => handleInputChange('assignedTo', e.target.value)}
            placeholder="Enter assignee name"
          />
        </div>
        <div>
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
          <Input
            id="warrantyExpiry"
            type="date"
            value={formData.warrantyExpiry}
            onChange={(e) => handleInputChange('warrantyExpiry', e.target.value)}
            className={errors.warrantyExpiry ? 'border-red-500' : ''}
          />
          {errors.warrantyExpiry && (
            <p className="text-red-500 text-sm mt-1">{errors.warrantyExpiry}</p>
          )}
        </div>
        <div>
          <Label htmlFor="purchaseCost">Purchase Cost</Label>
          <Input
            id="purchaseCost"
            type="number"
            value={formData.purchaseCost}
            onChange={(e) => handleInputChange('purchaseCost', parseFloat(e.target.value))}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={errors.purchaseCost ? 'border-red-500' : ''}
          />
          {errors.purchaseCost && (
            <p className="text-red-500 text-sm mt-1">{errors.purchaseCost}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Enter notes"
          />
        </div>
      </div>
      </div>
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6 py-2 h-11 text-base font-medium bg-white hover:bg-gray-50 border-gray-300 transition-colors"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="px-6 py-2 h-11 text-base font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {asset ? 'Update Asset' : 'Add Asset'}
        </Button>
      </div>
    </form>
  )
}
