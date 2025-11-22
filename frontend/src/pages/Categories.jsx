// import React, { useEffect, useState } from 'react'
// import API, { setToken } from '../api'

// export default function Categories(){
//   const [cats, setCats] = useState([])
//   const [msg, setMsg] = useState('')
//   const [editing, setEditing] = useState(null)
//   const [name, setName] = useState('')
//   const [desc, setDesc] = useState('')
//   const [newImageSection, setNewImageSection] = useState('hero') 
//   const [newImageUrl, setNewImageUrl] = useState('')
//   const [newImageAlt, setNewImageAlt] = useState('')
  
//   useEffect(()=>{
//     const t = localStorage.getItem('ef_token')
//     if(t) setToken(t)
//     else window.location.href = '/login'
//   },[])

//   const load = async ()=>{
//     try{
//       const r = await API.get('/admin/categories')
//       setCats(r.data)
//     }catch(e){ setMsg('Failed to load categories: ' + (e?.response?.data?.message || '')) }
//   }

//   useEffect(()=>{ load() },[])

//   const startEdit = (c)=>{ setEditing(c); setName(c.name); setDesc(c.description || '') }
//   const cancelEdit = ()=>{ setEditing(null); setName(''); setDesc('') }

//   const saveEdit = async () => {
//     try{
//       await API.patch(`/admin/categories/${editing._id}`, 
//         { name, description: desc 
//         })
//       setMsg('Category updated')
//       cancelEdit()
//       load()
//     }catch(e){ setMsg('Error: ' + (e?.response?.data?.message || '')) }
//   }

//   const deleteCat = async (id) => {
//     if(!window.confirm('Delete category? This will remove it from all vendor profiles.')) return;
//     try{
//       await API.delete(`/admin/categories/${id}`)
//       setMsg('Category deleted')
//       load()
//     }catch(e){ setMsg('Error: ' + (e?.response?.data?.message || '')) }
//   }

//     const uploadImage = async () => {
//     if(!newImageUrl) return setMsg('Image URL required')
//     try{
//       await API.post('/admin/categories', { 
//         section: newImageSection, 
//         imageUrl: newImageUrl, 
//         altText: newImageAlt })
//       setMsg('Image uploaded')
//       setNewImageUrl('')
//       setNewImageAlt('')
//       loadImages()
//     }catch(e){
//       setMsg('Error: ' + (e?.response?.data?.message || ''))
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="bg-white p-4 rounded shadow">
//         <h2 className="text-xl font-bold mb-4">Manage Categories</h2>
//         {msg && <div className="bg-blue-100 p-2 rounded mb-4 text-blue-700">{msg}</div>}
//         <div className="grid md:grid-cols-2 gap-4">
//           <div>
//             <h4 className="font-semibold mb-2">Existing Categories</h4>
//             <div className="space-y-2">
//               {cats.map(c=> (
//                 <div key={c._id} className="p-2 border rounded flex justify-between items-center">
//                   <div>
//                     <div className="font-semibold">{c.name}</div>
//                     <div className="text-sm text-gray-600">{c.description}</div>
//                     <img src={c.imageUrl} alt={c.altText} />
//                   </div>
//                   <div className="flex gap-2">
//                     <button onClick={()=>startEdit(c)} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">Edit</button>
//                     <button onClick={()=>deleteCat(c._id)} className="bg-red-600 text-white px-2 py-1 rounded text-sm">Delete</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div>
//             <h4 className="font-semibold mb-2">{editing? 'Edit Category' : 'Create Category'}</h4>
//             <div className="grid gap-2">
//               <input placeholder="Name" className="p-2 border rounded" value={name} onChange={e=>setName(e.target.value)} />
//               <textarea placeholder="Description" className="p-2 border rounded" rows="4" value={desc} onChange={e=>setDesc(e.target.value)} />
//                 <input 
//                 placeholder="Image URL" 
//                 value={newImageUrl} 
//                 onChange={e=>setNewImageUrl(e.target.value)}
//                  className="p-2 border rounded" />
//                 <input 
//                 placeholder="Alt text"
//                  value={newImageAlt} 
//                  onChange={e=>setNewImageAlt(e.target.value)} 
//                  className="p-2 border rounded" />
//               </div>
//               <div className="mt-2">
//                 <button onClick={uploadImage} 
//                 className="bg-green-600 text-white px-3 py-1 rounded">Upload / Update</button>
//               </div>
//               {msg && <p className="mt-2 text-blue-600">{msg}</p>}


