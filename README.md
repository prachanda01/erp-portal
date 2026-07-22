# NexusERP Operations Suite

A production-grade, enterprise web application built for modern wholesale, distribution, and manufacturing businesses to unify customer relationships (CRM), manage warehouse stock, track stock movements with immutable audit trails, process sales challans with automatic inventory deduction, export reporting data to CSV, and enforce granular role-based access control (RBAC).

---

## 🌟 Project Overview

**NexusERP Operations Suite** transforms legacy ERP operations into a sleek, real-time management experience. Built with a decoupled TypeScript architecture (Express REST API backend and React + Vite + Tailwind CSS frontend), NexusERP offers robust data integrity, modern UI/UX aesthetics, client-side CSV exports, and complete audit logging for enterprise compliance.

---

## ✨ Key Features

### 🏢 Customer CRM Directory
- Track wholesale, distributor, and retail client profiles.
- Store GST numbers, contact info, billing/shipping addresses, and customer notes.
- Log interaction follow-up notes with scheduled next follow-up dates.

### 📦 Product Master & Inventory Management
- Product catalog management with SKU identifiers, categories, wholesale unit pricing, tags, and minimum stock threshold triggers.
- Multi-warehouse inventory tracking across Central Distribution Hubs and Regional Depots.
- Low stock alert notifications and filter toggles.

### 🔄 Immutable Stock Movement Logs
- Track every stock addition (`IN`) and dispatch (`OUT`) with audit timestamps and user attribution.
- Manual stock adjustment modal with audit reason tracking.

### 📜 Sales Challans & Automated Dispatch
- Create draft sales challans with item snapshots and automatic grand total calculation.
- **Confirmation Flow**: Confirming a draft sales challan automatically deducts stock from inventory and logs stock movement audit trails.
- **Cancellation Flow**: Cancelling a confirmed sales challan automatically restores stock levels.

### 📊 Client-Side CSV Export
- Instant CSV export buttons integrated on Customers, Products, Inventory, Sales Challans, and Audit Log tables.
- Exports only currently filtered/displayed rows with escaped CSV formatting.

### 🛡️ Role-Based Security & Audit Trails
- RBAC with four pre-configured roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.
- JWT access tokens (15-minute validity) & DB-backed revocable refresh tokens (7-day validity).
- Comprehensive system audit logs for critical entity changes and security events.


## 🛠️ Tech Stack

### Backend
- **Core**: Node.js, Express, TypeScript (`tsx`)
- **ORM & Database**: Prisma ORM (SQLite for local dev, PostgreSQL for production)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Validation**: Zod schema validation
- **Documentation**: Swagger UI OpenAPI 3.0 (`swagger-ui-express`)

### Frontend
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **State Management**: `@tanstack/react-query` (TanStack Query v5)
- **Routing**: React Router DOM v6
- **Form Management**: React Hook Form with `@hookform/resolvers/zod`

---

## 📄 links :

### 1. GitHub repository link
[https://github.com/prachanda01/erp-portal](https://github.com/prachanda01/erp-portal)

### 2. Live frontend URL
[https://erpportal-ten.vercel.app](https://erpportal-ten.vercel.app)

### 3. Live backend API URL
[https://erp-portal-pqpl.onrender.com](https://erp-portal-pqpl.onrender.com)

### 4. Test login credentials for all roles
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@minierp.com` | `Admin123!` |
| **Sales** | `sales@minierp.com` | `Sales123!` |
| **Warehouse** | `warehouse@minierp.com` | `Warehouse123!` |
| **Accounts** | `accounts@minierp.com` | `Accounts123!` |

### 5. Postman collection or API documentation
- **Live Swagger UI**: [https://erp-portal-pqpl.onrender.com/api-docs](https://erp-portal-pqpl.onrender.com/api-docs)
- **Postman Collection**: Located in the repository at `backend/postman_collection.json`.

### 6.setup and deployment instructions
#### Local Setup (Standard Node.js)
1. **Backend**:
   - `cd backend`
   - `npm install`
   - `npx prisma generate`
   - `npx prisma db push` (Uses local SQLite for zero config)
   - `npm run prisma:seed`
   - `npm run dev`
2. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

#### Local Setup (Docker)
- From the root directory: `docker-compose up --build -d`
- Access Frontend on `http://localhost:80` and Backend API on `http://localhost:5000`.

#### Environment Variables
- `backend/.env.example` and `frontend/.env.example` are provided.
- Backend requires: `PORT`, `NODE_ENV`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`.
- Frontend requires: `VITE_API_BASE_URL`.

#### Deployment Instructions
- **Frontend (Vercel)**: Import `frontend` directory, set Framework to Vite, add `VITE_API_BASE_URL` pointing to the backend.
- **Backend (Render)**: Connect repo, Render automatically uses `render.yaml` Blueprint to provision the Node.js Web Service and PostgreSQL database.

### 7. Short explanation of architecture
- **Backend**: Node.js & Express.js with TypeScript using a layered controller-service-route architecture. Validates requests via Zod. Uses Prisma ORM to interact with a PostgreSQL database in production (or SQLite locally).
- **Frontend**: React 18 & TypeScript with Vite. Uses Tailwind CSS for styling, React Router DOM for navigation, and TanStack Query (React Query) for state management and API caching.
- **Authentication**: Stateless JWT access tokens paired with database-backed refresh tokens and bcrypt password hashing.

### 8. Known limitations or incomplete parts
- **Multi-Warehouse Logic**: Currently simplified. Advanced stock transfers between individual warehouses are partially implemented.
- **Invoice PDF Export**: The system supports client-side CSV exports for reporting, but PDF generation for Invoices (listed as a bonus point) is incomplete.
- **AWS S3 Uploads**: Image uploads for products are not yet implemented.

