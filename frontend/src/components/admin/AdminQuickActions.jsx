import React, { useState, useEffect } from 'react'
import API from '../../api'

export default function AdminQuickActions({ setMsg, setActiveTab , stats, loadStats}) {
  const [pendingEvents, setPendingEvents] = useState([])
  const [unapprovedUsers, setUnapprovedUsers] = useState([])
  const [pendingTestimonials, setPendingTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('events')

  useEffect(() => {
    loadQuickActions()
  }, [])

  const loadQuickActions = async () => {
    setLoading(true)
    try {
      // Load pending events
      const eventsRes = await API.get('/admin/events')
      const pending = eventsRes.data.filter(e => e.status === 'pending')
      setPendingEvents(pending.slice(0, 5)) // Show latest 5

      // Load unapproved users
      const usersRes = await API.get('/admin/users')
      const unapproved = usersRes.data.filter(u => u.status !== 'approved')
      setUnapprovedUsers(unapproved.slice(0, 5)) // Show latest 5

      // Load pending testimonials
      const testimonialsRes = await API.get('/admin/testimonials/pending')
      setPendingTestimonials(testimonialsRes.data.slice(0, 5)) // Show latest 5

      setMsg('')
    } catch (e) {
      setMsg('Failed to load quick actions: ' + (e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const approveEvent = async (eventId) => {
    try {
      await API.put(`/admin/events/${eventId}`, { status: 'approved' })
      setMsg('Event approved!')
      loadQuickActions()
    } catch (e) {
      setMsg('Error approving event: ' + (e?.response?.data?.message || ''))
    }
  }

  const rejectEvent = async (eventId) => {
    try {
      await API.put(`/admin/events/${eventId}`, { status: 'denied' })
      setMsg('Event denied!')
      loadQuickActions()
    } catch (e) {
      setMsg('Error rejecting event: ' + (e?.response?.data?.message || ''))
    }
  }

  const approveUser = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}`, { status: 'approved' })
      setMsg('User approved!')
      loadQuickActions()
    } catch (e) {
      setMsg('Error approving user: ' + (e?.response?.data?.message || ''))
    }
  }

  const rejectUser = async (userId) => {
    try {
      await API.delete(`/admin/users/${userId}`)
      setMsg('User rejected!')
      loadQuickActions()
    } catch (e) {
      setMsg('Error rejecting user: ' + (e?.response?.data?.message || ''))
    }
  }

  const approveTestimonial = async (testimonialId) => {
    try {
      await API.post(`/admin/testimonials/${testimonialId}/approve`, { displayOnLanding: false })
      setMsg('Testimonial approved!')
      loadQuickActions()
    } catch (e) {
      setMsg('Error approving testimonial: ' + (e?.response?.data?.message || ''))
    }
  }

  const rejectTestimonial = async (testimonialId) => {
    try {
      await API.delete(`/admin/testimonials/${testimonialId}`)
      setMsg('Testimonial rejected!')
      loadQuickActions()
    } catch (e) {
      setMsg('Error rejecting testimonial: ' + (e?.response?.data?.message || ''))
    }
  }

  const handleViewAll = (type) => {
    setActiveTab(type)
  }

  if (loading) {
    return <div className="text-center py-8">Loading quick actions...</div>
  }

  const totalPending = pendingEvents.length + unapprovedUsers.length + pendingTestimonials.length

  return (
    <>
    {/* Quick Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow text-center hover:shadow-lg transition">
            <div className="text-sm text-gray-600">Vendors</div>
            <div className="text-2xl font-bold text-blue-600">{stats.vendorsCount}</div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center hover:shadow-lg transition">
            <div className="text-sm text-gray-600">Clients</div>
            <div className="text-2xl font-bold text-green-600">{stats.clientsCount}</div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center hover:shadow-lg transition">
            <div className="text-sm text-gray-600">Completed Events</div>
            <div className="text-2xl font-bold text-purple-600">{stats.completedEvents}</div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center hover:shadow-lg transition">
            <div className="text-sm text-gray-600">Pending Events</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingEvents}</div>
          </div>
    </div>
    {/* Quick actions */}
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">⚡ Quick Actions</h2>
        <button
          onClick={loadQuickActions}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          🔄 Refresh
        </button>
      </div>

      {totalPending === 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-700 font-semibold">✓ All caught up! No pending items.</p>
        </div>
      )}

      {totalPending > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <p className="text-yellow-700 font-semibold">
            ⚠️ You have {totalPending} pending item{totalPending !== 1 ? 's' : ''} to review
          </p>
        </div>
      )}

      {/* Quick action tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveSection('events')}
          className={`px-4 py-2 font-medium transition ${
            activeSection === 'events'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📅 Events ({pendingEvents.length})
        </button>
        <button
          onClick={() => setActiveSection('users')}
          className={`px-4 py-2 font-medium transition ${
            activeSection === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          👥 Users ({unapprovedUsers.length})
        </button>
        <button
          onClick={() => setActiveSection('testimonials')}
          className={`px-4 py-2 font-medium transition ${
            activeSection === 'testimonials'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ⭐ Feedback ({pendingTestimonials.length})
        </button>
      </div>

      {/* Pending Events Section */}
      {activeSection === 'events' && (
        <div className="space-y-4">
          {pendingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending events</p>
          ) : (
            <>
              {pendingEvents.map(event => (
                <div key={event._id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>📅 {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</span>
                        <span>📍 {event.location}</span>
                        <span>👤 {event.postedBy?.email || 'Unknown'}</span>
                      </div>
                    </div>
                    <span className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
                      {event.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveEvent(event._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => rejectEvent(event._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      ✕ Reject
                    </button>
                    <button
                      onClick={() => handleViewAll('events')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              ))}
              {pendingEvents.length > 0 && (
                <button
                  onClick={() => handleViewAll('events')}
                  className="w-full mt-4 p-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition"
                >
                  View all {pendingEvents.length} events →
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Unapproved Users Section */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          {unapprovedUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No unapproved users</p>
          ) : (
            <>
              {unapprovedUsers.map(user => (
                <div key={user._id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{user.name || user.email}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>📧 {user.email}</span>
                        <span className="capitalize">👤 {user.role}</span>
                      </div>
                      {user.profile && (
                        <div className="mt-2 text-sm text-gray-500">
                          {user.profile.phone && <span>📱 {user.profile.phone}</span>}
                          {user.profile.city && <span className="ml-2">📍 {user.profile.city}</span>}
                        </div>
                      )}
                    </div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      user.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      user.status === 'rejected' ? 'bg-red-200 text-red-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveUser(user._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => rejectUser(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      ✕ Reject
                    </button>
                    <button
                      onClick={() => handleViewAll('users')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              ))}
              {unapprovedUsers.length > 0 && (
                <button
                  onClick={() => handleViewAll('users')}
                  className="w-full mt-4 p-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition"
                >
                  View all {unapprovedUsers.length} users →
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Pending Testimonials Section */}
      {activeSection === 'testimonials' && (
        <div className="space-y-4">
          {pendingTestimonials.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending feedback</p>
          ) : (
            <>
              {pendingTestimonials.map(testimonial => (
                <div key={testimonial._id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600 italic">"{testimonial.message}"</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Role: <span className="capitalize">{testimonial.role}</span> • 
                        Submitted: {new Date(testimonial.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveTestimonial(testimonial._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => rejectTestimonial(testimonial._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      ✕ Reject
                    </button>
                    <button
                      onClick={() => handleViewAll('testimonials')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              ))}
              {pendingTestimonials.length > 0 && (
                <button
                  onClick={() => handleViewAll('testimonials')}
                  className="w-full mt-4 p-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition"
                >
                  View all {pendingTestimonials.length} testimonials →
                </button>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
    </>
  )
}