//               <div className="flex gap-2">
//                 {editing ? (
//                   <>
//                     <button onClick={saveEdit} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
//                     <button onClick={cancelEdit} className="bg-gray-600 text-white px-3 py-1 rounded">Cancel</button>
//                   </>
//                 ) : (
//                   <CreateCategoryForm onCreated={()=>{ setName(''); setDesc(''); load(); setMsg('Category created') }} setMsg={setMsg} />
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
    
//   )
// }

// function CreateCategoryForm({ onCreated, setMsg }){
//   const [name, setName] = useState('')
//   const [desc, setDesc] = useState('')
//   const create = async ()=>{
//     if(!name) return setMsg('Name required')
//     try{
//       await API.post('/admin/categories', { name, description: desc })
//       setName(''); setDesc('')
//       onCreated()
//     }catch(e){ setMsg('Error: ' + (e?.response?.data?.message || '')) }
//   }
//   return (
//     <div className="flex gap-2">
//       <input placeholder="Name" className="p-2 border rounded flex-1" value={name} onChange={e=>setName(e.target.value)} />
//       <button onClick={create} className="bg-green-600 text-white px-3 py-1 rounded">Create</button>    
//     </div>
//   )
// }


import React, { useEffect, useState } from "react";
import API, { setToken } from "../api";

/**
 * Robust Categories manager:
 * - unified create/edit form
 * - resilient image detection from multiple possible API shapes
 * - shows preview, onError fallback, and console debug info
 */
