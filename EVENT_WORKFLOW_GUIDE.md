# Event Workflow Guide - Complete Flow

## Overview
This document describes the complete event lifecycle in Event Forge, from client posting through vendor assignment and payment tracking.

---

## Event Lifecycle States

### Event Status Flow
```
Client Posts Event
       ↓
    PENDING (awaiting admin approval)
       ├─→ APPROVED (visible to vendors)
       │      ├─→ Vendors show interest (create quotations)
       │      ├─→ Admin reviews interested vendors
       │      ├─→ Admin assigns vendor (quotation status = approved)
       │      └─→ Payment tracking begins
       │
       └─→ DENIED (not shown to vendors, client notified)
```

---

## Step-by-Step Workflow

### 1. Client Posts Event
**Location:** Client Dashboard / Post Event Form
**Action:** Client fills form (title, description, date, location, category)

**What happens:**
- Event created in database with `status: 'pending'`
- Event NOT visible to any vendors yet
- Admin sees event in "Manage Events" tab under "Pending Approval"

**Database:** `Event` model
- `title`, `description`, `date`, `location`
- `postedBy`: Reference to Client User
- `status`: 'pending'
- `vendorInterests`: Empty array
- `assignedVendors`: Empty array

---

### 2. Admin Reviews Pending Event
**Location:** Admin Dashboard → Manage Events tab
**Display:** "⏳ Pending Approval" section with event cards

**Event Card Shows:**
- Event title, location, date
- Posted by (client name/email)
- Number of vendors interested (starts at 0)
- Yellow status badge: "PENDING"
- "View Details" button

**Admin Actions Available:**
1. **View Details** - Opens modal with full event information
2. **Approve Event** - Makes event visible to vendors
3. **Deny Event** - Hides event from vendors permanently
4. **Edit Event Details** - Modify title, description, date, location
5. **Delete Event** - Remove event entirely from system

---

### 3. Admin Approves Event
**Location:** Admin Events Details Modal
**Action:** Click "✓ Approve Event" button

**What happens:**
- Event `status` changes from 'pending' → 'approved'
- Event now visible to ALL vendors in their dashboard
- Event moves to "✓ Approved Events" section in admin panel
- Status badge changes to green

**Backend:** `PUT /admin/events/:id` with `{ action: 'approve' }`

---

### 4. Vendors View Approved Events
**Location:** Vendor Dashboard → Available Events
**Filter:** Only events with `status: 'approved'` are shown

**Vendor Dashboard Shows:**
- Approved event cards with details
- "Send Interest" button per event
- Previous interests/quotations marked

---

### 5. Vendor Sends Interest
**Location:** Vendor Dashboard
**Action:** Click "Send Interest" → Fill form with quotation message

**What happens:**
- **Quotation created** with:
  - `vendor`: Reference to Vendor User
  - `event`: Reference to Event
  - `status`: 'pending' (waiting for admin approval)
  - `vendorStatus`: 'none' (not yet assigned)
  - `message`: Vendor's quotation message
  - `paid`: false

- Event `vendorInterests[]` array updated to include quotation ID
- Quotation visible in admin event details
- Event now shows "+1" interested vendors

---

### 6. Admin Reviews Interested Vendors
**Location:** Admin Events Details Modal → "📋 Vendors Interested" section
**Display:** Expandable section showing all vendors who sent interest

**For Each Vendor Shows:**
- Vendor name/email
- Quotation message
- Current status badge (pending/assigned/etc)
- Buttons: "Assign" (if pending) OR "✓ ASSIGNED" (if approved)

**Admin Can:**
1. **Assign Vendor** - Approve this vendor for the event
   - Changes quotation `status`: 'approved'
   - Sets `vendorStatus`: 'assigned'
   - Adds vendor to event `assignedVendors[]` array
   - Vendor now sees event in "Assigned Events" on their dashboard

2. **Deny Vendor** - Reject this vendor's interest
   - Changes quotation `status`: 'denied'
   - Vendor notified that their interest was rejected
   - Event still visible to vendor but marked as rejected

---

### 7. Payment Tracking (Per Vendor, Per Event)
**Location:** Admin Dashboard → Payments tab
**View:** Event-centric payment dashboard

**Payments Tab Shows:**
- Event cards grouped by event
- For each event:
  - **Client Payment Status:** Toggle button (paid/unpaid)
  - **Vendor Payment Status:** Table showing:
    - All assigned vendors for that event
    - Each vendor's payment status (paid/unpaid) with color indicators
    - Buttons to mark paid/unpaid
  - **"ALL PAID" Badge:** Shows when all vendors paid for that event

