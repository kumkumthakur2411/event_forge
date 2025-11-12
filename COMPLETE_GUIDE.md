# Event Forge — Complete Setup & Usage Guide

**Status: ✅ Fully Implemented & Running**

## Overview

Event Forge is a comprehensive event management platform where:
- **Clients** post events and manage vendor assignments
- **Vendors** bid on (send interest in) events
- **Admin** approves/denies users, events, and vendor quotations

All three roles use **JWT authentication** and **MongoDB** for persistence.

---

## Quick Start (Already Running)

Both servers are running:
- **Backend**: `http://localhost:5000` (Express + MongoDB)
- **Frontend**: `http://localhost:3000` (Vite + React + Tailwind)

### Default Admin Credentials
```
Email: admin@admin.com
Password: admin@admin
```

---

## Project Structure

```
event_forge/
├── backend/
│   ├── server.js                    # Express app entry
│   ├── config/db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js                  # User (admin/client/vendor)
│   │   ├── Event.js                 # Event (posted by client)
│   │   └── Quotation.js             # Vendor interest in event
│   ├── controllers/
│   │   ├── authController.js        # register, login, me
│   │   ├── adminController.js       # manage users/events/quotations
│   │   ├── clientController.js      # post events, manage profile
│   │   └── vendorController.js      # view events, send interest, manage profile
│   ├── middleware/
│   │   └── auth.js                  # JWT protect & role authorize
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── client.js
│   │   └── vendor.js
│   ├── seed/adminSeed.js            # Create admin account
│   ├── package.json
│   ├── .env                         # Environment (local copy)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.jsx                 # App router
│   │   ├── api.js                   # Axios instance with JWT
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx        # Shows user role & profile status
│   │   │   ├── Admin.jsx            # Manage users, events, quotations
│   │   │   ├── Client.jsx           # Post events, view assignments
│   │   │   └── Vendor.jsx           # Browse events, send interest
│   │   └── styles/index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── package.json
│   └── .env.example
└── README.md (this file)
```

---

## Authentication Flow

1. **Register** → POST `/api/auth/register` with `role` (client/vendor)
   - Account status: `pending` (awaits admin approval)
   - Token NOT issued yet

2. **Admin approves** → PUT `/api/admin/users/:id` with `action: 'approve'`
   - Account status: `approved`

3. **Login** → POST `/api/auth/login`
   - Returns JWT token (if `status === 'approved'`)
   - Token stored in `localStorage` as `ef_token`

4. **Protected routes** → Include `Authorization: Bearer <token>` header
   - `api.js` automatically adds token to all requests

---

## API Endpoints (Summary)

### Auth
```
POST   /api/auth/register        { name, email, password, role }
POST   /api/auth/login           { email, password }
GET    /api/auth/me              (protected)
```

### Admin (requires admin JWT)
```
GET    /api/admin/users          { query: { q, role } }
PUT    /api/admin/users/:id      { action: 'approve'|'deny' }
GET    /api/admin/events
GET    /api/admin/events/:id
PUT    /api/admin/events/:id     { action: 'approve'|'deny' }
PUT    /api/admin/quotations/:id { action: 'approve'|'deny' }
```

### Client (requires client JWT)
```
POST   /api/client/events        { title, description, date, location }
GET    /api/client/events        (my events)
PUT    /api/client/profile       { name, phone, city, ... }
```

### Vendor (requires vendor JWT)
```
GET    /api/vendor/events        (approved events only)
POST   /api/vendor/interest      { eventId, message }
PUT    /api/vendor/profile       { name, phone, company, ... }
```

---

## User Workflows

### Admin Workflow
1. **Login** with `admin@admin.com` / `admin@admin`
2. **Manage Users** tab
   - Search vendors/clients by name/email
   - Filter by role
   - Approve/deny pending users
3. **Manage Events** tab
   - View all events (pending, approved, denied)
   - Approve/deny events from clients
   - View vendor interests (quotations) on each event
   - Approve/deny vendor quotations → assigns vendor to event

### Client Workflow
1. **Register** as `client` (status: pending)
2. **Admin approves** your account
3. **Login**
4. **Edit Profile** → Add name, phone, city (marks profile complete)
5. **Post Event** → Submit event for admin review
6. **Admin approves event** → Event visible to vendors
7. **View assigned vendors** on your events once admin approves their quotations

### Vendor Workflow
1. **Register** as `vendor` (status: pending)
2. **Admin approves** your account
3. **Login**
4. **Edit Profile** → Add name, phone, company (marks profile complete)
5. **Browse Available Events** → See approved events
6. **Show Interest** → Send quotation/message for an event
7. **Admin approves quotation** → You're assigned to event
8. **Client sees you** on their event detail

---

## How to Use (Step by Step)

### 1. Open Frontend
- Go to `http://localhost:3000` in your browser

