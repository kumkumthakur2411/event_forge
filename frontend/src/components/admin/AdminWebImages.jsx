import React, { useState } from 'react'
import API from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminWebImages({ images, setMsg, loadImages }) {
  const [editingId, setEditingId] = useState(null)
  const [editFile, setEditFile] = useState(null)
  const [editAltText, setEditAltText] = useState('')
  
  const [newFile, setNewFile] = useState(null)
  const [newSection, setNewSection] = useState('hero')
  const [newAltText, setNewAltText] = useState('')

  const sections = ['hero', 'navbar-logo', 'box1', 'box2', 'howitworks']

  const handleUpload = async () => {
    if (!newFile || !newSection) return setMsg('File and section required')
    try {
      const form = new FormData()
      form.append('image', newFile)
      form.append('section', newSection)
      form.append('altText', newAltText)
      await API.post('/admin/images', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg('Image uploaded')
      setNewFile(null)
      setNewSection('hero')
      setNewAltText('')
      loadImages()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e?.message || ''))
    }
  }

  const handleEdit = (img) => {
    setEditingId(img._id)
    setEditFile(null)
    setEditAltText(img.altText || '')
  }

  const handleSaveEdit = async () => {
    try {
      const form = new FormData()
      if (editFile) form.append('image', editFile)
      form.append('altText', editAltText)
      await API.patch(`/admin/images/${editingId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg('Image updated')
      setEditingId(null)
      setEditFile(null)
      setEditAltText('')
      loadImages()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e?.message || ''))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return
    try {
      await API.delete(`/admin/images/${id}`)
      setMsg('Image deleted')
      loadImages()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e?.message || ''))
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Web Section Images</h2>

      {/* Upload New */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-3">Upload New Image</h3>
        <div className="space-y-3">
          <select value={newSection} onChange={(e) => setNewSection(e.target.value)} className="w-full p-2 border rounded">
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="file" accept="image/*" onChange={(e) => setNewFile(e.target.files[0])} className="w-full p-2 border rounded" />
          <input type="text" placeholder="Alt text" value={newAltText} onChange={(e) => setNewAltText(e.target.value)} className="w-full p-2 border rounded" />
          <button onClick={handleUpload} className="bg-green-600 text-white px-4 py-2 rounded w-full">Upload</button>
        </div>
      </div>

      {/* Images List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map(img => (
          <div key={img._id} className="border rounded p-3 bg-gray-50">
            {editingId === img._id ? (
              <div className="space-y-2">
                <img src={getFullImageUrl(img.imageUrl)} alt={img.altText} className="w-full h-32 object-cover rounded mb-2" />
                <input type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files[0])} className="w-full p-2 border rounded text-xs" />
                <input type="text" value={editAltText} onChange={(e) => setEditAltText(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Alt text" />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="bg-blue-600 text-white px-3 py-1 rounded text-xs flex-1">Save</button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-xs flex-1">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <img src={getFullImageUrl(img.imageUrl)} alt={img.altText} className="w-full h-32 object-cover rounded mb-2" />
                <div className="text-xs font-semibold text-gray-700">{img.section}</div>
                <div className="text-xs text-gray-600 mb-2">{img.altText}</div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(img)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs flex-1">Edit</button>
                  <button onClick={() => handleDelete(img._id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs flex-1">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
