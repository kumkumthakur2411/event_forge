import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API, { setToken } from '../api'
import Categories from './Categories'
// Notifications component disabled

export default function Admin(){
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [searchQ, setSearchQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [catFilter, setCatFilter] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  // const [msg, setMsg] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [testimonials, setTestimonials] = useState([])
  const [images, setImages] = useState([])
//created
  const [sections, setSections] = useState([
    "hero",
    "navbar-logo",
    "why-us",
    "box1",
    "box2",
    "how-it-works",
    "footer"
  ]);
//already
  const [newImageSection, setNewImageSection] = useState('hero')
  
  
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')
  const [msg, setMsg] = useState('')

//already
  const [customSectionName, setCustomSectionName] = useState('')
  const [showCustomSectionInput, setShowCustomSectionInput] = useState(false)

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
  const navigate = useNavigate()

  const loadUsers = async () => {
    try{
      const res = await API.get('/admin/users', { params: { q: searchQ, role: roleFilter, category: catFilter } })
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
  },[activeTab, searchQ, roleFilter, catFilter])

  const loadTestimonials = async () => {
    try{
      const res = await API.get('/admin/testimonials/pending')
      setTestimonials(res.data)
    }catch(e){
      setMsg('Failed to load testimonials: ' + (e?.response?.data?.message || ''))
    }
  }

  const loadImages = async () => {
    try{
      const res = await API.get('/admin/images')
      setImages(res.data)
    }catch(e){
      setMsg('Failed to load images: ' + (e?.response?.data?.message || ''))
    }
  }

  const approveTestimonial = async (id) => {
    try{
      await API.post(`/admin/testimonials/${id}/approve`)
      setMsg('Testimonial approved')
      loadTestimonials()
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const rejectTestimonial = async (id) => {
    try{
      await API.delete(`/admin/testimonials/${id}`)
      setMsg('Testimonial rejected')
      loadTestimonials()
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const uploadImage = async () => {
    if(!newImageUrl) return setMsg('Image URL required')
    try{
      await API.post('/admin/images', { 
        section: newImageSection, 
        imageUrl: newImageUrl, 
        altText: newImageAlt })
      setMsg('Image uploaded')
      setNewImageUrl('')
      setNewImageAlt('')
      loadImages()
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const deleteImage = async (id) => {
    if(!window.confirm('Delete this image?')) return
    try{
      await API.delete(`/admin/images/${id}`)
      setMsg('Image deleted')
      loadImages()
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const addCustomSection = () => {
  const name = customSectionName.trim();
  if (!name) return;

  if (!sections.includes(name)) {
    setSections(prev => [...prev, name]); // Add permanently
  }

  setNewImageSection(name);
  setCustomSectionName("");
  setShowCustomSectionInput(false);
  };

  useEffect(()=>{
    if(activeTab === 'testimonials') loadTestimonials()
    if(activeTab === 'images') loadImages()
  },[activeTab])

  useEffect(()=>{
    // load categories for filters and creation
    API.get('/categories').then(r=>setCategories(r.data)).catch(()=>{})
  },[])

  const createCategory = async () => {
    if(!newCatName) return setMsg('Name required')
    try{
      await API.post('/admin/categories', { name: newCatName, description: newCatDesc })
      setMsg('Category created')
      setNewCatName('')
      setNewCatDesc('')
      const res = await API.get('/categories')
      setCategories(res.data)
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

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

  const openEventDetails = (ev) => {
    setSelectedEvent(ev._id)
    setEditTitle(ev.title || '')
    setEditDescription(ev.description || '')
    setEditDate(ev.date ? ev.date.split('T')[0] : '')
    setEditLocation(ev.location || '')
  }

  const updateEventDetails = async (id) => {
    try{
      await API.patch(`/admin/events/${id}`, { title: editTitle, description: editDescription, date: editDate, location: editLocation })
      setMsg('Event updated')
      setSelectedEvent(null)
      loadEvents()
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const applyPending = async (id) => {
    if(!window.confirm('Apply pending edits to this event? This will make changes live.')) return;
    try{
      await API.post(`/admin/events/${id}/apply`)
      setMsg('Pending edits applied')
      loadEvents()
      setSelectedEvent(null)
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const discardPending = async (id) => {
    if(!window.confirm('Discard pending edits? This cannot be undone.')) return;
    try{
      await API.post(`/admin/events/${id}/discard`)
      setMsg('Pending edits discarded')
      loadEvents()
      setSelectedEvent(null)
    }catch(e){
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }
useEffect(() => {
  localStorage.setItem("sections", JSON.stringify(sections));
}, [sections]);


useEffect(() => {
  const saved = localStorage.getItem("sections");
  if (saved) setSections(JSON.parse(saved));
}, []);


  if(!user) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Event Forge Admin</h1>
        <div className="flex items-center">
          <span className="mr-4">{user.email}</span>
          <button onClick={()=>{localStorage.clear(); window.location.href='/login'}} className="bg-red-600 px-3 py-1 rounded">Logout</button>
        </div>
      </nav>

      <div className="p-6">
        {msg && <div className="bg-blue-100 p-3 rounded mb-4 text-blue-700">{msg}</div>}

        <div className="flex gap-4 mb-6">
          <button onClick={()=>setActiveTab('users')} className={`px-4 py-2 rounded ${activeTab==='users'?'bg-blue-600 text-white':'bg-white'}`}>Manage Users</button>
          <button onClick={()=>setActiveTab('events')} className={`px-4 py-2 rounded ${activeTab==='events'?'bg-blue-600 text-white':'bg-white'}`}>Manage Events</button>
          <button onClick={()=>setActiveTab('categories')} className={`px-4 py-2 rounded ${activeTab==='categories'?'bg-blue-600 text-white':'bg-white'}`}>Categories</button>
          <button onClick={()=>setActiveTab('testimonials')} className={`px-4 py-2 rounded ${activeTab==='testimonials'?'bg-blue-600 text-white':'bg-white'}`}>Testimonials</button>
          <button onClick={()=>setActiveTab('images')} className={`px-4 py-2 rounded ${activeTab==='images'?'bg-blue-600 text-white':'bg-white'}`}>Images</button>
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
              <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="p-2 border rounded">
                <option value="">All categories</option>
                {categories.map(c=> <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Create Category </h4>
              <div className="flex gap-2">
                <input placeholder="Name" className="p-2 border rounded flex-1" value={newCatName} onChange={e=>setNewCatName(e.target.value)} />
                <input placeholder="Description" className="p-2 border rounded flex-1" value={newCatDesc} onChange={e=>setNewCatDesc(e.target.value)} />
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
                  {users.map(u=>(
                    <tr key={u._id} className="border-t">
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role}</td>
                      <td className="p-2">{(u.categories||[]).map(c=>c.name).join(', ')}</td>
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

        {/* categories */}
        {activeTab === 'categories'  && (
          <div className="bg-white p-6 rounded shadow">
          <Categories/>
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
                      <button onClick={()=>openEventDetails(e)} className="block w-full bg-blue-600 text-white px-3 py-1 rounded text-sm mt-2">View Details</button>
                    </div>
                  </div>

                  {selectedEvent === e._id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded border-l-4 border-blue-600">
                      <h4 className="font-bold mb-2">Edit Event</h4>
                      <div className="grid gap-2 mb-4">
                        <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="p-2 border rounded" />
                        <textarea value={editDescription} onChange={e=>setEditDescription(e.target.value)} className="p-2 border rounded" rows="3"></textarea>
                        <input type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} className="p-2 border rounded" />
                        <input value={editLocation} onChange={e=>setEditLocation(e.target.value)} className="p-2 border rounded" />
                        <div className="flex gap-2">
                          <button onClick={()=>updateEventDetails(e._id)} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                          <button onClick={()=>setSelectedEvent(null)} className="bg-gray-600 text-white px-3 py-1 rounded">Cancel</button>
                        </div>
                      </div>

                        {e.pendingEdits && (
                          <div className="mt-4 p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
                            <h4 className="font-bold mb-2">Pending Edits</h4>
                            <p className="text-sm"><strong>Title:</strong> {e.pendingEdits.title || '(no change)'}</p>
                            <p className="text-sm"><strong>Description:</strong> {e.pendingEdits.description || '(no change)'}</p>
                            <p className="text-sm"><strong>Date:</strong> {e.pendingEdits.date ? new Date(e.pendingEdits.date).toLocaleDateString() : '(no change)'}</p>
                            <p className="text-sm"><strong>Location:</strong> {e.pendingEdits.location || '(no change)'}</p>
                            <div className="flex gap-2 mt-3">
                              <button onClick={()=>applyPending(e._id)} className="bg-blue-600 text-white px-3 py-1 rounded">Apply Pending Edits</button>
                              <button onClick={()=>discardPending(e._id)} className="bg-gray-600 text-white px-3 py-1 rounded">Discard Pending Edits</button>
                            </div>
                          </div>
                        )}

                      {e.vendorInterests && e.vendorInterests.length > 0 && (
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
              )}
            </div>))}
          </div>
      </div>)}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Pending Testimonials</h2>
            {testimonials.length === 0 ? (
              <p className="text-gray-600">No pending testimonials</p>
            ) : (
              <div className="space-y-4">
                {testimonials.map(t => (
                  <div key={t._id} className="border p-3 rounded">
                    <p className="font-semibold">{t.name} <span className="text-sm text-gray-500">({t.role})</span></p>
                    <p className="text-sm text-gray-700 my-2">{t.message}</p>
                    <div className="flex gap-2">
                      <button onClick={()=>approveTestimonial(t._id)} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                      <button onClick={()=>rejectTestimonial(t._id)} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Website Images</h2>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Upload / Update Image</h4>
              <div className="grid sm:grid-cols-3 gap-2">
                <div className="relative">
            <select
            value={newImageSection}
            onChange={(e) => {
              if (e.target.value === "new-section") {
                setShowCustomSectionInput(true);
              } else {
                setNewImageSection(e.target.value);
                setShowCustomSectionInput(false);
              }
            }} className="p-2 border rounded w-full">
                    
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
            <option value="new-section">+ Create New Section</option>
          </select>
                </div>
                        {/* Custom Section Input */}
          {showCustomSectionInput && (
            <input
              placeholder="Enter new section name"
              value={customSectionName}
              onChange={(e) => setCustomSectionName(e.target.value)}
              className="p-2 border rounded"
              onBlur={addCustomSection}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustomSection();
              }}
            />
          )}
          
                <input 
                placeholder="Image URL" 
                value={newImageUrl} 
                onChange={e=>setNewImageUrl(e.target.value)}
                 className="p-2 border rounded" />
                <input 
                placeholder="Alt text"
                 value={newImageAlt} 
                 onChange={e=>setNewImageAlt(e.target.value)} 
                 className="p-2 border rounded" />
              </div>
              <div className="mt-2">
                <button onClick={uploadImage} 
                className="bg-green-600 text-white px-3 py-1 rounded">Upload / Update</button>
              </div>
              {msg && <p className="mt-2 text-blue-600">{msg}</p>}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Existing Images</h4>
              {images.length === 0 ? <p className="text-gray-600">No images uploaded yet</p> : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {images.map(img => (
                    <div key={img._id} className="border p-3 rounded flex items-center justify-between ">
                      <div className=''>
                        <p className="font-semibold">{img.section}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs ">{img.imageUrl}</p>
                        <div className="flex gap-2">
                        <button onClick={()=>deleteImage(img._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                      </div>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
