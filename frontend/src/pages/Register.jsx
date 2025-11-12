import React, { useState } from 'react'
import API from '../api'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await API.post('/auth/register', { name, email, password, role });
      setMsg(res.data.message || 'Registered');
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
        <button className="w-full bg-green-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  )
}
