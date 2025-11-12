import React, { useEffect, useState } from 'react'
import API, { setToken } from '../api'

export default function Dashboard(){
  const [user, setUser] = useState(null)

  useEffect(()=>{
    const t = localStorage.getItem('ef_token');
    if(t){
      setToken(t);
      API.get('/auth/me').then(r=>setUser(r.data)).catch(()=>{});
    }
  },[])

  if(!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl">You are not logged in</h2>
        <a className="text-blue-600" href="/login">Login</a> or <a className="text-blue-600" href="/register">Register</a>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-2">Dashboard</h1>
      <p>Signed in as: <strong>{user.email}</strong> ({user.role})</p>
      <p>Profile complete: {user.profileComplete ? 'Yes' : 'No'}</p>
      <div className="mt-4">
        {user.role === 'client' && <a href="/client" className="inline-block bg-green-600 text-white px-4 py-2 rounded">Go to Client Dashboard</a>}
        {user.role === 'vendor' && <a href="/vendor" className="inline-block bg-purple-600 text-white px-4 py-2 rounded">Go to Vendor Dashboard</a>}
        {user.role === 'admin' && <a href="/admin" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">Go to Admin Panel</a>}
      </div>
      <button onClick={()=>{localStorage.clear(); window.location.href='/login'}} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Logout</button>
    </div>
  )
}
