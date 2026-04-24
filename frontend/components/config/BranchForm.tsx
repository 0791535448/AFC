'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Building2 } from 'lucide-react'

interface Branch {
  id?: number
  name: string
  code: string
  locationAddress: string
  contactPerson: string
  contactPhone: string
  isActive: boolean
}

interface BranchFormProps {
  branch?: Branch
  onSubmit: (branch: Branch) => void
  onCancel: () => void
}

export default function BranchForm({ branch, onSubmit, onCancel }: BranchFormProps) {
  const [formData, setFormData] = useState<Branch>({
    name: branch?.name || '',
    code: branch?.code || '',
    locationAddress: branch?.locationAddress || '',
    contactPerson: branch?.contactPerson || '',
    contactPhone: branch?.contactPhone || '',
    isActive: branch?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof Branch, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {branch ? 'Edit Branch' : 'Add New Branch'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Branch Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Head Office"
                  required
                />
              </div>
              <div>
                <label className="form-label">Branch Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="e.g., HO"
                  maxLength={20}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Location Address</label>
              <Input
                value={formData.locationAddress}
                onChange={(e) => handleChange('locationAddress', e.target.value)}
                placeholder="e.g., 123 Main Street, Nairobi, Kenya"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Contact Person</label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  placeholder="e.g., John Manager"
                />
              </div>
              <div>
                <label className="form-label">Contact Phone</label>
                <Input
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  placeholder="e.g., +254-712-345-678"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
              <Badge className={formData.isActive ? 'status-badge status-active' : 'status-badge'}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button type="submit" className="btn-primary">
                {branch ? 'Update Branch' : 'Create Branch'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
