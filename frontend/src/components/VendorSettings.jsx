import React, { useEffect, useState } from 'react'
import API from '../api'
import { getFullImageUrl } from '../utils/getBaseUrl'

export default function VendorSettings({ vendor, onUpdate }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [profileImage, setProfileImage] = useState(null)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [formData, setFormData] = useState({
    profileImage: '',
    name: '',
    email: '',
    phoneNo: '',
    city: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    bio: '',
    experience: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [msg, setMsg] = useState('')
  const [vendorPhotos, setVendorPhotos] = useState([])
  const [uploadFiles, setUploadFiles] = useState(null)

  // Load vendor profile data
  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        phoneNo: vendor.phoneNo || '',
        city: vendor.city || '',
        companyName: vendor.companyName || '',
        companyEmail: vendor.companyEmail || '',
        companyPhone: vendor.companyPhone || '',
        bio: vendor.bio || '',
        experience: vendor.experience || ''
      })
      setProfileImage(vendor.profileImage || null)
      setVendorPhotos(vendor.vendorPhotos || [])
    }
  }, [vendor])

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setProfileImage(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key])
      })
      if (profileImageFile) {
        data.append('profileImage', profileImageFile)
      }
      
      const res = await API.patch('/vendor/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setMsg('Profile updated successfully')
      setProfileImageFile(null)
      if (onUpdate) onUpdate(res.data.vendor)
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || err.message))
    }
  }

  const changePassword = async () => {
    try {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        return setMsg('All password fields required')
      }
      if (passwordData.newPassword.length < 6) {
        return setMsg('New password must be at least 6 characters')
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return setMsg('Passwords do not match')
      }
      
      await API.put('/vendor/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      setMsg('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || err.message))
    }
  }

  const handleUploadPhotosChange = (e) => {
    setUploadFiles(e.target.files)
  }

  const uploadPhotos = async () => {
    try {
      if (!uploadFiles || uploadFiles.length === 0) {
        return setMsg('Please select photos to upload')
      }
      
      const formData = new FormData()
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append('vendorPhotos', uploadFiles[i])
      }
      
      const res = await API.post('/vendor/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setMsg('Photos uploaded successfully')
      setVendorPhotos(res.data.vendorPhotos)
      setUploadFiles(null)
      document.getElementById('photoInput').value = ''
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || err.message))
    }
  }

  const deletePhoto = async (photoUrl) => {
    try {
      const res = await API.delete('/vendor/photos', {
        data: { photoUrl }
      })
      setMsg('Photo deleted')
      setVendorPhotos(res.data.vendorPhotos)
      setTimeout(() => setMsg(''), 2000)
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || err.message))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 px-4 font-semibold text-center transition ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-3 px-4 font-semibold text-center transition ${
            activeTab === 'photos'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Gallery Photos
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 py-3 px-4 font-semibold text-center transition ${
            activeTab === 'password'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className={`p-4 text-sm ${
          msg.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {msg}
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Image Upload */}
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-semibold mb-3">Profile Image</label>
              <div className="flex gap-4 items-start">
                <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  {profileImage ? (
                    <img
                      src={profileImage.startsWith('data:') ? profileImage : getFullImageUrl(profileImage)}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                      No Photo
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="block mb-2 text-sm"
                  />
                  <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    placeholder="Your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    placeholder="City"
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Email</label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    placeholder="Company email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Phone</label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    placeholder="Company phone"
                  />
                </div>
              </div>
            </div>

            {/* Bio & Experience */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Professional Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    placeholder="Tell about your business"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience</label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    placeholder="Years of experience, specialties, etc."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveProfile}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition"
            >
              Save Profile
            </button>
          </div>
        )}

        {/* Gallery Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            {/* Upload Photos */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Upload Gallery Photos</h3>
              <div className="mb-4">
                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadPhotosChange}
                  className="block w-full text-sm mb-2"
                />
                <p className="text-xs text-gray-500">Select multiple photos (up to 10)</p>
              </div>
              <button
                onClick={uploadPhotos}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
              >
                Upload Photos
              </button>
            </div>

            {/* Photos Gallery */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Your Gallery Photos ({vendorPhotos.length})</h3>
              {vendorPhotos.length === 0 ? (
                <p className="text-gray-500 text-sm">No photos uploaded yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vendorPhotos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={getFullImageUrl(photo)}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-40 rounded object-cover"
                      />
                      <button
                        onClick={() => deletePhoto(photo)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="space-y-6 max-w-md">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded"
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  onClick={changePassword}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