**Payment Workflow:**
1. Vendor assigned to event → Payment tracking begins
2. Admin marks vendor as paid once payment received
3. Admin marks client as paid once client pays
4. When all vendors paid for event → "ALL PAID" badge appears

**Database Updates:**
- `Quotation.paid`: Boolean (true when vendor paid)
- Track client payment separately (stored in event or separate collection)

---

### 8. After Assignment - Vendor Workflow
**Vendor Actions After Assignment:**
1. View assigned event details
2. Upload event materials (photos, designs, etc)
3. Edit quotation details if needed
4. Send invoices/documents
5. Mark event as completed when done

---

## Admin Event Management Features

### Manage Events Tab Sections

#### 1. ⏳ Pending Approval Section
- Events awaiting admin decision
- Can: Approve, Deny, Edit, Delete
- Not visible to vendors

#### 2. ✓ Approved Events Section
- Events visible to vendors
- Can: Edit details, View vendor interests, Reassign vendors
- Shows how many vendors interested

#### 3. ✗ Denied Events Section
- Events rejected by admin
- Not visible to vendors
- Can still be edited/deleted if admin changes mind

---

## Key API Endpoints

### Event Management
- `GET /admin/events` - Get all events
- `GET /admin/events/:id` - Get single event with vendor interests
- `PUT /admin/events/:id` - Update event status (approve/deny)
- `PATCH /admin/events/:id` - Update event details
- `DELETE /admin/events/:id` - Delete event

### Quotation/Vendor Management
- `PUT /admin/quotations/:id` - Approve/deny vendor
- `PUT /admin/quotations/:id/mark-paid` - Mark vendor as paid
- `PUT /admin/quotations/:id/mark-unpaid` - Mark vendor as unpaid

### Client Events
- `POST /client/events` - Client posts new event (creates with status='pending')
- `GET /client/events` - Client views their events

### Vendor Events
- `GET /vendor/events` - Vendor sees approved events only
- `POST /vendor/interest` - Vendor sends interest (creates quotation)

---

## UI Component Structure

### Admin.jsx (Orchestrator)
- Manages all admin state
- Passes data to child components
- Loads events on mount

### AdminEvents.jsx (Event Management)
- Displays events grouped by status
- Manages approve/deny/edit workflows
- Shows vendor interests in modal
- Handles event editing

### AdminPayments.jsx (Payment Tracking)
- Events layout with payment tracking
- Client payment toggles
- Vendor payment indicators
- Mark paid/unpaid buttons

---

## Common Workflows

### Workflow 1: Quick Approval
1. Client posts event
2. Admin sees in "Pending" section
3. Admin clicks "Approve Event"
4. Event immediately visible to vendors
5. Vendors can send interest

### Workflow 2: Vendor Assignment
1. Vendor sends interest
2. Admin reviews vendors in event details
3. Admin clicks "Assign" for selected vendor
4. Vendor sees event in assigned list
5. Vendor can work on event
6. Admin marks vendor as paid when done

### Workflow 3: Full Payment Cycle
1. Admin approves vendors
2. Admin tracks payments in Payments tab
3. Admin marks vendor as paid once payment received
4. Admin marks client as paid once client pays
5. Event complete when "ALL PAID"

---

## Error Handling

### Event Not Found
- If event deleted while admin viewing: Modal closes, error shown
- If event status changed elsewhere: Data refreshes automatically

### Vendor Interest Issues
- If vendor denies quotation: Can still send new interest
- If admin denies vendor: Vendor sees rejection, can try another event

### Payment Tracking
- Can mark paid/unpaid multiple times (no restrictions)
- Useful if payment arrangement changes

---

## Testing Checklist

- [ ] Client can post event (creates with status='pending')
- [ ] Event appears in admin "Pending Approval"
- [ ] Admin can approve event (changes to status='approved')
- [ ] Vendor sees approved event in dashboard
- [ ] Vendor can send interest (creates quotation)
- [ ] Admin sees vendor interest in event details
- [ ] Admin can assign vendor (updates quotation status & vendorStatus)
- [ ] Vendor sees event in "Assigned Events"
- [ ] Admin can mark vendor as paid
- [ ] Admin can mark client as paid
- [ ] "ALL PAID" badge shows when all paid
- [ ] Admin can deny event (not visible to vendors)
- [ ] Admin can edit event details
- [ ] Admin can delete event

---

## Notes

- All status changes are real-time (no polling needed)
- Vendor can send interest multiple times (creates separate quotations)
- Once vendor assigned, other vendors' interests still visible in admin
- Events in all statuses can be edited/deleted by admin
- Payment tracking independent of vendor assignment

