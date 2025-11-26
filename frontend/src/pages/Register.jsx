import React, { useState } from 'react'
import API from '../api'

export default function Register() {
  const [name, setName] = useState('')
  const [phoneNo, setPhoneNo] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [city, setCity] = useState('')
  const [description, setDescription] = useState('')
  const [companyLogo, setCompanyLogo] = useState('')
  const [gst, setGst] = useState('')
  const [pan, setPan] = useState('')
  const [media, setMedia] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Register as Client or Vendor')
  const [categories, setCategories] = useState([])
  const [selectedCats, setSelectedCats] = useState([])
  const [msg, setMsg] = useState('')

  React.useEffect(() => {
    // load categories for vendor registration
    API.get('/categories').then(r => setCategories(r.data)).catch(() => { })
  }, [])

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, phoneNo, email, password, role };
      if (role === 'vendor') payload.companyName = companyName;
      if (role === 'vendor') payload.categories = selectedCats;
      if (role === 'vendor') payload.companyEmail = companyEmail;
      if (role === 'vendor') payload.companyPhone = companyPhone;
      if (role === 'vendor') payload.city = city;
      if (role === 'vendor') payload.description = description;
      if (role === 'vendor') payload.companyLogo = companyLogo;
      if (role === 'vendor') payload.gst = gst;
      if (role === 'vendor') payload.pan = pan;
      if (role === 'vendor') payload.media = media;

      const res = await API.post('/auth/register', payload);
      setMsg(res.data.message || 'Registered');
      localStorage.setItem('ef_role', role);
      setTimeout(() => window.location.href = '/login', 1500);
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Register failed');
    }
  }

  return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 from-yellow-500 to-purple-700 ">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden grid md:grid-cols-2">

    {/* LEFT SIDE IMAGE */}
    <div className="hidden md:block bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0')" }}>
    </div>

    {/* RIGHT SIDE FORM */}
    <form onSubmit={submit} className="p-5">
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">Create Account</h2>

      {msg && <div className="text-sm text-green-600 mb-3">{msg}</div>}

      {/* ---- 2 COLUMN LAYOUT ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">

        <input className="p-1 border rounded" placeholder="Name"
          value={name} onChange={e => setName(e.target.value)} />

        <input className="p-1 border rounded" placeholder="Phone Number"
          value={phoneNo} onChange={e => setPhoneNo(e.target.value)} />

        <input className="p-1 border rounded" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />

        <input type="password" className="p-1 border rounded" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)} />

        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="p-1 border rounded text-gray-700 col-span-1 md:col-span-2"
        >
          <option value="">Register as Client or Vendor</option>
          <option value="client">Client</option>
          <option value="vendor">Vendor</option>
        </select>
      </div>

      {/* ---------- VENDOR SECTION ---------- */}
      {role === 'vendor' && (
        <div className="mt-2 pl-4 p-2 bg-gray-50 border rounded-xl">

          <p className="text-sm font-semibold mb-3 text-gray-700">Select Categories</p>

          <div className="grid grid-cols-6 gap-2 mb-4">
            {categories.map(c => (
              <label key={c._id} className="flex items-center gap-2 text-sm">
                <input type="checkbox"
                  checked={selectedCats.includes(c._id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedCats(prev => [...prev, c._id]);
                    else setSelectedCats(prev => prev.filter(x => x !== c._id));
                  }} />
                {c.name}
              </label>
            ))}
          </div>

          {/* ---- VENDOR FIELDS IN 2-COLUMNS ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input className="p-1 border rounded" placeholder="Company Name"
              value={companyName} onChange={e => setCompanyName(e.target.value)} />

            <input className="p-1 border rounded" placeholder="Company Email"
              value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} />

            <input className="p-1 border rounded" placeholder="Company Phone"
              value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} />

            <input className="p-1 border rounded" placeholder="City"
              value={city} onChange={e => setCity(e.target.value)} />

            <textarea className="p-1 border rounded col-span-1 md:col-span-2"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)} />

            <input className="p-1 border rounded" placeholder="Company Logo URL"
              value={companyLogo} onChange={e => setCompanyLogo(e.target.value)} />

            <input className="p-1 border rounded" placeholder="GST Number"
              value={gst} onChange={e => setGst(e.target.value)} />

            <input className="p-1 border rounded" placeholder="PAN Number"
              value={pan} onChange={e => setPan(e.target.value)} />

            <input className="p-1 border rounded col-span-1 md:col-span-2"
              placeholder="Media URLs (comma separated)"
              value={media.join(',')}
              onChange={e => setMedia(e.target.value.split(',').map(s => s.trim()))}
            />
          </div>
        </div>
      )}
      <button
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 transition text-white p-2 rounded-lg font-semibold">
        Register
      </button>
    </form>
  </div>
</div>


  )
}
