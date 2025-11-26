import React, { useState } from 'react'
import API from '../../api'

export default function AdminCategories({ categories, setMsg, loadCategories }) {
  const [editCatId, setEditCatId] = useState(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatDesc, setEditCatDesc] = useState('')

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

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Categories</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id} className="border-t">
                <td className="p-2">
                  {editCatId === cat._id ? (
                    <input value={editCatName} onChange={e => setEditCatName(e.target.value)} className="p-1 border rounded" />
                  ) : (
                    cat.name
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
    </div>
  )
}
