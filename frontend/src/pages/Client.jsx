import React, { useEffect, useState } from 'react'
import API, { setToken } from '../api'
// Notifications disabled

export default function Client(){
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('events')
  const [events, setEvents] = useState([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({})
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    const t = localStorage.getItem('ef_token')
    if(!t){
      window.location.href = '/login'
      return
    }
    setToken(t)
    API.get('/auth/me').then(r=>{
      if(r.data.role !== 'client'){
        window.location.href = '/'
        return
      }
      setUser(r.data)
      setProfileData(r.data.profile || {})
    }).catch(()=>window.location.href='/login')
  },[])

  const loadMyEvents = async () => {
    try{
      const res = await API.get('/client/events')
      setEvents(res.data)
    }catch(e){
      setMsg('Failed to load events')
    }
  }

  useEffect(()=>{
    if(activeTab === 'events') loadMyEvents()
  },[activeTab])

  const postEvent = async (e) => {
    e.preventDefault()
    if(!title) return setMsg('Title required')
    try{
      await API.post('/client/events', { title, description, date, location })
      setMsg('Event posted for admin approval')
      setTitle('')
      setDescription('')
      setDate('')
      setLocation('')
      loadMyEvents()
    }catch(err){
      setMsg('Error: ' + (err?.response?.data?.message || ''))
    }
  }

  const updateProfile = async () => {
    try{
      const res = await API.put('/client/profile', profileData)
      setMsg(res.data.message)
      setUser({...user, profileComplete: res.data.profileComplete})
      setEditingProfile(false)
    }catch(e){
      setMsg('Error updating profile')
    }
  }

  if(!user) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <nav className="bg-green-700 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Client Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-4">{user.email}</span>
          <button onClick={()=>{localStorage.clear(); window.location.href='/login'}} className="bg-red-600 px-3 py-1 rounded">Logout</button>
        </div>
      </nav> */}
      <div className="flex flex-row items-start gap-6  p-2">
      {/* Profile Image */}
      <div className="w-40 h-40 rounded-[8vh] bg-red-300 "></div>
      {/* Info */}
      <div>
        <div className="flex items-center pt-15 gap-2">
          <h3 className="text-2xl font-extrabold text-gray-800">{user.email}</h3>

          <button onClick={()=>{localStorage.clear(); window.location.href='/login'}} className="bg-red-600 px-3 py-1 rounded">Logout</button>
 

         <span
            className={`text-xs text-white px-2 py-1 rounded 
            ${
              user.profileComplete ? "bg-green-500" : "bg-red-600"
            }`}
          >
            {user.profileComplete ? "Completed" : "Incomplete"}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum, sequi.
        </p>
        <button onClick={()=>setEditingProfile(!editingProfile)} className="mt-2 bg-gray-800 text-xs text-white px-7 py-2 rounded hover:bg-gray-700 transition">
          Edit Profile
        </button>
      </div>
    </div>


      <div className="p-6">
        {msg && <div className="bg-green-100 p-3 rounded mb-4 text-green-700">{msg}</div>}

        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg">Profile Status: <span className={`font-bold ${user.profileComplete?'text-green-600':'text-red-600'}`}>{user.profileComplete?'Complete':'Incomplete'}</span></p>
              <p className="text-sm text-gray-600">Profile info is required to post events</p>
            </div>
            <button onClick={()=>setEditingProfile(!editingProfile)} className="bg-blue-600 text-white px-4 py-2 rounded">Edit Profile</button>
          </div>

          {editingProfile && (
            <div className="mt-4 pt-4 border-t">
              <input placeholder="Name" value={profileData.name || ''} onChange={e=>setProfileData({...profileData, name: e.target.value})} className="w-full p-2 border mb-2 rounded" />
              <input placeholder="Phone" value={profileData.phone || ''} onChange={e=>setProfileData({...profileData, phone: e.target.value})} className="w-full p-2 border mb-2 rounded" />
              <input placeholder="City" value={profileData.city || ''} onChange={e=>setProfileData({...profileData, city: e.target.value})} className="w-full p-2 border mb-4 rounded" />
              <div className="flex gap-2">
                <button onClick={updateProfile} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                <button onClick={()=>setEditingProfile(false)} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          )}
        </div>




              <div className="flex gap-4 mb-6">
                <button onClick={()=>setActiveTab('events')} className={`px-4 py-2 rounded ${activeTab==='events'?'bg-green-600 text-white':'bg-white'}`}>My Events</button>
                <button onClick={()=>setActiveTab('post')} className={`px-4 py-2 rounded ${activeTab==='post'?'bg-green-600 text-white':'bg-white'}`}>Post Event</button>
                <button onClick={()=>setActiveTab('feedback')} className={`px-4 py-2 rounded ${activeTab==='feedback'?'bg-green-600 text-white':'bg-white'}`}>Send Feedback</button>
              </div>

        {/* Post Event */}
        {activeTab === 'post' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Post New Event</h2>
            <form onSubmit={postEvent}>
              <input placeholder="Event Title" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border mb-2 rounded" required />
              <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 border mb-2 rounded" rows="4"></textarea>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 border mb-2 rounded" />
              <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} className="w-full p-2 border mb-4 rounded" />
              <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Submit Event</button>
            </form>
          </div>
        )}

        {/* My Events */}
        {activeTab === 'events' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">My Events</h2>
            {events.length === 0 ? (
              <p className="text-gray-600">No events posted yet</p>
            ) : (
              <div className="space-y-4">
                {events.map(e=>(
                  <div key={e._id} className="border p-4 rounded">
                    <h3 className="font-bold text-lg">{e.title}</h3>
                    <p className="text-sm text-gray-600">{e.description}</p>
                    <p className="text-sm">Date: {e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-sm">Location: {e.location}</p>
                    <p className="text-sm mt-2"><span className={`px-2 py-1 rounded text-xs font-bold ${e.status==='approved'?'bg-green-200':e.status==='denied'?'bg-red-200':'bg-yellow-200'}`}>{e.status}</span></p>
                    {e.assignedVendors && e.assignedVendors.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="font-semibold text-sm mb-2">Assigned Vendors:</p>
                        {e.assignedVendors.map(v=>(
                          <div key={v._id} className="text-sm bg-white p-2 mb-1 rounded">
                            <p className="font-semibold">{v.name || v.email}</p>
                            <p className="text-gray-600">{v.email}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        {activeTab === 'feedback' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Send Feedback / Testimonial</h2>
              <p className="text-sm text-gray-600 mb-3">Share your experience — your feedback may appear on the public landing page.</p>
                {feedbackMsg && <div className="mb-3 p-2 rounded bg-green-100 text-green-700">{feedbackMsg}</div>}
                  <textarea placeholder="Write your feedback here" value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} className="w-full p-2 border mb-2 rounded" rows={5} />
                    <div className="flex gap-2">
                      <button onClick={async ()=>{
                          if(!feedbackText) return setFeedbackMsg('Please enter feedback')
                              try{
                                const res = await API.post('/client/feedback', { message: feedbackText })
                                setFeedbackMsg(res.data.message || 'Thanks for your feedback')
                                setFeedbackText('')
                              }catch(err){
                                setFeedbackMsg('Error sending feedback')
                              }
                            }} className="bg-green-600 text-white px-4 py-2 rounded">Submit Feedback</button>
                      <button onClick={()=>{setFeedbackText(''); setFeedbackMsg('')}} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
          </div>
        )}              
      </div>
    </div>
  )
}
