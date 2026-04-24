'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Cpu, 
  Save,
  X
} from 'lucide-react'

interface DeviceType {
  id?: number
  device_type_name: string
  description: string
  category: string
  is_active: boolean
}

const categories = ['Computer', 'Peripheral', 'Infrastructure', 'Network', 'Storage', 'Other']

export const DeviceTypeConfig: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([
    {
      id: 1,
      device_type_name: 'Laptop',
      description: 'Portable computer for mobile work',
      category: 'Computer',
      is_active: true
    },
    {
      id: 2,
      device_type_name: 'Desktop',
      description: 'Desktop computer for office work',
      category: 'Computer',
      is_active: true
    },
    {
      id: 3,
      device_type_name: 'Printer',
      description: 'Document printing device',
      category: 'Peripheral',
      is_active: true
    },
    {
      id: 4,
      device_type_name: 'Monitor',
      description: 'Display screen for computers',
      category: 'Peripheral',
      is_active: true
    },
    {
      id: 5,
      device_type_name: 'Server',
      description: 'Enterprise server equipment',
      category: 'Infrastructure',
      is_active: true
    },
    {
      id: 6,
      device_type_name: 'Router',
      description: 'Network routing device',
      category: 'Network',
      is_active: true
    },
    {
      id: 7,
      device_type_name: 'Switch',
      description: 'Network switching device',
      category: 'Network',
      is_active: true
    },
    {
      id: 8,
      device_type_name: 'Scanner',
      description: 'Document scanning device',
      category: 'Peripheral',
      is_active: true
    }
  ])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<DeviceType>({
    device_type_name: '',
    description: '',
    category: 'Computer',
    is_active: true
  })
  const [message, setMessage] = useState('')

  const handleInputChange = (field: keyof DeviceType, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.device_type_name) {
      setMessage('Device type name is required')
      return
    }

    if (editingId) {
      setDeviceTypes(prev => prev.map(deviceType => 
        deviceType.id === editingId ? { ...formData, id: editingId } : deviceType
      ))
      setMessage('Device type updated successfully')
    } else {
      const newDeviceType = { ...formData, id: Date.now() }
      setDeviceTypes(prev => [...prev, newDeviceType])
      setMessage('Device type added successfully')
    }

    resetForm()
  }

  const handleEdit = (deviceType: DeviceType) => {
    setFormData(deviceType)
    setEditingId(deviceType.id!)
    setIsAdding(true)
    setMessage('')
  }

  const handleDelete = (id: number) => {
    setDeviceTypes(prev => prev.filter(deviceType => deviceType.id !== id))
    setMessage('Device type deleted successfully')
  }

  const resetForm = () => {
    setFormData({
      device_type_name: '',
      description: '',
      category: 'Computer',
      is_active: true
    })
    setIsAdding(false)
    setEditingId(null)
    setTimeout(() => setMessage(''), 3000)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Computer': return 'bg-blue-100 text-blue-800'
      case 'Peripheral': return 'bg-green-100 text-green-800'
      case 'Infrastructure': return 'bg-purple-100 text-purple-800'
      case 'Network': return 'bg-orange-100 text-orange-800'
      case 'Storage': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Device Type Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Device Type' : 'Add New Device Type'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update device type information' : 'Create a new device type category'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="device_type_name">Device Type Name *</Label>
                <Input
                  id="device_type_name"
                  value={formData.device_type_name}
                  onChange={(e) => handleInputChange('device_type_name', e.target.value)}
                  placeholder="Enter device type name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value: string) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter device type description"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update Device Type' : 'Add Device Type'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Types List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Cpu className="h-5 w-5 mr-2" />
              Device Types
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Device Type
            </Button>
          </CardTitle>
          <CardDescription>
            Manage device categories and types for hardware classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deviceTypes.map((deviceType) => (
              <div key={deviceType.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{deviceType.device_type_name}</h3>
                      <Badge className={getCategoryColor(deviceType.category)}>
                        {deviceType.category}
                      </Badge>
                      {deviceType.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </div>
                    
                    {deviceType.description && (
                      <p className="text-sm text-gray-600">{deviceType.description}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(deviceType)}
                      disabled={isAdding}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(deviceType.id!)}
                      disabled={isAdding}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {deviceTypes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Cpu className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No device types configured yet</p>
                <p className="text-sm">Click "Add Device Type" to create your first device type</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
