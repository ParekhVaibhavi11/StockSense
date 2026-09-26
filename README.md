# StockSense 📦

> **Modular Inventory Management System for modern, centralized stock operations.**

StockSense is a web-based **Inventory Management System (IMS)** developed for the **Odoo Hackathon**. It centralizes products, multi-warehouse hierarchy, vendor suppliers, receipts, deliveries, internal transfers, stock adjustments, profile management, and immutable stock movement history into a single platform.

The goal is to replace manual registers, Excel sheets, and scattered inventory tracking with a **structured, reliable, double-entry transactional inventory app**.

---

## 🎯 Problem Statement

Traditional inventory management often relies on manual records and spreadsheets, which can result in:

* Stock mismatches & negative stock balances
* Manual calculation errors
* Delayed stock updates
* Difficulty tracking stock movement across multiple racks & locations
* Poor visibility across suppliers, warehouses, and locations

**StockSense** provides a centralized workflow where every stock operation is validated, transactionally processed (`BEGIN`/`COMMIT`/`ROLLBACK`), and immutably recorded in the inventory ledger with strict PostgreSQL constraints (`CHECK (quantity >= 0)`).

---

## ✨ Core Features

### 🔐 Authentication & Profile Management

* **Public User Registration**: Locked strictly to **Warehouse Staff** role (Manager/Admin accounts are seeded manually in database setup).
* **Email OTP Verification**: 6-digit verification code dispatch via Nodemailer with dev terminal console logging fallback.
* **OTP-Based Password Reset**: Interactive 6-digit OTP password recovery workflow.
* **Profile & Account Management**: Users can update their Name, Email, and change their Account Password.
* **JWT & Role-Based Access Control**: Route authorization for `inventory_manager` vs `warehouse_staff`.

### 📊 Inventory Dashboard (Shiprocket-Inspired UI)

* 5 KPI Summary Boxes in 1 horizontal line (*Total Products in Stock, Low Stock / Out of Stock Items, Pending Receipts, Pending Deliveries, Scheduled Internal Transfers*).
* Low Stock Warning Alert Banners highlighting products below `min_reorder_qty`.
* **Dynamic Filters** by:
  * Document type (*Receipts, Delivery, Internal, Adjustments*)
  * Status (*Draft, Waiting, Ready, Done, Canceled*)
  * Warehouse / Location
  * Product Category

### 📦 Product Management & Stock Availability

* Create and update products (*Name, SKU/Code, Category, Unit of Measure, Min Reorder Threshold, Initial Stock*).
* Global SKU & Product search.
* **Per-Location Stock Breakdown Modal**: Displays on-hand quantity per internal location (*e.g., Main Store: 150 kg, Production Floor: 40 kg*).

### 🚚 Inventory Operations Engine

* **Receipts (Incoming Stock)**: Record incoming vendor goods with **mandatory Supplier selection**. Validation automatically increases stock.
* **Delivery Orders (Outgoing Stock)**: Pick, pack, and validate customer shipments. Validation automatically verifies stock sufficiency and decreases stock.
* **Internal Transfers**: Move stock between warehouses or racks (*Main Store $\rightarrow$ Production Floor*).
* **Inventory Adjustments**: Compare physical and recorded stock, reconciling mismatches with automatic ledger entries.
* **Atomic Validation**: Status transitions (`Draft` $\rightarrow$ `Waiting` $\rightarrow$ `Ready` $\rightarrow$ `Done`) with single-service transaction execution.

### 🏭 Supplier Directory

* Vendor database management (*Name, Email, Phone, Address*).
* Enforced supplier selection for incoming stock Receipts.

### 🏢 Warehouse & Settings (`Setting -> Warehouse`)

* Multi-warehouse & rack location hierarchy (*Main Warehouse, Production Floor, Storage Racks, Virtual Vendor/Customer/Loss Locations*).
* Default warehouse configuration (Default Receipt destination, Delivery dispatch source, Loss location).

### 📜 Stock Ledger & Audit History

Every stock-affecting operation is immutably logged in the **Stock Ledger**, providing full auditability for all inventory movements.

---

## 🔄 Inventory Flow

```text
                 ┌───────────────┐
                 │    Vendor     │
                 └───────┬───────┘
                         │ (Mandatory Supplier)
                         ▼
                ┌─────────────────┐
                │     Receipt     │
                │    Stock +      │
                └────────┬────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Warehouse / Location│
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
     Internal Transfer          Delivery
     Location → Location        Stock −
              │                     │
              ▼                     ▼
       Updated Location          Customer

                    │
                    ▼
          Inventory Adjustment
                    │
                    ▼
             Stock Ledger
```

All stock calculations and atomic updates are handled through the shared **Inventory Service** using PostgreSQL transactions and `CHECK (quantity >= 0)` database constraints.

---

## 🛠️ Tech Stack

### Frontend

* **React.js** (v18+)
* **Vite**
* **React Router DOM** (v6)
* **Axios** (with JWT Bearer interceptors)
* **Lucide React** (Icons)
* **Vanilla CSS** (Shiprocket-inspired design system with dark navy sticky sidebar `#0b1021`)

