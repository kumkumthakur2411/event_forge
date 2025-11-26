import React from 'react'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function EventsGallery({ eventImages }) {
  return (
    <section id="events-gallery" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Events Gallery</h2>
        <p className="text-sm text-gray-600 mb-4">
          Photos uploaded by users & approved by admin.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {eventImages.length === 0 ? (
            <div className="text-gray-600">No gallery images yet.</div>
          ) : (
            [...eventImages]
              .sort(() => Math.random() - 0.5)
              .map(img => (
                <div key={img._id} className="rounded overflow-hidden bg-gray-100">
                  <img
                    src={getFullImageUrl(img.imageUrl)}
                    className="w-full h-48 object-cover"
                    alt={img.caption || 'event'}
                  />
                  <div className="p-2 text-sm text-gray-700">
                    {img.caption || img.event?.title}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </section>
  )
}
