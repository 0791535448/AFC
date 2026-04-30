'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Eye,
  FileSpreadsheet
} from 'lucide-react'
import axios from 'axios'

interface AssetData {
  asset_code: string
  asset_name: string
  asset_category: string
  asset_type: string
  brand: string
  serial_number: string
  model_number: string
  warranty_start: string
  warranty_end: string
  maintenance_contract: boolean
  contract_expiry: string
  location: string
  department: string
  assigned_user: string
  asset_status: string
  condition_rating: string
  last_inspection: string
  next_inspection: string
  notes: string
  barcode: string
  qr_code: string
}

interface AssetMassUploadProps {
  onAssetsUploaded: (assets: AssetData[]) => void
  onCancel: () => void
}

const assetCategories = [
  'Computer', 'Office Equipment', 'Network Equipment', 'Display Equipment', 
  'Storage', 'Peripheral', 'Mobile Device', 'Server', 'Other'
]

const assetConditions = ['Excellent', 'Good', 'Fair', 'Poor']
const assetStatuses = ['Active', 'Inactive', 'Under Maintenance', 'Retired', 'Lost', 'Stolen']

export const AssetMassUpload: React.FC<AssetMassUploadProps> = ({ onAssetsUploaded, onCancel }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [parsedAssets, setParsedAssets] = useState<AssetData[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const API_BASE_URL = 'http://localhost:8001'

  // Download CSV template
  const downloadTemplate = () => {
    const headers = [
      'asset_code',
      'asset_name', 
      'asset_category',
      'asset_type',
      'brand',
      'serial_number',
      'model_number',
      'warranty_start',
      'warranty_end',
      'maintenance_contract',
      'contract_expiry',
      'location',
      'department',
      'assigned_user',
      'asset_status',
      'condition_rating',
      'last_inspection',
      'next_inspection',
      'notes',
      'barcode',
      'qr_code'
    ]

    const sampleData = [
      [
        'AST001',
        'Dell Laptop XPS 15',
        'Computer',
        'Laptop',
        'Dell',
        'DL123456789',
        'XPS15-9530',
        '2023-01-15',
        '2025-01-15',
        'true',
        '2024-01-15',
        'IT Department',
        'IT',
        'John Doe',
        'Active',
        'Good',
        '2023-06-15',
        '2023-12-15',
        'Primary work laptop',
        'AST001-BARCODE',
        'AST001-QR'
      ],
      [
        'AST002',
        'HP Desktop EliteDesk',
        'Computer',
        'Desktop',
        'HP',
        'HP987654321',
        'EliteDesk-800',
        '2023-02-20',
        '2025-02-20',
        'false',
        '',
        'Finance',
        'Finance',
        'Jane Smith',
        'Active',
        'Excellent',
        '2023-08-20',
        '2024-02-20',
        'Finance workstation',
        'AST002-BARCODE',
        'AST002-QR'
      ]
    ]

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assets_upload_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setValidationErrors(['Please select a CSV file'])
        return
      }
      setCsvFile(file)
      setValidationErrors([])
      parseCSV(file)
    }
  }

  // Parse CSV file
  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        setValidationErrors(['CSV file must contain at least one data row'])
        return
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      const assets: AssetData[] = []
      const errors: string[] = []

      // Validate headers
      const requiredHeaders = [
        'asset_code', 'asset_name', 'asset_category', 'brand', 'location', 'asset_status'
      ]
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        errors.push(`Missing required columns: ${missingHeaders.join(', ')}`)
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch`)
          continue
        }

        const asset: any = {}
        headers.forEach((header, index) => {
          asset[header] = values[index] || ''
        })

        // Validate required fields
        if (!asset.asset_code) errors.push(`Row ${i + 1}: Asset code is required`)
        if (!asset.asset_name) errors.push(`Row ${i + 1}: Asset name is required`)
        if (!asset.asset_category) errors.push(`Row ${i + 1}: Asset category is required`)
        if (!asset.brand) errors.push(`Row ${i + 1}: Brand is required`)
        if (!asset.location) errors.push(`Row ${i + 1}: Location is required`)
        if (!asset.asset_status) errors.push(`Row ${i + 1}: Asset status is required`)

        
        // Validate dropdown values
        if (asset.asset_category && !assetCategories.includes(asset.asset_category)) {
          errors.push(`Row ${i + 1}: Invalid asset category "${asset.asset_category}"`)
        }
        if (asset.asset_status && !assetStatuses.includes(asset.asset_status)) {
          errors.push(`Row ${i + 1}: Invalid asset status "${asset.asset_status}"`)
        }
        if (asset.condition_rating && !assetConditions.includes(asset.condition_rating)) {
          errors.push(`Row ${i + 1}: Invalid condition rating "${asset.condition_rating}"`)
        }

        // Convert boolean fields
        asset.maintenance_contract = asset.maintenance_contract === 'true' || asset.maintenance_contract === 'TRUE'

        assets.push(asset as AssetData)
      }

      setValidationErrors(errors)
      setParsedAssets(assets)
    }
    reader.readAsText(file)
  }

  // Upload assets to API
  const handleUpload = async () => {
    if (parsedAssets.length === 0) {
      setValidationErrors(['No valid assets to upload'])
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadedAssets = []
      
      for (let i = 0; i < parsedAssets.length; i++) {
        const asset = {
          ...parsedAssets[i],
          is_active: true
        }

        try {
          const response = await axios.post(`${API_BASE_URL}/assets`, asset, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
            }
          })
          
          uploadedAssets.push(asset)
          setUploadProgress(((i + 1) / parsedAssets.length) * 100)
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          console.error(`Error uploading asset ${asset.asset_code}:`, error)
          setValidationErrors(prev => [...prev, `Failed to upload asset ${asset.asset_code}`])
        }
      }

      if (uploadedAssets.length > 0) {
        onAssetsUploaded(uploadedAssets)
        setValidationErrors([`Successfully uploaded ${uploadedAssets.length} assets`])
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      setValidationErrors(['Upload failed. Please try again.'])
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Mass Upload Assets</span>
          </CardTitle>
          <CardDescription>
            Upload multiple assets at once using a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Download CSV Template</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Use this template to prepare your asset data for upload
                </p>
              </div>
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="csv-file">Select CSV File</Label>
            <div className="mt-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {csvFile ? csvFile.name : 'Choose CSV File'}
              </Button>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm">
                      {error}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Parsed Assets Preview */}
          {parsedAssets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">
                  {parsedAssets.length} assets ready to upload
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>

              {showPreview && (
                <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Asset Code</th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Category</th>
                        <th className="p-2 text-left">Brand</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedAssets.slice(0, 10).map((asset, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{asset.asset_code}</td>
                          <td className="p-2">{asset.asset_name}</td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-xs">
                              {asset.asset_category}
                            </Badge>
                          </td>
                          <td className="p-2">{asset.brand}</td>
                          <td className="p-2">
                            <Badge className="text-xs">
                              {asset.asset_status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedAssets.length > 10 && (
                    <div className="p-2 text-center text-sm text-gray-500">
                      ... and {parsedAssets.length - 10} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading assets...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={parsedAssets.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${parsedAssets.length} Assets`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
