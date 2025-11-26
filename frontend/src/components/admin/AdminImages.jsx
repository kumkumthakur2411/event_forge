import React, { useState } from 'react'
import API from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminImages({ images, setMsg, loadImages }) {
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImageTitle, setNewImageTitle] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleImageFileChange = (e) => {
    setNewImageFile(e.target.files[0])
  }

  const uploadImage = async () => {
    if (!newImageFile || !newImageTitle) {
      return setMsg('File and title required')
    }
    try {
      const formData = new FormData()
      formData.append('image', newImageFile)
      formData.append('title', newImageTitle)
      await API.post('/admin/upload-web-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMsg('Image uploaded')
      setNewImageFile(null)
      setNewImageTitle('')
      loadImages()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const deleteImage = async (id) => {
    if (!window.confirm('Delete this image?')) return
    try {
      await API.delete(`/admin/web-images/${id}`)
      setMsg('Image deleted')
      loadImages()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const paginatedImages = images.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(images.length / itemsPerPage)

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Web Images</h2>

      {/* Upload Section */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-3">Upload New Image</h3>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageFileChange}
            className="p-2 border rounded flex-1"
          />
          <input 
            type="text"
            placeholder="Image title"
            value={newImageTitle}
            onChange={(e) => setNewImageTitle(e.target.value)}
            className="p-2 border rounded flex-1"
          />
          <button onClick={uploadImage} className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {paginatedImages.map(img => (
          <div key={img._id} className="border rounded p-3">
            <img src={getFullImageUrl(img.imagePath)} alt={img.title} className="w-full h-32 object-cover rounded mb-2" />
            <p className="text-sm font-semibold">{img.title}</p>
            <p className="text-xs text-gray-600">{new Date(img.createdAt).toLocaleDateString()}</p>
            <button 
              onClick={() => deleteImage(img._id)} 
              className="bg-red-600 text-white px-2 py-1 rounded text-xs mt-2 w-full"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
