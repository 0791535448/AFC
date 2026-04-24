'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Save,
  X,
  Palette
} from 'lucide-react'

interface Status {
  id?: number
  status_name: string
  description: string
  color_code: string
  is_active: boolean
}

export const StatusConfig: React.FC = () => {
  const [statuses, setStatuses] = useState<Status[]>([
    {
      id: 1,
      status_name: 'Active',
      description: 'Device is in use and operational',
      color_code: '#22c55e',
      is_active: true
    },
    {
      id: 2,
      status_name: 'Under Repair',
      description: 'Device is being repaired',
      color_code: '#f59e0b',
      is_active: true
    },
    {
      id: 3,
      status_name: 'Retired',
      description: 'Device is no longer in service',
      color_code: '#64748b',
      is_active: true
    },
    {
      id: 4,
      status_name: 'Lost',
      description: 'Device has been lost',
      color_code: '#ef4444',
      is_active: true
    },
    {
      id: 5,
      status_name: 'Disposed',
      description: 'Device has been disposed',
      color_code: '#991b1b',
      is_active: true
    },
    {
      id: 6,
      status_name: 'In Storage',
      description: 'Device is in storage',
      color_code: '#8b5cf6',
      is_active: true
    },
    {
      id: 7,
      status_name: 'Pending Assignment',
      description: 'Device awaiting assignment',
      color_code: '#06b6d4',
      is_active: true
    }
  ])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Status>({
    status_name: '',
    description: '',
    color_code: '#22c55e',
    is_active: true
  })
  const [message, setMessage] = useState('')

  const predefinedColors = [
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Gray', value: '#64748b' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Orange', value: '#f97316' }
  ]

  const handleInputChange = (field: keyof Status, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.status_name) {
      setMessage('Status name is required')
      return
    }

    if (editingId) {
      setStatuses(prev => prev.map(status => 
        status.id === editingId ? { ...formData, id: editingId } : status
      ))
      setMessage('Status updated successfully')
    } else {
      const newStatus = { ...formData, id: Date.now() }
      setStatuses(prev => [...prev, newStatus])
      setMessage('Status added successfully')
    }

    resetForm()
  }

  const handleEdit = (status: Status) => {
    setFormData(status)
    setEditingId(status.id!)
    setIsAdding(true)
    setMessage('')
  }

  const handleDelete = (id: number) => {
    setStatuses(prev => prev.filter(status => status.id !== id))
    setMessage('Status deleted successfully')
  }

  const resetForm = () => {
    setFormData({
      status_name: '',
      description: '',
      color_code: '#22c55e',
      is_active: true
    })
    setIsAdding(false)
    setEditingId(null)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Status Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Hardware Status' : 'Add New Hardware Status'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update hardware status information' : 'Create a new hardware status option'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status_name">Status Name *</Label>
                <Input
                  id="status_name"
                  value={formData.status_name}
                  onChange={(e) => handleInputChange('status_name', e.target.value)}
                  placeholder="Enter status name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color_code">Color Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="color_code"
                    value={formData.color_code}
                    onChange={(e) => handleInputChange('color_code', e.target.value)}
                    placeholder="#22c55e"
                    className="flex-1"
                  />
                  <div 
                    className="w-10 h-10 rounded border border-gray-300"
                    style={{ backgroundColor: formData.color_code }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleInputChange('color_code', color.value)}
                      className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter status description"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update Status' : 'Add Status'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statuses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Hardware Status Options
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Status
            </Button>
          </CardTitle>
          <CardDescription>
            Manage hardware status options with color coding for easy identification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statuses.map((status) => (
              <div key={status.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: status.color_code }}
                        />
                        <h3 className="font-semibold text-lg">{status.status_name}</h3>
                      </div>
                      {status.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </div>
                    
                    {status.description && (
                      <p className="text-sm text-gray-600 mb-2">{status.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Palette className="h-3 w-3 mr-1" />
                        <span>{status.color_code}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(status)}
                      disabled={isAdding}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(status.id!)}
                      disabled={isAdding}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {statuses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hardware status options configured yet</p>
                <p className="text-sm">Click "Add Status" to create your first hardware status</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
