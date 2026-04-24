'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Building2, 
  Monitor, 
  Wrench, 
  Package, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter
} from 'lucide-react'
import BranchForm from '@/components/config/BranchForm'
import DeviceTypeForm from '@/components/config/DeviceTypeForm'
import MakeForm from '@/components/config/MakeForm'
import ModelForm from '@/components/config/ModelForm'
import StatusForm from '@/components/config/StatusForm'

interface ConfigItem {
  id: number
  name: string
  code?: string
  description?: string
  isActive: boolean
  createdAt: string
}

interface Branch extends ConfigItem {
  code: string
  locationAddress?: string
  contactPerson?: string
  contactPhone?: string
}

interface DeviceType extends ConfigItem {
  category?: string
}

interface Make extends ConfigItem {
  website?: string
  supportContact?: string
}

interface Model extends ConfigItem {
  makeId: number
  deviceTypeId: number
  specifications?: string
  releaseYear?: number
  makeName?: string
  deviceTypeName?: string
}

interface Status extends ConfigItem {
  colorCode?: string
}

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState<'branches' | 'deviceTypes' | 'makes' | 'models' | 'status'>('branches')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Mock data - replace with API calls
  const [branches, setBranches] = useState<Branch[]>([
    { id: 1, name: 'Head Office', code: 'HO', locationAddress: '123 Main Street, Nairobi', contactPerson: 'John Manager', contactPhone: '+254-712-345-678', isActive: true, createdAt: '2023-01-01' },
    { id: 2, name: 'IT Department', code: 'IT', locationAddress: '456 Tech Avenue, Nairobi', contactPerson: 'Jane IT', contactPhone: '+254-723-456-789', isActive: true, createdAt: '2023-01-01' },
  ])

  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([
    { id: 1, name: 'Laptop', description: 'Portable computer for mobile work', category: 'Computer', isActive: true, createdAt: '2023-01-01' },
    { id: 2, name: 'Desktop', description: 'Desktop computer for office work', category: 'Computer', isActive: true, createdAt: '2023-01-01' },
  ])

  const [makes, setMakes] = useState<Make[]>([
    { id: 1, name: 'Dell', description: 'Dell Inc. computer hardware', website: 'https://www.dell.com', supportContact: 'support@dell.com', isActive: true, createdAt: '2023-01-01' },
    { id: 2, name: 'HP', description: 'Hewlett-Packard computer hardware', website: 'https://www.hp.com', supportContact: 'support@hp.com', isActive: true, createdAt: '2023-01-01' },
  ])

  const [models, setModels] = useState<Model[]>([
    { id: 1, name: 'Latitude 7420', makeId: 1, deviceTypeId: 1, specifications: 'Intel Core i7, 16GB RAM, 512GB SSD', releaseYear: 2023, makeName: 'Dell', deviceTypeName: 'Laptop', isActive: true, createdAt: '2023-01-01' },
    { id: 2, name: 'EliteDesk 800', makeId: 2, deviceTypeId: 2, specifications: 'Intel Core i5, 8GB RAM, 256GB SSD', releaseYear: 2022, makeName: 'HP', deviceTypeName: 'Desktop', isActive: true, createdAt: '2023-01-01' },
  ])

  const [statusList, setStatusList] = useState<Status[]>([
    { id: 1, name: 'Active', description: 'Device is in use and operational', colorCode: '#22c55e', isActive: true, createdAt: '2023-01-01' },
    { id: 2, name: 'Under Repair', description: 'Device is being repaired', colorCode: '#f59e0b', isActive: true, createdAt: '2023-01-01' },
  ])

  const tabs = [
    { id: 'branches', label: 'Branches', icon: Building2, count: branches.length },
    { id: 'deviceTypes', label: 'Device Types', icon: Monitor, count: deviceTypes.length },
    { id: 'makes', label: 'Hardware Makes', icon: Wrench, count: makes.length },
    { id: 'models', label: 'Hardware Models', icon: Package, count: models.length },
    { id: 'status', label: 'Status Options', icon: CheckCircle, count: statusList.length },
  ]

  const getCurrentData = () => {
    switch (activeTab) {
      case 'branches': return branches
      case 'deviceTypes': return deviceTypes
      case 'makes': return makes
      case 'models': return models
      case 'status': return statusList
      default: return []
    }
  }

  const renderTable = () => {
    const data = getCurrentData()
    const filteredData = data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (activeTab === 'branches') {
      return (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Code</th>
                <th>Location</th>
                <th>Contact Person</th>
                <th>Contact Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((branch: Branch) => (
                <tr key={branch.id}>
                  <td className="font-medium">{branch.name}</td>
                  <td><Badge variant="outline">{branch.code}</Badge></td>
                  <td className="text-sm">{branch.locationAddress}</td>
                  <td>{branch.contactPerson}</td>
                  <td>{branch.contactPhone}</td>
                  <td>
                    <Badge className={branch.isActive ? 'status-badge status-active' : 'status-badge'}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(branch)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'deviceTypes') {
      return (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Device Type</th>
                <th>Description</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((device: DeviceType) => (
                <tr key={device.id}>
                  <td className="font-medium">{device.name}</td>
                  <td className="text-sm">{device.description}</td>
                  <td><Badge variant="outline">{device.category}</Badge></td>
                  <td>
                    <Badge className={device.isActive ? 'status-badge status-active' : 'status-badge'}>
                      {device.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(device)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'makes') {
      return (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Make Name</th>
                <th>Description</th>
                <th>Website</th>
                <th>Support Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((make: Make) => (
                <tr key={make.id}>
                  <td className="font-medium">{make.name}</td>
                  <td className="text-sm">{make.description}</td>
                  <td>
                    <a href={make.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {make.website}
                    </a>
                  </td>
                  <td>{make.supportContact}</td>
                  <td>
                    <Badge className={make.isActive ? 'status-badge status-active' : 'status-badge'}>
                      {make.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(make)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'models') {
      return (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Make</th>
                <th>Device Type</th>
                <th>Specifications</th>
                <th>Release Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((model: Model) => (
                <tr key={model.id}>
                  <td className="font-medium">{model.name}</td>
                  <td><Badge variant="outline">{model.makeName}</Badge></td>
                  <td><Badge variant="outline">{model.deviceTypeName}</Badge></td>
                  <td className="text-sm">{model.specifications}</td>
                  <td>{model.releaseYear}</td>
                  <td>
                    <Badge className={model.isActive ? 'status-badge status-active' : 'status-badge'}>
                      {model.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(model)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'status') {
      return (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status Name</th>
                <th>Description</th>
                <th>Color Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((status: Status) => (
                <tr key={status.id}>
                  <td className="font-medium">{status.name}</td>
                  <td className="text-sm">{status.description}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300" 
                        style={{ backgroundColor: status.colorCode }}
                      />
                      <span className="text-sm">{status.colorCode}</span>
                    </div>
                  </td>
                  <td>
                    <Badge className={status.isActive ? 'status-badge status-active' : 'status-badge'}>
                      {status.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(status)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return null
  }

  const handleFormSubmit = (item: any) => {
    // Handle form submission - API call would go here
    console.log('Form submitted:', item)
    setShowAddModal(false)
    setEditingItem(null)
  }

  const renderForm = () => {
    if (activeTab === 'branches') {
      return (
        <BranchForm
          branch={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
        />
      )
    }
    if (activeTab === 'deviceTypes') {
      return (
        <DeviceTypeForm
          deviceType={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
        />
      )
    }
    if (activeTab === 'makes') {
      return (
        <MakeForm
          make={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
        />
      )
    }
    if (activeTab === 'models') {
      return (
        <ModelForm
          model={editingItem}
          makes={makes.map(m => ({ id: m.id, name: m.name }))}
          deviceTypes={deviceTypes.map(dt => ({ id: dt.id, name: dt.name }))}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
        />
      )
    }
    if (activeTab === 'status') {
      return (
        <StatusForm
          status={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
        />
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuration Management</h1>
                <p className="text-gray-600 text-sm">Manage system configuration data</p>
              </div>
            </div>
            <Button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {tab.count}
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable()}
          </CardContent>
        </Card>
      </main>

      {/* Form Modal */}
      {(showAddModal || editingItem) && renderForm()}
    </div>
  )
}
