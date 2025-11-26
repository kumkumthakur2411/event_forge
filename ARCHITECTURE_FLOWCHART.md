# Event Forge - Visual Flowchart & Architecture

## Event Lifecycle Flowchart

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT LIFECYCLE FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

                          ╔════════════════════════╗
                          ║    CLIENT DASHBOARD    ║
                          ╚════════════════════════╝
                                    │
                                    │ Post Event
                                    ↓
                    ┌─────────────────────────────┐
                    │  CREATE EVENT               │
                    │ status: 'pending'           │
                    │ postedBy: client ID         │
                    └─────────────────────────────┘
                                    │
                                    ↓
                    ┌─────────────────────────────┐
                    │ EVENT IN DB                 │
                    │ vendorInterests: []         │
                    │ assignedVendors: []         │
                    └─────────────────────────────┘
                                    │
                                    ↓
                          ╔════════════════════════╗
                          ║   ADMIN DASHBOARD      ║
                          ║  Manage Events Tab     ║
                          ╚════════════════════════╝
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ↓ APPROVE                       ↓ DENY
        ┌──────────────────────┐    ┌──────────────────────┐
        │ status → 'approved'  │    │ status → 'denied'    │
        │ VISIBLE TO VENDORS   │    │ NOT VISIBLE TO ANY   │
        └──────────────────────┘    └──────────────────────┘
                    │                               │
                    ↓                               ↓
        ┌──────────────────────┐    ┌──────────────────────┐
        │  VENDOR DASHBOARD    │    │   EVENT REJECTED     │
        │  Available Events    │    │   (Cannot proceed)   │
        │  (Approved Only)     │    └──────────────────────┘
        └──────────────────────┘
                    │
                    │ Send Interest
                    ↓
        ┌──────────────────────────────┐
        │  CREATE QUOTATION            │
        │  status: 'pending'           │
        │  vendorStatus: 'none'        │
        │  message: vendor's bid       │
        │  vendor: vendor ID           │
        │  event: event ID             │
        └──────────────────────────────┘
                    │
                    ↓ Added to
        ┌──────────────────────────────┐
        │  event.vendorInterests[]     │
        │  (Vendor ID reference)       │
        └──────────────────────────────┘
                    │
                    ↓
        ┌──────────────────────────────┐
        │   ADMIN REVIEWS              │
        │   Event Details Modal        │
        │   Shows all interested       │
        │   vendors                    │
        └──────────────────────────────┘
                    │
        ┌───────────┴────────────────┐
        │                            │
        ↓ ASSIGN VENDOR             ↓ DENY VENDOR
    ┌────────────────┐          ┌────────────────┐
    │ quotation.     │          │ quotation.     │
    │ status →       │          │ status →       │
    │ 'approved'     │          │ 'denied'       │
    │                │          │                │
    │ vendorStatus→  │          └────────────────┘
    │ 'assigned'     │          (Vendor notified)
    │                │
    │ Add vendor to  │
    │ event.assigned │
    │ Vendors[]      │
    └────────────────┘
            │
            ↓
    ┌────────────────┐
    │  VENDOR SEES   │
    │  In Assigned   │
    │  Events tab    │
    └────────────────┘
            │
            ↓
    ┌────────────────────────┐
    │  PAYMENT TRACKING      │
    │  Admin → Payments Tab  │
    │  Mark vendor paid ✓    │
    │  Mark client paid ✓    │
    └────────────────────────┘
            │
            ↓
    ┌────────────────────────┐
    │  ALL PAID BADGE        │
    │  When complete         │
    └────────────────────────┘
