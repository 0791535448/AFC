'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Wrench } from 'lucide-react'

interface Make {
  id?: number
  name: string
  description: string
  website: string
  supportContact: string
  isActive: boolean
}

interface MakeFormProps {
  make?: Make
  onSubmit: (make: Make) => void
  onCancel: () => void
}

export default function MakeForm({ make, onSubmit, onCancel }: MakeFormProps) {
  const [formData, setFormData] = useState<Make>({
    name: make?.name || '',
    description: make?.description || '',
    website: make?.website || '',
    supportContact: make?.supportContact || '',
    isActive: make?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof Make, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {make ? 'Edit Hardware Make' : 'Add New Hardware Make'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">Make Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Dell"
                required
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="e.g., Dell Inc. computer hardware"
              />
            </div>

            <div>
              <label className="form-label">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="e.g., https://www.dell.com"
                type="url"
              />
            </div>

            <div>
              <label className="form-label">Support Contact</label>
              <Input
                value={formData.supportContact}
                onChange={(e) => handleChange('supportContact', e.target.value)}
                placeholder="e.g., support@dell.com"
                type="email"
              />
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
                {make ? 'Update Make' : 'Create Make'}
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
