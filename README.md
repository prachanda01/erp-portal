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

---
#LIVE DEMO:
frontend :https://erpportal-ten.vercel.app/login
backend  :https://erp-portal-pqpl.onrender.com
## 🔑 Pre-configured Demo Accounts

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@minierp.com` | `Admin123!` | Full superuser access, user management, audit logs, and record deletion |
| **Sales Exec** | `sales@minierp.com` | `Sales123!` | Manage customer CRM, log follow-up notes, and create sales challans |
| **Warehouse Lead** | `warehouse@minierp.com` | `Warehouse123!` | Manage product catalog, minimum stock alerts, and manual stock adjustments |
| **Accounts Manager** | `accounts@minierp.com` | `Accounts123!` | View financial summaries, inspect audit logs, and export reports |

---

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

## 📄 Submission Documentation

As requested by the Case Study PDF, below is the required documentation for setup, environment variables, local execution, deployment, and assumptions.

### 1. How the server was set up
The backend server is built using **Node.js** and **Express.js** with **TypeScript**.
- **Architecture**: It uses a layered controller-service-route architecture for separation of concerns.
- **Database ORM**: **Prisma** is used to manage the database schema. Local development uses **SQLite** for zero-configuration, while production uses **PostgreSQL**.
- **Authentication**: JWT is used for stateless authentication. Passwords are encrypted using `bcryptjs`.
- **Validation**: All incoming API requests are validated using **Zod** middleware to prevent bad data.
- **Docker**: The entire stack (Frontend, Backend, PostgreSQL) is containerized via `Dockerfile` and orchestrated via `docker-compose.yml`.

### 2. How environment variables are managed
Environment variables are managed using `.env` files locally and cloud dashboards (Vercel/Render) in production. `.env.example` files are provided in both directories.

**Backend (`backend/.env`)** requires:
- `PORT`: Port the server runs on (e.g., 5000).
- `NODE_ENV`: `development` or `production`.
- `DATABASE_URL`: Connection string to PostgreSQL or SQLite.
- `JWT_SECRET` / `JWT_EXPIRES_IN`: Secrets and timings for Access tokens.
- `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN`: Secrets and timings for Refresh tokens.
- `CORS_ORIGIN`: Allowed frontend origin (e.g., `http://localhost:5173`).

**Frontend (`frontend/.env`)** requires:
- `VITE_API_BASE_URL`: URL to the backend REST API (e.g., `http://localhost:5000/api`).

### 3. How to run the project locally
You can run the project locally using two methods: Standard Node.js OR Docker.

**Method A: Standard Node.js (Requires Node v18+)**
1. **Backend**:
   - `cd backend`
   - `npm install`
   - `npx prisma generate` (Generates Prisma Client)
   - `npx prisma db push` (Pushes schema to local SQLite)
   - `npm run prisma:seed` (Seeds enterprise sample data)
   - `npm run dev` (Starts backend on port 5000)
2. **Frontend**:
   - Open a second terminal window
   - `cd frontend`
   - `npm install`
   - `npm run dev` (Starts frontend on port 5173)

**Method B: Docker Compose (Requires Docker)**
- From the root directory, simply run:
  `docker-compose up --build -d`
- Access Frontend on `http://localhost:80` and Backend API on `http://localhost:5000`.

### 4. How to deploy the project
The repository includes configuration files for free cloud deployment:

**Deploy Frontend to Vercel**:
1. Push repository to GitHub.
2. Go to Vercel, Import project, choose `frontend` as Root Directory.
3. Framework Preset: Vite.
4. Set Environment Variable: `VITE_API_BASE_URL` to your live backend URL.
5. Click **Deploy**. (The `vercel.json` file handles client-side routing fallback).

**Deploy Backend to Render**:
1. Push repository to GitHub.
2. Go to Render Dashboard, click **New Blueprint**, and connect your repo.
3. Render automatically detects the `render.yaml` file in the root.
4. It will instantly provision a PostgreSQL database and deploy the Node.js Web Service automatically, setting up the necessary Database URLs internally.

### 5. Any assumptions made
1. **Multi-Warehouse Support:** The requirements mentioned "Location/warehouse". I assumed it would be best to create a dedicated `Warehouse` database model rather than a raw string, to allow for scalable multi-location inventory.
2. **Soft Deletions:** Rather than permanently deleting critical records (like Customers or Products), the system utilizes `isActive` soft-deletes to preserve relational integrity for historical Sales Challans and Audit Logs.
3. **Database Selection:** For a seamless local reviewer experience without forcing the reviewer to install PostgreSQL locally, the system uses SQLite by default via `schema.prisma`. However, for production deployment, a robust PostgreSQL schema (`schema.postgres.prisma`) is provided and configured via `render.yaml` and `docker-compose.yml`.
4. **Challan Validation:** It is assumed that stock levels cannot go into negative values. If a Draft Challan is confirmed and the stock is insufficient, the transaction rolls back and returns a 400 error.

---

## 🔌 API Documentation
A Postman collection is located at `backend/postman_collection.json`. When the backend runs locally, interactive Swagger OpenAPI documentation is available at `http://localhost:5000/api-docs`.