```

---

## Admin Dashboard Component Architecture

```
┌─────────────────────────────────────────────────┐
│              Admin.jsx (312 lines)              │
│          Main Orchestrator Component            │
│                                                  │
│  State: user, activeTab, users, events,         │
│         categories, testimonials, images,       │
│         quotations, stats                       │
└────────┬────────────────────────────────────────┘
         │
         ├─→ Manage Users Tab ──┬──→ AdminUsers.jsx
         │                      │    - User list
         │                      │    - Search/filter
         │                      │    - Detail panels
         │                      └──→ User approval
         │
         ├─→ Manage Events Tab ─┬──→ AdminEvents.jsx ✨ NEW
         │                      │    - Grouped by status
         │                      │    - Approve/deny
         │                      │    - Event editing
         │                      │    - Vendor interests
         │                      └──→ Event deletion
         │
         ├─→ Categories Tab ────┬──→ AdminCategories.jsx
         │                      │    - Add category
         │                      │    - Edit category
         │                      └──→ Delete category
         │
         ├─→ Testimonials Tab ──┬──→ AdminTestimonials.jsx
         │                      │    - View testimonials
         │                      │    - Approve/reject
         │                      └──→ Delete testimonial
         │
         ├─→ Images Tab ────────┬──→ AdminImages.jsx
         │                      │    - Upload images
         │                      │    - View gallery
         │                      └──→ Delete images
         │
         ├─→ Payments Tab ──────┬──→ AdminPayments.jsx ✨ REDESIGNED
         │                      │    - Event-based layout
         │                      │    - Vendor payment status
         │                      │    - Client payment toggle
         │                      └──→ "ALL PAID" badge
         │
         └─→ Settings Tab ──────┬──→ AdminSettings.jsx ✨ NEW
                                │    - Change password
                                │    - Update profile
                                └──→ Upload profile image
```

---

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                   DATABASE RELATIONSHIPS                      │
└──────────────────────────────────────────────────────────────┘

User Collection
├── _id
├── email
├── password (hashed)
├── name
├── role: 'admin' | 'client' | 'vendor'
├── status: 'approved' | 'denied' | 'pending'
├── profileImage
└── categories (for vendors)
         │
         ├─→ Referenced in Event.postedBy ──→ Event Collection
         │                                    ├── _id
         │                                    ├── title
         │                                    ├── description
         │                                    ├── date
         │                                    ├── location
         │                                    ├── postedBy → User._id
         │                                    ├── status: 'pending' | 'approved' | 'denied'
         │                                    ├── vendorInterests → [Quotation._id]
         │                                    └── assignedVendors → [User._id]
         │                                            │
         │                                            └─→ Quotation Collection
         │                                                ├── _id
         │                                                ├── vendor → User._id
         │                                                ├── event → Event._id
         │                                                ├── message
         │                                                ├── status: 'pending' | 'approved' | 'denied'
         │                                                ├── vendorStatus: 'none' | 'assigned' | 'accepted' | 'completed' | 'denied'
         │                                                ├── paid: true | false
         │                                                └── timestamps
         │
         └─→ Referenced in Quotation.vendor

Category Collection
├── _id
├── name
├── description
├── imageUrl
└── altText

Testimonial Collection
├── _id
├── clientName
├── message
├── rating
└── status

WebImage Collection
├── _id
├── imageUrl
├── altText
└── uploadedAt
```

---

## API Request Flow

```
┌──────────────────────────────────────────────────────────────┐
│              FRONTEND → BACKEND REQUEST FLOW                 │
└──────────────────────────────────────────────────────────────┘

ADMIN APPROVES EVENT:
┌────────────────────────┐
│  AdminEvents.jsx       │
│  Click "Approve"       │
└────────────────────────┘
         │
         ↓
    API.put('/admin/events/:id', 
      { action: 'approve' },
      adminToken
    )
         │
         ↓
    ┌────────────────────────┐
    │ admin.js Router        │
    │ PUT /events/:id        │
    └────────────────────────┘
         │
         ↓
    ┌────────────────────────┐
    │ adminController.js     │
    │ approveEvent()         │
    └────────────────────────┘
         │
         ↓
    ┌────────────────────────┐
    │ Event.findById(id)     │
    │ event.status =         │
    │ 'approved'             │
    │ event.save()           │
    └────────────────────────┘
         │
         ↓
    ┌────────────────────────┐
    │ Response:              │
    │ { message:             │
    │   "Event approved"  }  │
    └────────────────────────┘
         │
         ↓
    ┌────────────────────────┐
    │ AdminEvents.jsx        │
    │ setMsg('Event...')     │
    │ loadEvents()           │
    │ closeModal()           │
    └────────────────────────┘
         │
         ↓
    Event visible to vendors ✓
```

---

## Event Status State Machine

