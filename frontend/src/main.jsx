"use client";
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import TestimonialsPage from './pages/Testimonials'
import Admin from './pages/Admin'
import Categories from './pages/Categories'
import Client from './pages/Client'
import Vendor from './pages/Vendor'
import CategoryDetail from './pages/CategoryDetail'

import { motion } from "framer-motion";
function RootPage() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('ef_token');
      const role = localStorage.getItem('ef_role');
      if (token && role) {
        setIsLoggedIn(true);
        setUserRole(role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (login/logout from other tabs or windows)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (loading) return <div className="p-4">
<div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="flex space-x-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-4 h-4 bg-black rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>


  </div>;

  // If logged in, show role-specific dashboard
  if (isLoggedIn && userRole === 'admin') {
    return <Admin />;
  } else if (isLoggedIn && userRole === 'vendor') {
    return <Vendor />;
  } else if (isLoggedIn && userRole === 'client') {
    return <Client />;
  }
  // Not logged in: show landing page
  return <Landing />;
}

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<RootPage/>} />
        <Route path='/category/:categoryId' element={<CategoryDetail/>} />
        <Route path='/testimonials' element={<TestimonialsPage/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/admin' element={<Admin/>} />
        <Route path='/admin/categories' element={<Categories/>} />
        <Route path='/client' element={<Client/>} />
        <Route path='/vendor' element={<Vendor/>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
