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
  Package, 
  Globe, 
  Mail, 
  Save,
  X
} from 'lucide-react'

interface Make {
  id?: number
  make_name: string
  description: string
  website: string
  support_contact: string
  is_active: boolean
}

export const MakeConfig: React.FC = () => {
  const [makes, setMakes] = useState<Make[]>([
    {
      id: 1,
      make_name: 'Dell',
      description: 'Dell Inc. computer hardware',
      website: 'https://www.dell.com',
      support_contact: 'support@dell.com',
      is_active: true
    },
    {
      id: 2,
      make_name: 'HP',
      description: 'Hewlett-Packard computer hardware',
      website: 'https://www.hp.com',
      support_contact: 'support@hp.com',
      is_active: true
    },
    {
      id: 3,
      make_name: 'Canon',
      description: 'Canon printing and imaging equipment',
      website: 'https://www.canon.com',
      support_contact: 'support@canon.com',
      is_active: true
    },
    {
      id: 4,
      make_name: 'LG',
      description: 'LG Electronics displays and electronics',
      website: 'https://www.lg.com',
      support_contact: 'support@lg.com',
      is_active: true
    },
    {
      id: 5,
      make_name: 'Cisco',
      description: 'Cisco networking equipment',
      website: 'https://www.cisco.com',
      support_contact: 'support@cisco.com',
      is_active: true
    },
    {
      id: 6,
      make_name: 'Lenovo',
      description: 'Lenovo computer hardware',
      website: 'https://www.lenovo.com',
      support_contact: 'support@lenovo.com',
      is_active: true
    },
    {
      id: 7,
      make_name: 'Epson',
      description: 'Epson printing equipment',
      website: 'https://www.epson.com',
      support_contact: 'support@epson.com',
      is_active: true
    },
    {
      id: 8,
      make_name: 'Samsung',
      description: 'Samsung electronics and displays',
      website: 'https://www.samsung.com',
      support_contact: 'support@samsung.com',
      is_active: true
    }
  ])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Make>({
    make_name: '',
    description: '',
    website: '',
    support_contact: '',
    is_active: true
  })
  const [message, setMessage] = useState('')

  const handleInputChange = (field: keyof Make, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.make_name) {
      setMessage('Make name is required')
      return
    }

    if (editingId) {
      setMakes(prev => prev.map(make => 
        make.id === editingId ? { ...formData, id: editingId } : make
      ))
      setMessage('Make updated successfully')
    } else {
      const newMake = { ...formData, id: Date.now() }
      setMakes(prev => [...prev, newMake])
      setMessage('Make added successfully')
    }

    resetForm()
  }

  const handleEdit = (make: Make) => {
    setFormData(make)
    setEditingId(make.id!)
    setIsAdding(true)
    setMessage('')
  }

  const handleDelete = (id: number) => {
    setMakes(prev => prev.filter(make => make.id !== id))
    setMessage('Make deleted successfully')
  }

  const resetForm = () => {
    setFormData({
      make_name: '',
      description: '',
      website: '',
      support_contact: '',
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

      {/* Add/Edit Make Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Hardware Make' : 'Add New Hardware Make'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update hardware make information' : 'Create a new hardware manufacturer'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make_name">Make Name *</Label>
                <Input
                  id="make_name"
                  value={formData.make_name}
                  onChange={(e) => handleInputChange('make_name', e.target.value)}
                  placeholder="Enter make name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter make description"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="support_contact">Support Contact</Label>
                <Input
                  id="support_contact"
                  value={formData.support_contact}
                  onChange={(e) => handleInputChange('support_contact', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update Make' : 'Add Make'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Makes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Hardware Makes
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Make
            </Button>
          </CardTitle>
          <CardDescription>
            Manage hardware manufacturers and their support information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {makes.map((make) => (
              <div key={make.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{make.make_name}</h3>
                      {make.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </div>
                    
                    {make.description && (
                      <p className="text-sm text-gray-600 mb-2">{make.description}</p>
                    )}
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {make.website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          <a 
                            href={make.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {make.website}
                          </a>
                        </div>
                      )}
                      {make.support_contact && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {make.support_contact}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(make)}
                      disabled={isAdding}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(make.id!)}
                      disabled={isAdding}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {makes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hardware makes configured yet</p>
                <p className="text-sm">Click "Add Make" to create your first hardware make</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
