import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFullImageUrl } from '../utils/getBaseUrl'
import API from '../api'

// already existing components
import LandingNavbar from '../components/LandingNavbar'
import HeroSection from '../components/HeroSection'

// NEW modular components
import HowItWorks from '../components/landing/HowItWorks'
import EventsGallery from '../components/landing/EventsGallery'
import CategoriesSection from '../components/landing/CategoriesSection'
import VendorsSection from '../components/landing/VendorsSection'
import CompletedEvents from '../components/landing/CompletedEvents'
import Testimonials from '../components/landing/Testimonials'
import WhyChooseUs from '../components/landing/WhyChooseUs'

export default function Landing() {
  const navigate = useNavigate()

  const [vendors, setVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [completed, setCompleted] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [images, setImages] = useState([])
  const [imagesMap, setImagesMap] = useState({})
  const [eventImages, setEventImages] = useState([])
const collageImages = [
  "image1.jpg",
  "image2.jpg",
  "image3.jpg",
  "image4.jpg",
  "image5.jpg"
];
  const load = async () => {
    try {
      const [vRes, catRes, cRes, tRes, iRes, egRes] = await Promise.all([
        API.get('/public/vendors'),
        API.get('/public/categories'),
        API.get('/public/events/completed'),
        API.get('/public/testimonials?landing=true'),
        API.get('/public/images'),
        API.get('/public/event-images')
      ])

      setVendors(vRes.data || [])
      setCategories(catRes.data || [])
      setCompleted(cRes.data || [])
      setTestimonials(tRes.data || [])
      setImages(iRes.data || [])
      setEventImages(egRes.data || [])

      const map = {}
      ;(iRes.data || []).forEach(img => (map[img.section] = img))
      setImagesMap(map)
    } catch (e) {
      console.warn(e)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      {/* Navbar */}
      <LandingNavbar
        onSearchResults={setVendors}
        logoUrl={getFullImageUrl(imagesMap['navbar-logo']?.imageUrl)}
      />

      {/* Hero Section */}
      <HeroSection
        categories={categories.map(cat => cat.name)}
        heroImg={getFullImageUrl(imagesMap['hero']?.imageUrl)}
        box1={getFullImageUrl(imagesMap['box1']?.imageUrl)}
        box2={getFullImageUrl(imagesMap['box2']?.imageUrl)}
      />

      {/* Modular Sections */}
      <HowItWorks icon={getFullImageUrl(imagesMap['hero']?.imageUrl)} />
      <WhyChooseUs/>
      <EventsGallery eventImages={eventImages} />

      <CategoriesSection categories={categories} />

      <VendorsSection vendors={vendors} />
      <CompletedEvents completed={completed} />
      <Testimonials testimonials={testimonials} collageImages={collageImages}/>
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="text-center">
          <a href="/testimonials" className="text-blue-600 underline">Show more testimonials</a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex justify-between">
          <div>
            <div className="font-bold">Event Forge</div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Event Forge
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Contact: contact@example.com
          </div>
        </div>
      </footer>
    </div>
  )
}
