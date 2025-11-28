import React from 'react'
import { motion } from "framer-motion"
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function Testimonials({ collageImages, testimonials = [] }) {
  const mid = Math.ceil(testimonials.length / 2)
  const leftSide = testimonials.slice(0, mid)
  const rightSide = testimonials.slice(mid)

  return (
    <section className="relative py-32 bg-cream-50 overflow-hidden">
      {/* Floating soft shapes */}
      <div className="absolute top-0 left-10 w-72 h-72 bg-yellow-100/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-pink-100/20 rounded-full blur-3xl animate-spin-slow"></div>
      <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-beige-100/15 rounded-full blur-2xl animate-spin-reverse"></div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Section Header */}
        <h2 className="text-sm uppercase tracking-wider text-yellow-600 font-serif mb-2">
          What Our Clients Say
        </h2>
        <h3 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-16 leading-snug">
          Elegant Experiences <br />
          <span className="text-yellow-600">Luxury Weddings & Events, Perfectly Curated</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT SIDE Cards */}
          <div className="space-y-10">
            {leftSide.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="p-8 bg-white shadow-2xl rounded-3xl border border-beige-200 hover:shadow-3xl hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  {t.avatar && (
                    <img src={getFullImageUrl(t.avatar)} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <div className="text-left">
                    <h3 className="text-lg font-serif font-bold text-gray-800">{t.name}</h3>
                    <p className="text-sm text-gray-600 italic">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">"{t.message}"</p>
              </motion.div>
            ))}
          </div>

          {/* RIGHT SIDE Cards */}
          <div className="space-y-10">
            {rightSide.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="p-10 bg-white shadow-2xl rounded-3xl border border-beige-200 hover:shadow-3xl hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  {t.avatar && (
                    <img src={getFullImageUrl(t.avatar)} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <div className="text-left">
                    <h3 className="text-lg font-serif font-bold text-gray-800">{t.name}</h3>
                    <p className="text-sm text-gray-600 italic">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">"{t.message}"</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
