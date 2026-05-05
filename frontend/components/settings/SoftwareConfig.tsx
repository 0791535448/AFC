'use client'

import React, { useState, useEffect } from 'react'
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
  Save,
  X,
  Shield,
  Calendar
} from 'lucide-react'

interface Software {
  id?: number
  software_name: string
  software_provider: string
  license_update_date: string
  license_expiry_date: string
  is_active: boolean
}

const predefinedSoftware: Software[] = [
  { id: 1, software_name: 'BR Net', software_provider: 'Craft Silicon', license_update_date: '2024-01-15', license_expiry_date: '2025-01-15', is_active: true },
  { id: 2, software_name: 'FITNES', software_provider: 'FITNES Corp', license_update_date: '2024-02-20', license_expiry_date: '2025-02-20', is_active: true },
  { id: 3, software_name: 'Perpay', software_provider: 'Perpay Solutions', license_update_date: '2024-03-10', license_expiry_date: '2025-03-10', is_active: true },
  { id: 4, software_name: 'SOPHOS', software_provider: 'Sophos Ltd', license_update_date: '2024-04-05', license_expiry_date: '2025-04-05', is_active: true },
  { id: 5, software_name: 'Zimbra', software_provider: 'Zimbra Inc', license_update_date: '2024-05-12', license_expiry_date: '2025-05-12', is_active: true },
  { id: 6, software_name: 'GP', software_provider: 'Microsoft Dynamics', license_update_date: '2024-06-18', license_expiry_date: '2025-06-18', is_active: true },
  { id: 7, software_name: 'Kaspersky', software_provider: 'Kaspersky Lab', license_update_date: '2024-07-22', license_expiry_date: '2025-07-22', is_active: true }
]

export const SoftwareConfig: React.FC = () => {
  const [software, setSoftware] = useState<Software[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    software_name: '',
    software_provider: '',
    license_update_date: '',
    license_expiry_date: '',
    is_active: true
  })

  // Load software from API or use predefined data
  useEffect(() => {
    loadSoftware()
  }, [])

  const loadSoftware = async () => {
    try {
      // Load from API with cache busting and no-store directive
      const response = await fetch('http://localhost:8001/api/software?t=' + Date.now(), {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded software data:', data.software)
        setSoftware(data.software || [])
        setMessage('Loaded software from database')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to load software')
      }
    } catch (error) {
      console.error('Error loading software:', error)
      // Only fallback if network error, not if API returns error
      if (error.message && error.message.includes('Failed to load')) {
        setMessage(error.message)
      } else {
        setSoftware(predefinedSoftware)
        setMessage('Using predefined software data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous messages
    setMessage('')
    
    // Form validation
    if (!formData.software_name || !formData.software_name.trim()) {
      setMessage('Software name is required')
      return
    }
    if (!formData.software_provider || !formData.software_provider.trim()) {
      setMessage('Software provider is required')
      return
    }
    if (!formData.license_update_date) {
      setMessage('License update date is required')
      return
    }
    if (!formData.license_expiry_date) {
      setMessage('License expiry date is required')
      return
    }
    
    try {
      const url = editingId 
        ? `http://localhost:8001/api/software/${editingId}`
        : 'http://localhost:8001/api/software'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadSoftware() // Reload software list
        setMessage(editingId ? 'Software updated successfully' : 'Software added successfully')
        resetForm()
      } else {
        const errorData = await response.json()
        setMessage(errorData.detail || 'Failed to save software')
      }
    } catch (error) {
      console.error('Error saving software:', error)
      setMessage('Failed to save software')
    }
  }

  const handleEdit = (soft: Software) => {
    setFormData({
      software_name: soft.software_name,
      software_provider: soft.software_provider,
      license_update_date: soft.license_update_date,
      license_expiry_date: soft.license_expiry_date,
      is_active: soft.is_active
    })
    setEditingId(soft.id!)
    setIsAdding(true)
    setMessage('')
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8001/api/software/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadSoftware() // Reload software list
        setMessage('Software deleted successfully')
      } else {
        const errorData = await response.json()
        setMessage(errorData.detail || 'Failed to delete software')
      }
    } catch (error) {
      console.error('Error deleting software:', error)
      setMessage('Failed to delete software')
    }
  }

  const resetForm = () => {
    setFormData({
      software_name: '',
      software_provider: '',
      license_update_date: '',
      license_expiry_date: '',
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

      {loading && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
          <p>Loading software...</p>
        </div>
      )}

      {/* Add/Edit Software Form */}
      {!loading && isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Software' : 'Add New Software'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update software information' : 'Add a new software to inventory'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="software_name">Software Name *</Label>
                  <Input
                    id="software_name"
                    value={formData.software_name}
                    onChange={(e) => handleInputChange('software_name', e.target.value)}
                    placeholder="Enter software name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="software_provider">Software Provider *</Label>
                  <Input
                    id="software_provider"
                    value={formData.software_provider}
                    onChange={(e) => handleInputChange('software_provider', e.target.value)}
                    placeholder="Enter software provider"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license_update_date">License Update Date *</Label>
                  <Input
                    id="license_update_date"
                    type="date"
                    value={formData.license_update_date}
                    onChange={(e) => handleInputChange('license_update_date', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license_expiry_date">License Expiry Date *</Label>
                  <Input
                    id="license_expiry_date"
                    type="date"
                    value={formData.license_expiry_date}
                    onChange={(e) => handleInputChange('license_expiry_date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? 'Update Software' : 'Add Software'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Software List */}
      {!loading && !isAdding && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Software Inventory</CardTitle>
                <CardDescription>Manage software licenses and providers</CardDescription>
              </div>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Software
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {software.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No software found. Add your first software to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {software.map((soft) => (
                  <div key={soft.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{soft.software_name}</h3>
                          <Badge variant={soft.is_active ? 'default' : 'secondary'}>
                            {soft.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            {soft.software_provider}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Updated: {soft.license_update_date}
                          </div>
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-1" />
                            Expires: {soft.license_expiry_date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(soft)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(soft.id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
