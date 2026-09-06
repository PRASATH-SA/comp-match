# Computer Match — E-Commerce Web Platform

A full-stack, modern light-themed e-commerce platform for **New and Refurbished Laptops, Computers, Accessories, and Refurbished Mac PCs**. Built with **React + Vite** for frontend (store and dedicated admin panel), **Express.js** for backend with a single monolithic API, **MongoDB** with Mongoose, and **Cloudflare R2** for image storage.

---

## Design System

- **Primary CTA**: `#FBBF24` (Amber/Yellow) — Prominent **Enquire Now** buttons, highlights, badges
- **Background**: `#FFFFFF` / `#FAFAFA` — Clean white modern light theme
- **Secondary**: `#3B82F6` (Blue) — **Add to Cart**, informative highlights
- **Text**: `#111827` (Deep Black/Gray)
- **Typography**: Inter via Google Fonts
- **Animations**: AOS (Animate on Scroll) & smooth CSS transitions
- **Image Performance**: Blur-up lazy loading (`react-lazy-load-image-component`) with custom SVGs

---

## Architecture Overview

```
Computer Match/
├── client/          # Customer Storefront (React 19 + Vite + React Router)
├── admin/           # Admin Dashboard (React 19 + Vite + React Router)
├── server/          # Express.js Single Monolithic REST API + Mongoose
├── package.json     # Workspace management scripts
└── README.md
```

---

## Key Features

### 1. Categories
- **New Laptops**
- **New Computers**
- **New Accessories**
- **Refurbished Laptops**
- **Refurbished Computers**
- **Refurbished Accessories**
- **Refurbished Mac PCs**

### 2. Auto-Generated Product IDs
Every product is automatically assigned a unique incremental ID (`CM-0001`, `CM-0002`, ...) stored in MongoDB via atomic counters.

### 3. Direct Enquiry & WhatsApp Integration
- "Enquire Now" acts as the **Primary Yellow CTA** on product details.
- Collects Customer Name, Contact Number, and optional Requirement.
- Records the enquiry directly in MongoDB for admin follow-up.
- Automatically generates an encoded redirect link to WhatsApp (`+91 8825918573`) with the Product Name and `CM-XXXX` ID.
- **Privacy Notice**: The phone number is never displayed directly on the storefront UI.

### 4. Authentication (No Firebase)
- **Google OAuth 2.0**: Direct authentication via `passport-google-oauth20`.
- **Email/Password**: Bcrypt-hashed password authentication.
- **Email OTP Verification**: 6-digit numeric OTP sent via Nodemailer for email verification prior to activation.

### 5. Advertisements & Amazon Referral
- Configurable **Google AdSense** banner placements with responsive and fixed sizes (`responsive`, `300x250`, `728x90`, `320x50`).
- **Amazon Affiliate referral** tags and custom banners uploadable directly to Cloudflare R2.
- Impression and click counters tracked in the database.

### 6. User Tracking & Analytics (Admin Panel)
- Real-time tracking of:
  - **Last active timestamp**
  - **Last visited page & product**
  - **Total watch time / dwell time** (accumulated in seconds)
  - Detailed activity history log per user.

### 7. Comprehensive Admin Management Subdomain/Panel
- **Dashboard**: High-level statistics, pending enquiries, active users.
- **Manage Products**: Full CRUD, specifications editor, Cloudflare R2 image upload, active/featured status.
- **Manage Enquiries**: Status tracking (`pending`, `contacted`, `resolved`) with quick-action WhatsApp chat.
- **Manage Users**: Activity logs, search, last active times, watch times.
- **Manage Ads**: Google AdSense and Amazon referral link controls.
- **Manage Categories**: Order management, condition & type mapping.

### 8. Legal & Compliance Pages
- **Privacy Policy** (`/privacy-policy`)
- **Terms of Service** (`/terms-of-service`) — includes aggregator/referral disclaimer and liability limitations.

---

## Quick Start Guide

### 1. Prerequisites
- Node.js v18+
- MongoDB (Local or MongoDB Atlas)
- Cloudflare R2 bucket & API token (for live image hosting)
- SMTP credentials (e.g. Gmail App Password) for OTP emails

### 2. Configure Environment Variables
In `server/.env` (copy from `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/computer-match
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
R2_ACCOUNT_ID=your_cloudflare_r2_account_id
R2_ACCESS_KEY_ID=your_cloudflare_r2_access_key
R2_SECRET_ACCESS_KEY=your_cloudflare_r2_secret_key
R2_BUCKET_NAME=computer-match
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
WHATSAPP_NUMBER=918825918573
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### 3. Seed Default Categories
```bash
npm run seed
```

### 4. Run Development Servers
- **Start Backend API** (Port 5000):
  ```bash
  npm run server
  ```
- **Start Storefront** (Port 5173):
  ```bash
  npm run client
  ```
- **Start Admin Panel** (Port 5174):
  ```bash
  npm run admin
  ```

---

## Verification & Build
Both frontends build cleanly with Vite:
```bash
npm run build:client
npm run build:admin
```
