import React from 'react'
import { getFullImageUrl } from '../../utils/getBaseUrl'

export default function CompletedEvents({ completed }) {
  return (
    <section id="completed" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Completed Events</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {completed.map(e => (
            <div key={e._id} className="p-4 bg-white rounded shadow">
              <div className="font-semibold">{e.title}</div>
              <div className="flex items-center gap-2 mt-2">
                {e.postedBy?.profileImage && (
                  <img src={getFullImageUrl(e.postedBy.profileImage)} alt={e.postedBy.name} className="w-8 h-8 rounded-full object-cover" />
                )}
                <div className="text-sm text-gray-600">
                  Posted by: {e.postedBy?.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
