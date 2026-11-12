# 🛍️ BIGSALE - Enterprise E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v24+-339933?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v19+-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

BIGSALE is a full-featured, enterprise-grade e-commerce web platform engineered for high performance, modern user experience, and scalable cloud infrastructure. It provides customers with a responsive storefront, intuitive checkout with coupons, real-time inventory tracking, and admins with a comprehensive back-office management console.

---

## 📸 Screenshots & UI Preview

```
+-----------------------------------------------------------------------------------+
|  🛍️ BIGSALE               [ Search products... ]        ❤️ Wishlist  🛒 Cart (2)   |
+-----------------------------------------------------------------------------------+
|  [⚡ MEGA FLASH SALE: Up to 50% Off Electronics & Gadgets - Limited Time Only! ]  |
+-----------------------------------------------------------------------------------+
|  FEATURED CATEGORIES                                                              |
|  [ Electronics ]   [ Fashion ]   [ Home & Living ]   [ Sports ]   [ Books ]       |
+-----------------------------------------------------------------------------------+
|  TRENDING PRODUCTS                                                                |
|  +-------------------+  +-------------------+  +-------------------+              |
|  | [ Product Image ] |  | [ Product Image ] |  | [ Product Image ] |              |
|  | Smart Watch Ultra |  | Wireless SoundPro |  | Mech Keyboard X   |              |
|  | ★★★★☆ (128)      |  | ★★★★★ (94)        |  | ★★★★★ (215)       |              |
|  | $399.99  $449.99  |  | $199.99  $249.99  |  | $129.99  $159.99  |              |
|  | [ Add to Cart ]   |  | [ Add to Cart ]   |  | [ Add to Cart ]   |              |
|  +-------------------+  +-------------------+  +-------------------+              |
+-----------------------------------------------------------------------------------+
```

*(Place real screenshots in `docs/screenshots/`)*

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Navy `#0f172a`, Electric Blue `#2563eb`, Orange `#f97316`)
- **State Management**: Zustand
- **Data Fetching & Cache**: TanStack React Query v5
- **Icons & Animation**: Lucide React + Framer Motion
- **Forms & Validation**: React Hook Form + Zod
- **Notifications**: React Hot Toast

### Backend Architecture
- **Runtime & Server**: Node.js v24 + Express.js 5 + TypeScript
- **ORM & Data Layer**: Prisma ORM v6
- **Database**: PostgreSQL 16 (Relational DB with Enums, Cascades, Foreign Keys, Indexes)
- **Caching & Sessions**: Redis 7
- **Security**: JWT Authentication, Bcrypt Password Hashing, Helmet HTTP Headers, Rate Limiting, Cookie Parser, Zod validation
- **Logging**: Morgan + Winston
- **Email Testing**: MailHog (SMTP 1025 / Web 8025)

---

## 📋 Prerequisites

Ensure your environment meets the minimum version requirements:
- **Node.js**: `v18+` (Recommended: `v24.x`)
- **npm**: `v9+` (Tested on `v11.x`)
- **PostgreSQL**: `v14+` (Recommended: PostgreSQL `16`)
- **Redis**: `v6+` (Optional for local development fallback, recommended: `Redis 7`)
- **Docker & Docker Compose**: (Optional, enables 1-command startup)

---

## ⚡ Quick Start (With Docker)

Run the full stack (PostgreSQL, Redis, MailHog, Backend API, and Frontend) in 3 commands:

```bash
# 1. Clone repository and navigate to folder
cd d:\shop\bigsale

# 2. Copy environment configuration
cp .env.example backend/.env
cp .env.example frontend/.env

# 3. Spin up all containers
docker-compose up --build -d
```

- **Storefront & Admin UI**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **MailHog Email Inbox**: http://localhost:8025
- **Postgres Database**: `localhost:5432` (User: `bigsale`, Database: `bigsale`)

To seed sample catalog data with Docker:
```bash
docker-compose exec backend npm run db:seed
```

---

## 💻 Quick Start (Without Docker)

Follow these step-by-step instructions to run locally on Windows/macOS/Linux:

### Step 1: PostgreSQL Setup
1. Start your local PostgreSQL server on port `5432`.
2. Create database and user:
   ```sql
   CREATE USER bigsale WITH PASSWORD 'bigsale_secret';
   CREATE DATABASE bigsale OWNER bigsale;
   GRANT ALL PRIVILEGES ON DATABASE bigsale TO bigsale;
   ```
   *(Or import the schema directly: `psql -U bigsale -d bigsale -f database/schema.sql`)*

### Step 2: Backend Setup
```bash
cd d:\shop\bigsale\backend

# 1. Install dependencies
npm install

# 2. Setup environment file
cp .env.example .env
# Edit .env if your PostgreSQL credentials differ from:
# postgresql://bigsale:bigsale_secret@localhost:5432/bigsale?schema=public

# 3. Generate Prisma client and migrate database
npm run db:generate
npm run db:migrate

# 4. Seed database with 50+ products, categories, brands, coupons, and test users
npm run db:seed

# 5. Start development backend
npm run dev
```
Backend runs on: `http://localhost:4000` (Healthcheck: `http://localhost:4000/api/health`)

### Step 3: Frontend Setup
Open a new terminal window:
```bash
cd d:\shop\bigsale\frontend

# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 🔑 Trial Credentials

The seeded database includes pre-configured accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@bigsale.com` | `Admin123!` | Full Admin Console, Analytics, Order Management, Products/Categories CRUD |
| **Customer** | `customer@bigsale.com` | `Customer123!` | Storefront browsing, Cart, Wishlist, Checkout, Order History, Reviews |

