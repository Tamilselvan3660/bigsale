# 🛍️ BIGSALE - Global Electronics & Electricals Marketplace

[![Node.js](https://img.shields.io/badge/Node.js-v24+-339933?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v19+-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

**BIGSALE** is a full-featured, enterprise-grade e-commerce marketplace platform engineered for global electronics and electricals. It features an Amazon-inspired premium shopping experience, AI-assisted product discovery, comprehensive refurbished electronics workflows, and a production-grade SMTP email communication service.

---

## 🚀 Key Feature Highlights

### 1. ♻️ BIGSALE Renew (Refurbished & Trade-in Marketplace)
- Dedicated refurbished electronics hub (smartphones, laptops, desktops, audio, accessories).
- Standardized condition grading (Grade A: Pristine, Grade B: Good, Grade C: Fair).
- Verified battery health metrics, multi-point inspection checklists, and warranty exclusions.
- Multi-step customer trade-in calculator with estimated trade-in credit generation.

### 2. 🔍 AI Visual & Barcode Search
- Direct image upload and live camera scanning for visual product discovery.
- Barcode and QR code instant lookup.
- Integrated camera capture mode with smart fallback matching.

### 3. 🖥️ Intelligent PC Setup Builder
- Component-by-component rig builder (CPU, GPU, Motherboard, RAM, Storage, PSU, Cooler, Case).
- Live power consumption calculation and bottleneck analysis.
- Socket, form-factor, and wattage compatibility validation before purchase.

### 4. ⚡ Energy Intelligence Calculator
- Real-time electricity consumption and operating cost estimator.
- Regional tariff presets (kWh pricing) with custom tariff sliders.
- Daily, monthly, and yearly cost projections with eco-efficiency badges.

### 5. 🛡️ Trust Centre & Authenticity Verification
- Serial number and IMEI verification portal.
- Tamper-proof digital authenticity certificates with cryptographic seals.
- Authorised dealer directory and anti-counterfeit reporting.

### 6. 📧 Production SMTP Email Service
- Reusable TypeScript mailer singleton with connection verification and safe fallback handling.
- Professional, mobile-responsive HTML templates (Welcome, Verification, OTP, Password Reset, Admin Notifications).
- Cryptographically secure 6-digit OTPs with bcrypt hashing, attempt limits, and resend cooldowns.
- Single-use, time-limited tokenized email verification and password reset flows.
- Strict per-IP rate limiting on auth and notification endpoints.

---

## 🏛️ Platform Architecture & Block Diagrams

### 1. High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph Client["Client Tier (Frontend - React 19 + Vite)"]
        UI["Amazon-Inspired Marketplace Storefront"]
        AuthUI["Auth & Account Portal"]
        RenewUI["BIGSALE Renew & Trade-in"]
        ToolsUI["Setup Builder & Energy Calc"]
        AdminUI["Admin & Analytics Dashboard"]
    end

    subgraph Security["Edge & API Gateway Layer"]
        CORS["CORS Policy"]
        Helmet["Helmet Security Headers"]
        RateLimit["Rate Limiting (500 req/15m & Strict Auth)"]
        JWTMiddleware["JWT Authentication Middleware"]
    end

    subgraph Backend["Application Server Tier (Node.js + Express 5)"]
        Router["Express REST API Router (/api)"]
        AuthCtrl["Auth Controller"]
        EmailService["SMTP Email Service (Nodemailer)"]
        ProductCtrl["Products & Renew Controller"]
        BuilderCtrl["Setup Builder & Compatibility Engine"]
        EnergyCtrl["Energy Intelligence Engine"]
        TrustCtrl["Trust & Authenticity Engine"]
        OrderCtrl["Checkout & Order Management"]
    end

    subgraph DataTier["Data & External Services Tier"]
        MockDB[("Data Store / Mock Prisma\n(data.json / PostgreSQL Schema)")]
        SMTPServer["SMTP Server\n(Gmail / SES / SendGrid)"]
        Stripe["Stripe Payments API"]
    end

    UI --> Security
    AuthUI --> Security
    RenewUI --> Security
    ToolsUI --> Security
    AdminUI --> Security

    Security --> Router
    Router --> AuthCtrl
    Router --> EmailService
    Router --> ProductCtrl
    Router --> BuilderCtrl
    Router --> EnergyCtrl
    Router --> TrustCtrl
    Router --> OrderCtrl

    AuthCtrl --> EmailService
    AuthCtrl --> MockDB
    ProductCtrl --> MockDB
    BuilderCtrl --> MockDB
    TrustCtrl --> MockDB
    OrderCtrl --> MockDB
    OrderCtrl --> Stripe
    EmailService --> SMTPServer
```

---

## 🔄 Core Workflows & Flowcharts

### 1. Customer Authentication & Email Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer
    participant Front as Frontend (React)
    participant Auth as Auth Controller
    participant DB as Prisma / Data Store
    participant Mailer as SMTP Mailer
    actor Inbox as Customer Email Inbox

    User->>Front: Enter registration details
    Front->>Auth: POST /api/auth/register
    Auth->>DB: Check email duplicate & hash password (bcrypt)
    Auth->>DB: Create User record (isVerified = false)
    Auth-->>Front: Set HTTP-only JWT Cookie & return 201 Created
    
    rect rgb(240, 248, 255)
        Note over Auth,Mailer: Asynchronous Non-blocking Email Dispatch
        Auth->>DB: Store EmailVerification token hash & expiry
        Auth->>Mailer: sendEmail(welcomeTemplate)
        Mailer->>Inbox: Dispatch Welcome & Verification Link
    end

    User->>Inbox: Click "Verify Email" link
    Inbox->>Auth: GET /api/email/verify-email?token=...
    Auth->>DB: Validate token hash & expiration
    Auth->>DB: Mark user isVerified = true, mark token used
    Auth-->>Front: Redirect to /verify-email?success=true
    Front-->>User: Show verified status & unlocked features
```

### 2. Multi-Factor OTP Verification Lifecycle

```mermaid
flowchart TD
    Start([User requests OTP]) --> InputCheck{Valid Email & Purpose?}
    InputCheck -- No --> Ret400[Return 400 Bad Request]
    InputCheck -- Yes --> UserCheck{User exists?}
    UserCheck -- No --> FakeOk[Return 200 generic message\nAnti-enumeration safe]
    UserCheck -- Yes --> CooldownCheck{Within 60s cooldown?}
    
    CooldownCheck -- Yes --> Ret429[Return 429 Too Many Requests]
    CooldownCheck -- No --> GenOTP[Generate 6-digit random code]
    
    GenOTP --> HashOTP[Hash code with bcrypt salt]
    HashOTP --> SaveOTP[Save hashed code, expiry & reset attempts to DB]
    SaveOTP --> SendMail[Dispatch branded HTML OTP email via SMTP]
    SendMail --> WaitInput[Customer enters 6-digit OTP]
    
    WaitInput --> VerifyCall[POST /api/email/verify-otp]
    VerifyCall --> ExpireCheck{Expired or not found?}
    ExpireCheck -- Yes --> ExpiredErr[Return 400 Expired / Request new]
    
    ExpireCheck -- No --> AttemptCheck{Attempts >= 5?}
    AttemptCheck -- Yes --> LockErr[Delete OTP & Return 429 Max attempts exceeded]
    
    AttemptCheck -- No --> MatchCheck{bcrypt.compare code == hash?}
    MatchCheck -- No --> IncAttempt[Increment attempt counter\nReturn 400 with remaining attempts]
    MatchCheck -- Yes --> Success[Delete OTP record\nMark purpose verified / Login user]
    Success --> Done([Authentication Complete])
```

### 3. PC Setup Builder Compatibility & Power Flow

```mermaid
flowchart LR
    SelectParts["1. User selects parts\n(CPU, GPU, MB, RAM, PSU)"] --> ValidationAPI["2. POST /api/setup-builder/validate"]
    
    subgraph Engine["Intelligent Rules Engine"]
        SocketCheck{"CPU Socket ==\nMotherboard Socket?"}
        RamCheck{"RAM Type ==\nMotherboard DDR?"}
        PowerCalc["Sum TDP + 20% Overhead Margin"]
        WattCheck{"PSU Wattage >=\nRequired TDP?"}
    end

    ValidationAPI --> SocketCheck
    SocketCheck -- Mismatch --> Warn1["Flag Socket Incompatibility"]
    SocketCheck -- Match --> RamCheck
    RamCheck -- Mismatch --> Warn2["Flag Memory Standard Mismatch"]
    RamCheck -- Match --> PowerCalc
    PowerCalc --> WattCheck
    WattCheck -- Underpowered --> Warn3["Flag PSU Underpowered Alert"]
    WattCheck -- Sufficient --> AllGood["All Components Compatible ✅"]

    Warn1 --> Summary["Generate Diagnostics Report & Buy Box"]
    Warn2 --> Summary
    Warn3 --> Summary
    AllGood --> Summary
```

---

## 🎨 Design System & Theme

BIGSALE features a conversion-focused Amazon-inspired marketplace theme:
- **Midnight Navy (`#0F1B2D`) & Deep Navy (`#152A45`)**: Header, brand navigation, and top banners.
- **Marketplace Orange (`#FF9900`)**: Primary actions, search triggers, offers, and Badges.
- **Bright Yellow (`#FFD814`)**: Promotional CTAs and instant "Add to Cart" / "Buy Now" buttons.
- **Light Background (`#F3F5F8`)**: High-contrast, clean marketplace background.
- **Main Text (`#172337`) & Muted Text (`#667085`)**: Optimized legibility and contrast.

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS Theme Variables
- **State Management**: Zustand
- **Data Fetching & Cache**: TanStack React Query v5
- **Icons & Animation**: Lucide React + Framer Motion
- **Forms & Validation**: React Hook Form + Zod
- **Notifications**: React Hot Toast

### Backend Architecture
- **Runtime & Server**: Node.js v24 + Express.js 5 + TypeScript
- **Data Layer**: Mock Prisma Client (JSON file-backed database) with PostgreSQL compatibility
- **Email Service**: Nodemailer (SMTP with connection verification & templating)
- **Security**: JWT Authentication, Bcrypt Hashing, Helmet Headers, Express Rate Limit, Cookie Parser
- **Logging**: Morgan + Winston

---

## ⚙️ SMTP Email Configuration

The backend supports any standard SMTP provider (Gmail, SendGrid, Amazon SES, Mailgun, Mailtrap, MailHog).

Add these parameters to your `backend/.env`:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="BIGSALE <your-email@gmail.com>"
FRONTEND_URL=http://localhost:5173

# Security & Expiration Settings
EMAIL_VERIFICATION_EXPIRES_HOURS=24
OTP_EXPIRES_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
PASSWORD_RESET_EXPIRES_HOURS=1
```

> **Note**: When `SMTP_USER` or `SMTP_PASS` are unset or using placeholder values, the server operates in safe simulated mode, logging email dispatches to the console without throwing errors.

---

## 💻 Quick Start & Running Locally

### 1. Prerequisites
- **Node.js**: `v18+` (Recommended: `v22+` or `v24`)
- **npm**: `v9+`

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server (watch mode)
npm run dev
```
Backend runs on `http://localhost:4000` (Healthcheck: `http://localhost:4000/api/health`).

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 📚 API Endpoints Summary

| Category | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | No | System health check & uptime |
| **Auth** | `POST` | `/api/auth/register` | No | Register account & auto-send welcome email |
| **Auth** | `POST` | `/api/auth/login` | No | Authenticate user & get JWT |
| **Auth** | `GET` | `/api/auth/me` | Yes | Get authenticated profile |
| **Email** | `POST` | `/api/email/send-otp` | No (Rate Limited) | Generate & email 6-digit hashed OTP |
| **Email** | `POST` | `/api/email/verify-otp` | No (Rate Limited) | Verify OTP with max attempt throttling |
| **Email** | `POST` | `/api/email/forgot-password` | No (Rate Limited) | Dispatch single-use password reset link |
| **Email** | `POST` | `/api/email/reset-password` | No (Rate Limited) | Validate reset token & update password |
| **Email** | `GET` | `/api/email/verify-email` | No | Confirm email address via link |
| **Email** | `POST` | `/api/email/resend-verification`| Yes | Resend verification link |
| **Email (Admin)**| `POST` | `/api/email/test` | Admin | Send test email to target address |
| **Email (Admin)**| `POST` | `/api/email/verify-connection`| Admin | Check live SMTP handshake status |
| **Renew** | `GET` | `/api/renew/products` | No | List certified renewed devices |
| **Renew** | `POST` | `/api/renew/trade-in` | No / Yes | Submit device for trade-in valuation |
| **Setup Builder**| `GET`| `/api/setup-builder/components`| No | List PC components & specifications |
| **Setup Builder**| `POST`| `/api/setup-builder/validate`| No | Check compatibility & power requirements |
| **Energy** | `POST` | `/api/energy/calculate` | No | Calculate electricity cost estimates |
| **Trust** | `GET` | `/api/trust/verify/:serial` | No | Verify product authenticity & certificate |
| **Products** | `GET` | `/api/products` | No | Search, filter, and paginate catalog |
| **Cart** | `GET/POST`| `/api/cart` | Yes | View and modify customer cart |
| **Checkout** | `POST` | `/api/checkout/place-order`| Yes | Complete order & transit protection |

---

## 🔑 Trial Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@bigsale.com` | `Admin123!` | Admin Dashboard, SMTP Management, Order & Product Controls |
| **Customer** | `customer@bigsale.com` | `Customer123!` | Storefront browsing, Cart, Trade-in, Wishlist, Setup Builder |

---

## 📄 License
This project is licensed under the MIT License.
