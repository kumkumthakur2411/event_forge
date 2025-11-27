import React, { useState } from 'react'
import API from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminCategories({ categories, setMsg, loadCategories }) {
  const [editCatId, setEditCatId] = useState(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatDesc, setEditCatDesc] = useState('')

  // create
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newFiles, setNewFiles] = useState([])

  // upload images modal
  const [uploadCat, setUploadCat] = useState(null)
  const [uploadFiles, setUploadFiles] = useState([])

  // vendors modal
  const [vendorsList, setVendorsList] = useState([])
  const [showVendorsFor, setShowVendorsFor] = useState(null)

  const editCategory = (cat) => {
    setEditCatId(cat._id)
    setEditCatName(cat.name)
    setEditCatDesc(cat.description || '')
  }

  const saveCategory = async (id) => {
    if (!editCatName) return setMsg('Name required')
    try {
      await API.put(`/admin/categories/${id}`, { name: editCatName, description: editCatDesc })
      setMsg('Category updated')
      setEditCatId(null)
      loadCategories()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
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
    setNewFiles(Array.from(e.target.files || []))
  }

  const createCategory = async () => {
    if (!newName) return setMsg('Name required')
    try {
      const form = new FormData()
      form.append('name', newName)
      form.append('description', newDesc)
      uploadFiles.forEach((f,i)=>{})
      newFiles.forEach(f=> form.append('images', f))
      const res = await API.post('/admin/categories', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg('Category created')
      setNewName('')
      setNewDesc('')
      setNewFiles([])
      loadCategories()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const openUploadModal = (cat) => {
    setUploadCat(cat)
    setUploadFiles([])
  }
  const handleUploadFiles = (e) => setUploadFiles(Array.from(e.target.files || []))
  const uploadCategoryImages = async () => {
    if (!uploadCat || uploadFiles.length === 0) return setMsg('Select files')
    try {
      const form = new FormData()
      uploadFiles.forEach(f=> form.append('images', f))
      const res = await API.post(`/admin/categories/${uploadCat._id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg('Images uploaded')
      setUploadCat(null)
      loadCategories()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
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

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Categories</h2>

      {/* Create new category */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-3">Create New Category</h3>
        <div className="grid md:grid-cols-3 gap-2">
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="p-2 border rounded" />
          <input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Description" className="p-2 border rounded" />
          <input type="file" multiple accept="image/*" onChange={handleNewFiles} className="p-2" />
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
                  {editCatId === cat._id ? (
                    <input value={editCatName} onChange={e => setEditCatName(e.target.value)} className="p-1 border rounded" />
                  ) : (
                    <button onClick={() => viewVendors(cat)} className="text-left text-blue-600 underline">{cat.name}</button>
                  )}
                </td>
                <td className="p-2">
                  {editCatId === cat._id ? (
                    <input value={editCatDesc} onChange={e => setEditCatDesc(e.target.value)} className="p-1 border rounded w-full" />
                  ) : (
                    cat.description
                  )}
                </td>
                <td className="p-2 text-center">
                  {editCatId === cat._id ? (
                    <>
                      <button 
                        onClick={() => saveCategory(cat._id)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-1"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditCatId(null)}
                        className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => editCategory(cat)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => openUploadModal(cat)}
                        className="bg-indigo-600 text-white px-2 py-1 rounded text-xs mr-1"
                      >
                        Upload Images
                      </button>
                      <button 
                        onClick={() => deleteCategory(cat._id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload modal */}
      {uploadCat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Upload Images for {uploadCat.name}</h3>
              <button onClick={() => setUploadCat(null)} className="text-gray-600">✕</button>
            </div>
            <input type="file" multiple accept="image/*" onChange={handleUploadFiles} />
            <div className="mt-3 flex gap-2">
              <button onClick={uploadCategoryImages} className="bg-blue-600 text-white px-3 py-1 rounded">Upload</button>
              <button onClick={() => setUploadCat(null)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

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

    </div>
  )
}
