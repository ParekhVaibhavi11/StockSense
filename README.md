# StockSense 📦

> **Modular Inventory Management System for modern, centralized stock operations.**

StockSense is a web-based **Inventory Management System (IMS)** developed for the **Odoo Hackathon**. It centralizes products, warehouses, receipts, deliveries, internal transfers, stock adjustments, and stock movement history into a single platform.

The goal is to replace manual registers, Excel sheets, and scattered inventory tracking with a **structured, reliable, and easy-to-use inventory system**.

---

## 🎯 Problem Statement

Traditional inventory management often relies on manual records and spreadsheets, which can result in:

* Stock mismatches
* Manual calculation errors
* Delayed stock updates
* Difficulty tracking stock movement
* Poor visibility across warehouses and locations

**StockSense** provides a centralized workflow where every stock operation is validated, processed, and recorded in the inventory ledger.

---

## ✨ Core Features

### 🔐 Authentication

* User Signup & Login
* Email OTP verification
* OTP-based password reset
* JWT authentication
* Role-based authorization

### 📊 Inventory Dashboard

* Total Products in Stock
* Low Stock / Out of Stock Items
* Pending Receipts
* Pending Deliveries
* Scheduled Internal Transfers
* Dynamic filters by:

  * Document type
  * Status
  * Warehouse / Location
  * Product Category

### 📦 Product Management

* Create and update products
* SKU / Product Code
* Product Categories
* Unit of Measure
* Stock availability
* Reordering rules

### 🚚 Inventory Operations

**Receipts**

* Record incoming goods
* Add supplier and products
* Validate received quantities
* Automatically increase stock

**Delivery Orders**

* Pick and pack products
* Validate deliveries
* Automatically decrease stock

**Internal Transfers**

* Move stock between warehouses or locations
* Track source and destination
* Maintain complete movement history

**Inventory Adjustments**

* Compare physical and recorded stock
* Update mismatched quantities
* Automatically create ledger entries

### 📜 Stock Ledger

Every stock-affecting operation is recorded in the **Stock Ledger**, providing traceability for inventory movements.

---

## 🔄 Inventory Flow

```text
                 ┌───────────────┐
                 │    Vendor     │
                 └───────┬───────┘
                         │
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

All stock calculations are handled through the centralized **Inventory Service** using PostgreSQL transactions.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Vite
* Axios

### Backend

* Node.js
* Express.js
* JWT
* Nodemailer
* Google cloude console
* PDF kit
* Zod

### Database

* PostgreSQL
* `pg` PostgreSQL connection pool
* Raw SQL schema and seed data

### Testing

* Postman

### Version Control

* Git And Github


---

## 🏗️ Architecture

StockSense follows a **modular architecture**.

### Backend Modules

```text
Auth
  ↓
Products
  ↓
Inventory
  ↓
Locations
  ↓
Dashboard
```

The **Inventory Module** acts as the core stock engine. It handles:

* Receipts
* Deliveries
* Internal Transfers
* Adjustments
* Stock calculations
* SQL transactions
* Stock Ledger entries

Database operations use:

```text
BEGIN
  ↓
Validate Operation
  ↓
Update Stock
  ↓
Create Ledger Entry
  ↓
COMMIT
```

If an operation fails:

```text
ROLLBACK
```

This helps maintain inventory consistency.

---

## 📁 Project Structure

```text
stocksense/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── mailer.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── validators.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── locations/
│   │   │   └── dashboard/
│   │   │
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── seed.sql
│   │   │
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── operations/
│   │   │   └── ledger/
│   │   │
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 👥 Team

| Member              | Role        |
| ------------------- | ----------- |
| **Vaibhavi Parekh** | Team Leader |
| **Purav Modi**      | Team Member |
| **Ramakant Gupta**  | Team Member |

---

## 🏆 Hackathon

**Odoo Hackathon**

**Project:** StockSense
**Category:** Inventory Management System

### Current Status

🚧 **Development Started**

The team is currently working on the core architecture, PostgreSQL database, authentication, product management, inventory operations, and dashboard modules.

---

## 🔮 Future Scope

* Advanced inventory analytics
* Automated reorder notifications
* Supplier management
* Barcode / QR code integration
* Detailed inventory reports
* Role-specific dashboards
* Real-time inventory updates
* Integration with business and ERP workflows

---

**StockSense — Track. Move. Manage.**
