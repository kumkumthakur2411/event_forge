import React, { useEffect, useState } from 'react'
import API, { setToken } from '../api'

export default function Admin(){
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [searchQ, setSearchQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    const t = localStorage.getItem('ef_token')
    if(!t){
      window.location.href = '/login'
      return
    }
    setToken(t)
    API.get('/auth/me').then(r=>{
      if(r.data.role !== 'admin'){
        window.location.href = '/'
        return
      }
      setUser(r.data)
    }).catch(()=>window.location.href='/login')
  },[])

  const loadUsers = async () => {
    try{
      const res = await API.get('/admin/users', { params: { q: searchQ, role: roleFilter } })
      setUsers(res.data)
    }catch(e){
      setMsg('Failed to load users: ' + (e?.response?.data?.message || ''))
    }
  }

  const loadEvents = async () => {
    try{
      const res = await API.get('/admin/events')
      setEvents(res.data)
    }catch(e){
      setMsg('Failed to load events: ' + (e?.response?.data?.message || ''))
    }
  }

  useEffect(()=>{
    if(activeTab === 'users') loadUsers()
    if(activeTab === 'events') loadEvents()
  },[activeTab, searchQ, roleFilter])

  const approveUser = async (id, action) => {
    try{
      await API.put(`/admin/users/${id}`, { action })
      setMsg(`User ${action}d`)
      loadUsers()
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const approveEvent = async (id, action) => {
    try{
      await API.put(`/admin/events/${id}`, { action })
      setMsg(`Event ${action}d`)
      loadEvents()
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const approveQuotation = async (quotId, action) => {
    try{
      await API.put(`/admin/quotations/${quotId}`, { action })
      setMsg(`Quotation ${action}d`)
      loadEvents()
      setSelectedEvent(null)
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  if(!user) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Event Forge Admin</h1>
        <div>
          <span className="mr-4">{user.email}</span>
          <button onClick={()=>{localStorage.clear(); window.location.href='/login'}} className="bg-red-600 px-3 py-1 rounded">Logout</button>
        </div>
      </nav>

      <div className="p-6">
        {msg && <div className="bg-blue-100 p-3 rounded mb-4 text-blue-700">{msg}</div>}

        <div className="flex gap-4 mb-6">
          <button onClick={()=>setActiveTab('users')} className={`px-4 py-2 rounded ${activeTab==='users'?'bg-blue-600 text-white':'bg-white'}`}>Manage Users</button>
          <button onClick={()=>setActiveTab('events')} className={`px-4 py-2 rounded ${activeTab==='events'?'bg-blue-600 text-white':'bg-white'}`}>Manage Events</button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Users</h2>
            <div className="flex gap-2 mb-4">
              <input placeholder="Search" value={searchQ} onChange={e=>setSearchQ(e.target.value)} className="flex-1 p-2 border rounded" />
              <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="p-2 border rounded">
                <option value="">All roles</option>
                <option value="client">Client</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u._id} className="border-t">
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role}</td>
                      <td className="p-2"><span className={`px-2 py-1 rounded text-xs font-bold ${u.status==='approved'?'bg-green-200':'bg-yellow-200'}`}>{u.status}</span></td>
                      <td className="p-2 text-center">
                        {u.status === 'pending' && (
                          <>
                            <button onClick={()=>approveUser(u._id,'approve')} className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-1">Approve</button>
                            <button onClick={()=>approveUser(u._id,'deny')} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Deny</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Events</h2>
            <div className="grid gap-4">
              {events.map(e=>(
                <div key={e._id} className="border p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{e.title}</h3>
                      <p className="text-sm text-gray-600">{e.description}</p>
                      <p className="text-sm">Posted by: <span className="font-semibold">{e.postedBy?.email}</span></p>
                      <p className="text-sm">Date: {e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-sm">Location: {e.location}</p>
                      <p className="text-sm mt-2"><span className={`px-2 py-1 rounded text-xs font-bold ${e.status==='approved'?'bg-green-200':e.status==='denied'?'bg-red-200':'bg-yellow-200'}`}>{e.status}</span></p>
                    </div>
                    <div className="ml-4">
                      {e.status === 'pending' && (
                        <>
                          <button onClick={()=>approveEvent(e._id,'approve')} className="block w-full bg-green-600 text-white px-3 py-1 rounded text-sm mb-2">Approve</button>
                          <button onClick={()=>approveEvent(e._id,'deny')} className="block w-full bg-red-600 text-white px-3 py-1 rounded text-sm">Deny</button>
                        </>
                      )}
                      <button onClick={()=>setSelectedEvent(e._id)} className="block w-full bg-blue-600 text-white px-3 py-1 rounded text-sm mt-2">View Details</button>
                    </div>
                  </div>

                  {selectedEvent === e._id && e.vendorInterests && e.vendorInterests.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded border-l-4 border-blue-600">
                      <h4 className="font-bold mb-2">Vendor Interests ({e.vendorInterests.length})</h4>
                      {e.vendorInterests.map(q=>(
                        <div key={q._id} className="bg-white p-2 mb-2 rounded flex justify-between items-center">
                          <div className="text-sm">
                            <p className="font-semibold">{q.vendor?.name || q.vendor?.email}</p>
                            <p className="text-gray-600">{q.message}</p>
                            <p className="text-xs mt-1">
                              <span className={`px-2 py-0.5 rounded ${q.status==='pending'?'bg-yellow-200':'bg-green-200'}`}>{q.status}</span>
                              <span className="ml-2 px-2 py-0.5 rounded bg-gray-200 text-xs">{q.vendorStatus || 'vendor: none'}</span>
                            </p>
                          </div>
                          {q.status === 'pending' && (
                            <div>
                              <button onClick={()=>approveQuotation(q._id,'approve')} className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-1">Approve</button>
                              <button onClick={()=>approveQuotation(q._id,'deny')} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Deny</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