export default function Categories() {
  const [cats, setCats] = useState([]);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(null);

  // Form states (shared for create/edit)
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("ef_token");
    if (t) setToken(t);
    else window.location.href = "/login";
  }, []);

  // Helper: normalize API response bodies (some APIs return array directly, others {data: [...]})
  const normalizeCats = (respData) => {
    if (!respData) return [];
    if (Array.isArray(respData)) return respData;
    // common wrapper keys
    if (Array.isArray(respData.data)) return respData.data;
    if (Array.isArray(respData.categories)) return respData.categories;
    // fallback - try to find an array within object values
    for (const k of Object.keys(respData)) {
      if (Array.isArray(respData[k])) return respData[k];
    }
    return [];
  };

  const load = async () => {
    try {
      const r = await API.get("/admin/categories");
      const arr = normalizeCats(r.data);
      setCats(arr);
      setMsg("");
    } catch (e) {
      setMsg("Failed to load categories: " + (e?.response?.data?.message || e.message));
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Helper: detect a usable image URL from many shapes
  const detectImageUrl = (cat) => {
    if (!cat) return null;

    // tries in order; add more shapes if your API uses different names
    const attempts = [
      cat.imageUrl,
      cat.image?.url,
      cat.image?.imageUrl,
      cat.imageUrl?.url,
      cat.images && Array.isArray(cat.images) && (cat.images[0]?.url || cat.images[0]?.imageUrl || cat.images[0]),
      // Older or nested possibilities
      cat.photo,
      cat.photoUrl,
      cat.img,
      cat.src,
    ].flat();

    // return first non-empty string that looks like a URL or data URI
    for (const maybe of attempts) {
      if (typeof maybe === "string" && maybe.trim()) return maybe.trim();
      if (typeof maybe === "object" && maybe && typeof maybe.url === "string") return maybe.url.trim();
    }

    return null;
  };

  const startEdit = (c) => {
    setEditing(c);
    setName(c.name || "");
    setDesc(c.description || c.desc || "");
    setImageUrl(detectImageUrl(c) || "");
    setAltText(c.altText || c.alt || c.description || "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setName("");
    setDesc("");
    setImageUrl("");
    setAltText("");
  };

  const saveEdit = async () => {
    if (!name) return setMsg("Name required");
    try {
      await API.patch(`/admin/categories/${editing._id}`, {
        name,
        description: desc,
        imageUrl,
        altText,
      });
      setMsg("Category updated");
      cancelEdit();
      await load();
    } catch (e) {
      setMsg("Error: " + (e?.response?.data?.message || e.message));
    }
  };

  const createCategory = async () => {
    if (!name) return setMsg("Name required");
    try {
      await API.post("/admin/categories", {
        name,
        description: desc,
        imageUrl,
        altText,
      });
      setMsg("Category created");
      cancelEdit();
      await load();
    } catch (e) {
      setMsg("Error: " + (e?.response?.data?.message || e.message));
    }
  };

  const deleteCat = async (id) => {
    if (!window.confirm("Delete category?")) return;
    try {
      await API.delete(`/admin/categories/${id}`);
      setMsg("Category deleted");
      await load();
    } catch (e) {
      setMsg("Error: " + (e?.response?.data?.message || e.message));
    }
  };

  // tiny placeholder SVG data URI for missing images
  const placeholder =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='160'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='14'>No image</text></svg>`
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Manage Categories</h2>

        {msg && <div className="bg-blue-100 p-2 rounded mb-4 text-blue-700">{msg}</div>}

        <div className="grid md:grid-cols-2 gap-4">
          {/* LEFT: existing categories */}
          <div>
            <h4 className="font-semibold mb-2">Existing Categories</h4>
            <div className="space-y-3">
              {cats.map((c) => {
                const url = detectImageUrl(c);
                // debug: log what we found for each category (helps backend mapping)
                console.debug("Category image detect:", { id: c._id, name: c.name, detectedUrl: url, raw: c });

                return (
                  <div
                    key={c._id}
                    className="p-3 border rounded flex justify-between items-start"
                  >
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-sm text-gray-600">{c.description}</div>

                      {/* image preview: use detected url or placeholder */}
                      <div className="mt-2">
                        <img
                          src={url || placeholder}
                          alt={c.altText || c.alt || c.name || "category image"}
                          className="w-32 h-auto rounded border"
                          onError={(e) => {
                            // show placeholder on broken image and avoid infinite error loops
                            if (e?.currentTarget?.src !== placeholder) {
                              e.currentTarget.src = placeholder;
                            }
                          }}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCat(c._id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: create / edit form */}
          <div>
            <h4 className="font-semibold mb-2">{editing ? "Edit Category" : "Create Category"}</h4>

            <div className="grid gap-3">
              <input
                className="p-2 border rounded"
                placeholder="Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <textarea
                className="p-2 border rounded"
                rows="3"
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />

              <input
                className="p-2 border rounded"
                placeholder="Image URL (http(s):// or data: URI)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />

              <input
                className="p-2 border rounded"
                placeholder="Alt Text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={altText || name}
                  className="w-32 h-auto rounded border"
                  onError={(e) => {
                    // if typed URL is invalid, fallback to placeholder
                    if (e?.currentTarget?.src !== placeholder) {
                      e.currentTarget.src = placeholder;
                    }
                  }}
                />
              )}

              <div className="flex gap-2 mt-2">
                {editing ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-600 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={createCategory}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Create
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




// import React, { useEffect, useState } from "react";
// import API, { setToken } from "../api";

// export default function Categories() {
//   const [cats, setCats] = useState([]);
//   const [msg, setMsg] = useState("");
//   const [editing, setEditing] = useState(null);

//   // Form states (used for both Create + Edit)
//   const [name, setName] = useState("");
//   const [desc, setDesc] = useState("");
//   const [imageUrl, setImageUrl] = useState("");
//   const [altText, setAltText] = useState("");

//   useEffect(() => {
//     const t = localStorage.getItem("ef_token");
//     if (t) setToken(t);
//     else window.location.href = "/login";
//   }, []);

//   const load = async () => {
//     try {
//       const r = await API.get("/admin/categories");
//       setCats(r.data);
//     } catch (e) {
//       setMsg("Failed to load categories: " + (e?.response?.data?.message || ""));
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   // START EDIT
//   const startEdit = (c) => {
//     setEditing(c);
//     setName(c.name);
//     setDesc(c.description || "");
//     setImageUrl(c.imageUrl || "");
//     setAltText(c.altText || "");
//   };

//   const cancelEdit = () => {
//     setEditing(null);
//     setName("");
//     setDesc("");
//     setImageUrl("");
//     setAltText("");
//   };

//   // SAVE EDIT
//   const saveEdit = async () => {
//     if (!name) return setMsg("Name required");

//     try {
//       await API.patch(`/admin/categories/${editing._id}`, {
//         name,
//         description: desc,
//         imageUrl,
//         altText,
//       });

//       setMsg("Category updated");
//       cancelEdit();
//       load();
//     } catch (e) {
//       setMsg("Error: " + (e?.response?.data?.message || ""));
//     }
//   };

//   // CREATE NEW CATEGORY
//   const createCategory = async () => {
//     if (!name) return setMsg("Name required");

//     try {
//       await API.post("/admin/categories", {
//         name,
//         description: desc,
//         imageUrl,
//         altText,
//       });

//       setMsg("Category created");
//       cancelEdit();
//       load();
//     } catch (e) {
//       setMsg("Error: " + (e?.response?.data?.message || ""));
//     }
//   };

//   // DELETE CATEGORY
//   const deleteCat = async (id) => {
//     if (!window.confirm("Delete category?")) return;

//     try {
//       await API.delete(`/admin/categories/${id}`);
//       setMsg("Category deleted");
//       load();
//     } catch (e) {
//       setMsg("Error: " + (e?.response?.data?.message || ""));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="bg-white p-4 rounded shadow">
//         <h2 className="text-xl font-bold mb-4">Manage Categories</h2>

//         {msg && (
//           <div className="bg-blue-100 p-2 rounded mb-4 text-blue-700">{msg}</div>
//         )}

//         <div className="grid md:grid-cols-2 gap-4">
//           {/* LEFT SIDE – EXISTING CATEGORIES */}
//           <div>
//             <h4 className="font-semibold mb-2">Existing Categories</h4>

//             <div className="space-y-3">
//               {cats.map((c) => (
//                 <div
//                   key={c._id}
//                   className="p-3 border rounded flex justify-between items-start"
//                 >
//                   <div>
//                     <div className="font-semibold">{c.name}</div>
//                     <div className="text-sm text-gray-600">{c.description}</div>

//                     {c.imageUrl && (
//                       <img
//                         src={c.imageUrl}
//                         alt={c.altText}
//                         className="w-32 h-auto rounded mt-2 border"
//                       />
//                     )}
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => startEdit(c)}
//                       className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => deleteCat(c._id)}
//                       className="bg-red-600 text-white px-2 py-1 rounded text-sm"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* RIGHT SIDE – CREATE/EDIT FORM */}
//           <div>
//             <h4 className="font-semibold mb-2">
//               {editing ? "Edit Category" : "Create Category"}
//             </h4>

//             <div className="grid gap-3">
//               <input
//                 className="p-2 border rounded"
//                 placeholder="Category Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />

//               <textarea
//                 className="p-2 border rounded"
//                 rows="3"
//                 placeholder="Description"
//                 value={desc}
//                 onChange={(e) => setDesc(e.target.value)}
//               />

//               <input
//                 className="p-2 border rounded"
//                 placeholder="Image URL"
//                 value={imageUrl}
//                 onChange={(e) => setImageUrl(e.target.value)}
//               />

//               <input
//                 className="p-2 border rounded"
//                 placeholder="Alt Text"
//                 value={altText}
//                 onChange={(e) => setAltText(e.target.value)}
//               />

//               {/* Image Preview */}
//               {imageUrl && (
//                 <img
//                   src={imageUrl}
//                   alt={altText}
//                   className="w-32 h-auto rounded border"
//                 />
//               )}

//               <div className="flex gap-2 mt-2">
//                 {editing ? (
//                   <>
//                     <button
//                       onClick={saveEdit}
//                       className="bg-green-600 text-white px-3 py-1 rounded"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={cancelEdit}
//                       className="bg-gray-600 text-white px-3 py-1 rounded"
//                     >
//                       Cancel
//                     </button>
//                   </>
//                 ) : (
//                   <button
//                     onClick={createCategory}
//                     className="bg-green-600 text-white px-3 py-1 rounded"
//                   >
//                     Create
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
