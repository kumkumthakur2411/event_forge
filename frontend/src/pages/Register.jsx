import React, { useState } from 'react'
import API from '../api'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')
  const [categories, setCategories] = useState([])
  const [selectedCats, setSelectedCats] = useState([])
  const [msg, setMsg] = useState('')

  React.useEffect(()=>{
    // load categories for vendor registration
    API.get('/categories').then(r=>setCategories(r.data)).catch(()=>{})
  },[])

  const submit = async (e) => {
    e.preventDefault();
    try{
      const payload = { name, email, password, role };
      if(role === 'vendor') payload.categories = selectedCats;
      const res = await API.post('/auth/register', payload);
      setMsg(res.data.message || 'Registered');
      localStorage.setItem('ef_role', role);
      setTimeout(() => window.location.href = '/login', 1500);
    }catch(err){
      setMsg(err?.response?.data?.message || 'Register failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Register</h2>
        {msg && <div className="text-sm text-green-600 mb-2">{msg}</div>}
        <input className="w-full p-2 border mb-2" placeholder="name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-2 border mb-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border mb-4" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <select value={role} onChange={e=>setRole(e.target.value)} className="w-full p-2 border mb-4">
          <option value="client">Client</option>
          <option value="vendor">Vendor</option>
        </select>
        {role === 'vendor' && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Select Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c=> (
                <label key={c._id} className="flex items-center gap-2">
                  <input type="checkbox" value={c._id} checked={selectedCats.includes(c._id)} onChange={(e)=>{
                    const id = c._1 || c._id;
                    if(e.target.checked) setSelectedCats(prev=>[...prev, c._id]); else setSelectedCats(prev=>prev.filter(x=>x!==c._id))
                  }} />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <button className="w-full bg-green-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  )
}
