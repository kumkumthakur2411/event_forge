import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import API from '../api'
import LandingNavbar from '../components/LandingNavbar'
import HeroSection from '../components/HeroSection'

export default function Landing(){
  const navigate = useNavigate()
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [images, setImages] = useState([]);
  const [imagesMap, setImagesMap] = useState({})
  


  const load = async ()=>{
    try{
      const [vRes, catRes, cRes, tRes, iRes] = await Promise.all([
        API.get('/public/vendors'),
        API.get('/public/categories'),
        API.get('/public/events/completed'),
        API.get('/public/testimonials'),
        API.get('/public/images')
      ])
      setVendors(vRes.data || [])
      setCategories(catRes.data || [])
      setCompleted(cRes.data || [])
      setTestimonials(tRes.data || [])
      setImages(iRes.data || [])
      const map = {};
      (iRes.data || []).forEach(img => { map[img.section] = img })
      setImagesMap(map)
    }catch(e){ console.warn(e) }
  }

  useEffect(()=>{ load() },[])

  return (
    <div>
      <LandingNavbar onSearchResults={setVendors} logoUrl={imagesMap['navbar-logo']?.imageUrl}  />
      <HeroSection  categories={categories.map(cat => cat.name)} heroImg={imagesMap['hero']?.imageUrl} box1={imagesMap['box1']?.imageUrl} box2={imagesMap['box2']?.imageUrl} />

      <section id="how" className="py-16 border-2 border-red-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl text-red-300 font-bold mb-1">How it works ?</h2>
          <h4 className='text-3xl font-extrabold mb-10'>
           Plan your event in simple steps
           <br/> <span className='text-red-300'>discover, book, and celebrate.</span>
          </h4>
          <div className="grid grid-cols-4 gap-6">
            <div className="p-6 border-2 border-red-300 rounded-xl ">
              <img src={imagesMap['hero']?.imageUrl || 'logoimg.png'} alt="" className='size-12 rounded-xl mb-4'/>
              <h3 className="font-semibold ">Post your event</h3>
              <p className="text-sm text-gray-600 mt-1"> Lorem ipsum dolor 
                sit amet consectetur adipisicing elit. Ea voluptates sunt eveniet nesciunt amet ab dolor odit 
                ipsa nam dicta molestiae .</p>
            </div>
            <div className="p-6 border-2 border-red-300 rounded-xl ">
              <img src={imagesMap['hero']?.imageUrl || 'logoimg.png'} alt="" className='size-12 rounded-xl mb-4'/>
              <h3 className="font-semibold ">Get vendor proposals</h3>
              <p className="text-sm text-gray-600">Vendors send quotations and you compare.</p>
            </div>
            <div className="p-6 border-2 border-red-300 rounded-xl ">
              <img src={imagesMap['hero']?.imageUrl || 'logoimg.png'} alt="" className='size-12 rounded-xl mb-4'/>
              <h3 className="font-semibold ">Post your event</h3>
              <p className="text-sm text-gray-600">Create an event with details and date.</p>
            </div>
            <div className="p-6 border-2 border-red-300 rounded-xl ">
              <img src={imagesMap['hero']?.imageUrl || 'logoimg.png'} alt="" className='size-12 rounded-xl mb-4'/>
              <h3 className="font-semibold ">Approve & manage</h3>
              <p className="text-sm text-gray-600">Admin reviews and approves events and vendors.</p>
            </div>
          </div>
        </div>
      </section>

  
   

      <section id="categories" className="py-16">
        <div className="max-w-6xl mx-auto px-4 text-center justify-center">
          <h2 className="text-3xl font-bold  mb-2"> Vendor Categories</h2>
          <h4><span>From décor to catering,</span><br/>
            find trusted experts across every category.</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-10">
            {categories.map(cat => (
              <div              
                key={cat._id}
                onClick={() => navigate(`/category/${cat._id}`)}
                className="p-6 h-60 bg-gradient-to-br from-red-500 to-blue-600 text-white
                 rounded shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
              >
                <motion.div
                  className="font-bold text-lg mb-2"
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  whileHover={{ scale: 1.03 }}
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

      <section id="vendors" className="py-16 bg-[#161616]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl text-white font-bold mb-6">Vendors</h2>
          <div className="grid grid-cols-6 gap-4">
            {vendors.map(v => (
              <div key={v._id} className="p-4 size-40 bg-[#1D1D1D]  shadow shadow-white">
                <div className="font-semibold">{v.name || v.email}</div>
                <div className="text-sm text-gray-600">{v.profile?.company || ''}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="completed" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Completed Events</h2>
          <div className="grid grid-cols-3 gap-4">
            {completed.map(e => (
              <div key={e._id} className="p-4 bg-white rounded shadow">
                <div className="font-semibold">{e.title}</div>
                <div className="text-sm text-gray-600">Posted by: {e.postedBy?.email}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">What our users say</h2>
          <div className="grid grid-cols-1 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 bg-white rounded shadow">
                <div className="font-semibold mb-2">{t.name} <span className="text-sm text-gray-500">{t.role}</span></div>
                <div className="text-sm text-gray-700">{t.message}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex justify-between">
          <div>
            <div className="font-bold">Event Forge</div>
            <div className="text-sm text-gray-400">© {new Date().getFullYear()} Event Forge</div>
          </div>
          <div className="text-sm text-gray-400">Contact: contact@example.com</div>
        </div>
      </footer>
    </div>
  )
}