### Backend

* **Node.js** & **Express.js** (Modular Architecture)
* **JWT** & **bcryptjs**
* **Nodemailer** (Email OTP verification with console fallback)

### Database

* **PostgreSQL**
* **`pg`** (node-postgres connection pool; raw SQL, **no ORM**)
* **Constraints**: `UNIQUE (product_id, location_id)` & `CHECK (quantity >= 0.00)`

---

## 🏗️ Architecture

StockSense follows a **Feature-Based Modular Architecture**.

### Backend Modules (`backend/src/modules/`)

```text
modules/
├── auth/          # Email OTP, Signup (Staff only), Login, Password Reset, Profile Management
├── products/      # Catalog, SKU uniqueness, Categories, Location Stock Breakdown
├── inventory/     # Double-entry Stock Engine, Operations, Validation, Ledger Audit
├── locations/     # Warehouses & Location tree
├── suppliers/     # Vendor directory
└── dashboard/     # Real-time KPIs & Low-stock alerts
```

Database operations execute inside explicit PostgreSQL transactions:

```text
BEGIN
  ↓
Check Stock Sufficiency (for Outgoing)
  ↓
Update Stock Quants
  ↓
Create Immutable Move Ledger Entries
  ↓
COMMIT
```

If validation fails or stock is insufficient:

```text
ROLLBACK
```

---

## 📁 Project Structure

```text
stocksense/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # PostgreSQL pool connection
│   │   │   └── mailer.js         # Nodemailer OTP email transporter
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # JWT & Role authorization
│   │   │   ├── validators.js     # Validates quantities (>0), fields & status transitions
│   │   │   └── errorHandler.js   # Global error handler with PG error code translation
│   │   ├── modules/
│   │   │   ├── auth/             # Auth & Profile module
│   │   │   ├── products/         # Products & Categories module
│   │   │   ├── inventory/        # Stock Engine & Ledger module
│   │   │   ├── locations/        # Warehouses module
│   │   │   ├── suppliers/        # Vendors module
│   │   │   └── dashboard/        # KPIs & Analytics module
│   │   ├── db/
│   │   │   ├── schema.sql        # Raw PostgreSQL tables & DDL constraints
│   │   │   ├── seed.sql          # Full seed data for all tables
│   │   │   ├── initDb.js         # Automated DB creator & seed runner
│   │   │   └── fixSeed.js        # Bcrypt demo accounts updater
│   │   └── server.js             # Express app entry point
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Sticky Sidebar ("SS" Logo), Header
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global user & OTP verification state
│   │   ├── features/
│   │   │   └── auth/             # OTPVerifyModal, ResetPasswordModal
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx      # Login & Staff Signup
│   │   │   ├── DashboardPage.jsx # KPI cards & Filter Bar
│   │   │   ├── ProductsPage.jsx  # Products & Stock Breakdown Modal
│   │   │   ├── OperationsPage.jsx# Receipts, Deliveries, Transfers, Adjustments
│   │   │   ├── MoveHistoryPage.jsx# Stock Ledger Audit Log
│   │   │   ├── WarehousesPage.jsx# Locations Tree
│   │   │   ├── SuppliersPage.jsx # Vendors Directory
│   │   │   ├── ProfilePage.jsx   # My Profile & Change Password
│   │   │   └── SettingsPage.jsx  # Warehouse Defaults Setting
│   │   ├── services/
│   │   │   └── api.js            # Axios client with interceptors
│   │   ├── App.jsx               # Routes container
│   │   ├── main.jsx              # React DOM mount
│   │   └── index.css             # Shiprocket design system CSS
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stocksense
```

### 2. Backend Setup & Automated Database Init

```bash
cd backend
npm install
```

Configure your credentials in `backend/.env`:

```env
PORT=5000
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGDATABASE=stocksense_db
JWT_SECRET=stocksense_super_secret_jwt_key_2026
```

Automatically create the database, tables, constraints, and seed data with one command:

```bash
npm run init-db
```

Start the backend server:

```bash
npm run dev
```

*(Backend runs on `http://localhost:5000`)*

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

*(Frontend app runs on `http://localhost:3000`)*

---

## 🔑 Demo Login Credentials (Seeded Accounts)

| Role | Email | Password |
| --- | --- | --- |
| **Inventory Manager** | `manager@stocksense.com` | `password123` |
| **Warehouse Staff** | `staff@stocksense.com` | `password123` |

*(Public signups via the web app automatically register as **Warehouse Staff** and verify via 6-digit OTP).*

---

## 👥 Team

| Member | Role |
| --- | --- |
| **Vaibhavi Parekh** | Team Leader |
| **Purav Modi** | Team Member |
| **Ramakant Gupta** | Team Member |

---

## 🏆 Hackathon

**Odoo Hackathon**

**Project:** StockSense  
**Category:** Inventory Management System  

### Current Status

✅ **Core Development & Backend Complete**  
The fullstack modular platform, PostgreSQL constraints, transactional engine, OTP authentication, product location breakdown, operations workflows, audit move ledger, and Shiprocket UI are fully built and operational.

---

**StockSense — Track. Move. Manage.**
