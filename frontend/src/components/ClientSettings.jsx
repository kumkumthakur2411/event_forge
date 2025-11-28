import React, { useState, useEffect } from 'react'
import API, { setToken } from '../api'
import { getFullImageUrl } from '../utils/getBaseUrl'

export default function ClientSettings({ setMsg, onProfileUpdate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const t = localStorage.getItem('ef_token')
      if (t) setToken(t)
      const res = await API.get('/client/profile')
      const u = res.data || {}
      setName(u.name || '')
      setEmail(u.email || '')
      setPhone(u.profile?.phone || '')
      setCity(u.profile?.city || '')
      setProfileImage(u.profileImage || null)
    } catch (e) {
      setMsg('Failed to load profile: ' + (e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    setProfileImageFile(e.target.files[0])
  }

  const saveProfile = async () => {
    try {
      if (!name) return setMsg('Name is required')
      if (!phone) return setMsg('Phone is required')

      const t = localStorage.getItem('ef_token')
      if (t) setToken(t)

      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('city', city)
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile)
      }

      const res = await API.patch('/client/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMsg(res.data.message || 'Profile updated')
      setProfileImage(res.data.user?.profileImage || null)
      setProfileImageFile(null)
      if (onProfileUpdate) onProfileUpdate(res.data.user)
    } catch (e) {
      setMsg('Error updating profile: ' + (e?.response?.data?.message || e.message))
    }
  }

  const changePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return setMsg('All password fields required')
      }
      if (newPassword !== confirmPassword) {
        return setMsg('New passwords do not match')
      }
      if (newPassword.length < 6) {
        return setMsg('Password must be at least 6 characters')
      }

      const t = localStorage.getItem('ef_token')
      if (t) setToken(t)

      await API.put('/client/profile/password', {
        currentPassword,
        newPassword
      })
      setMsg('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e.message))
    }
  }

  if (loading) return <div className="p-6 text-center">Loading profile...</div>

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>

      {/* Profile Information */}
      <div className="border-b pb-6">
        <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your city"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {profileImage && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Current Photo:</p>
              <img
                src={getFullImageUrl(profileImage)}
                alt="Profile"
                className="w-32 h-32 rounded object-cover"
              />
            </div>
          )}

          <button
            onClick={saveProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Change Password */}
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
            <label className="block text-sm font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={changePassword}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  )
}
