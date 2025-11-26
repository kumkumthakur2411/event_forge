import React, { useState } from 'react'
import API from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminTestimonials({ testimonials, setMsg, loadTestimonials }) {
  const [newTestimonialName, setNewTestimonialName] = useState('')
  const [newTestimonialRole, setNewTestimonialRole] = useState('')
  const [newTestimonialContent, setNewTestimonialContent] = useState('')
  const [newTestimonialImage, setNewTestimonialImage] = useState(null)

  const handleTestimonialImageChange = (e) => {
    setNewTestimonialImage(e.target.files[0])
  }

  const createTestimonial = async () => {
    if (!newTestimonialName || !newTestimonialRole || !newTestimonialContent || !newTestimonialImage) {
      return setMsg('All fields required including image')
    }
    try {
      const formData = new FormData()
      formData.append('name', newTestimonialName)
      formData.append('role', newTestimonialRole)
      formData.append('content', newTestimonialContent)
      formData.append('image', newTestimonialImage)
      await API.post('/admin/testimonials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMsg('Testimonial created')
      setNewTestimonialName('')
      setNewTestimonialRole('')
      setNewTestimonialContent('')
      setNewTestimonialImage(null)
      loadTestimonials()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const deleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return
    try {
      await API.delete(`/admin/testimonials/${id}`)
      setMsg('Testimonial deleted')
      loadTestimonials()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Testimonials</h2>

      {/* Create Form */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-3">Add New Testimonial</h3>
        <div className="space-y-3">
          <input 
            type="text"
            placeholder="Name"
            value={newTestimonialName}
            onChange={(e) => setNewTestimonialName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input 
            type="text"
            placeholder="Role/Title"
            value={newTestimonialRole}
            onChange={(e) => setNewTestimonialRole(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea 
            placeholder="Testimonial content"
            value={newTestimonialContent}
            onChange={(e) => setNewTestimonialContent(e.target.value)}
            rows="3"
            className="w-full p-2 border rounded"
          />
          <div>
            <label className="block text-sm font-semibold mb-2">Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleTestimonialImageChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button onClick={createTestimonial} className="bg-green-600 text-white px-4 py-2 rounded w-full">Add Testimonial</button>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map(t => (
          <div key={t._id} className="border rounded p-4 bg-gray-50">
            {t.image && (
              <img src={getFullImageUrl(t.image)} alt={t.name} className="w-full h-32 object-cover rounded mb-3" />
            )}
            <h3 className="font-bold">{t.name}</h3>
            <p className="text-sm text-gray-600 font-semibold">{t.role}</p>
            <p className="text-sm mt-2">{t.content}</p>
            <button 
              onClick={() => deleteTestimonial(t._id)}
              className="bg-red-600 text-white px-3 py-1 rounded text-xs mt-3 w-full"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
