import React, { useState } from 'react'
import API from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminSettings({ adminName, setAdminName, adminProfileImageFile, setAdminProfileImageFile, adminProfileImage, setAdminProfileImage, setMsg }) {
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
      </div>
    </div>
  )
}
