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

  const load = async () => {
    try {
      const [vRes, catRes, cRes, tRes, iRes, egRes] = await Promise.all([
        API.get('/public/vendors'),
        API.get('/public/categories'),
        API.get('/public/events/completed'),
        API.get('/public/testimonials'),
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
      <Testimonials testimonials={testimonials} />

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

// Option A — Minimal + Premium (Apple style)

// Large elegant typography

// Clean white layout

// Subtle gradients

// Soft shadows

// Classy look

// Option B — Bold & Vibrant (Startup / SaaS style)

// Huge colorful gradient backgrounds

// Floating abstract shapes

// Modern 3D depth

// Strong contrast with dark/light mix

// Option C — Luxury Wedding & Events Theme

// Gold accents

// Floral subtle patterns

// Cream + beige + champagne colors

// Soft elegant typography

// Premium event feel

// Option D — Dark Modern (High contrast)

// Dark background

// Neon accents

// Floating lights

// Very modern / techy

// Option E — Playful & Creative

// Rounded abstract shapes

// Soft pastel gradients

// Cards popping with animation

// Very friendly design