### 2. Register Test Accounts
- **Register as Client**
  - Name: John Doe
  - Email: client@test.com
  - Password: test123
  - Role: Client
- **Register as Vendor**
  - Name: ABC Events
  - Email: vendor@test.com
  - Password: test123
  - Role: Vendor

### 3. Admin Approval
- **Login as Admin** (admin@admin.com / admin@admin)
- Go to **Admin Panel** → **Manage Users**
- Approve both accounts

### 4. Client Posts Event
- **Login as Client** (client@test.com)
- Go to **Client Dashboard**
- **Edit Profile** → Add name, phone → Save
- **Post Event** → Fill in event details → Submit
- Status shows `pending`

### 5. Admin Approves Event
- **Login as Admin**
- Go to **Manage Events**
- Find your event → **Approve**

### 6. Vendor Sends Interest
- **Login as Vendor** (vendor@test.com)
- Go to **Vendor Dashboard**
- **Edit Profile** → Add name, phone, company → Save
- **Browse Available Events** → Your event appears
- **Show Interest** → Write a quotation message → Send

### 7. Admin Approves Quotation
- **Login as Admin**
- Go to **Manage Events** → **View Details**
- See vendor's interest under **Vendor Interests**
- **Approve** → Vendor assigned to event

### 8. Client Sees Assigned Vendor
- **Login as Client**
- Go to **My Events**
- Event detail shows **Assigned Vendors** section with vendor info

---

## Environment Variables

### Backend (`.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventforge
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin@admin
```

**MongoDB Requirement**: Ensure MongoDB is running on `localhost:27017` or update `MONGO_URI`.

### Frontend (`.env` — optional)
```
VITE_API_URL=http://localhost:5000/api
```

---

## Commands Reference

### Backend
```powershell
cd backend

# Install dependencies
npm install

# Start dev server (with auto-reload)
npm run dev

# Seed admin user
npm run seed-admin
```

### Frontend
```powershell
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Key Features

✅ **User Roles** — Admin, Client, Vendor with role-based access control
✅ **Registration & Approval** — Admin must approve new accounts
✅ **Profile Management** — Edit and track profile completion status
✅ **Event Lifecycle** — Post → Approve → Vendor Bids → Assign
✅ **Quotation System** — Vendors send interest; admin approves assignment
✅ **Search & Filter** — Admin can search vendors by name/email, filter by role
✅ **JWT Auth** — Secure token-based authentication
✅ **MongoDB** — Persistent data storage
✅ **Responsive UI** — Tailwind CSS for clean, modern design
✅ **Error Handling** — User-friendly error messages

---

## Database Models

### User
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'client' | 'vendor',
  status: 'pending' | 'approved' | 'denied',
  profile: Mixed (name, phone, company, city, etc.),
  profileComplete: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Event
```js
{
  title: String (required),
  description: String,
  date: Date,
  location: String,
  postedBy: ObjectId (ref: User),
  status: 'pending' | 'approved' | 'denied',
  vendorInterests: [ObjectId] (ref: Quotation),
  assignedVendors: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Quotation
```js
{
  vendor: ObjectId (ref: User),
  event: ObjectId (ref: Event),
  message: String,
  status: 'pending' | 'approved' | 'denied',
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is in use:
```powershell
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess | Stop-Process -Force

# Or change PORT in backend/.env and restart
```

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`
- Default: `mongodb://localhost:27017/eventforge`

### Token Invalid / Login Failed
- Clear `localStorage` in browser: Open DevTools → Application → Storage → Clear localStorage
- Re-login

### Frontend Can't Connect to API
- Check backend is running on `http://localhost:5000`
- Verify `VITE_API_URL` in frontend `.env` (or it defaults to `http://localhost:5000/api`)
- Check CORS is enabled (it is in `server.js`)

---

## Next Steps / Enhancements

1. **Add Pagination** — Paginate event and user lists in admin panel
2. **Add File Upload** — Event images, vendor portfolio documents
3. **Add Notifications** — Email/SMS alerts for approvals, bids
4. **Add Ratings** — Rate vendors after event completion
5. **Add Messaging** — Live chat between client and vendor
6. **Add Payment** — Integrate payment gateway for quotations
7. **Add Analytics** — Dashboard stats (total events, vendors, revenue)
8. **Add Tests** — Unit & integration tests (Jest, Supertest)
9. **Deploy** — Docker, Heroku, AWS, or your favorite platform
10. **Security** — Rate limiting, input validation, HTTPS, secure headers

---

## Support

For issues or questions, check:
1. **Backend logs** — Terminal where `npm run dev` is running
2. **Browser console** — Check for API errors
3. **Network tab** — Inspect API requests/responses
4. **MongoDB** — Verify data using MongoDB Compass or CLI

---

**Happy event managing! 🎉**
