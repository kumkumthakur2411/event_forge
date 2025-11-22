import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api'
import LandingNavbar from '../components/LandingNavbar'

export default function CategoryDetail() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true)
        const res = await API.get(`/public/categories/${categoryId}/vendors`)
        setCategory(res.data.category)
        setVendors(res.data.vendors || [])
      } catch (err) {
        console.error('Error fetching category data:', err)
        navigate('/') // Redirect to landing if category not found
      } finally {
        setLoading(false)
      }
    }
    fetchCategoryData()
  }, [categoryId, navigate])

  if (loading) {
    return (
      <div>
        <LandingNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <LandingNavbar />
      
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ← Back to Home
          </button>

          {category && (
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-gray-600">{category.description}</p>
              )}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-6">
              Available Vendors ({vendors.length})
            </h2>

            {vendors.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded text-center">
                <p className="text-gray-600">No vendors available in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map(vendor => (
                  <div
                    key={vendor._id}
                    className="bg-white p-6 rounded shadow hover:shadow-lg transition"
                  >
                    <div className="font-bold text-lg mb-2">
                      {vendor.name || vendor.email}
                    </div>
                    {vendor.profile?.company && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Company:</strong> {vendor.profile.company}
                      </div>
                    )}
                    {vendor.profile?.experience && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Experience:</strong> {vendor.profile.experience}
                      </div>
                    )}
                    {vendor.profile?.phone && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Phone:</strong> {vendor.profile.phone}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <strong>Email:</strong> {vendor.email}
                    </div>
                    {vendor.profile?.portfolio && (
                      <a
                        href={vendor.profile.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        View Portfolio
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
