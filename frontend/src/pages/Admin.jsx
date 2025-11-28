import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API, { setToken } from '../api'
import AdminUsers from '../components/admin/AdminUsers'
import AdminEvents from '../components/admin/AdminEvents'
import AdminSettings from '../components/admin/AdminSettings'
import AdminWebImages from '../components/admin/AdminWebImages'
import AdminEventImages from '../components/admin/AdminEventImages'
import AdminTestimonials from '../components/admin/AdminTestimonials'
import AdminPayments from '../components/admin/AdminPayments'
import AdminCategories from '../components/admin/AdminCategories'
import AdminQuickActions from '../components/admin/AdminQuickActions'

export default function Admin(){
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [msg, setMsg] = useState('')
  
  // Shared state
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [pendingTestimonials, setPendingTestimonials] = useState([])
  const [approvedTestimonials, setApprovedTestimonials] = useState([])
  const [webImages, setWebImages] = useState([])
  const [eventImages, setEventImages] = useState([])
  const [quotations, setQuotations] = useState([])
  
  // Filters and search
  const [searchQ, setSearchQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  
  // Admin profile
  const [adminName, setAdminName] = useState('')
  const [adminProfileImage, setAdminProfileImage] = useState(null)
  const [adminProfileImageFile, setAdminProfileImageFile] = useState(null)
  
  // Stats
  const [stats, setStats] = useState({ vendorsCount:0, clientsCount:0, completedEvents:0, pendingEvents:0 })

  // Auth check
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
      setAdminName(r.data.name || '')
      setAdminProfileImage(r.data.profileImage || null)
    }).catch(()=>window.location.href='/login')
  },[])

  // Load users
  const loadUsers = async () => {
    try{
      const res = await API.get('/admin/users', { params: { q: searchQ, role: roleFilter, category: catFilter } })
      setUsers(res.data)
    }catch(e){
      setMsg('Failed to load users: ' + (e?.response?.data?.message || ''))
    }
  }

  // Load events
  const loadEvents = async () => {
    try{
      const res = await API.get('/admin/events')
      setEvents(res.data)
    }catch(e){
      setMsg('Failed to load events: ' + (e?.response?.data?.message || ''))
    }
  }

  // Load categories
  const loadCategories = async () => {
    try{
      const res = await API.get('/categories')
      setCategories(res.data)
    }catch(e){
      setMsg('Failed to load categories: ' + (e?.response?.data?.message || ''))
    }
  }

  // Load testimonials
  const loadTestimonials = async () => {
    try{
      // pending (requires admin auth)
      const pRes = await API.get('/admin/testimonials/pending')
      setPendingTestimonials(pRes.data || [])
      // approved (public)
      const aRes = await API.get('/public/testimonials?limit=1000')
      setApprovedTestimonials(aRes.data || [])
      // legacy single testimonials state
      setTestimonials(aRes.data || [])
    }catch(e){
      setMsg('Failed to load testimonials: ' + (e?.response?.data?.message || ''))
    }
  }

  // Load web images
  const loadWebImages = async () => {
    try{
      const res = await API.get('/admin/images')
      setWebImages(res.data)
    }catch(e){
      setMsg('Failed to load web images: ' + (e?.response?.data?.message || ''))
    }
  }

  // Load event images
  const loadEventImages = async () => {
    try{
      const res = await API.get('/admin/event-images')
      setEventImages(res.data.images || [])
    }catch(e){
      setMsg('Failed to load event images: ' + (e?.response?.data?.message || ''))
    }
  }

  // Load quotations
  const loadQuotations = async () => {
    try{
      const res = await API.get('/admin/quotations')
      setQuotations(res.data)
    }catch(e){
      setMsg('Failed to load quotations: ' + (e?.response?.data?.message || ''))
    }
  }

  // Load stats
  const loadStats = async () => {
    try{
      const res = await API.get('/admin/stats')
      setStats(res.data)
    }catch(e){ 
      console.warn('Failed to load stats') 
    }
  }

  // Load initial data
  useEffect(()=>{
    if(user){
      loadUsers()
      loadEvents()
      loadCategories()
      loadQuotations()
      loadStats()
    }
  },[user])

  // Load data when tab changes
  useEffect(() => {
    if(activeTab === 'testimonials') loadTestimonials()
    if(activeTab === 'images') loadWebImages()
    if(activeTab === 'event-images') loadEventImages()
  },[activeTab])

  // Refresh on filter/search change
  useEffect(()=>{ loadUsers() },[searchQ, roleFilter, catFilter])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  if(!user) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-blue-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Event Forge Admin</h1>
        <div className="flex items-center gap-4">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </nav>

      <div className="p-6">
        {msg && (
          <div className="bg-blue-100 border-l-4 border-blue-600 p-3 rounded mb-4 text-blue-700">
            {msg}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button 
            onClick={()=>setActiveTab('dashboard')} 
            className={`px-4 py-2 rounded transition ${activeTab==='dashboard'?'bg-blue-600 text-white':'bg-white hover:bg-gray-50'}`}  
          >
            Dashboard
          </button>
          <button 
            onClick={()=>setActiveTab('users')} 
            className={`px-4 py-2 rounded transition ${activeTab==='users'?'bg-blue-600 text-white':'bg-white hover:bg-gray-50'}`}
          >
            Manage Users
          </button>
          <button 
            onClick={()=>setActiveTab('events')} 
            className={`px-4 py-2 rounded transition ${activeTab==='events'?'bg-blue-600 text-white':'bg-white hover:bg-gray-50'}`}
          >
            Manage Events
          </button>
          <button 
            onClick={()=>setActiveTab('categories')} 
            className={`px-4 py-2 rounded transition ${activeTab==='categories'?'bg-blue-600 text-white':'bg-white hover:bg-gray-50'}`}
          >
            Categories
          </button>
          <button 
            onClick={()=>setActiveTab('testimonials')} 
            className={`px-4 py-2 rounded transition ${activeTab==='testimonials'?'bg-blue-600 text-white':'bg-white hover:bg-gray-50'}`}
          >
            Testimonials
          </button>
          <button 
            onClick={()=>setActiveTab('images')} 
            className={`px-4 py-2 rounded transition ${activeTab==='images'?'bg-blue-600 text-white':'bg-white hover:bg-gray-50'}`}
          >
            Web Images
          </button>
          <button 
            onClick={()=>setActiveTab('event-images')} 
            className={`px-4 py-2 rounded transition ${activeTab==='event-images'?'bg-blue-600 text-white':'bg-white hover:bg-gray-50'}`}
          >
            Event Gallery
          </button>
          <button 
            onClick={()=>setActiveTab('payments')} 
            className={`px-4 py-2 rounded transition ${activeTab==='payments'?'bg-blue-600 text-white':'bg-white hover:bg-gray-50'}`}
          >
            Payments
          </button>
          <button 
            onClick={()=>setActiveTab('settings')} 
            className={`px-4 py-2 rounded transition ${activeTab==='settings'?'bg-blue-600 text-white':'bg-white hover:bg-gray-50'}`}
          >
            Settings
          </button>
        </div>

        {/* Quick Actions Section */}
        {activeTab==='dashboard' && (
          <AdminQuickActions 
          setMsg={setMsg} 
          setActiveTab={setActiveTab} 
          stats={stats}
          loadStats={loadStats}
          />)}

        {/* Tab Content */}
        {activeTab === 'users' && (
          <AdminUsers 
            users={users} 
            categories={categories} 
            setMsg={setMsg}
            loadUsers={loadUsers}
            searchQ={searchQ}
            setSearchQ={setSearchQ}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            catFilter={catFilter}
            setCatFilter={setCatFilter}
          />
        )}

        {activeTab === 'events' && (
          <AdminEvents 
            events={events}
            setMsg={setMsg}
            loadEvents={loadEvents}
          />
        )}

        {activeTab === 'categories' && (
          <AdminCategories 
            categories={categories}
            setMsg={setMsg}
            loadCategories={loadCategories}
          />
        )}

        {activeTab === 'testimonials' && (
          <AdminTestimonials 
            pendingTestimonials={pendingTestimonials}
            approvedTestimonials={approvedTestimonials}
            setMsg={setMsg}
            loadTestimonials={loadTestimonials}
          />
        )}

        {activeTab === 'images' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Web Section Images</h2>
            <AdminWebImages 
              images={webImages}
              setMsg={setMsg}
              loadImages={loadWebImages}
            />
          </div>
        )}

        {activeTab === 'event-images' && (
          <AdminEventImages 
            images={eventImages}
            setMsg={setMsg}
            loadImages={loadEventImages}
          />
        )}

        {activeTab === 'payments' && (
          <AdminPayments 
            events={events}
            setMsg={setMsg}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettings 
            adminName={adminName}
            setAdminName={setAdminName}
            adminProfileImage={adminProfileImage}
            setAdminProfileImage={setAdminProfileImage}
            adminProfileImageFile={adminProfileImageFile}
            setAdminProfileImageFile={setAdminProfileImageFile}
            setMsg={setMsg}
          />
        )}
      </div>
    </div>
  )
}
