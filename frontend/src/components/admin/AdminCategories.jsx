import React, { useState } from 'react'
import API from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminCategories({ categories, setMsg, loadCategories }) {
  const [editCatId, setEditCatId] = useState(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatDesc, setEditCatDesc] = useState('')
  const [editCatLongDesc, setEditCatLongDesc] = useState('')
  const [editCatImages, setEditCatImages] = useState([])
  const [editNewFiles, setEditNewFiles] = useState([])

  // create
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newLongDesc, setNewLongDesc] = useState('')
  const [newFiles, setNewFiles] = useState([])

  // vendors modal
  const [vendorsList, setVendorsList] = useState([])
  const [showVendorsFor, setShowVendorsFor] = useState(null)

  const editCategory = (cat) => {
    setEditCatId(cat._id)
    setEditCatName(cat.name)
    setEditCatDesc(cat.description || '')
    setEditCatLongDesc(cat.longDescription || '')
    setEditCatImages(cat.images || [])
    setEditNewFiles([])
  }

  const saveCategory = async (id) => {
    if (!editCatName) return setMsg('Name required')
    try {
      const form = new FormData()
      form.append('name', editCatName)
      form.append('description', editCatDesc)
      form.append('longDescription', editCatLongDesc)
      
      // If there is a new file selected, add it to form
      if (editNewFiles.length > 0) {
        form.append('image', editNewFiles[0])
      }
      
      // Use PATCH with multipart/form-data
      await API.patch(`/admin/categories/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      
      setMsg('Category updated')
      setEditCatId(null)
      setEditCatImages([])
      setEditNewFiles([])
      loadCategories()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e?.message || ''))
      console.error(e)
    }
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await API.delete(`/admin/categories/${id}`)
      setMsg('Category deleted')
      loadCategories()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const handleNewFiles = (e) => {
    setNewFiles([e.target.files?.[0]].filter(Boolean))
  }

  const createCategory = async () => {
    if (!newName) return setMsg('Name required')
    try {
      const form = new FormData()
      form.append('name', newName)
      form.append('description', newDesc)
      form.append('longDescription', newLongDesc)
      if (newFiles.length > 0) {
        form.append('image', newFiles[0])
      }
      const res = await API.post('/admin/categories', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg('Category created')
      setNewName('')
      setNewDesc('')
      setNewLongDesc('')
      setNewFiles([])
      loadCategories()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e?.message || ''))
      console.error(e)
    }
  }

  const viewVendors = async (cat) => {
    try {
      const res = await API.get('/admin/users', { params: { category: cat._id, role: 'vendor' } })
      setVendorsList(res.data)
      setShowVendorsFor(cat)
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const closeVendors = () => { setVendorsList([]); setShowVendorsFor(null) }

  const deleteImageFromEdit = async (catId, imageUrl) => {
    if (!window.confirm('Delete this image?')) return
    try {
      await API.delete(`/admin/categories/${catId}/images`, { data: { imageUrl } })
      setEditCatImages(editCatImages.filter(img => img.url !== imageUrl))
      setMsg('Image deleted')
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const handleEditNewFiles = (e) => {
    setEditNewFiles(Array.from(e.target.files || []))
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Categories</h2>

      {/* Create new category */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-3">Create New Category</h3>
        <div className="space-y-3">
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded" />
          <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Description (short)" className="w-full p-2 border rounded" rows="2" />
          <textarea value={newLongDesc} onChange={e=>setNewLongDesc(e.target.value)} placeholder="Long Description" className="w-full p-2 border rounded" rows="3" />
          <input type="file" accept="image/*" onChange={handleNewFiles} className="w-full p-2 border rounded" />
        </div>
        <div className="mt-3">
          <button onClick={createCategory} className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Preview</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-center">Long Description</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id} className="border-t">
                <td className="p-2 w-24">
                  {cat.images && cat.images.length > 0 ? (
                    <img src={getFullImageUrl(cat.images[0].url || cat.imageUrl)} alt={cat.altText || cat.name} className="w-20 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-12 bg-gray-100 flex items-center justify-center text-xs text-gray-500 rounded">No Image</div>
                  )}
                </td>
                <td className="p-2">
                  <button onClick={() => viewVendors(cat)} className="text-left text-blue-600 underline">{cat.name}</button>
                </td>
                <td className="p-2">
                  {cat.description}
                </td>
                <td className="p-2">
                  {cat.longDescription}
                </td>
                <td className="p-2 text-center">
                  <button 
                    onClick={() => editCategory(cat)}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteCategory(cat._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendors modal */}
      {showVendorsFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Vendors for {showVendorsFor.name}</h3>
              <button onClick={closeVendors} className="text-gray-600">✕</button>
            </div>
            {vendorsList.length === 0 ? (
              <p className="text-gray-500">No vendors registered for this category.</p>
            ) : (
              <div className="space-y-3">
                {vendorsList.map(v => (
                  <div key={v._id} className="flex items-center gap-3 border rounded p-2">
                    <img src={getFullImageUrl(v.profileImage)} alt={v.name} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <div className="font-semibold">{v.name || v.email}</div>
                      <div className="text-xs text-gray-600">{v.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Category with Images Modal */}
      {editCatId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Category</h3>
              <button onClick={() => setEditCatId(null)} className="text-gray-600 text-2xl">✕</button>
            </div>

            {/* Category Info */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Category Name</label>
              <input 
                value={editCatName} 
                onChange={e => setEditCatName(e.target.value)} 
                className="w-full p-2 border rounded"
                placeholder="Category name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea 
                value={editCatDesc} 
                onChange={e => setEditCatDesc(e.target.value)} 
                className="w-full p-2 border rounded"
                placeholder="Category description"
                rows="3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Long Description</label>
              <textarea 
                value={editCatLongDesc} 
                onChange={e => setEditCatLongDesc(e.target.value)} 
                className="w-full p-2 border rounded"
                placeholder="Category long description"
                rows="4"
              />
            </div>

            {/* Current Images */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Current Images</label>
              {editCatImages && editCatImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {editCatImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={getFullImageUrl(img.url)} 
                        alt={img.altText || 'category'} 
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => deleteImageFromEdit(editCatId, img.url)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        title="Delete image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-3">No images yet</p>
              )}
            </div>

            {/* Add New Images */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Change Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleEditNewFiles}
                className="w-full p-2 border rounded"
              />
              {editNewFiles.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">1 file selected - will replace current image</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setEditCatId(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={() => saveCategory(editCatId)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
