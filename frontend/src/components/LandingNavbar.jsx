import React, { useState, useEffect } from "react";
import { Menu, ChevronDown, Search, LogIn, Images, Grid3X3, User } from "lucide-react";
import API from "../api";

export default function LandingNavbar({ onSearchResults, logoUrl }) {
  const [q, setQ] = useState("");
  const [siteName, setSiteName] = useState('event forge')
  const [suggestions, setSuggestions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const options = [
    { name: "Login", icon: <LogIn size={16} />, link: "/login" },
    { name: "Categories", icon: <Grid3X3 size={16} />, link: "#categories" },
    { name: "Events", icon: <Images size={16} />, link: "#events" },
    { name: "Gallery", icon: <Images size={16} />, link: "#gallery" },
  ];

  const doSearch = async (term) => {
    try {
      const res = await API.get("/public/vendors/search", { params: { q: term } });
      setSuggestions(res.data || []);
      if (onSearchResults) onSearchResults(res.data || []);
    } catch (e) {
      console.warn("Search failed", e);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    doSearch(q);
  };

  useEffect(()=>{
    // load public settings (site name/contact)
    let mounted = true
    API.get('/public/settings').then(r=>{
      if(!mounted) return
      const s = r.data || {}
      if(s.siteName) setSiteName(s.siteName)
    }).catch(()=>{})
    return ()=>{ mounted = false }
  }, [])

  return (
    <nav
      className="
      sticky top-0 z-50 backdrop-blur-xl bg-white/40 
      border-b border-white/30 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-1 flex justify-between items-center">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img
            src={logoUrl || "logoimg.png"}
            className="w-10 h-10 rounded-full shadow-md"
          />
          <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            {siteName}
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">

          {/* Explore */}
          <a
            href="#how"
            className="text-gray-700 hover:text-purple-600 transition font-semibold"
          >
            Explore
          </a>

          {/* Dropdown */}
          <div className="relative">
            <button
              className="
              flex items-center gap-1 px-3 py-1 font-semibold 
              hover:bg-white/50 rounded-lg transition"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Menu <ChevronDown size={16} />
            </button>

            {dropdownOpen && (
              <div
                className="
                absolute mt-2 w-40 bg-white/90 backdrop-blur-xl 
                shadow-xl rounded-lg border p-2 space-y-1"
              >
                {options.map((opt, idx) => (
                  <a
                    key={idx}
                    href={opt.link}
                    className="
                    flex items-center gap-2 px-3 py-2 rounded-md 
                    hover:bg-purple-100/60 transition text-sm font-medium"
                  >
                    {opt.icon} {opt.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Join Button */}
          <a
            href="/register"
            className="
            px-5 py-2 bg-gradient-to-r 
            from-purple-600 to-blue-600 text-white rounded-lg shadow-lg
            hover:shadow-xl transition font-semibold"
          >
            Join
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg bg-white/50 backdrop-blur-md shadow"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white/70 backdrop-blur-xl px-6 py-4 space-y-4 shadow-lg">

          <a href="#how" className="block font-semibold text-gray-700">
            Explore
          </a>

          {options.map((opt, idx) => (
            <a
              key={idx}
              href={opt.link}
              className="
              flex items-center gap-2 bg-white/50 p-2 rounded-lg border"
            >
              {opt.icon} {opt.name}
            </a>
          ))}

          <a
            href="/register"
            className="
            block text-center bg-purple-600 text-white py-2 rounded-lg shadow-md"
          >
            Join
          </a>
        </div>
      )}
    </nav>
  );
}

