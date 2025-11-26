import React, { useState, useEffect } from 'react'
import API from '../../api'

export default function AdminPayments({ events, setMsg }) {
  const [eventPayments, setEventPayments] = useState([])
  const [clientPaymentStatus, setClientPaymentStatus] = useState({})
  const [loading, setLoading] = useState(true)

  // Load events with vendor payment details
  useEffect(() => {
    loadEventPayments()
  }, [])

  const loadEventPayments = async () => {
    try {
      setLoading(true)
      const res = await API.get('/admin/events')
      const eventsWithPayments = res.data.map(event => {
        // Get all vendor interests (quotations) for this event
        const vendorQuotations = event.vendorInterests || []
        
        // Check if all assigned vendors are paid
        const assignedVendors = event.assignedVendors || []
        const allVendorsPaid = assignedVendors.length > 0 && vendorQuotations.every(q => q.paid)
        
        return {
          ...event,
          vendorQuotations,
          allVendorsPaid,
          clientPaid: clientPaymentStatus[event._id] || false
        }
      })
      setEventPayments(eventsWithPayments)
    } catch (e) {
      setMsg('Failed to load event payments: ' + (e?.response?.data?.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const markVendorAsPaid = async (quotationId) => {
    try {
      await API.put(`/admin/quotations/${quotationId}/mark-paid`)
      setMsg('Vendor marked as paid')
      loadEventPayments()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const markVendorAsUnpaid = async (quotationId) => {
    try {
      await API.put(`/admin/quotations/${quotationId}/mark-unpaid`)
      setMsg('Vendor marked as unpaid')
      loadEventPayments()
    } catch (e) {
      setMsg('Error: ' + (e?.response?.data?.message || ''))
    }
  }

  const toggleClientPayment = async (eventId) => {
    try {
      const newStatus = !clientPaymentStatus[eventId]
      setClientPaymentStatus(prev => ({ ...prev, [eventId]: newStatus }))
      
      // In a real implementation, you'd save this to backend
      // For now, just show in UI
      setMsg(newStatus ? 'Client marked as paid' : 'Client marked as unpaid')
    } catch (e) {
      setMsg('Error updating client payment status')
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4 font-bold">Payment Management</h2>
      <p className="text-sm text-gray-600 mb-6">Track vendor payments for each event and client payment status</p>

      {eventPayments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No events found</div>
      ) : (
        <div className="space-y-6">
          {eventPayments.map(event => (
            <div key={event._id} className="border-2 rounded-lg p-5 hover:shadow-lg transition bg-gradient-to-r from-blue-50 to-purple-50">
              {/* Event Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
                <div>
                  <h3 className="font-bold text-lg text-blue-700">{event.title}</h3>
                  <p className="text-sm text-gray-600">Posted by: <span className="font-semibold">{event.postedBy?.name || event.postedBy?.email}</span></p>
                  <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-700">Event Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      event.status === 'approved' ? 'bg-green-200 text-green-800' :
                      event.status === 'denied' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <button 
                    onClick={() => toggleClientPayment(event._id)}
                    className={`px-4 py-2 rounded font-semibold text-white transition ${
                      clientPaymentStatus[event._id]
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    {clientPaymentStatus[event._id] ? '✓ Client Paid' : 'Mark Client Paid'}
                  </button>
                  <p className="text-xs text-center mt-1 text-gray-600">Status: {clientPaymentStatus[event._id] ? 'PAID' : 'PENDING'}</p>
                </div>
              </div>

              {/* Vendors Section */}
              <div>
                <h4 className="font-semibold text-md mb-3 text-gray-800">
                  Assigned Vendors ({event.vendorQuotations.length})
                  {event.allVendorsPaid && (
                    <span className="ml-2 px-3 py-1 rounded-full text-xs bg-green-300 text-green-900 font-bold">
                      ALL PAID ✓
                    </span>
                  )}
                </h4>

                {event.vendorQuotations.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No vendors assigned</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-300">
                        <tr>
                          <th className="p-2 text-left">Vendor Name</th>
                          <th className="p-2 text-left">Status</th>
                          <th className="p-2 text-left">Payment</th>
                          <th className="p-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.vendorQuotations.map(quotation => (
                          <tr key={quotation._id} className={`border-t ${quotation.paid ? 'bg-green-50' : 'bg-yellow-50'}`}>
                            <td className="p-2 font-semibold">{quotation.vendor?.name || quotation.vendor?.email}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                quotation.vendorStatus === 'completed' ? 'bg-blue-200 text-blue-800' :
                                quotation.vendorStatus === 'accepted' ? 'bg-green-200 text-green-800' :
                                quotation.vendorStatus === 'assigned' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {quotation.vendorStatus}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className={`px-3 py-1 rounded text-xs font-bold ${
                                quotation.paid
                                  ? 'bg-green-300 text-green-900'
                                  : 'bg-red-300 text-red-900'
                              }`}>
                                {quotation.paid ? '✓ PAID' : 'UNPAID'}
                              </span>
                            </td>
                            <td className="p-2 text-center space-x-1">
                              {quotation.paid ? (
                                <button 
                                  onClick={() => markVendorAsUnpaid(quotation._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                >
                                  Mark Unpaid
                                </button>
                              ) : (
                                <button 
                                  onClick={() => markVendorAsPaid(quotation._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
