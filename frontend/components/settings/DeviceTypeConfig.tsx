'use client'

import React, { useState, useEffect } from 'react'
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
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([])
  const [loading, setLoading] = useState(true)

  // Load device types from API
  useEffect(() => {
    loadDeviceTypes()
  }, [])

  const loadDeviceTypes = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/device-types')
      const data = await response.json()
      setDeviceTypes(data.device_types || [])
    } catch (error) {
      console.error('Error loading device types:', error)
      setMessage('Failed to load device types')
    } finally {
      setLoading(false)
    }
  }
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

  const handleSubmit = async () => {
    if (!formData.device_type_name) {
      setMessage('Device type name is required')
      return
    }

    try {
      let response;
      if (editingId) {
        response = await fetch(`http://localhost:8001/api/device-types/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        setMessage('Device type updated successfully')
      } else {
        response = await fetch('http://localhost:8001/api/device-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        setMessage('Device type added successfully')
      }

      if (response.ok) {
        await loadDeviceTypes() // Reload device types from API
        resetForm()
      } else {
        const errorData = await response.json()
        setMessage(errorData.detail || 'Failed to save device type')
      }
    } catch (error) {
      console.error('Error saving device type:', error)
      setMessage('Failed to save device type')
    }
  }

  const handleEdit = (deviceType: DeviceType) => {
    setFormData(deviceType)
    setEditingId(deviceType.id!)
    setIsAdding(true)
    setMessage('')
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8001/api/device-types/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadDeviceTypes() // Reload device types from API
        setMessage('Device type deleted successfully')
      } else {
        const errorData = await response.json()
        setMessage(errorData.detail || 'Failed to delete device type')
      }
    } catch (error) {
      console.error('Error deleting device type:', error)
      setMessage('Failed to delete device type')
    }
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
