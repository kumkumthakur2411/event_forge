import React from 'react'

export default function Testimonials({ testimonials }) {
  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">What our users say</h2>

        <div className="grid grid-cols-1 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 bg-white rounded shadow">
              <div className="font-semibold mb-2">
                {t.name}{' '}
                <span className="text-sm text-gray-500">{t.role}</span>
              </div>
              <div className="text-sm text-gray-700">{t.message}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
