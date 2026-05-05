import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Asset {
  id: number
  asset_code: string
  asset_name: string
  asset_category: string
  asset_type: string
  brand: string
  serial_number: string
  model_number: string
  location: string
  department: string
  assigned_user: string
  asset_status: string
  notes: string
}

interface DeviceType {
  id: number
  device_type_name: string
  description: string
  category: string
}

interface HardwareMake {
  id: number
  make_name: string
  description: string
}

interface HardwareModel {
  id: number
  model_name: string
  make_name: string
  device_type_name: string
}

interface Branch {
  id: number
  branch_name: string
  branch_code: string
  location_address: string
}

interface HardwareStatus {
  id: number
  status_name: string
  description: string
  color_code: string
}

const API_BASE_URL = 'http://localhost:8001'

const assetCategories = [
  'Computer', 'Office Equipment', 'Network Equipment', 'Display Equipment', 
  'Storage', 'Peripheral', 'Mobile Device', 'Server', 'Other'
]

interface EditAssetFormProps {
  asset: Asset
  onSubmit: (updatedAsset: Partial<Asset>) => void
  onCancel: () => void
}

export const EditAssetForm: React.FC<EditAssetFormProps> = ({ asset, onSubmit, onCancel }) => {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([])
  const [hardwareMakes, setHardwareMakes] = useState<HardwareMake[]>([])
  const [hardwareModels, setHardwareModels] = useState<HardwareModel[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [hardwareStatuses, setHardwareStatuses] = useState<HardwareStatus[]>([])
  const [loadingDeviceTypes, setLoadingDeviceTypes] = useState(false)
  const [loadingMakes, setLoadingMakes] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [loadingStatuses, setLoadingStatuses] = useState(false)
  
  const [formData, setFormData] = useState<Partial<Asset>>({
    asset_code: asset.asset_code,
    asset_name: asset.asset_name,
    asset_category: asset.asset_category,
    asset_type: asset.asset_type,
    brand: asset.brand,
    serial_number: asset.serial_number,
    model_number: asset.model_number,
    location: asset.location,
    department: asset.department,
    assigned_user: asset.assigned_user,
    asset_status: asset.asset_status,
    notes: asset.notes
  })

  // Fetch all config data on component mount
  useEffect(() => {
    const fetchDeviceTypes = async () => {
      try {
        setLoadingDeviceTypes(true)
        const response = await axios.get(`${API_BASE_URL}/dev/device-types`)
        setDeviceTypes(response.data.device_types || [])
      } catch (error) {
        console.error('Error fetching device types:', error)
      } finally {
        setLoadingDeviceTypes(false)
      }
    }

    const fetchHardwareMakes = async () => {
      try {
        setLoadingMakes(true)
        const response = await axios.get(`${API_BASE_URL}/dev/makes`)
        setHardwareMakes(response.data.makes || [])
      } catch (error) {
        console.error('Error fetching hardware makes:', error)
      } finally {
        setLoadingMakes(false)
      }
    }

    const fetchHardwareModels = async () => {
      try {
        setLoadingModels(true)
        const response = await axios.get(`${API_BASE_URL}/dev/models`)
        setHardwareModels(response.data.models || [])
      } catch (error) {
        console.error('Error fetching hardware models:', error)
      } finally {
        setLoadingModels(false)
      }
    }

    const fetchBranches = async () => {
      try {
        setLoadingBranches(true)
        const response = await axios.get(`${API_BASE_URL}/dev/branches`)
        setBranches(response.data.branches || [])
      } catch (error) {
        console.error('Error fetching branches:', error)
      } finally {
        setLoadingBranches(false)
      }
    }

    const fetchHardwareStatuses = async () => {
      try {
        setLoadingStatuses(true)
        const response = await axios.get(`${API_BASE_URL}/dev/statuses`)
        setHardwareStatuses(response.data.statuses || [])
      } catch (error) {
        console.error('Error fetching hardware statuses:', error)
      } finally {
        setLoadingStatuses(false)
      }
    }

    fetchDeviceTypes()
    fetchHardwareMakes()
    fetchHardwareModels()
    fetchBranches()
    fetchHardwareStatuses()
  }, [])

  const handleInputChange = (field: keyof Asset, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset_code">Asset Tag *</Label>
                <Input
                  id="asset_code"
                  value={formData.asset_code || ''}
                  onChange={(e) => handleInputChange('asset_code', e.target.value)}
                  placeholder="AFC0000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_name">Asset Name *</Label>
                <Select 
                  value={formData.asset_name || undefined} 
                  onValueChange={(value) => handleInputChange('asset_name', value)}
                  disabled={loadingDeviceTypes || deviceTypes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loadingDeviceTypes ? "Loading device types..." : 
                      deviceTypes.length === 0 ? "No device types found. Add in Settings." : 
                      "Select device type"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((dt) => (
                      <SelectItem key={dt.id} value={dt.device_type_name}>
                        {dt.device_type_name}
                        {dt.category && <span className="text-gray-400 ml-2">({dt.category})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_category">Category *</Label>
                <Select value={formData.asset_category || ''} onValueChange={(value) => handleInputChange('asset_category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_type">Asset Type *</Label>
                <Select 
                  value={formData.asset_type || undefined} 
                  onValueChange={(value) => handleInputChange('asset_type', value)}
                  disabled={loadingMakes || hardwareMakes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loadingMakes ? "Loading makes..." : 
                      hardwareMakes.length === 0 ? "No makes found. Add in Settings." : 
                      "Select make"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {hardwareMakes.map((make) => (
                      <SelectItem key={make.id} value={make.make_name}>
                        {make.make_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Asset Brand *</Label>
                <Select 
                  value={formData.brand || undefined} 
                  onValueChange={(value) => handleInputChange('brand', value)}
                  disabled={loadingModels || hardwareModels.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loadingModels ? "Loading models..." : 
                      hardwareModels.length === 0 ? "No models found. Add in Settings." : 
                      "Select model"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {hardwareModels.map((model) => (
                      <SelectItem key={model.id} value={model.model_name}>
                        {model.model_name}
                        {model.make_name && <span className="text-gray-400 ml-2">({model.make_name})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number || ''}
                  onChange={(e) => handleInputChange('serial_number', e.target.value)}
                  placeholder="e.g., DL123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select 
                  value={formData.location || undefined} 
                  onValueChange={(value) => handleInputChange('location', value)}
                  disabled={loadingBranches || branches.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loadingBranches ? "Loading branches..." : 
                      branches.length === 0 ? "No branches found. Add in Settings." : 
                      "Select branch"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.branch_name}>
                        {branch.branch_name}
                        {branch.branch_code && <span className="text-gray-400 ml-2">({branch.branch_code})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_user">Assigned User *</Label>
                <Input
                  id="assigned_user"
                  value={formData.assigned_user || ''}
                  onChange={(e) => handleInputChange('assigned_user', e.target.value)}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_status">Asset Status *</Label>
                <Select 
                  value={formData.asset_status || undefined} 
                  onValueChange={(value) => handleInputChange('asset_status', value)}
                  disabled={loadingStatuses || hardwareStatuses.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loadingStatuses ? "Loading statuses..." : 
                      hardwareStatuses.length === 0 ? "No statuses found. Add in Settings." : 
                      "Select status"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {hardwareStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.status_name}>
                        {status.status_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this asset..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Update Asset
          </Button>
        </div>
      </form>
  )
}
