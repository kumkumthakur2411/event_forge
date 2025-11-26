import React, { useEffect, useState } from 'react'
import API, { setToken } from '../api'
// Notifications disabled

export default function Vendor(){
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('events')
  const [events, setEvents] = useState([])
  const [assignedEvents, setAssignedEvents] = useState([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({})
  const [photos, setPhotos] = useState([])
  const [message, setMessage] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [msg, setMsg] = useState('')
  const [uploadFiles, setUploadFiles] = useState(null)
  const [uploadEventTarget, setUploadEventTarget] = useState(null)

  useEffect(()=>{
    const t = localStorage.getItem('ef_token')
    if(!t){
      window.location.href = '/login'
      return
    }
    setToken(t)
    API.get('/auth/me').then(r=>{
      if(r.data.role !== 'vendor'){
        window.location.href = '/'
        return
      }
      setUser(r.data)
      setProfileData(r.data.profile || {})
    }).catch(()=>window.location.href='/login')
  },[])

  const loadAvailableEvents = async () => {
    try{
      const res = await API.get('/vendor/events')
      setEvents(res.data)
    }catch(e){
      setMsg('Failed to load events')
    }
  }

  const loadAssignedEvents = async () => {
    try{
      const res = await API.get('/vendor/assigned')
      setAssignedEvents(res.data)
    }catch(e){
      setMsg('Failed to load assigned events')
    }
  }
  // active tab change effect
  useEffect(()=>{
    if(activeTab === 'events') loadAvailableEvents()
    if(activeTab === 'assigned') loadAssignedEvents()
  },[activeTab])

  const sendInterest = async (eventId) => {
    if(!message) return setMsg('Please write a message')
    try{
      await API.post('/vendor/interest', { eventId, message })
      setMsg('Interest sent to admin for approval')
      setSelectedEvent(null)
      setMessage('')
      loadAvailableEvents()
    }catch(err){
      setMsg('Error: ' + (err?.response?.data?.message || ''))
    }
  }

  const revokeInterest = async (eventId) => {
    try{
      await API.delete(`/vendor/interest/${eventId}`)
      setMsg('Interest revoked')
      loadAvailableEvents()
    }catch(err){
      setMsg('Error: ' + (err?.response?.data?.message || ''))
    }
  }

  const updateAssignment = async (action, eventId) => {
    try{
      await API.post(`/vendor/assigned/${eventId}/action`, { action })
      setMsg('Status updated')
      loadAssignedEvents()
    }catch(err){
      setMsg('Error: ' + (err?.response?.data?.message || ''))
    }
  }

  const handleFileChange = (e) => {
    setPhotos(e.target.files);
  };

  const handleUploadFilesChange = (e) => {
    setUploadFiles(e.target.files)
  }

  const uploadPhotosForEvent = async (eventId) => {
    if(!uploadFiles || uploadFiles.length === 0) return setMsg('Please select files to upload')
    try{
      const formData = new FormData();
      for(let i=0;i<uploadFiles.length;i++) formData.append('photos', uploadFiles[i]);
      const res = await API.post(`/vendor/events/${eventId}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg(res.data.message || 'Uploaded')
      setUploadFiles(null)
      setUploadEventTarget(null)
      loadAssignedEvents()
    }catch(e){ setMsg('Error: ' + (e?.response?.data?.message || e.message)) }
  }

  const updateProfile = async () => {
    try{
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key]);
      });
      for (let i = 0; i < photos.length; i++) {
        formData.append("photos", photos[i]);
      }

      const res = await API.patch('/vendor/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMsg(res.data.message)
      setUser(res.data.user)
      setEditingProfile(false)
    }catch(e){
      setMsg('Error updating profile')
    }
  }

  const deleteAccount = async () => {
    if(!window.confirm('Delete your account? This cannot be undone.')) return
    try{
      await API.delete('/vendor/profile')
      localStorage.clear()
      window.location.href = '/'
    }catch(e){ setMsg('Error: ' + (e?.response?.data?.message || e.message)) }
  }

  if(!user) return <div className="p-4">Loading...</div>

  return (
    
    <div className="min-h-screen bg-gray-100">
    {/* dashboard */}
      <nav className="bg-purple-700 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Vendor Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-4">{user.email}</span>
          <button onClick={()=>{localStorage.clear(); window.location.href='/login'}} className="bg-red-600 px-3 py-1 rounded">Logout</button>
        </div>
      </nav>

      <div className="p-6">
        {msg && <div className="bg-purple-100 p-3 rounded mb-4 text-purple-700">{msg}</div>}

       {/* upper tab */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg">Profile Status: <span className={`font-bold ${user.profileComplete?'text-green-600':'text-red-600'}`}>{user.profileComplete?'Complete':'Incomplete'}</span></p>
              <p className="text-sm text-gray-600">Profile info is required to send bids</p>
            </div>
            <button onClick={()=>setEditingProfile(!editingProfile)} className="bg-blue-600 text-white px-4 py-2 rounded">Edit Profile</button>
          </div>

          {editingProfile && (
            <div className="mt-4 pt-4 border-t">
              <input placeholder="Name" value={profileData.name || ''} onChange={e=>setProfileData({...profileData, name: e.target.value})} className="w-full p-2 border mb-2 rounded" />
              <input placeholder="Phone" value={profileData.phone || ''} onChange={e=>setProfileData({...profileData, phone: e.target.value})} className="w-full p-2 border mb-2 rounded" />
              <input placeholder="Company Name" value={profileData.company || ''} onChange={e=>setProfileData({...profileData, company: e.target.value})} className="w-full p-2 border mb-4 rounded" />
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Profile Photos</label>
                <input type="file" multiple onChange={handleFileChange} className="w-full p-2 border rounded" />
              </div>
              
              <div className="flex gap-2">
                <button onClick={updateProfile} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                <button onClick={()=>setEditingProfile(false)} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
              </div>

              <div className="mt-4 flex gap-4 flex-wrap">
                {user.photos && user.photos.map(photo => (
                  <img key={photo} src={`${import.meta.env.VITE_API_URL}${photo}`} alt="profile" className="w-24 h-24 object-cover rounded" />
                ))}
              </div>
              <div className="mt-4">
              <button onClick={deleteAccount} className="bg-red-600 text-white px-4 py-2 rounded">Delete Account</button>
            </div>
            </div>
            
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={()=>setActiveTab('events')} className={`px-4 py-2 rounded ${activeTab==='events'?'bg-purple-600 text-white':'bg-white'}`}>Available Events</button>
          <button onClick={()=>setActiveTab('assigned')} className={`px-4 py-2 rounded ${activeTab==='assigned'?'bg-purple-600 text-white':'bg-white'}`}>
            Assigned Events
            <span className="ml-2 inline-block bg-red-600 text-white text-xs px-2 rounded-full">{assignedEvents.length}</span>
          </button>
        </div>

        {/* Available Events */}
        {activeTab === 'events' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Available Events</h2>
            {events.length === 0 ? (
              <p className="text-gray-600">No approved events available</p>
            ) : (
              <div className="space-y-4">
                {events.map(e=>(
                  <div key={e._id} className="border p-4 rounded">
                    <h3 className="font-bold text-lg">{e.title}</h3>
                    <p className="text-sm text-gray-600">{e.description}</p>
                    <p className="text-sm">Date: {e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-sm">Location: {e.location}</p>
                    <p className="text-sm">Posted by: <span className="font-semibold">{e.postedBy?.email}</span></p>

                    {selectedEvent === e._id ? (
                      <div className="mt-4 p-4 bg-blue-50 rounded">
                        <h4 className="font-bold mb-2">Send Your Interest</h4>
                        <textarea 
                          placeholder="Write your quotation/message" 
                          value={message} 
                          onChange={e=>setMessage(e.target.value)} 
                          className="w-full p-2 border mb-2 rounded" 
                          rows="3"
                        ></textarea>
                        <div className="flex gap-2">
                          <button onClick={()=>sendInterest(e._id)} className="bg-green-600 text-white px-4 py-2 rounded">Send Interest</button>
                          <button onClick={()=>{setSelectedEvent(null); setMessage('')}} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      (() => {
                        // check if this vendor already sent interest for this event
                        const myQuote = e.vendorInterests && e.vendorInterests.find(q => q.vendor && (String(q.vendor._id) === String(user._id)));
                        if (myQuote) {
                          return (
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-sm text-gray-700">Interest sent ({myQuote.status}{myQuote.vendorStatus?` / ${myQuote.vendorStatus}`:''})</span>
                              {myQuote.status === 'pending' && (
                                <button onClick={()=>revokeInterest(e._id)} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">Revoke Interest</button>
                              )}
                            </div>
                          )
                        }
                        return <button onClick={()=>setSelectedEvent(e._id)} className="mt-2 bg-purple-600 text-white px-4 py-2 rounded text-sm">Show Interest</button>
                      })()
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Assigned Events */}
        {activeTab === 'assigned' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Assigned Events</h2>
            {assignedEvents.length === 0 ? (
              <p className="text-gray-600">No assigned events yet</p>
            ) : (
              <div className="space-y-4">
                {assignedEvents.map(e=> {
                  const myQuote = e.vendorInterests && e.vendorInterests.find(q => q.vendor && (String(q.vendor._id) === String(user._id)));
                  return (
                    <div key={e._id} className="border p-4 rounded">
                      <h3 className="font-bold text-lg">{e.title}</h3>
                      <p className="text-sm text-gray-600">{e.description}</p>
                      <p className="text-sm">Date: {e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-sm">Location: {e.location}</p>
                      <p className="text-sm">Posted by: <span className="font-semibold">{e.postedBy?.email}</span></p>
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="font-semibold text-sm mb-2">Your Assignment</p>
                        {!myQuote ? (
                          <p className="text-sm text-gray-700">You are assigned to this event. (No quotation data found.)</p>
                        ) : (
                          <div>
                            <p className="text-sm">Quotation status: <span className="font-semibold">{myQuote.status}</span></p>
                            <p className="text-sm">Your status: <span className="font-semibold">{myQuote.vendorStatus || 'none'}</span></p>
                            <p className="text-sm">Payment: <span className={`px-2 py-0.5 rounded text-xs ${myQuote.paid ? 'bg-green-200' : 'bg-yellow-200'}`}>{myQuote.paid ? 'Paid' : 'Unpaid'}</span></p>
                            <div className="mt-2 flex gap-2">
                              {(myQuote.vendorStatus === 'assigned' || (myQuote.status === 'approved' && !myQuote.vendorStatus)) && (
                                <>
                                  <button onClick={()=>updateAssignment('accept', e._id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Accept</button>
                                  <button onClick={()=>updateAssignment('deny', e._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Deny</button>
                                </>
                              )}
                              {myQuote.vendorStatus === 'accepted' && (
                                <>
                                  <button onClick={()=>updateAssignment('complete', e._id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Mark Completed</button>
                                  <button onClick={()=>updateAssignment('deny', e._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Deny</button>
                                </>
                              )}
                              <div className="mt-3">
                                <p className="text-sm font-semibold">Upload photos for this event (will be pending approval)</p>
                                <input type="file" multiple onChange={(ev)=>{ setUploadEventTarget(e._id); handleUploadFilesChange(ev) }} className="mt-2 mb-2" />
                                <div className="flex gap-2">
                                  <button onClick={()=>uploadPhotosForEvent(e._id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Upload Photos</button>
                                  <button onClick={()=>{ setUploadFiles(null); setUploadEventTarget(null) }} className="bg-gray-600 text-white px-3 py-1 rounded text-sm">Clear</button>
                                </div>
                              </div>
                              {myQuote.vendorStatus === 'completed' && (
                                <span className="text-sm text-green-700 font-semibold">Completed</span>
                              )}
                              {myQuote.vendorStatus === 'denied' && (
                                <span className="text-sm text-red-700 font-semibold">You denied this assignment</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
