'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, CheckCircle } from 'lucide-react'

interface Status {
  id?: number
  name: string
  description: string
  colorCode: string
  isActive: boolean
}

interface StatusFormProps {
  status?: Status
  onSubmit: (status: Status) => void
  onCancel: () => void
}

export default function StatusForm({ status, onSubmit, onCancel }: StatusFormProps) {
  const [formData, setFormData] = useState<Status>({
    name: status?.name || '',
    description: status?.description || '',
    colorCode: status?.colorCode || '#22c55e',
    isActive: status?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof Status, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const colorPresets = [
    { name: 'Green', value: '#22c55e' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Gray', value: '#64748b' },
    { name: 'Cyan', value: '#06b6d4' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {status ? 'Edit Status' : 'Add New Status'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">Status Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Active"
                required
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="e.g., Device is in use and operational"
              />
            </div>

            <div>
              <label className="form-label">Color Code</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.colorCode}
                    onChange={(e) => handleChange('colorCode', e.target.value)}
                    className="w-20 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.colorCode}
                    onChange={(e) => handleChange('colorCode', e.target.value)}
                    placeholder="#22c55e"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleChange('colorCode', preset.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                        formData.colorCode === preset.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: preset.value }}
                      />
                      <span className="text-sm">{preset.name}</span>
                    </button>
                  ))}
                </div>
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
                {status ? 'Update Status' : 'Create Status'}
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
