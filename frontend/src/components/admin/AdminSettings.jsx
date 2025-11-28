import React, { useState, useEffect } from 'react'
import API, { setToken } from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminSettings({ adminName, setAdminName, adminProfileImageFile, setAdminProfileImageFile, adminProfileImage, setAdminProfileImage, setMsg }) {
  // default settings state
  const [siteName, setSiteName] = useState('Event Forge')
  const [defaultEventApproval, setDefaultEventApproval] = useState('pending')
  const [defaultTestimonialDisplay, setDefaultTestimonialDisplay] = useState(false)
  const [defaultUserRole, setDefaultUserRole] = useState('client')
  const [notifyOnNewRegistration, setNotifyOnNewRegistration] = useState(true)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [quickActionsEnabled, setQuickActionsEnabled] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const handleAdminImageFileChange = (e) => {
    setAdminProfileImageFile(e.target.files[0])
  }

  const updateAdminProfile = async () => {
    try {
      const formData = new FormData()
      formData.append('name', adminName)
      if (adminProfileImageFile) {
        formData.append('profileImage', adminProfileImageFile)
      }
      const res = await API.patch('/admin/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMsg('Profile updated successfully')
      setAdminProfileImage(res.data.profileImage)
      setAdminProfileImageFile(null)
    } catch (e) {
      setMsg('Error updating profile: ' + (e?.response?.data?.message || e.message))
    }
  }

  const changeAdminPassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return setMsg('All password fields required')
    }
    if (newPassword !== confirmNewPassword) {
      return setMsg('New passwords do not match')
    }
    if (newPassword.length < 6) {
      return setMsg('New password must be at least 6 characters')
    }
    try {
      await API.put('/admin/profile/password', {
        currentPassword,
        newPassword
      })
      setMsg('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e.message))
    }
  }

  // Load settings from backend
  const loadSettings = async () => {
    try {
      setSettingsLoading(true)
      // ensure token is set on API helper (in case parent hasn't set yet)
      const t = localStorage.getItem('ef_token')
      if (t) setToken(t)
      const res = await API.get('/admin/settings')
      const s = res.data || {}
      setSiteName(s.siteName || 'Event Forge')
      setDefaultEventApproval(s.defaultEventApproval || 'pending')
      setDefaultTestimonialDisplay(Boolean(s.defaultTestimonialDisplay))
      setDefaultUserRole(s.defaultUserRole || 'client')
      setAdminEmail(s.adminEmail || '')
      setAdminPhone(s.adminPhone || '')
      setNotifyOnNewRegistration(typeof s.notifyOnNewRegistration === 'undefined' ? true : Boolean(s.notifyOnNewRegistration))
      setItemsPerPage(Number(s.itemsPerPage) || 10)
      setQuickActionsEnabled(typeof s.quickActionsEnabled === 'undefined' ? true : Boolean(s.quickActionsEnabled))
    } catch (e) {
      setMsg('Failed to load settings: ' + (e?.response?.data?.message || e.message))
    } finally {
      setSettingsLoading(false)
    }
  }

  useEffect(() => { loadSettings() }, [])

  const saveSettings = async () => {
    try {
      // ensure token is set
      const t = localStorage.getItem('ef_token')
      if (t) setToken(t)
      const payload = {
        siteName,
        defaultEventApproval,
        defaultTestimonialDisplay,
        defaultUserRole,
        adminEmail,
        adminPhone,
        notifyOnNewRegistration,
        itemsPerPage,
        quickActionsEnabled
      }
      const res = await API.put('/admin/settings', payload)
      if (res && res.data) {
        setMsg(res.data.message || 'Settings saved successfully')
      } else {
        setMsg('Settings saved')
      }
    } catch (e) {
      const errMsg = e?.response?.data?.message || e?.message || JSON.stringify(e?.response?.data) || 'Unknown error'
      setMsg('Failed to save settings: ' + errMsg)
    }
  }

  const resetDefaults = async () => {
    try {
      setSiteName('Event Forge')
      setDefaultEventApproval('pending')
      setDefaultTestimonialDisplay(false)
      setDefaultUserRole('client')
      setNotifyOnNewRegistration(true)
      setItemsPerPage(10)
      setQuickActionsEnabled(true)
      setMsg('Defaults restored (click Save to persist)')
    } catch (e) {
      setMsg('Failed to reset defaults')
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <div>
        <h2 className="text-2xl mb-4 font-bold">Settings</h2>

        {/* Profile Section */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Admin Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Admin Name</label>
              <input 
                type="text" 
                value={adminName} 
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Enter admin name" 
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Profile Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleAdminImageFileChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          {adminProfileImage && (
            <div className="mt-4">
              <img src={getFullImageUrl(adminProfileImage)} alt="Admin Profile" className="w-24 h-24 rounded object-cover" />
            </div>
          )}
          <button 
            onClick={updateAdminProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          >
            Update Profile
          </button>
        </div>

        {/* Password Change Section */}
        <div className="pt-6">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-2">Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button 
            onClick={changeAdminPassword}
            className="bg-green-600 text-white px-4 py-2 rounded mt-4"
          >
            Change Password
          </button>
        </div>

        {/* Default Admin Settings */}
        <div className="pt-6">
          <h3 className="text-xl font-semibold mb-4">Default Admin Settings</h3>
          {settingsLoading ? (
            <div>Loading settings...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Site Name</label>
                <input value={siteName} onChange={(e)=>setSiteName(e.target.value)} className="w-full p-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Default Event Approval</label>
                <select value={defaultEventApproval} onChange={(e)=>setDefaultEventApproval(e.target.value)} className="w-full p-2 border rounded">
                  <option value="pending">Require Admin Approval (pending)</option>
                  <option value="autoApprove">Auto-Approve New Events</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="inline-flex items-center mt-1">
                    <input type="checkbox" checked={defaultTestimonialDisplay} onChange={(e)=>setDefaultTestimonialDisplay(e.target.checked)} className="mr-2" />
                    <span className="text-sm">Display testimonials on landing by default</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Default Role on Registration</label>
                  <select value={defaultUserRole} onChange={(e)=>setDefaultUserRole(e.target.value)} className="w-full p-2 border rounded">
                    <option value="client">Client</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="inline-flex items-center mt-1">
                    <input type="checkbox" checked={notifyOnNewRegistration} onChange={(e)=>setNotifyOnNewRegistration(e.target.checked)} className="mr-2" />
                    <span className="text-sm">Notify admin on new registrations</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">List Items Per Page</label>
                  <input type="number" min={1} value={itemsPerPage} onChange={(e)=>setItemsPerPage(Number(e.target.value)||1)} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Admin Contact Email</label>
                  <input type="email" value={adminEmail} onChange={(e)=>setAdminEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="admin@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Admin Contact Phone</label>
                  <input type="text" value={adminPhone} onChange={(e)=>setAdminPhone(e.target.value)} className="w-full p-2 border rounded" placeholder="+91-XXXXXXXXXX" />
                </div>
              </div>

              <div>
                <label className="inline-flex items-center mt-1">
                  <input type="checkbox" checked={quickActionsEnabled} onChange={(e)=>setQuickActionsEnabled(e.target.checked)} className="mr-2" />
                  <span className="text-sm">Enable Quick Actions on Dashboard</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button onClick={saveSettings} className="bg-blue-600 text-white px-4 py-2 rounded">Save Settings</button>
                <button onClick={resetDefaults} className="bg-gray-200 px-4 py-2 rounded">Restore Defaults</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
