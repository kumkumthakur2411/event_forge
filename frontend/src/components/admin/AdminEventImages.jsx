import React, { useState } from 'react'
import API from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminEventImages({ images = [], setMsg, loadImages }) {
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [adminFile, setAdminFile] = useState(null)
  const [adminCaption, setAdminCaption] = useState('')
  const itemsPerPage = 10

  const handleAdminUpload = async () => {
    if (!adminFile) return setMsg('File required')
    try {
      const form = new FormData()
      form.append('image', adminFile)
      form.append('caption', adminCaption)
      await API.post('/admin/event-images', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg('Event image uploaded')
      setAdminFile(null)
      setAdminCaption('')
      loadImages()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e?.message || ''))
    }
  }

  const handleApprove = async (id, approve) => {
    try {
      await API.post(`/admin/event-images/${id}/approve`, { approve })
      setMsg(`Image ${approve ? 'approved' : 'unapproved'}`)
      loadImages()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e?.message || ''))
    }
  }

  const handleToggleLanding = async (id, forLanding) => {
    try {
      await API.post(`/admin/event-images/${id}/approve`, { forLanding })
      setMsg('Landing flag updated')
      loadImages()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e?.message || ''))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return
    try {
      await API.delete(`/admin/event-images/${id}`)
      setMsg('Image deleted')
      loadImages()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e?.message || ''))
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Event Images Gallery</h2>

      {/* Admin Upload */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-3">Admin Upload Event Image</h3>
        <div className="space-y-3">
          <input type="file" accept="image/*" onChange={(e) => setAdminFile(e.target.files[0])} className="w-full p-2 border rounded" />
          <input type="text" placeholder="Caption (optional)" value={adminCaption} onChange={(e) => setAdminCaption(e.target.value)} className="w-full p-2 border rounded" />
          <button onClick={handleAdminUpload} className="bg-green-600 text-white px-4 py-2 rounded w-full">Upload</button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {images.map(img => (
          <div key={img._id} className="border rounded p-3 bg-gray-50">
            <img src={getFullImageUrl(img.imageUrl)} alt={img.caption} className="w-full h-32 object-cover rounded mb-2" />
            <div className="text-xs text-gray-600 mb-2">
              {img.uploader?.name || 'Admin'} - {img.event?.title || 'No event'}
            </div>
            {img.caption && <div className="text-sm mb-2">{img.caption}</div>}
            
            <div className="space-y-2 text-xs">
              {!img.approved ? (
                <button onClick={() => handleApprove(img._id, true)} className="bg-green-600 text-white px-3 py-1 rounded w-full">Approve</button>
              ) : (
                <button onClick={() => handleApprove(img._id, false)} className="bg-yellow-600 text-white px-3 py-1 rounded w-full">Unapprove</button>
              )}
              
              {img.approved && (
                <label className="flex items-center gap-2 p-2 bg-white rounded border">
                  <input type="checkbox" checked={!!img.forLanding} onChange={(e) => handleToggleLanding(img._id, e.target.checked)} />
                  <span>Show on landing</span>
                </label>
              )}

              <button onClick={() => handleDelete(img._id)} className="bg-red-600 text-white px-3 py-1 rounded w-full">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination would go here if needed */}
    </div>
  )
}
