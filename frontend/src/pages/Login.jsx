import React, { useState } from 'react'
import API, { setToken } from '../api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await API.post('/auth/login', { email, password });
      const { token } = res.data;
      setToken(token);
      localStorage.setItem('ef_token', token);
      setMsg('Logged in — token saved.');
      window.location.href = '/';
    }catch(err){
      setMsg(err?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Login</h2>
        {msg && <div className="text-sm text-red-600 mb-2">{msg}</div>}
        <input className="w-full p-2 border mb-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border mb-4" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  )
}
