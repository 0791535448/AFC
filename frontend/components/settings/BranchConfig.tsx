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
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Save,
  X
} from 'lucide-react'

interface Branch {
  id?: number
  branch_name: string
  branch_code: string
  location_address: string
  contact_person: string
  contact_phone: string
  is_active: boolean
}

export const BranchConfig: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: 1,
      branch_name: 'Head Office',
      branch_code: 'HO',
      location_address: '123 Main Street, Nairobi, Kenya',
      contact_person: 'John Manager',
      contact_phone: '+254-712-345-678',
      is_active: true
    },
    {
      id: 2,
      branch_name: 'IT Department',
      branch_code: 'IT',
      location_address: '456 Tech Avenue, Nairobi, Kenya',
      contact_person: 'Jane IT',
      contact_phone: '+254-723-456-789',
      is_active: true
    },
    {
      id: 3,
      branch_name: 'Finance Department',
      branch_code: 'FIN',
      location_address: '789 Finance Road, Nairobi, Kenya',
      contact_person: 'Mike Finance',
      contact_phone: '+254-734-567-890',
      is_active: true
    },
    {
      id: 4,
      branch_name: 'Reception',
      branch_code: 'REC',
      location_address: '321 Reception Lane, Nairobi, Kenya',
      contact_person: 'Sarah Reception',
      contact_phone: '+254-745-678-901',
      is_active: true
    }
  ])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Branch>({
    branch_name: '',
    branch_code: '',
    location_address: '',
    contact_person: '',
    contact_phone: '',
    is_active: true
  })
  const [message, setMessage] = useState('')

  const handleInputChange = (field: keyof Branch, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.branch_name || !formData.branch_code) {
      setMessage('Branch name and code are required')
      return
    }

    if (editingId) {
      setBranches(prev => prev.map(branch => 
        branch.id === editingId ? { ...formData, id: editingId } : branch
      ))
      setMessage('Branch updated successfully')
    } else {
      const newBranch = { ...formData, id: Date.now() }
      setBranches(prev => [...prev, newBranch])
      setMessage('Branch added successfully')
    }

    resetForm()
  }

  const handleEdit = (branch: Branch) => {
    setFormData(branch)
    setEditingId(branch.id!)
    setIsAdding(true)
    setMessage('')
  }

  const handleDelete = (id: number) => {
    setBranches(prev => prev.filter(branch => branch.id !== id))
    setMessage('Branch deleted successfully')
  }

  const resetForm = () => {
    setFormData({
      branch_name: '',
      branch_code: '',
      location_address: '',
      contact_person: '',
      contact_phone: '',
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

      {/* Add/Edit Branch Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Branch' : 'Add New Branch'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update branch information' : 'Create a new branch location'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch_name">Branch Name *</Label>
                <Input
                  id="branch_name"
                  value={formData.branch_name}
                  onChange={(e) => handleInputChange('branch_name', e.target.value)}
                  placeholder="Enter branch name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branch_code">Branch Code *</Label>
                <Input
                  id="branch_code"
                  value={formData.branch_code}
                  onChange={(e) => handleInputChange('branch_code', e.target.value.toUpperCase())}
                  placeholder="Enter branch code"
                  maxLength={20}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location_address">Location Address</Label>
                <Input
                  id="location_address"
                  value={formData.location_address}
                  onChange={(e) => handleInputChange('location_address', e.target.value)}
                  placeholder="Enter complete address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  placeholder="Contact person name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update Branch' : 'Add Branch'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branches List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Branch Locations
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </CardTitle>
          <CardDescription>
            Manage all branch locations and their contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branches.map((branch) => (
              <div key={branch.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{branch.branch_name}</h3>
                      <Badge variant="outline">{branch.branch_code}</Badge>
                      {branch.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {branch.location_address || 'No address provided'}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {branch.contact_person || 'No contact person'}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {branch.contact_phone || 'No phone number'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(branch)}
                      disabled={isAdding}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(branch.id!)}
                      disabled={isAdding}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {branches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No branches configured yet</p>
                <p className="text-sm">Click "Add Branch" to create your first branch</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