```
                    ┌──────────────┐
                    │   CREATED    │
                    │ status:null  │
                    └──────┬───────┘
                           │
                           │ Admin Action
                           ↓
                ┌──────────────────────┐
                │  DATABASE PERSISTS   │
                │  status: 'pending'   │
                └──────┬──────────┬────┘
                       │          │
           ┌───────────┘          └──────────┐
           │                                  │
     Admin Approves                    Admin Denies
           │                                  │
           ↓                                  ↓
    ┌─────────────────┐             ┌────────────────┐
    │ 'approved'      │             │ 'denied'       │
    │ EVENT VISIBLE   │             │ NOT VISIBLE    │
    │ TO VENDORS      │             │ TO VENDORS     │
    └────────┬────────┘             └────────────────┘
             │
             │ Vendor sends interest
             ↓
    ┌─────────────────────────┐
    │ Quotation created       │
    │ status: 'pending'       │
    │ vendorStatus: 'none'    │
    └────────┬────────────────┘
             │
             │ Admin assigns vendor
             ↓
    ┌─────────────────────────┐
    │ quotation.status →      │
    │ 'approved'              │
    │ vendorStatus → 'assigned'
    └─────────────────────────┘
             │
             │ Vendor completes work
             ↓
    ┌─────────────────────────┐
    │ vendorStatus →          │
    │ 'accepted' | 'completed'│
    └─────────────────────────┘
             │
             │ Admin marks vendor paid
             ↓
    ┌─────────────────────────┐
    │ quotation.paid = true   │
    │ Payment tracked ✓       │
    └─────────────────────────┘
```

---

## Component Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   DATA FLOW DIAGRAM                          │
└─────────────────────────────────────────────────────────────┘

Admin.jsx (Orchestrator)
│
├─→ loadEvents() 
│   └─→ GET /admin/events
│       └─→ events: [Event, Event, ...]
│
├─→ Pass to AdminEvents.jsx
│   ├─→ events prop
│   ├─→ setMsg callback
│   └─→ loadEvents callback
│
├─→ AdminEvents.jsx renders
│   ├─→ Separate by status
│   │   ├─→ pendingEvents = events.filter(s: 'pending')
│   │   ├─→ approvedEvents = events.filter(s: 'approved')
│   │   └─→ deniedEvents = events.filter(s: 'denied')
│   │
│   ├─→ Show event cards
│   │   ├─→ Title, location, date
│   │   ├─→ Posted by
│   │   ├─→ Vendor count
│   │   └─→ "View Details" button
│   │
│   └─→ Event details modal
│       ├─→ Approve/deny buttons (if pending)
│       ├─→ Edit form
│       │   ├─→ PUT /admin/events/:id (details)
│       │   └─→ PATCH /admin/events/:id (update)
│       │
│       └─→ Vendor interests list
│           ├─→ GET from event.vendorInterests[]
│           ├─→ Show vendor details
│           ├─→ "Assign" button
│           │   └─→ PUT /admin/quotations/:id
│           │       { action: 'approve' }
│           │
│           └─→ "Deny" button
│               └─→ PUT /admin/quotations/:id
│                   { action: 'deny' }
```

---

## Status Badge Color Coding

```
┌──────────────────────────────────────────┐
│        STATUS VISUAL INDICATORS          │
└──────────────────────────────────────────┘

EVENT STATUS:
├─ 🟨 PENDING (Yellow)
│  └─ Awaiting admin approval
│
├─ 🟩 APPROVED (Green)
│  └─ Visible to vendors
│
└─ 🟥 DENIED (Red)
   └─ Rejected, not visible

QUOTATION STATUS:
├─ ⚪ PENDING
│  └─ Waiting for admin review
│
├─ 🟩 APPROVED
│  └─ Vendor assigned to event
│
└─ 🟥 DENIED
   └─ Vendor rejected

PAYMENT STATUS:
├─ 🔴 UNPAID
│  └─ Payment not received
│
├─ 🟢 PAID
│  └─ Payment received
│
└─ 🏆 ALL PAID
   └─ All vendors and client paid
```

---

## Quick Reference

### For Admins
1. Login → Admin Dashboard
2. Go to "Manage Events"
3. Review pending events
4. Approve events to show vendors
5. View interested vendors
6. Assign vendors to events
7. Track payments in "Payments" tab

### For Clients
1. Login → Client Dashboard
2. Click "Post Event"
3. Fill event details
4. Submit
5. Wait for admin approval
6. Check status in dashboard

### For Vendors
1. Login → Vendor Dashboard
2. Browse "Available Events"
3. Find interesting event
4. Click "Send Interest"
5. Enter quotation message
6. Wait for admin to assign
7. Start working on event

