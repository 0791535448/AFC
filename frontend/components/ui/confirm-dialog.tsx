'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, Monitor, Edit2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: 'default' | 'destructive' | 'hardware' | 'update'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[425px] ${
        variant === 'destructive' ? 'bg-red-50 border-red-200' : 
        variant === 'hardware' ? 'bg-orange-50 border-orange-200' : 
        variant === 'update' ? 'bg-blue-50 border-blue-200' : 
        'bg-white'
      }`}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {variant === 'destructive' && (
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            )}
            {variant === 'hardware' && (
              <div className="p-2 bg-orange-100 rounded-full">
                <Monitor className="h-6 w-6 text-orange-600" />
              </div>
            )}
            {variant === 'update' && (
              <div className="p-2 bg-blue-100 rounded-full">
                <Edit2 className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <DialogTitle className={
              variant === 'destructive' ? 'text-red-800 text-xl font-bold' : 
              variant === 'hardware' ? 'text-orange-800 text-xl font-bold' : 
              variant === 'update' ? 'text-blue-800 text-xl font-bold' : 
              ''
            }>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className={
            variant === 'destructive' ? 'text-red-700 text-base' : 
            variant === 'hardware' ? 'text-orange-700 text-base' : 
            variant === 'update' ? 'text-blue-700 text-base' : 
            'text-gray-600'
          }>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            className="px-6"
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
