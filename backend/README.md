# Event Forge — Backend

Backend built with Node.js, Express and MongoDB.

Quick start

1. Copy `.env.example` to `.env` and set values.
2. Install dependencies:

```powershell
cd backend; npm install
```

3. Seed admin user:

```powershell
npm run seed-admin
```

Default admin credentials (from `.env.example` if not overridden):
- email: `admin@admin.com`
- password: `admin@admin`

4. Start server:

```powershell
npm run dev
```

Endpoints
- `POST /api/auth/register` { name, email, password, role } — role: `client` or `vendor`
- `POST /api/auth/login` { email, password }
- Admin: protected endpoints under `/api/admin` (requires admin JWT)
- Client: `/api/client/*`
- Vendor: `/api/vendor/*`
