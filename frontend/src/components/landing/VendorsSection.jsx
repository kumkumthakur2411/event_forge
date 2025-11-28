import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function VendorsSection({ vendors }) {
  const navigate = useNavigate()

  return (
    <section id="vendors" className="py-16 bg-[#161616]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl text-white font-bold mb-6">Vendors</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {vendors.map(v => (
            <div
              key={v._id}
              className="p-4 bg-[#1D1D1D] text-white rounded shadow cursor-pointer hover:bg-[#242424] transition"
              onClick={() => navigate(`/vendor/profile/${v._id}`)}
            >
              <div className="font-semibold">{v.name || v.email}</div>
              <div className="text-sm text-gray-400">
                {v.profile?.company || ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
