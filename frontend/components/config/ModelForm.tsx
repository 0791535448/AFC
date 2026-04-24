'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Package } from 'lucide-react'

interface Model {
  id?: number
  name: string
  makeId: number
  deviceTypeId: number
  specifications: string
  releaseYear: number
  isActive: boolean
}

interface ModelFormProps {
  model?: Model
  makes: Array<{ id: number; name: string }>
  deviceTypes: Array<{ id: number; name: string }>
  onSubmit: (model: Model) => void
  onCancel: () => void
}

export default function ModelForm({ model, makes, deviceTypes, onSubmit, onCancel }: ModelFormProps) {
  const [formData, setFormData] = useState<Model>({
    name: model?.name || '',
    makeId: model?.makeId || 0,
    deviceTypeId: model?.deviceTypeId || 0,
    specifications: model?.specifications || '',
    releaseYear: model?.releaseYear || new Date().getFullYear(),
    isActive: model?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof Model, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {model ? 'Edit Hardware Model' : 'Add New Hardware Model'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">Model Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Latitude 7420"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Make *</label>
                <select
                  value={formData.makeId}
                  onChange={(e) => handleChange('makeId', parseInt(e.target.value))}
                  className="form-input"
                  required
                >
                  <option value="">Select a make</option>
                  {makes.map((make) => (
                    <option key={make.id} value={make.id}>
                      {make.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Device Type *</label>
                <select
                  value={formData.deviceTypeId}
                  onChange={(e) => handleChange('deviceTypeId', parseInt(e.target.value))}
                  className="form-input"
                  required
                >
                  <option value="">Select a device type</option>
                  {deviceTypes.map((deviceType) => (
                    <option key={deviceType.id} value={deviceType.id}>
                      {deviceType.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Specifications</label>
              <textarea
                value={formData.specifications}
                onChange={(e) => handleChange('specifications', e.target.value)}
                placeholder="e.g., Intel Core i7, 16GB RAM, 512GB SSD"
                className="form-input min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="form-label">Release Year</label>
              <Input
                type="number"
                value={formData.releaseYear}
                onChange={(e) => handleChange('releaseYear', parseInt(e.target.value))}
                min="1990"
                max={new Date().getFullYear() + 2}
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
                {model ? 'Update Model' : 'Create Model'}
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
