# Event Forge — Frontend

Frontend built with React (Vite) and Tailwind CSS.

## Quick start

1. Install dependencies:

```powershell
cd frontend; npm install
```

2. Start dev server:

```powershell
npm run dev
```

The app will be available at `http://localhost:3000`.

## Features

- **Register/Login**: Register as `client` or `vendor` (pending admin approval); login with approved account.
- **Admin Panel**: Approve/deny users, events, and vendor quotations. Search vendors by name/email.
- **Client Dashboard**: Post events, manage profile, view assigned vendors.
- **Vendor Dashboard**: View approved events, send quotations, manage profile.

## Environment

Optional `.env` file (copy from `.env.example`):
- `VITE_API_URL` — Backend API base (default: `http://localhost:5000/api`)