---

## ⚙️ Environment Variables Explanation

All environment settings are documented in [`.env.example`](file:///.env.example):

### Backend (`backend/.env`)
- `PORT`: HTTP port for Express (Default: `4000`)
- `NODE_ENV`: Runtime environment (`development`, `production`, `test`)
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://user:pass@host:5432/db?schema=public`)
- `JWT_SECRET`: Secret key used for signing JWT access tokens
- `JWT_EXPIRES_IN`: Access token duration (e.g. `7d`, `24h`)
- `CORS_ORIGIN`: Comma-separated list of permitted web origins (e.g. `http://localhost:5173`)
- `REDIS_URL`: Redis URI for caching and queue sessions (`redis://localhost:6379`)
- `STRIPE_SECRET_KEY`: Secret API key for Stripe payment processing (`sk_test_...`)
- `STRIPE_WEBHOOK_SECRET`: Secret for validating Stripe webhooks (`whsec_...`)
- `SMTP_HOST`, `SMTP_PORT`: Email server configuration (MailHog: `localhost:1025`)

### Frontend (`frontend/.env`)
- `VITE_API_URL`: Backend REST API base URL (`http://localhost:4000/api`)
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key (`pk_test_...`)
- `VITE_APP_NAME`: Display title of application

---

## 📚 API Endpoints Reference

Complete documentation with request/response schemas and curl examples is located in [`docs/API.md`](file:///docs/API.md).

| Category | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | No | System health check & uptime |
| **Auth** | `POST` | `/api/auth/register` | No | Register new customer account |
| **Auth** | `POST` | `/api/auth/login` | No | Authenticate user & get JWT |
| **Auth** | `GET` | `/api/auth/me` | Yes | Get authenticated profile |
| **Products** | `GET` | `/api/products` | No | List products with search & filters |
| **Products** | `GET` | `/api/products/featured`| No | Get featured hero items |
| **Products** | `GET` | `/api/products/:slug` | No | Get product details by slug or ID |
| **Products** | `POST` | `/api/products` | Admin | Create product |
| **Categories**| `GET` | `/api/categories` | No | List all product categories |
| **Brands** | `GET` | `/api/brands` | No | List all brands |
| **Cart** | `GET` | `/api/cart` | Yes | Get user cart items & totals |
| **Cart** | `POST` | `/api/cart/add` | Yes | Add product or variant to cart |
| **Cart** | `POST` | `/api/cart/coupon` | Yes | Apply discount coupon code |
| **Wishlist** | `GET` | `/api/wishlist` | Yes | Get saved wishlist items |
| **Wishlist** | `POST` | `/api/wishlist/add` | Yes | Save item to wishlist |
| **Checkout** | `POST` | `/api/checkout/calculate`| Yes | Calculate order subtotals, tax, fees |
| **Checkout** | `POST` | `/api/checkout/place-order`| Yes | Finalize checkout & place order |
| **Orders** | `GET` | `/api/orders/my-orders`| Yes | View customer order history |
| **Orders** | `GET` | `/api/orders/admin/all` | Admin | Manage all platform orders |
| **Admin** | `GET` | `/api/admin/stats` | Admin | Dashboard revenue and metrics |
| **Admin** | `GET` | `/api/admin/customers` | Admin | View customer accounts |
| **Search** | `GET` | `/api/search` | No | Instant search with fuzzy matching |

---

## 🏗️ Architecture Overview

```
+---------------------------------------------------------------------+
|                         CLIENT BROWSER                              |
|   React 19 + Vite SPA (Storefront & Administration Back-office)    |
|   Zustand Store  •  React Query Cache  •  Tailwind Design System    |
+---------------------------------------------------------------------+
                                  |
                                  | HTTPS / REST (JSON)
                                  v
+---------------------------------------------------------------------+
|                     EXPRESS.JS BACKEND (API)                        |
|   Port 4000  •  TypeScript  •  Helmet  •  Rate Limiter  •  CORS     |
|   JWT Authentication Middleware  •  Zod Request Validation Pipeline |
+---------------------------------------------------------------------+
          |                           |                      |
          v                           v                      v
+-------------------+       +-------------------+  +------------------+
|    POSTGRESQL     |       |       REDIS       |  |     MAILHOG      |
|  Prisma ORM v6    |       |   Cache & Rate    |  | Mock SMTP Server |
|  20 Data Models   |       |   Limit Storage   |  | Web UI (8025)    |
+-------------------+       +-------------------+  +------------------+
```

### Database Entities
- **Users & Security**: `users`, `addresses`, `audit_logs`, `notifications`
- **Catalog**: `categories`, `brands`, `products`, `product_images`, `product_variants`, `price_histories`
- **Shopping**: `carts`, `cart_items`, `wishlists`, `wishlist_items`, `coupons`, `reviews`
- **Checkout & Logistics**: `orders`, `order_items`, `payments`, `shipments`

---

## 🤝 Contributing Guide

1. **Branching**: Branch off `main` with descriptive prefix (`feature/`, `fix/`, `chore/`).
2. **Linting & Formatting**: Ensure code adheres to standards:
   ```bash
   cd frontend && npm run build
   cd backend && npm run build
   ```
3. **Database Changes**: Never modify migrations manually. Always use Prisma schema and run:
   ```bash
   npx prisma migrate dev --name <migration_name>
   ```
4. **Commits**: Follow conventional commit guidelines (`feat: ...`, `fix: ...`, `docs: ...`).

---

## 📄 License
This project is licensed under the MIT License.
