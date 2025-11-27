import React from 'react'
import { motion } from 'framer-motion'
import { getFullImageUrl } from '../../utils/getBaseUrl'
import { useNavigate } from 'react-router-dom'

export default function CategoriesSection({ categories }) {
  const navigate = useNavigate()

  return (
    <section id="categories" className="py-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-2">Vendor Categories</h2>
        <h4 className="text-gray-600">
          From décor to catering, find trusted experts.
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-10 gap-6">
          {categories.map(cat => (
            <div
              key={cat._id}
              onClick={() => navigate(`/category/${cat._id}`)}
              className="p-6 rounded shadow-lg cursor-pointer hover:scale-105 transition-all bg-black/30 text-white"
            >
              {cat.imageUrl && (
                <img
                  src={getFullImageUrl(cat.imageUrl)}
                  className="w-full h-32 object-cover rounded mb-3"
                  alt={cat.name}
                />
              )}

              <motion.div
                className="font-bold text-lg mb-2"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {cat.name}
              </motion.div>

              {cat.description && (
                <div className="text-sm text-blue-100">{cat.description}</div>
              )}

              
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
