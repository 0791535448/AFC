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
  Tag, 
  Save,
  X
} from 'lucide-react'

interface Model {
  id?: number
  model_name: string
  make_id: number
  device_type_id: number
  specifications: string
  release_year: number
  is_active: boolean
}

interface Make {
  id: number
  make_name: string
}

interface DeviceType {
  id: number
  device_type_name: string
}

export const ModelConfig: React.FC = () => {
  const makes: Make[] = [
    { id: 1, make_name: 'Dell' },
    { id: 2, make_name: 'HP' },
    { id: 3, make_name: 'Canon' },
    { id: 4, make_name: 'LG' },
    { id: 5, make_name: 'Cisco' },
    { id: 6, make_name: 'Lenovo' },
    { id: 7, make_name: 'Epson' },
    { id: 8, make_name: 'Samsung' }
  ]

  const deviceTypes: DeviceType[] = [
    { id: 1, device_type_name: 'Laptop' },
    { id: 2, device_type_name: 'Desktop' },
    { id: 3, device_type_name: 'Printer' },
    { id: 4, device_type_name: 'Monitor' },
    { id: 5, device_type_name: 'Server' },
    { id: 6, device_type_name: 'Router' },
    { id: 7, device_type_name: 'Switch' },
    { id: 8, device_type_name: 'Scanner' }
  ]

  const [models, setModels] = useState<Model[]>([
    {
      id: 1,
      model_name: 'Latitude 7420',
      make_id: 1,
      device_type_id: 1,
      specifications: 'Intel Core i7, 16GB RAM, 512GB SSD',
      release_year: 2023,
      is_active: true
    },
    {
      id: 2,
      model_name: 'EliteDesk 800',
      make_id: 2,
      device_type_id: 2,
      specifications: 'Intel Core i5, 8GB RAM, 256GB SSD',
      release_year: 2022,
      is_active: true
    },
    {
      id: 3,
      model_name: 'IR-ADV 4535',
      make_id: 3,
      device_type_id: 3,
      specifications: 'Multi-function printer, 45ppm, Color',
      release_year: 2021,
      is_active: true
    },
    {
      id: 4,
      model_name: '27UL850',
      make_id: 4,
      device_type_id: 4,
      specifications: '27-inch 4K UHD Monitor, USB-C',
      release_year: 2022,
      is_active: true
    },
    {
      id: 5,
      model_name: 'ThinkPad X1 Carbon',
      make_id: 6,
      device_type_id: 1,
      specifications: 'Intel Core i7, 16GB RAM, 1TB SSD',
      release_year: 2023,
      is_active: true
    },
    {
      id: 6,
      model_name: 'Epson EcoTank L3150',
      make_id: 7,
      device_type_id: 3,
      specifications: 'Ink Tank Printer, Wireless',
      release_year: 2022,
      is_active: true
    },
    {
      id: 7,
      model_name: 'Cisco Catalyst 2960',
      make_id: 5,
      device_type_id: 6,
      specifications: '24-port Gigabit Switch',
      release_year: 2021,
      is_active: true
    }
  ])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Model>({
    model_name: '',
    make_id: 1,
    device_type_id: 1,
    specifications: '',
    release_year: new Date().getFullYear(),
    is_active: true
  })
  const [message, setMessage] = useState('')

  const handleInputChange = (field: keyof Model, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.model_name) {
      setMessage('Model name is required')
      return
    }

    if (editingId) {
      setModels(prev => prev.map(model => 
        model.id === editingId ? { ...formData, id: editingId } : model
      ))
      setMessage('Model updated successfully')
    } else {
      const newModel = { ...formData, id: Date.now() }
      setModels(prev => [...prev, newModel])
      setMessage('Model added successfully')
    }

    resetForm()
  }

  const handleEdit = (model: Model) => {
    setFormData(model)
    setEditingId(model.id!)
    setIsAdding(true)
    setMessage('')
  }

  const handleDelete = (id: number) => {
    setModels(prev => prev.filter(model => model.id !== id))
    setMessage('Model deleted successfully')
  }

  const resetForm = () => {
    setFormData({
      model_name: '',
      make_id: 1,
      device_type_id: 1,
      specifications: '',
      release_year: new Date().getFullYear(),
      is_active: true
    })
    setIsAdding(false)
    setEditingId(null)
    setTimeout(() => setMessage(''), 3000)
  }

  const getMakeName = (makeId: number) => {
    const make = makes.find(m => m.id === makeId)
    return make?.make_name || 'Unknown'
  }

  const getDeviceTypeName = (deviceTypeId: number) => {
    const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId)
    return deviceType?.device_type_name || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Model Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Hardware Model' : 'Add New Hardware Model'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update hardware model information' : 'Create a new hardware model'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model_name">Model Name *</Label>
                <Input
                  id="model_name"
                  value={formData.model_name}
                  onChange={(e) => handleInputChange('model_name', e.target.value)}
                  placeholder="Enter model name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="make_id">Make</Label>
                <Select 
                  value={formData.make_id.toString()} 
                  onValueChange={(value: string) => handleInputChange('make_id', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((make) => (
                      <SelectItem key={make.id} value={make.id.toString()}>
                        {make.make_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="device_type_id">Device Type</Label>
                <Select 
                  value={formData.device_type_id.toString()} 
                  onValueChange={(value: string) => handleInputChange('device_type_id', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((deviceType) => (
                      <SelectItem key={deviceType.id} value={deviceType.id.toString()}>
                        {deviceType.device_type_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="release_year">Release Year</Label>
                <Input
                  id="release_year"
                  type="number"
                  value={formData.release_year}
                  onChange={(e) => handleInputChange('release_year', parseInt(e.target.value))}
                  min="2000"
                  max={new Date().getFullYear() + 5}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specifications">Specifications</Label>
                <Input
                  id="specifications"
                  value={formData.specifications}
                  onChange={(e) => handleInputChange('specifications', e.target.value)}
                  placeholder="Enter model specifications"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update Model' : 'Add Model'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Hardware Models
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </CardTitle>
          <CardDescription>
            Manage hardware models with their specifications and relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {models.map((model) => (
              <div key={model.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{model.model_name}</h3>
                      <Badge variant="outline">{getMakeName(model.make_id)}</Badge>
                      <Badge variant="secondary">{getDeviceTypeName(model.device_type_id)}</Badge>
                      {model.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </div>
                    
                    {model.specifications && (
                      <p className="text-sm text-gray-600 mb-2">{model.specifications}</p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Release Year: {model.release_year}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(model)}
                      disabled={isAdding}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(model.id!)}
                      disabled={isAdding}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {models.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hardware models configured yet</p>
                <p className="text-sm">Click "Add Model" to create your first hardware model</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
