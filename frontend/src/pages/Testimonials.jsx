import React, { useEffect, useState } from 'react'
import API from '../api'
import Testimonials from '../components/landing/Testimonials'

export default function TestimonialsPage(){
  const [testimonials, setTestimonials] = useState([])

  const load = async ()=>{
    try{
      // fetch many testimonials (approved)
      const res = await API.get('/public/testimonials?limit=1000')
      setTestimonials(res.data || [])
    }catch(e){
      console.warn(e)
    }
  }

  useEffect(()=>{ load() },[])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">All Testimonials</h1>
        <Testimonials testimonials={testimonials} />
      </div>
    </div>
  )
}
