'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'

interface Asset {
  id: string
  assetTag: string
  serialNumber: string
  deviceType: string
  make: string
  model: string
  status: string
  location: string
  assignedTo: string
  purchaseDate: string
  warrantyExpiry: string
  purchaseCost: number
  notes: string
}

interface MassUploadProps {
  onAssetsUploaded: (assets: Omit<Asset, 'id'>[]) => void
}

export const MassUpload: React.FC<MassUploadProps> = ({ onAssetsUploaded }) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const template = [
      'Asset Tag,Serial Number,Device Type,Make,Model,Status,Location,Assigned To,Purchase Date,Warranty Expiry,Purchase Cost,Notes',
      'ICT001,DL123456789,Laptop,Dell,Latitude 7420,Active,IT Department,John Doe,2023-01-15,2025-01-15,1200,Primary work laptop',
      'ICT002,HP987654321,Desktop,HP,EliteDesk 800,Active,Finance,Jane Smith,2023-02-20,2025-02-20,800,Finance department workstation',
      'ICT003,CN456789123,Printer,Canon,IR-ADV 4535,Under Repair,Head Office,Shared,2022-11-10,2024-11-10,2500,Multi-function printer',
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assets_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setUploadResults(null)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim())
    const result: string[][] = []
    
    for (const line of lines) {
      const values: string[] = []
      let currentValue = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            currentValue += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      
      values.push(currentValue.trim())
      result.push(values)
    }
    
    return result
  }

  const validateAssetData = (data: string[]): Omit<Asset, 'id'> | null => {
    if (data.length < 12) return null

    const [
      assetTag,
      serialNumber,
      deviceType,
      make,
      model,
      status,
      location,
      assignedTo,
      purchaseDate,
      warrantyExpiry,
      purchaseCostStr,
      notes
    ] = data

    // Validation
    if (!assetTag || !serialNumber || !deviceType || !make || !model) {
      return null
    }

    const purchaseCost = parseFloat(purchaseCostStr) || 0

    return {
      assetTag: assetTag.trim(),
      serialNumber: serialNumber.trim(),
      deviceType: deviceType.trim(),
      make: make.trim(),
      model: model.trim(),
      status: status.trim() || 'Active',
      location: location.trim() || '',
      assignedTo: assignedTo.trim() || '',
      purchaseDate: purchaseDate.trim(),
      warrantyExpiry: warrantyExpiry.trim(),
      purchaseCost,
      notes: notes.trim()
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const errors: string[] = []
    const validAssets: Omit<Asset, 'id'>[] = []

    try {
      const text = await file.text()
      const rows = parseCSV(text)
      
      // Skip header row
      const dataRows = rows.slice(1)
      
      for (let i = 0; i < dataRows.length; i++) {
        const assetData = validateAssetData(dataRows[i])
        
        if (assetData) {
          validAssets.push(assetData)
        } else {
          errors.push(`Row ${i + 2}: Invalid data format or missing required fields`)
        }
      }

      setUploadResults({
        success: validAssets.length,
        errors
      })

      if (validAssets.length > 0) {
        onAssetsUploaded(validAssets)
      }
    } catch (error) {
      errors.push('Failed to parse CSV file')
      setUploadResults({ success: 0, errors })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Mass Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mass Upload Assets</DialogTitle>
          <DialogDescription>
            Upload multiple assets from a CSV file
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Download the CSV template below</li>
                <li>Fill in your asset data following the template format</li>
                <li>Required fields: Asset Tag, Serial Number, Device Type, Make, Model</li>
                <li>Optional fields: Status, Location, Assigned To, Purchase Date, Warranty Expiry, Purchase Cost, Notes</li>
                <li>Upload the completed CSV file</li>
              </ol>
              <Button onClick={downloadTemplate} className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="mt-1"
                  />
                </div>
                
                {file && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Selected: {file.name}</span>
                  </div>
                )}
                
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || uploading}
                  className="w-full"
                >
                  {uploading ? 'Uploading...' : 'Upload Assets'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Results */}
          {uploadResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadResults.success > 0 && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>{uploadResults.success} assets uploaded successfully</span>
                    </div>
                  )}
                  
                  {uploadResults.errors.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 text-red-600 mb-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>{uploadResults.errors.length} errors found</span>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {uploadResults.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
