import React from "react";
import StackGrid, { transitions } from "react-stack-grid";
import { getFullImageUrl } from "../../utils/getBaseUrl";

export default function EventsGallery({ eventImages = [] }) {
  const transition = transitions.scaleDown; // you can use: fade, scaleDown, flip, etc.

  return (
    <section id="events-gallery" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Events Gallery</h2>
        <p className="text-sm text-gray-600 mb-4">
          Photos uploaded by users & approved by admin.
        </p>

        {eventImages.length === 0 ? (
          <div className="text-gray-600">No gallery images yet.</div>
        ) : (
          <StackGrid
            monitorImagesLoaded
            gutterWidth={15}
            gutterHeight={15}
            columnWidth={
              window.innerWidth < 640
                ? "50%"      // mobile
                : window.innerWidth < 1024
                ? "33.33%"   // tablet
                : "25%"      // desktop
            }
            appear={transition.appear}
            appeared={transition.appeared}
            enter={transition.enter}
            leaved={transition.leaved}
            duration={550}
            easing={"ease-out"}
          >
            {[...eventImages]
              .sort(() => Math.random() - 0.5)
              .map((img) => (
                <div key={img._id}>
                  <img
                    src={getFullImageUrl(img.imageUrl)}
                    alt={img.caption || "event"}
                    className="w-full h-auto rounded-lg shadow-sm object-cover"
                  />
                  <p className="text-sm mt-1 text-gray-700">
                    {img.caption || img.event?.title}
                  </p>
                </div>
              ))}
          </StackGrid>
        )}
      </div>
    </section>
  );
}

