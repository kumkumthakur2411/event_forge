import React, { useState } from 'react'
import API from '../../api'

export default function AdminUsers({ users, categories, setMsg, loadUsers, searchQ, setSearchQ, roleFilter, setRoleFilter, catFilter, setCatFilter }) {
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUserDetails, setSelectedUserDetails] = useState(null)
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')

  const openUserDetails = async (id) => {
    try {
      const res = await API.get(`/admin/users/${id}`)
      setSelectedUserId(id)
      setSelectedUserDetails(res.data)
    } catch (e) {
      setMsg('Failed to load user details: ' + (e?.response?.data?.message || e.message))
    }
  }

  const closeUserDetails = () => {
    setSelectedUserId(null)
    setSelectedUserDetails(null)
  }

  const approveUser = async (id, action) => {
    try {
      await API.put(`/admin/users/${id}`, { action })
      setMsg(`User ${action}d`)
      loadUsers()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user account? This cannot be undone.')) return
    try {
      await API.delete(`/admin/users/${id}`)
      setMsg('User deleted')
      loadUsers()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || e.message))
    }
  }

  const createCategory = async () => {
    if (!newCatName) return setMsg('Name required')
    try {
      await API.post('/admin/categories', { name: newCatName, description: newCatDesc })
      setMsg('Category created')
      setNewCatName('')
      setNewCatDesc('')
      const res = await API.get('/categories')
      // Note: parent needs to update categories state
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Users</h2>
      <div className="flex gap-2 mb-4">
        <div className="flex gap-2">
          <button onClick={() => setRoleFilter('')} className={`px-3 py-1 rounded ${roleFilter === '' ? 'bg-blue-600 text-white' : 'bg-white'}`}>All</button>
          <button onClick={() => setRoleFilter('vendor')} className={`px-3 py-1 rounded ${roleFilter === 'vendor' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Vendors</button>
          <button onClick={() => setRoleFilter('client')} className={`px-3 py-1 rounded ${roleFilter === 'client' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Clients</button>
        </div>
        <input placeholder="Search" value={searchQ} onChange={e => setSearchQ(e.target.value)} className="flex-1 p-2 border rounded" />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All roles</option>
          <option value="client">Client</option>
          <option value="vendor">Vendor</option>
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Create Category</h4>
        <div className="flex gap-2">
          <input placeholder="Name" className="p-2 border rounded flex-1" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
          <input placeholder="Description" className="p-2 border rounded flex-1" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} />
          <button onClick={createCategory} className="bg-green-600 text-white px-3 py-1 rounded">Create</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Categories</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t">
                <td className="p-2">
                  <button onClick={() => openUserDetails(u._id)} className="text-blue-600 underline">{u.email}</button>
                </td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{(u.categories || []).map(c => c.name).join(', ')}</td>
                <td className="p-2"><span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'approved' ? 'bg-green-200' : 'bg-yellow-200'}`}>{u.status}</span></td>
                <td className="p-2 text-center">
                  {u.status === 'pending' && (
                    <>
                      <button onClick={() => approveUser(u._id, 'approve')} className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-1">Approve</button>
                      <button onClick={() => approveUser(u._id, 'deny')} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Deny</button>
                    </>
                  )}
                  <div className="mt-1">
                    <button onClick={() => deleteUser(u._id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs mt-1">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUserDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded border-l-4 border-blue-600">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">User Details</h3>
              <p className="text-sm text-gray-600">Name: {selectedUserDetails.name || '(n/a)'}</p>
              <p className="text-sm text-gray-600">Email: {selectedUserDetails.email}</p>
              <p className="text-sm text-gray-600">Role: {selectedUserDetails.role}</p>
              <p className="text-sm text-gray-600">Status: <span className={`px-2 py-0.5 rounded text-xs ${selectedUserDetails.status === 'approved' ? 'bg-green-200' : 'bg-yellow-200'}`}>{selectedUserDetails.status}</span></p>
              <p className="text-sm text-gray-600">Categories: {(selectedUserDetails.categories || []).map(c => c.name).join(', ')}</p>
              <div className="mt-2">
                <h4 className="font-semibold">Profile</h4>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(selectedUserDetails.profile || {}, null, 2)}</pre>
              </div>
            </div>
            <div className="ml-4">
              <button onClick={closeUserDetails} className="bg-gray-600 text-white px-3 py-1 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
