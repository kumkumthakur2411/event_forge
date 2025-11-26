import React, { useState } from 'react'
import API from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminEvents({ events, setMsg, loadEvents }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [showVendorList, setShowVendorList] = useState(false)

  const openEventDetails = (e) => {
    setSelectedEvent(e)
    setEditTitle(e.title || '')
    setEditDescription(e.description || '')
    setEditDate(e.date ? new Date(e.date).toISOString().split('T')[0] : '')
    setEditLocation(e.location || '')
    setShowVendorList(false)
  }

  const closeEventDetails = () => {
    setSelectedEvent(null)
    setShowVendorList(false)
  }

  const approveEvent = async (id) => {
    try {
      await API.put(`/admin/events/${id}`, { action: 'approve' })
      setMsg('Event approved - now visible to vendors')
      loadEvents()
      closeEventDetails()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const denyEvent = async (id) => {
    try {
      await API.put(`/admin/events/${id}`, { action: 'deny' })
      setMsg('Event denied - not shown to vendors')
      loadEvents()
      closeEventDetails()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const updateEventDetails = async () => {
    if (!editTitle || !editDescription || !editDate || !editLocation) {
      return setMsg('All fields required')
    }
    try {
      await API.patch(`/admin/events/${selectedEvent._id}`, {
        title: editTitle,
        description: editDescription,
        date: editDate,
        location: editLocation
      })
      setMsg('Event updated')
      loadEvents()
      closeEventDetails()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const assignVendor = async (quotationId) => {
    try {
      await API.put(`/admin/quotations/${quotationId}`, { action: 'approve' })
      setMsg('Vendor assigned to event')
      loadEvents()
      openEventDetails(selectedEvent) // Refresh vendor list
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const denyVendor = async (quotationId) => {
    try {
      await API.put(`/admin/quotations/${quotationId}`, { action: 'deny' })
      setMsg('Vendor denied for this event')
      loadEvents()
      openEventDetails(selectedEvent) // Refresh vendor list
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return
    try {
      await API.delete(`/admin/events/${id}`)
      setMsg('Event deleted')
      loadEvents()
      closeEventDetails()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  // Separate events by status
  const pendingEvents = events.filter(e => e.status === 'pending')
  const approvedEvents = events.filter(e => e.status === 'approved')
  const deniedEvents = events.filter(e => e.status === 'denied')

  const EventCard = ({ event, isPending }) => (
    <div className={`border-2 rounded-lg p-4 mb-3 cursor-pointer transition hover:shadow-lg ${
      event.status === 'pending' ? 'bg-yellow-50 border-yellow-400' :
      event.status === 'approved' ? 'bg-green-50 border-green-400' :
      'bg-red-50 border-red-400'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-bold text-lg">{event.title}</h4>
          <p className="text-sm text-gray-600">By: {event.postedBy?.name || event.postedBy?.email}</p>
          <p className="text-sm text-gray-600">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
          <p className="text-sm mt-1 text-gray-700 line-clamp-2">{event.description}</p>
        </div>
        <div className="ml-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            event.status === 'pending' ? 'bg-yellow-300 text-yellow-900' :
            event.status === 'approved' ? 'bg-green-300 text-green-900' :
            'bg-red-300 text-red-900'
          }`}>
            {event.status.toUpperCase()}
          </span>
          <p className="text-xs mt-2 text-gray-500">
            {event.vendorInterests?.length || 0} vendors interested
          </p>
        </div>
      </div>
      <button
        onClick={() => openEventDetails(event)}
        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
      >
        View Details
      </button>
    </div>
  )

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Event Management</h2>
      
      {/* Pending Events Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-yellow-700">
          ⏳ Pending Approval ({pendingEvents.length})
        </h3>
        {pendingEvents.length === 0 ? (
          <p className="text-gray-500 italic">No pending events</p>
        ) : (
          <div>
            {pendingEvents.map(event => (
              <EventCard key={event._id} event={event} isPending={true} />
            ))}
          </div>
        )}
      </div>

      {/* Approved Events Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-green-700">
          ✓ Approved Events ({approvedEvents.length})
        </h3>
        {approvedEvents.length === 0 ? (
          <p className="text-gray-500 italic">No approved events</p>
        ) : (
          <div>
            {approvedEvents.map(event => (
              <EventCard key={event._id} event={event} isPending={false} />
            ))}
          </div>
        )}
      </div>

      {/* Denied Events Section */}
      {deniedEvents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-red-700">
            ✗ Denied Events ({deniedEvents.length})
          </h3>
          <div>
            {deniedEvents.map(event => (
              <EventCard key={event._id} event={event} isPending={false} />
            ))}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
              <button
                onClick={closeEventDetails}
                className="text-gray-600 hover:text-black text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Status Section */}
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h3 className="font-bold mb-3">Event Status</h3>
                <p className="mb-3">
                  Current Status: <span className={`font-bold px-3 py-1 rounded ${
                    selectedEvent.status === 'pending' ? 'bg-yellow-300' :
                    selectedEvent.status === 'approved' ? 'bg-green-300' :
                    'bg-red-300'
                  }`}>{selectedEvent.status.toUpperCase()}</span>
                </p>
                {selectedEvent.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveEvent(selectedEvent._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      ✓ Approve Event
                    </button>
                    <button
                      onClick={() => denyEvent(selectedEvent._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      ✗ Deny Event
                    </button>
                  </div>
                )}
              </div>

              {/* Event Details Editor */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h3 className="font-bold mb-3">Event Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Date</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Location</label>
                      <input
                        type="text"
                        value={editLocation}
                        onChange={e => setEditLocation(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={updateEventDetails}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Update Details
                  </button>
                  <button
                    onClick={() => deleteEvent(selectedEvent._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Delete Event
                  </button>
                </div>
              </div>

              {/* Client Info Section */}
              <div className="bg-purple-50 p-4 rounded border border-purple-200">
                <h3 className="font-bold mb-2">Client Information</h3>
                <p className="text-sm"><strong>Name:</strong> {selectedEvent.postedBy?.name || 'N/A'}</p>
                <p className="text-sm"><strong>Email:</strong> {selectedEvent.postedBy?.email || 'N/A'}</p>
              </div>

              {/* Vendor Interests Section */}
              <div className="bg-orange-50 p-4 rounded border border-orange-200">
                <button
                  onClick={() => setShowVendorList(!showVendorList)}
                  className="w-full flex justify-between items-center font-bold text-lg hover:opacity-75"
                >
                  <span>📋 Vendors Interested ({selectedEvent.vendorInterests?.length || 0})</span>
                  <span>{showVendorList ? '▼' : '▶'}</span>
                </button>

                {showVendorList && (
                  <div className="mt-4">
                    {!selectedEvent.vendorInterests || selectedEvent.vendorInterests.length === 0 ? (
                      <p className="text-gray-500 italic">No vendors interested yet</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedEvent.vendorInterests.map(quotation => (
                          <div key={quotation._id} className="bg-white p-3 rounded border-l-4 border-blue-600">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold">{quotation.vendor?.name || quotation.vendor?.email}</p>
                                <p className="text-sm text-gray-600">{quotation.message || 'No message provided'}</p>
                                <p className="text-xs mt-1">
                                  Status: <span className={`font-bold px-2 py-0.5 rounded ${
                                    quotation.vendorStatus === 'accepted' ? 'bg-green-200' :
                                    quotation.vendorStatus === 'completed' ? 'bg-blue-200' :
                                    'bg-gray-200'
                                  }`}>{quotation.vendorStatus}</span>
                                </p>
                              </div>
                              <div className="flex gap-2 ml-2">
                                {quotation.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => assignVendor(quotation._id)}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                    >
                                      Assign
                                    </button>
                                    <button
                                      onClick={() => denyVendor(quotation._id)}
                                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                    >
                                      Deny
                                    </button>
                                  </>
                                )}
                                {quotation.status === 'approved' && (
                                  <span className="px-3 py-1 rounded text-sm bg-green-300 text-green-900 font-bold">
                                    ✓ ASSIGNED
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
