'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export const IssueNotesContent = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'Super Admin'
  const loggedInName = user?.full_name || ''
  const loggedInRole = user?.role || ''
  const [formData, setFormData] = useState({
    to: '',
    from: 'ICT',
    ref: '',
    date: '',
    subject: '',
    message: 'Please acknowledge the receipt of the equipment issued;',
    issuingOfficer: '',
    issuingOfficerRole: 'ICT Officer',
    receivedByName: '',
    receivedByDesignation: '',
    receivedBySign: '',
    receivedByDate: ''
  })
  const [items, setItems] = useState([
    { asset_id: '', item: '', serialNumber: '', tagNumber: '' }
  ])
  const [branches, setBranches] = useState<{ id: number; branch_name: string }[]>([])
  const [officers, setOfficers] = useState<{ id: number; username: string; full_name: string; role: string }[]>([])
  const [allUsers, setAllUsers] = useState<{ id: number; username: string; full_name: string; role: string }[]>([])
  const [assets, setAssets] = useState<{ id: number; asset_code: string; asset_name: string; serial_number: string; brand: string }[]>([])
  const [savedNotes, setSavedNotes] = useState<any[]>([])
  const [editingNote, setEditingNote] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ receivedByName: '', receivedByDesignation: '', receivedByDate: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadNotes = () => {
    fetch('http://localhost:8000/api/issue-notes')
      .then(r => r.json())
      .then(d => setSavedNotes(d.issue_notes || []))
      .catch(() => {})
  }

  useEffect(() => {
    loadNotes()
    fetch('http://localhost:8000/api/branches')
      .then(r => r.json())
      .then(data => setBranches(data.branches || []))
      .catch(() => {})
    fetch('http://localhost:8000/api/users')
      .then(r => r.json())
      .then(data => {
        const list = data.users || []
        setAllUsers(list)
        setOfficers(list.filter((u: any) => ['ICT Officer', 'Technician'].includes(u.role)))
      })
      .catch(() => {})
    fetch('http://localhost:8000/dev/assets')
      .then(r => r.json())
      .then(data => setAssets(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Auto-fill issuing officer from the logged-in account
  useEffect(() => {
    if (user?.full_name) {
      setFormData(prev => ({
        ...prev,
        issuingOfficer: prev.issuingOfficer || user.full_name,
        issuingOfficerRole: prev.issuingOfficerRole !== 'ICT Officer' ? prev.issuingOfficerRole : (user.role || prev.issuingOfficerRole)
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Issue note cannot be submitted incomplete
    const missing: string[] = []
    if (!formData.to) missing.push('TO (Department/Branch)')
    if (!formData.date) missing.push('DATE')
    if (!formData.subject) missing.push('RE (Subject)')
    if (!formData.issuingOfficer) missing.push('Name of Issuing Officer')
    if (!formData.receivedByName) missing.push('Received By (Name)')
    items.forEach((item, i) => {
      if (!item.item.trim()) missing.push(`Item ${i + 1} name`)
      if (!item.serialNumber.trim()) missing.push(`Item ${i + 1} serial number`)
      if (!item.tagNumber.trim()) missing.push(`Item ${i + 1} tag number`)
    })
    if (missing.length > 0) {
      setSubmitMessage(`Issue note is incomplete. Please fill in: ${missing.join(', ')}.`)
      return
    }

    setSubmitting(true)
    setSubmitMessage('')
    try {
      const response = await fetch('http://localhost:8000/api/issue-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_department: formData.to,
          from_location: formData.from,
          date: formData.date,
          ref: formData.ref,
          subject: formData.subject,
          message: formData.message,
          issuing_officer: formData.issuingOfficer,
          issuing_officer_role: formData.issuingOfficerRole,
          items,
          received_by_name: formData.receivedByName,
          received_by_designation: formData.receivedByDesignation,
          date_out: formData.receivedByDate
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to save')
      setSubmitMessage('Issue note saved successfully.')
      loadNotes()
      setItems([{ asset_id: '', item: '', serialNumber: '', tagNumber: '' }])
      setFormData({
        to: '', from: 'ICT', ref: '', date: '', subject: '',
        message: 'Please acknowledge the receipt of the equipment issued;',
        issuingOfficer: loggedInName, issuingOfficerRole: loggedInRole || 'ICT Officer',
        receivedByName: '', receivedByDesignation: '', receivedBySign: '', receivedByDate: ''
      })
    } catch (err: any) {
      setSubmitMessage(err.message || 'Failed to save issue note.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const addItem = () => {
    setItems(prev => [...prev, { asset_id: '', item: '', serialNumber: '', tagNumber: '' }])
  }

  const handleAssetPick = (index: number, assetId: string) => {
    const asset = assets.find(a => String(a.id) === assetId)
    setItems(prev => prev.map((item, i) => i === index ? {
      ...item,
      asset_id: assetId,
      item: asset ? `${asset.asset_name} (${asset.asset_code})` : item.item,
      serialNumber: asset?.serial_number || item.serialNumber,
      tagNumber: asset?.asset_code || item.tagNumber
    } : item))
  }

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== index))
  }

  const openEditNote = (note: any) => {
    setEditingNote(note)
    setEditForm({
      receivedByName: note.received_by_name || '',
      receivedByDesignation: note.received_by_designation || '',
      receivedByDate: (note.date_out || '').toString().slice(0, 10)
    })
  }

  const handleEditNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNote) return
    setEditSaving(true)
    try {
      const res = await fetch(`http://localhost:8000/api/issue-notes/${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receivedByName: editForm.receivedByName,
          receivedByDesignation: editForm.receivedByDesignation,
          receivedByDate: editForm.receivedByDate || null
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to update')
      setEditingNote(null)
      loadNotes()
    } catch (err: any) {
      alert(err.message || 'Failed to update issue note')
    } finally {
      setEditSaving(false)
    }
  }

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelCls = "block text-sm font-medium text-gray-700 mb-2"

  const handlePrint = (note?: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const esc = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const src = note ? {
      to: note.to_department,
      from: note.from_location || 'ICT',
      ref: note.ref,
      date: note.date_in || note.date,
      subject: note.subject,
      message: note.message,
      issuingOfficer: note.issuing_officer,
      issuingOfficerRole: note.issuing_officer_role,
      receivedByName: note.received_by_name,
      receivedByDesignation: note.received_by_designation,
      receivedByDate: note.date_out,
      receivedBySign: note.received_by_signature
    } : { ...formData, receivedBySign: '' }

    let printItems = items
    if (note) {
      try { printItems = JSON.parse(note.items || '[]') } catch { printItems = [] }
    }

    const itemRows = printItems.map((item: any) => `
      <tr>
        <td style="border:1px solid #000;padding:6px;">${esc(item.item)}</td>
        <td style="border:1px solid #000;padding:6px;">${esc(item.serialNumber)}</td>
        <td style="border:1px solid #000;padding:6px;">${esc(item.tagNumber)}</td>
      </tr>`).join('')

    const baseUrl = window.location.origin

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Issue Note</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #000; font-size: 13px; position: relative; }
    .header { text-align: center; margin-bottom: 10px; }
    .header img.logo { height: 90px; margin-bottom: 6px; }
    .header h1 { font-size: 18px; margin: 0; }
    .header h2 { font-size: 15px; margin: 4px 0; }
    .header h3 { font-size: 14px; margin: 4px 0; font-weight: bold; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .meta-table td { padding: 4px 8px; vertical-align: top; }
    table.grid { width: 100%; border-collapse: collapse; margin-top: 10px; }
    table.grid th, table.grid td { border: 1px solid #000; padding: 6px; font-size: 12px; text-align: left; }
    table.grid th { background: #eee; }
    .received { margin-top: 40px; }
    .received .line { border-bottom: 1px solid #000; height: 30px; }
    .note { margin-top: 24px; font-size: 11px; font-style: italic; }
    .doc-footer { position: fixed; bottom: 20px; left: 0; right: 0; font-size: 10px; color: #555; }
    .doc-footer .cert-left { position: absolute; left: 0; bottom: 0; text-align: center; }
    .doc-footer .cert-right { position: absolute; right: 0; bottom: 0; }
    .doc-footer img { height: 55px; vertical-align: middle; }
    .doc-footer .cert-text { display: block; font-weight: bold; letter-spacing: 1px; font-size: 9px; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="${baseUrl}/images/afc-logo.jpeg" alt="AFC Logo" />
    <h1>Agricultural Finance Corporation</h1>
    <h2>ICT Department</h2>
    <h3>Issue Note</h3>
  </div>
  <table class="meta-table">
    <tr>
      <td style="width:33%;"><b>TO:</b> ${esc(src.to) || '______________'}</td>
      <td style="width:33%;"><b>FROM:</b> ${esc(src.from) || 'ICT'}</td>
      <td style="width:33%;"><b>REF:</b> ${esc(src.ref) || '______________'}</td>
    </tr>
    <tr>
      <td colspan="3"><b>DATE:</b> ${esc(src.date) || '______________'}</td>
    </tr>
    <tr>
      <td colspan="3"><b>RE:</b> ${esc(src.subject) || '______________'}</td>
    </tr>
  </table>
  <div>${esc(src.message) || '&nbsp;'}</div>
  <table class="grid">
    <thead>
      <tr>
        <th style="width:50%;">ITEM</th>
        <th style="width:25%;">SERIAL NUMBER</th>
        <th style="width:25%;">TAG NUMBER</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div style="margin-top:20px;">
    <b>NAME OF ISSUING OFFICER:</b> ${esc(src.issuingOfficer) || '______________'}<br/>
    <b>${esc(src.issuingOfficerRole) || 'ICT OFFICER'}</b>
  </div>
  <div class="received">
    <b>RECEIVED BY:</b>
    <div style="margin-top:30px;">
      Name <span class="line" style="display:inline-block;width:280px;vertical-align:bottom;margin-left:8px;"></span>
      Designation <span class="line" style="display:inline-block;width:200px;vertical-align:bottom;margin-left:8px;"></span>
    </div>
    <div style="margin-top:20px;">
      Signature <span class="line" style="display:inline-block;width:280px;vertical-align:bottom;margin-left:8px;"></span>
      Date <span class="line" style="display:inline-block;width:200px;vertical-align:bottom;margin-left:8px;"></span>
    </div>
    ${src.receivedByName ? `<div style="margin-top:10px;font-size:12px;">Received by: ${esc(src.receivedByName)}${src.receivedByDesignation ? ` (${esc(src.receivedByDesignation)})` : ''}${src.receivedBySign ? ` — Signed: ${esc(src.receivedBySign)}` : ''}</div>` : ''}
  </div>
  <div class="note">N/B: Please sign and return a copy of this issue note for our records.</div>
  <div class="doc-footer">
    <div class="cert-left">
      <img src="${baseUrl}/images/iso-9001.jpeg" alt="ISO 9001" />
      <span class="cert-text">ISO 9001:2015<br/>CERTIFIED</span>
    </div>
    <div class="cert-right">
      <img src="${baseUrl}/images/iso-mark.png" alt="Certification Mark" />
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`)
    printWindow.document.close()
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Issue Note</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>TO (Department/Branch) *</label>
              <select value={formData.to} onChange={(e) => handleInputChange('to', e.target.value)} className={inputCls} required>
                <option value="">Select branch...</option>
                {branches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>FROM</label>
              <input type="text" value={formData.from} onChange={(e) => handleInputChange('from', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>REF</label>
              <input type="text" value={formData.ref} onChange={(e) => handleInputChange('ref', e.target.value)} placeholder="e.g., AFC/ICT/001" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>DATE *</label>
              <input type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} className={inputCls} required />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>RE (Subject) *</label>
              <input type="text" value={formData.subject} onChange={(e) => handleInputChange('subject', e.target.value)} placeholder="e.g., KYOCERA PRINTER" className={inputCls} required />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className={labelCls}>MESSAGE</label>
            <textarea value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} rows={2} className={inputCls} />
          </div>

          {/* Items table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">ITEMS ISSUED</label>
              <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Row</button>
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tag Number</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <select
                          value={item.asset_id}
                          onChange={(e) => handleAssetPick(index, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="">Select asset...</option>
                          {assets.map(a => (
                            <option key={a.id} value={String(a.id)}>
                              {a.asset_code} — {a.asset_name}{a.brand ? ` (${a.brand})` : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2"><input type="text" value={item.item} onChange={(e) => handleItemChange(index, 'item', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., 4G FDD LTE MOBILE WIFI" required /></td>
                      <td className="px-3 py-2"><input type="text" value={item.serialNumber} onChange={(e) => handleItemChange(index, 'serialNumber', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., A01220FBCAD3" /></td>
                      <td className="px-3 py-2"><input type="text" value={item.tagNumber} onChange={(e) => handleItemChange(index, 'tagNumber', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., N/A" /></td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-sm" title="Remove row">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Issuing officer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>NAME OF ISSUING OFFICER *</label>
              <input type="text" value={formData.issuingOfficer} readOnly className={`${inputCls} bg-gray-100 cursor-not-allowed`} title="Auto-filled from your logged-in account" />
            </div>
            <div>
              <label className={labelCls}>DESIGNATION</label>
              <input type="text" value={formData.issuingOfficerRole} readOnly className={`${inputCls} bg-gray-100 cursor-not-allowed`} title="Auto-filled from your account role" />
            </div>
          </div>

          {/* Received by */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>RECEIVED BY (Name) *</label>
              <select value={formData.receivedByName} onChange={(e) => handleInputChange('receivedByName', e.target.value)} className={inputCls} required>
                <option value="">Select user...</option>
                {allUsers.map(o => <option key={o.id} value={o.full_name}>{o.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Designation</label>
              <input type="text" value={formData.receivedByDesignation} onChange={(e) => handleInputChange('receivedByDesignation', e.target.value)} placeholder="e.g., Branch Manager" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date Received</label>
              <input type="text" value="Entered by recipient on acknowledgment" readOnly className={`${inputCls} bg-gray-100 cursor-not-allowed text-gray-500`} />
            </div>
          </div>

          {submitMessage && (
            <div className={`p-3 rounded-md text-sm ${submitMessage.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {submitMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Print / Export
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Submit Issue Note'}
            </button>
          </div>
        </form>
      </div>

      {/* Posted Issue Notes */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted Issue Notes</h3>
        {savedNotes.length === 0 ? (
          <p className="text-sm text-gray-500">No issue notes posted yet.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-300 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ref</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">TO</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">RE</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issuing Officer</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savedNotes.map((note: any) => {
                  let itemCount = 0
                  try { itemCount = JSON.parse(note.items || '[]').length } catch { itemCount = 0 }
                  return (
                    <tr key={note.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{(note.date_in || note.date || '').toString().slice(0, 10)}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{note.ref || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{note.to_department || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{note.subject || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{note.issuing_officer || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{note.received_by_name || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{itemCount}</td>
                      <td className="px-3 py-2">
                        {note.status === 'Acknowledged' ? (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Acknowledged</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Pending</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm space-x-2 whitespace-nowrap">
                        <button onClick={() => handlePrint(note)} className="text-blue-600 hover:text-blue-800 font-medium">Print</button>
                        <button onClick={() => handlePrint(note)} className="text-green-600 hover:text-green-800 font-medium" title="Opens print dialog — choose 'Save as PDF' to export">Export PDF</button>
                        {isSuperAdmin && (
                          <button onClick={() => openEditNote(note)} className="text-amber-600 hover:text-amber-800 font-medium">Edit</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Issue Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Edit Issue Note</h3>
            <p className="text-sm text-gray-500 mb-4">Ref: {editingNote.ref || '—'} • {editingNote.subject || ''}</p>
            <form onSubmit={handleEditNote} className="space-y-4">
              <div>
                <label className={labelCls}>Received By (Name)</label>
                <select value={editForm.receivedByName} onChange={(e) => setEditForm(f => ({ ...f, receivedByName: e.target.value }))} className={inputCls}>
                  <option value="">Select user...</option>
                  {allUsers.map(o => <option key={o.id} value={o.full_name}>{o.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Designation</label>
                <input type="text" value={editForm.receivedByDesignation} onChange={(e) => setEditForm(f => ({ ...f, receivedByDesignation: e.target.value }))} placeholder="e.g., Branch Manager" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date Received</label>
                <input type="date" value={editForm.receivedByDate} onChange={(e) => setEditForm(f => ({ ...f, receivedByDate: e.target.value }))} className={inputCls} />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingNote(null)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={editSaving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export const RepairFormContent = () => {
  const [formData, setFormData] = useState({
    branch: '',
    dateIn: '',
    receivedBy: '',
    commentByHod: '',
    preparedByName: '',
    preparedBySign: '',
    preparedByDate: '',
    confirmedByName: '',
    confirmedBySign: '',
    confirmedByDate: '',
    receivedByHodName: '',
    receivedByHodSign: '',
    receivedByHodDate: ''
  })
  const [items, setItems] = useState([
    { device: '', model: '', tagNo: '', diagnosis: '', workDone: '', remarks: '' }
  ])
  const [branches, setBranches] = useState<{ id: number; branch_name: string }[]>([])
  const [officers, setOfficers] = useState<{ id: number; username: string; full_name: string }[]>([])
  const [allUsers, setAllUsers] = useState<{ id: number; username: string; full_name: string }[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/api/branches')
      .then(r => r.json())
      .then(data => setBranches(data.branches || []))
      .catch(() => {})
    fetch('http://localhost:8000/api/users')
      .then(r => r.json())
      .then(data => {
        const list = data.users || []
        setAllUsers(list)
        setOfficers(list.filter((u: any) => ['ICT Officer', 'Technician'].includes(u.role)))
      })
      .catch(() => {})
  }, [])

  const [submitMessage, setSubmitMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMessage('')
    try {
      const response = await fetch('http://localhost:8000/api/repair-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, devices: items })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to save')
      setSubmitMessage('Repair form saved successfully.')
      setItems([{ device: '', model: '', tagNo: '', diagnosis: '', workDone: '', remarks: '' }])
      setFormData({
        branch: '', dateIn: '', receivedBy: '', commentByHod: '',
        preparedByName: '', preparedBySign: '', preparedByDate: '',
        confirmedByName: '', confirmedBySign: '', confirmedByDate: '',
        receivedByHodName: '', receivedByHodSign: '', receivedByHodDate: ''
      })
    } catch (err: any) {
      setSubmitMessage(err.message || 'Failed to save repair form.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const addItem = () => {
    setItems(prev => [...prev, { device: '', model: '', tagNo: '', diagnosis: '', workDone: '', remarks: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== index))
  }

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelCls = "block text-sm font-medium text-gray-700 mb-2"

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const esc = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const baseUrl = window.location.origin

    const itemRows = items.map((item, i) => `
      <tr>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${i + 1}.</td>
        <td style="border:1px solid #000;padding:6px;">${esc(item.device)}</td>
        <td style="border:1px solid #000;padding:6px;">${esc(item.model)}</td>
        <td style="border:1px solid #000;padding:6px;">${esc(item.tagNo)}</td>
        <td style="border:1px solid #000;padding:6px;white-space:pre-wrap;">${esc(item.diagnosis)}</td>
        <td style="border:1px solid #000;padding:6px;white-space:pre-wrap;">${esc(item.workDone)}</td>
        <td style="border:1px solid #000;padding:6px;white-space:pre-wrap;">${esc(item.remarks)}</td>
      </tr>`).join('')

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Computer Repair and Maintenance Memo</title>
  <style>
    body { font-family: Tahoma, Arial, sans-serif; margin: 30px; color: #000; font-size: 13px; position: relative; }
    .header { text-align: center; margin-bottom: 16px; }
    .header img.logo { height: 110px; margin-bottom: 6px; }
    .header h1 { font-size: 16px; margin: 0; }
    .header h2 { font-size: 14px; margin: 2px 0; }
    .header h3 { font-size: 13px; margin: 2px 0; font-weight: bold; }
    .meta { margin: 12px 0; }
    table.grid { width: 100%; border-collapse: collapse; margin-top: 10px; }
    table.grid th, table.grid td { border: 1px solid #000; padding: 6px; font-size: 12px; text-align: left; }
    table.grid th { background: #eee; }
    .sign-row { display: flex; justify-content: space-between; margin-top: 30px; }
    .sign-item { width: 48%; font-size: 13px; }
    .sign-item .lbl { margin-bottom: 45px; }
    .uline { display: inline-block; border-bottom: 1px solid #000; height: 18px; min-width: 140px; vertical-align: bottom; }
    .note { margin-top: 24px; font-size: 11px; font-style: italic; }
    .doc-footer { position: fixed; bottom: 20px; left: 0; right: 0; font-size: 10px; color: #555; }
    .doc-footer .cert-left { position: absolute; left: 0; bottom: 0; text-align: center; }
    .doc-footer .cert-right { position: absolute; right: 0; bottom: 0; }
    .doc-footer img { height: 55px; vertical-align: middle; }
    .doc-footer .cert-text { display: block; font-weight: bold; letter-spacing: 1px; font-size: 9px; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="${baseUrl}/images/afc-logo.jpeg" alt="AFC Logo" />
    <h1>AGRICULTURAL FINANCE CORPORATION</h1>
    <h2>ICT DIVISION</h2>
    <h3>COMPUTER REPAIR AND MAINTENANCE MEMO</h3>
  </div>
  <div class="meta">
    <b>BRANCH:</b> ${esc(formData.branch) || '______________'}
    &nbsp;&nbsp;&nbsp;&nbsp;
    <b>DATE IN:</b> ${esc(formData.dateIn) || '______________'}
  </div>
  <div style="margin-bottom:10px;">
    <b>RECEIVED BY (ICT):</b> ${esc(formData.receivedBy) || '______________'}
    &nbsp;&nbsp;&nbsp; <b>SIGN:</b> <span class="uline" style="width:200px;"></span>
  </div>
  <table class="grid">
    <thead>
      <tr>
        <th style="width:4%;">No.</th>
        <th style="width:14%;">Device</th>
        <th style="width:12%;">Model</th>
        <th style="width:10%;">Tag No.</th>
        <th style="width:18%;">Diagnosis</th>
        <th style="width:20%;">Repair/Work done</th>
        <th style="width:22%;">Remarks/Challenges</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div style="margin-top:14px;">
    <b>Comment by BM/HOD</b> <span class="uline" style="width:70%;"></span>
    ${formData.commentByHod ? `<div style="margin-top:4px;">${esc(formData.commentByHod)}</div>` : ''}
  </div>
  <div class="sign-row">
    <div class="sign-item">
      <div class="lbl"><b>Prepared By:</b> ${esc(formData.preparedByName) || '______________'}</div>
      <div><b>Sign.</b> ${formData.preparedBySign ? esc(formData.preparedBySign) : '<span class="uline" style="width:160px;"></span>'} &nbsp; <b>Date:</b> ${esc(formData.preparedByDate) || '______________'}</div>
    </div>
    <div class="sign-item">
      <div class="lbl"><b>Confirmed By:</b> ${esc(formData.confirmedByName) || '______________'}</div>
      <div><b>Sign.</b> ${formData.confirmedBySign ? esc(formData.confirmedBySign) : '<span class="uline" style="width:160px;"></span>'} &nbsp; <b>Date:</b> ${esc(formData.confirmedByDate) || '______________'}</div>
    </div>
  </div>
  <div style="margin-top:30px;">
    <b>Received by (BM/HOD)</b> ${formData.receivedByHodName ? esc(formData.receivedByHodName) : '<span class="uline" style="width:30%;"></span>'}
    &nbsp;&nbsp; <b>Sign:</b> ${formData.receivedByHodSign ? esc(formData.receivedByHodSign) : '<span class="uline" style="width:160px;"></span>'}
    &nbsp;&nbsp; <b>Date:</b> ${esc(formData.receivedByHodDate) || '______________'}
  </div>
  <div class="note">N/B: Please sign and return a copy of this memo for our records.</div>
  <div class="doc-footer">
    <div class="cert-left">
      <img src="${baseUrl}/images/iso-9001.jpeg" alt="ISO 9001" />
      <span class="cert-text">ISO 9001:2015<br/>CERTIFIED</span>
    </div>
    <div class="cert-right">
      <img src="${baseUrl}/images/iso-mark.png" alt="Certification Mark" />
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`)
    printWindow.document.close()
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Repair Form</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>BRANCH</label>
              <select value={formData.branch} onChange={(e) => handleInputChange('branch', e.target.value)} className={inputCls} required>
                <option value="">Select branch...</option>
                {branches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>DATE IN</label>
              <input type="date" value={formData.dateIn} onChange={(e) => handleInputChange('dateIn', e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>RECEIVED BY (ICT)</label>
              <select value={formData.receivedBy} onChange={(e) => handleInputChange('receivedBy', e.target.value)} className={inputCls} required>
                <option value="">Select officer...</option>
                {officers.map(o => <option key={o.id} value={o.full_name}>{o.full_name}</option>)}
              </select>
            </div>
          </div>

          {/* Repair items table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">DEVICES REPAIRED</label>
              <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Row</button>
            </div>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-8">No.</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tag No.</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Repair/Work done</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks/Challenges</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm text-gray-500">{index + 1}.</td>
                      <td className="px-3 py-2"><input type="text" value={item.device} onChange={(e) => handleItemChange(index, 'device', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., ALL IN ONE" required /></td>
                      <td className="px-3 py-2"><input type="text" value={item.model} onChange={(e) => handleItemChange(index, 'model', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., LENOVO" /></td>
                      <td className="px-3 py-2"><input type="text" value={item.tagNo} onChange={(e) => handleItemChange(index, 'tagNo', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., AFC05773" required /></td>
                      <td className="px-3 py-2"><textarea value={item.diagnosis} onChange={(e) => handleItemChange(index, 'diagnosis', e.target.value)} rows={2} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., Faulty HDD" required /></td>
                      <td className="px-3 py-2"><textarea value={item.workDone} onChange={(e) => handleItemChange(index, 'workDone', e.target.value)} rows={2} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., Replaced HDD, reinstalled OS" required /></td>
                      <td className="px-3 py-2"><textarea value={item.remarks} onChange={(e) => handleItemChange(index, 'remarks', e.target.value)} rows={2} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" placeholder="e.g., Fixed" /></td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-sm" title="Remove row">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comment by BM/HOD */}
          <div>
            <label className={labelCls}>COMMENT BY BM/HOD</label>
            <textarea value={formData.commentByHod} onChange={(e) => handleInputChange('commentByHod', e.target.value)} rows={3} className={inputCls} placeholder="Comments from the Branch Manager / Head of Department" />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>PREPARED BY</label>
              <select value={formData.preparedByName} onChange={(e) => handleInputChange('preparedByName', e.target.value)} className={inputCls}>
                <option value="">Select user...</option>
                {officers.map(o => <option key={o.id} value={o.full_name}>{o.full_name}</option>)}
              </select>
              <input type="text" value={formData.preparedBySign} onChange={(e) => handleInputChange('preparedBySign', e.target.value)} placeholder="Signature" className={`${inputCls} mt-2`} />
              <input type="date" value={formData.preparedByDate} onChange={(e) => handleInputChange('preparedByDate', e.target.value)} className={`${inputCls} mt-2`} title="Date" />
            </div>
            <div>
              <label className={labelCls}>CONFIRMED BY</label>
              <select value={formData.confirmedByName} onChange={(e) => handleInputChange('confirmedByName', e.target.value)} className={inputCls}>
                <option value="">Select user...</option>
                {allUsers.map(o => <option key={o.id} value={o.full_name}>{o.full_name}</option>)}
              </select>
              <input type="text" value={formData.confirmedBySign} onChange={(e) => handleInputChange('confirmedBySign', e.target.value)} placeholder="Signature" className={`${inputCls} mt-2`} />
              <input type="date" value={formData.confirmedByDate} onChange={(e) => handleInputChange('confirmedByDate', e.target.value)} className={`${inputCls} mt-2`} title="Date" />
            </div>
            <div>
              <label className={labelCls}>RECEIVED BY (BM/HOD)</label>
              <select value={formData.receivedByHodName} onChange={(e) => handleInputChange('receivedByHodName', e.target.value)} className={inputCls}>
                <option value="">Select user...</option>
                {allUsers.map(o => <option key={o.id} value={o.full_name}>{o.full_name}</option>)}
              </select>
              <input type="text" value={formData.receivedByHodSign} onChange={(e) => handleInputChange('receivedByHodSign', e.target.value)} placeholder="Signature" className={`${inputCls} mt-2`} />
              <input type="date" value={formData.receivedByHodDate} onChange={(e) => handleInputChange('receivedByHodDate', e.target.value)} className={`${inputCls} mt-2`} title="Date" />
            </div>
          </div>

          {submitMessage && (
            <div className={`p-3 rounded-md text-sm ${submitMessage.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {submitMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Print / Export
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Submit Repair Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
