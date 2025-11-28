import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import API from '../api'
import { getFullImageUrl } from '../utils/getBaseUrl'

export default function VendorPublicProfile() {
  const { vendorId } = useParams()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true)
        const res = await API.get(`/public/vendors/${vendorId}`)
        setVendor(res.data)
      } catch (err) {
        setError(err?.response?.data?.message || 'Vendor not found')
      } finally {
        setLoading(false)
      }
    }

    if (vendorId) fetchVendor()
  }, [vendorId])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>
  if (!vendor) return <div className="min-h-screen flex items-center justify-center"><p>Vendor not found</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-200 overflow-hidden shadow-lg">
                {vendor.profileImage ? (
                  <img
                    src={getFullImageUrl(vendor.profileImage)}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-blue-500 text-white text-2xl font-bold">
                    {vendor.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{vendor.name || 'Vendor'}</h1>
                {vendor.ratings && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">⭐ {vendor.ratings.toFixed(1)}</span>}
              </div>

              {vendor.companyName && (
                <p className="text-lg text-indigo-600 font-semibold mb-4">{vendor.companyName}</p>
              )}

              <div className="space-y-2 mb-6">
                {vendor.city && <p className="text-gray-700"><strong>Location:</strong> {vendor.city}</p>}
                {vendor.email && <p className="text-gray-700"><strong>Email:</strong> {vendor.email}</p>}
                {vendor.phoneNo && <p className="text-gray-700"><strong>Phone:</strong> {vendor.phoneNo}</p>}
                {vendor.companyEmail && <p className="text-gray-700"><strong>Company Email:</strong> {vendor.companyEmail}</p>}
                {vendor.companyPhone && <p className="text-gray-700"><strong>Company Phone:</strong> {vendor.companyPhone}</p>}
              </div>

              {/* Categories/Services */}
              {vendor.categories && vendor.categories.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.categories.map((cat, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                        {typeof cat === 'string' ? cat : cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio & Experience */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {vendor.bio && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{vendor.bio}</p>
            </div>
          )}

          {vendor.experience && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Experience</h2>
              <p className="text-gray-700 whitespace-pre-line">{vendor.experience}</p>
            </div>
          )}
        </div>

        {/* GST/PAN Info */}
        {(vendor.gst || vendor.pan) && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Business Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.gst && <p><strong>GST Number:</strong> {vendor.gst}</p>}
              {vendor.pan && <p><strong>PAN Number:</strong> {vendor.pan}</p>}
            </div>
          </div>
        )}

        {/* Gallery Photos */}
        {vendor.vendorPhotos && vendor.vendorPhotos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Gallery ({vendor.vendorPhotos.length} Photos)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vendor.vendorPhotos.map((photo, idx) => (
                <div key={idx} className="overflow-hidden rounded-lg shadow hover:shadow-lg transition">
                  <img
                    src={getFullImageUrl(photo)}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-48 object-cover hover:scale-105 transition transform"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Links */}
        {vendor.media && vendor.media.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Media</h2>
            <div className="space-y-2">
              {vendor.media.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline block break-all text-sm"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
