import React, { useState } from 'react'
import API from '../../api'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function AdminTestimonials({ pendingTestimonials = [], approvedTestimonials = [], setMsg, loadTestimonials }) {
  const [localPending, setLocalPending] = useState(pendingTestimonials)
  const [localApproved, setLocalApproved] = useState(approvedTestimonials)

  // sync when props change
  React.useEffect(()=>{ setLocalPending(pendingTestimonials || []); setLocalApproved(approvedTestimonials || []) }, [pendingTestimonials, approvedTestimonials])

  const approve = async (id, display) => {
    try{
      await API.post(`/admin/testimonials/${id}/approve`, { displayOnLanding: !!display })
      setMsg('Testimonial approved')
      loadTestimonials()
    }catch(e){ setMsg('Error: ' + (e?.response?.data?.message || e?.message || '')) }
  }

  const reject = async (id) => {
    if(!window.confirm('Delete this testimonial?')) return
    try{
      await API.delete(`/admin/testimonials/${id}`)
      setMsg('Testimonial deleted')
      loadTestimonials()
    }catch(e){ setMsg('Error: ' + (e?.response?.data?.message || e?.message || '')) }
  }

  const toggleDisplay = async (id, value) => {
    try{
      await API.patch(`/admin/testimonials/${id}/display`, { displayOnLanding: !!value })
      setMsg('Display flag updated')
      loadTestimonials()
    }catch(e){ setMsg('Error: ' + (e?.response?.data?.message || e?.message || '')) }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Testimonials</h2>

      {/* Pending Testimonials */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Pending Feedback</h3>
        {localPending.length === 0 ? (
          <div className="text-sm text-gray-600">No pending testimonials.</div>
        ) : (
          <div className="grid gap-3">
            {localPending.map(t => (
              <div key={t._id} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {t.avatar && (
                      <img src={getFullImageUrl(t.avatar)} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-gray-600">{t.role}</div>
                      <div className="mt-2 text-sm">{t.message}</div>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end">
                    <label className="text-xs mb-2 flex items-center gap-2">
                      <input type="checkbox" onChange={(e)=>approve(t._id, e.target.checked)} />
                      <span>Approve & show on landing</span>
                    </label>
                    <button onClick={()=>reject(t._id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Testimonials */}
      <div>
        <h3 className="font-semibold mb-3">Approved Testimonials</h3>
        {localApproved.length === 0 ? (
          <div className="text-sm text-gray-600">No approved testimonials.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localApproved.map(t => (
              <div key={t._id} className="border rounded p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {t.avatar && (
                      <img src={getFullImageUrl(t.avatar)} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-gray-600">{t.role}</div>
                      <div className="mt-2 text-sm">{t.message}</div>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end">
                    <label className="text-xs mb-2 flex items-center gap-2">
                      <input type="checkbox" checked={!!t.displayOnLanding} onChange={(e)=>toggleDisplay(t._id, e.target.checked)} />
                      <span>Show on landing</span>
                    </label>
                    <button onClick={()=>reject(t._id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
