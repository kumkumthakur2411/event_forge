import React, { useState } from 'react'
import API, { setToken } from '../api'

export default function LandingNavbar({ onSearchResults, logoUrl }){
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const doSearch = async (term) => {
    try{
      const res = await API.get('/public/vendors/search', { params: { q: term } })
      setSuggestions(res.data || [])
      if(onSearchResults) onSearchResults(res.data || [])
    }catch(e){
      console.warn('Search failed', e)
    }
  }
//dropdown
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const options = [
    
  {name :"login" ,
   link: "/login"
  },
  {name :"categories" ,
   link: "#testimonials"
  },
    {name :"event" ,
   link: "#"
  },
    {name :"gallery" ,
   link: "#"
  },

  ];

  const onSubmit = (e) => {
    e.preventDefault();
    doSearch(q)
  }

  return (
    <nav className="sticky top-0 z-45  relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-3 px-10">
        <div className="flex items-center gap-2">
          <img src={logoUrl || 'logoimg.png'}  className="w-8 h-8 rounded-full " />
          <h1 className="text-xl font-[Georgia] font-bold">VendorForge</h1>
        </div>
{/* search bar */}
        {/* <form onSubmit={onSubmit} className="flex items-center gap-1">
           <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search vendors..." className="border px-2 py-1 rounded w-64" />
           <button className="bg-[#BBF7D0] text-grey-400 px-3 py-1 rounded">Search</button>
         </form> */}

        <div className="hidden md:flex space-x-10 font-bold text-sm">
          <a href="#how" className="hover:text-blue-600">explore</a>
<div className="relative ">
      {/* Selected Box */}
      <div
        className="  hover:bg-gray-100 pl-2 pr-2 cursor-pointer "
        onClick={() => setOpen(!open)}
      >
        {selected || " ☰"}
      </div>

      {/* Dropdown Options */}
      {open && (
        <div className="absolute w-28 left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10">
          {options.map((opt) => (
            <div
              key={opt}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSelected(opt);
                setOpen(false);
              }}
            >
              <a href={opt.link} className="px-3 py-1 rounded">{opt.name}</a>              
            </div>
          ))}
        </div>
      )}
    </div>
          {/* <a href="#testimonials" className="hover:text-blue-600">Contact</a> */}
          <a href="/register" className="bg-green-600 text-white px-3 py-1 rounded">join</a>
        </div>
{/* 
      <div className='text-sm'> login</div> */}

        <button
          className="md:hidden p-2 border rounded"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-gray-100 p-4 space-y-2">
          <a href="#how" className="block">How it Works</a>
          <a href="#why" className="block">Why Choose Us</a>
          <a href="#categories" className="block">Categories</a>
          <a href="#testimonials" className="block">Testimonials</a>
        </div>
      )}
    </nav>
  )
}
