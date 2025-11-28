import React, { useEffect, useState } from 'react'
import API, { setToken } from '../api'
import ClientSettings from '../components/ClientSettings'
import { getFullImageUrl } from '../utils/getBaseUrl'
// Notifications disabled

export default function Client() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('events')
  const [events, setEvents] = useState([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({})
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [photos, setPhotos] = useState([])
  const [uploadFiles, setUploadFiles] = useState(null)
  // const [photos, setPhotos] = useState([]) // Keep photos for now, may be needed for old data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('ef_token')
    if (!t) {
      window.location.href = '/login'
      return
    }
    setToken(t)
    API.get('/auth/me').then(r => {
      if (r.data.role !== 'client') {
        window.location.href = '/'
        return
      }
      setUser(r.data)
      setProfileData(r.data.profile || {})
    }).catch(() => window.location.href = '/login')
  }, [])

  const loadMyEvents = async () => {
    try {
      const res = await API.get('/client/events')
      setEvents(res.data)
    } catch (e) {
      setMsg('Failed to load events')
    }
  }

  useEffect(() => {
    if (activeTab === 'events') loadMyEvents()
  }, [activeTab])

  const postEvent = async (e) => {
    e.preventDefault()
    if (!title) return setMsg('Title required')
    try {
      await API.post('/client/events', { title, description, date, location })
      setMsg('Event posted for admin approval')
      setTitle('')
      setDescription('')
      setDate('')
      setLocation('')
      loadMyEvents()
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || ''))
    }
  }

  const handleFileChange = (e) => {
    setProfileImageFile(e.target.files[0]);
    // also collect profile photos if multiple
    if (e.target.files && e.target.files.length > 0) {
      const arr = Array.from(e.target.files)
      setPhotos(arr)
    }
  };

  const handleUploadFilesChange = (e) => {
    setUploadFiles(e.target.files)
  }

  const uploadPhotosForEvent = async (eventId) => {
    if (!uploadFiles || uploadFiles.length === 0) return setMsg('Please select files to upload')
    try {
      const formData = new FormData();
      for (let i = 0; i < uploadFiles.length; i++) formData.append('photos', uploadFiles[i]);
      const res = await API.post(`/client/events/${eventId}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg(res.data.message || 'Uploaded')
      setUploadFiles(null)
      loadMyEvents()
    } catch (e) { setMsg('Error: ' + (e?.response?.data?.message || e.message)) }
  }

  const updateProfile = async () => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key]);
      });
      for (let i = 0; i < photos.length; i++) {
        formData.append("photos", photos[i]);
      }

      const res = await API.patch('/client/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMsg(res.data.message)
      setUser(res.data.user)
      setEditingProfile(false)
    } catch (e) {
      setMsg('Error updating profile')
    }
  }

  const deleteAccount = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return
    try {
      await API.delete('/client/profile')
      localStorage.clear()
      window.location.href = '/'
    } catch (e) { setMsg('Error: ' + (e?.response?.data?.message || e.message)) }
  }

  if (!user) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-700 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Client Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-4">{user.email}</span>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="bg-red-600 px-3 py-1 rounded">Logout</button>
        </div>
      </nav>
      {/* Profile Header Section */}
      <div className="w-full bg-white shadow rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6">

        {/* Profile Image */}
        <div className="relative">
          <img
            src={
              user.profileImage
                ? getFullImageUrl(user.profileImage)
                : "https://via.placeholder.com/150?text=No+Image"
            }
            alt="profile"
            className="w-40 h-40 rounded-2xl object-cover shadow-md"
          />

          {/* Profile Status Badge */}
          <span
            className={`absolute bottom-2 right-2 text-xs px-3 py-1 rounded-full shadow-md ${user.profileComplete ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
          >
            {user.profileComplete ? "Profile Complete" : "Incomplete"}
          </span>
        </div>

        {/* User Info + Buttons */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between w-full">

            {/* Name + Email */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                {user.name || "Client User"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition"
              >
                Edit Profile
              </button>

              <button
                onClick={deleteAccount}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Short Bio */}
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            Welcome to your personal dashboard. Manage events, update your profile, and track
            your service activity efficiently.
          </p>
        </div>
      </div>

      <div className="p-6">
        {msg && <div className="bg-green-100 p-3 rounded mb-4 text-green-700">{msg}</div>}

        {/* tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: "events", label: "My Events" },
            { id: "post", label: "Post Event" },
            { id: "feedback", label: "Feedback" },
            { id: "settings", label: "Settings" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all 
      ${activeTab === tab.id
                  ? "bg-green-600 text-white shadow-md scale-105"
                  : "bg-white hover:bg-gray-100 text-gray-700 border"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Post Event */}
        {activeTab === "post" && (
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Event</h2>

            <form onSubmit={postEvent} className="space-y-5">
              <input
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Event Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />

              <textarea
                className="w-full border rounded-lg p-3 h-28 resize-none focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Event Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  className="border rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
                <input
                  className="border rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              <button className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition">
                Submit Event
              </button>
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
                {events.map(e => (
                  <div key={e._id} className="border p-4 rounded">
                    <h3 className="font-bold text-lg">{e.title}</h3>
                    <p className="text-sm text-gray-600">{e.description}</p>
                    <p className="text-sm">Date: {e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-sm">Location: {e.location}</p>
                    <p className="text-sm mt-2"><span className={`px-2 py-1 rounded text-xs font-bold ${e.status === 'approved' ? 'bg-green-200' : e.status === 'denied' ? 'bg-red-200' : 'bg-yellow-200'}`}>{e.status}</span></p>
                    {(e.quotations && e.quotations.length > 0) ? (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="font-semibold text-sm mb-2">Assigned Vendors:</p>
                        {e.quotations.map(q => (
                          <div key={q._id} className="text-sm bg-white p-2 mb-1 rounded flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {q.vendor?.profileImage && (
                                <img src={`${import.meta.env.VITE_API_URL}${q.vendor.profileImage}`} alt={q.vendor?.name} className="w-10 h-10 rounded-full object-cover" />
                              )}
                              <div>
                                <p className="font-semibold">{q.vendor?.name }</p>
                                <p className="text-gray-600">{}</p>
                              </div>
                            </div>
                            
                          </div>
                        ))}
                      </div>
                    ) : (
                      e.assignedVendors && e.assignedVendors.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded">
                          <p className="font-semibold text-sm mb-2">Assigned Vendors:</p>
                          {e.assignedVendors.map(v => (
                            <div key={v._id} className="text-sm bg-white p-2 mb-1 rounded flex items-center gap-3">
                              {v.profileImage && (
                                <img src={`${import.meta.env.VITE_API_URL}${v.profileImage}`} alt={v.name} className="w-10 h-10 rounded-full object-cover" />
                              )}
                              <div>
                                <p className="font-semibold">{v.name || v.email}</p>
                                <p className="text-gray-600">{v.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    <div className="mt-3">
                      <p className="font-semibold text-sm mb-2">Upload event photos (these will be pending admin approval)</p>
                      <input type="file" multiple onChange={handleUploadFilesChange} className="mb-2" />
                      <div className="flex gap-2">
                        <button onClick={() => uploadPhotosForEvent(e._id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Upload Photos</button>
                        <button onClick={() => setUploadFiles(null)} className="bg-gray-600 text-white px-3 py-1 rounded text-sm">Clear</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Upload photos for client events (inside each event card) */}

        {/* Feedback */}
        {activeTab === "feedback" && (
          <div className="bg-white p-8 rounded-2xl max-w-xl mx-auto shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Share Your Experience</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your feedback may appear on our public testimonials page.
            </p>

            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Write your feedback..."
              rows={5}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={async () => {
                  if (!feedbackText) return setFeedbackMsg("Please write something");
                  const res = await API.post("/client/feedback", { message: feedbackText });
                  setFeedbackMsg(res.data.message);
                  setFeedbackText("");
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Submit
              </button>

              <button
                onClick={() => { setFeedbackText(""); setFeedbackMsg(""); }}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>

            {feedbackMsg && (
              <p className="mt-4 text-green-700 text-sm bg-green-100 px-3 py-2 rounded">
                {feedbackMsg}
              </p>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <ClientSettings setMsg={setMsg} onProfileUpdate={(u) => setUser(u)} />
        )}
      </div>
    </div>
  )
}
