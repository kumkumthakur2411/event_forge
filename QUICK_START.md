# 🚀 Event Forge - System Status & Quick Reference

## ✅ Current Status: FULLY OPERATIONAL

```
┌─────────────────────────────────────────────────────────────┐
│ BACKEND SERVER                                              │
├─────────────────────────────────────────────────────────────┤
│ Status:    ✅ Running                                        │
│ URL:       http://localhost:5000                            │
│ Framework: Express.js + Node.js                             │
│ Database:  MongoDB (connected)                              │
│ Port:      5000                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FRONTEND SERVER                                             │
├─────────────────────────────────────────────────────────────┤
│ Status:    ✅ Running                                        │
│ URL:       http://localhost:3000                            │
│ Framework: Vite + React 18                                  │
│ Styling:   Tailwind CSS                                     │
│ Port:      3000                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Test Accounts Ready

### Admin Account (Pre-seeded)
- **Email:** `admin@admin.com`
- **Password:** `admin@admin`
- **Role:** Admin
- **Status:** Approved ✅

### Test Client Account (Create via Register)
- **Email:** `client@test.com`
- **Password:** `test123`
- **Role:** Client
- **Needs:** Admin approval after registration

### Test Vendor Account (Create via Register)
- **Email:** `vendor@test.com`
- **Password:** `test123`
- **Role:** Vendor
- **Needs:** Admin approval after registration

## 📍 Quick Links

| Feature | URL | Access |
|---------|-----|--------|
| Login | `http://localhost:3000/login` | Public |
| Register | `http://localhost:3000/register` | Public |
| Dashboard | `http://localhost:3000/` | Protected (Login required) |
| Admin Panel | `http://localhost:3000/admin` | Admin only |
| Client Dashboard | `http://localhost:3000/client` | Client only |
| Vendor Dashboard | `http://localhost:3000/vendor` | Vendor only |

## 🔄 Complete User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. REGISTRATION                                             │
├─────────────────────────────────────────────────────────────┤
│ Client/Vendor registers → Status: PENDING                   │
│ Token: NOT issued yet                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ADMIN APPROVAL                                           │
├─────────────────────────────────────────────────────────────┤
│ Admin reviews & approves user → Status: APPROVED ✅          │
│ User can now login                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. LOGIN & PROFILE SETUP                                    │
├─────────────────────────────────────────────────────────────┤
│ User logs in → Gets JWT token                               │
│ User edits profile → Marks profile complete                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌───────────────────┐                  ┌────────────────────┐
│ CLIENT FLOW       │                  │ VENDOR FLOW        │
├───────────────────┤                  ├────────────────────┤
│ 1. Post Event     │                  │ 1. Browse Events   │
│    (pending)      │                  │    (approved only) │
│                   │                  │                    │
│ 2. Admin approves │                  │ 2. Send Interest   │
│    event          │                  │    (quotation)     │
│                   │                  │                    │
│ 3. See vendors on │◄─────approval──►│ 3. Get assigned to │
│    event detail   │    (admin)       │    event by admin  │
└───────────────────┘                  └────────────────────┘
```

## 📊 Database Schema Overview

```
User Collection
├── Admin (1)
│   ├── Email: admin@admin.com
│   ├── Status: approved
│   └── Role: admin
│
├── Clients (many)
│   ├── Role: client
│   ├── Status: pending|approved|denied
│   └── Profile: { name, phone, city, ... }
│
└── Vendors (many)
    ├── Role: vendor
    ├── Status: pending|approved|denied
    └── Profile: { name, phone, company, ... }

Event Collection
├── Title, Description, Date, Location
├── Posted By: ref(User - client)
├── Status: pending|approved|denied
├── Vendor Interests: [ref(Quotation)]
└── Assigned Vendors: [ref(User - vendor)]

Quotation Collection
├── Vendor: ref(User - vendor)
├── Event: ref(Event)
├── Message: String
└── Status: pending|approved|denied
```

## 🎯 Admin Panel Features

### Users Management
- ✅ View all users (clients & vendors)
- ✅ Filter by role
- ✅ Search by name/email
- ✅ Approve/Deny accounts
- ✅ Track profile completion status

### Events Management
- ✅ View all events with details
- ✅ View who posted each event
- ✅ Approve/Deny events
- ✅ View vendor interest for each event
- ✅ Approve/Deny vendor quotations
- ✅ See assigned vendors

## 🎯 Client Features

### Profile Management
- ✅ Edit profile (name, phone, city)
- ✅ Track profile completion status

### Event Management
- ✅ Post new events
- ✅ View posted events
- ✅ See event status (pending/approved/denied)
- ✅ View assigned vendors for each event
- ✅ View vendor contact details

## 🎯 Vendor Features

### Profile Management
- ✅ Edit profile (name, phone, company)
- ✅ Track profile completion status

### Event Management
- ✅ Browse approved events from clients
- ✅ Send interest/quotation for events
- ✅ Track quotation status
- ✅ Get assigned to events (admin approval)

## 🔒 Security Features

- ✅ Password hashing (bcryptjs)
- ✅ JWT token-based auth
- ✅ Role-based access control (RBAC)
- ✅ Protected API endpoints
- ✅ Token expiry (7 days)
- ✅ Secure password validation

## 📦 Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | React 18 | UI library |
| | Vite 5 | Build tool & dev server |
| | Tailwind CSS | Styling |
| | Axios | HTTP client |
| | React Router | Navigation |
| Backend | Node.js | Runtime |
| | Express 4 | Web framework |
| | MongoDB | Database |
| | Mongoose | ODM |
| | JWT | Authentication |
| | bcryptjs | Password hashing |
| Deployment Ready | - | Can be dockerized & deployed |

## 🚀 Deployment Checklist

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Update `MONGO_URI` to production database
- [ ] Set proper CORS origins
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Add logging & monitoring
- [ ] Set up CI/CD pipeline
- [ ] Configure environment variables on hosting
- [ ] Test all user flows

## 📝 API Response Examples

### Login Successful
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "client",
    "profileComplete": true
  }
}
```

### Event Posted
```json
{
  "message": "Event submitted for admin approval",
  "event": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Wedding Reception",
    "description": "Grand wedding event",
    "date": "2025-12-25",
    "location": "Hotel Grand",
    "postedBy": "507f1f77bcf86cd799439011",
    "status": "pending",
    "createdAt": "2025-11-12T18:00:00Z"
  }
}
```

### Vendor Interest Sent
```json
{
  "message": "Interest sent to admin for approval",
  "quotation": {
    "_id": "507f1f77bcf86cd799439013",
    "vendor": "507f1f77bcf86cd799439014",
    "event": "507f1f77bcf86cd799439012",
    "message": "We can provide excellent catering services",
    "status": "pending",
    "createdAt": "2025-11-12T18:05:00Z"
  }
}
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Kill process or change PORT in `.env` |
| MongoDB not connecting | Start MongoDB: `mongod` |
| Token expired | Clear localStorage & re-login |
| API 401 Unauthorized | Check token in localStorage, re-login |
| Account not approved | Wait for admin to approve via Admin Panel |
| Profile incomplete | Edit profile & save from dashboard |

## 📞 Support Resources

- **Backend Logs:** Check terminal where backend is running
- **Browser Console:** Check for frontend errors (F12)
- **Network Tab:** Inspect API calls and responses
- **MongoDB Compass:** Visual database browser
- **Postman:** Test API endpoints directly

---

**Everything is ready! Open `http://localhost:3000` and start managing events! 🎉**
