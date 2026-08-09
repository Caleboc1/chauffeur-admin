# Chauffeur Admin Dashboard — Project Walkthrough

Welcome to the completed **Chauffeur Admin Dashboard**. This document provides a high-level guide to the system's architecture, key features, and operational workflows.

---

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Launch the Application
Run the following commands to install dependencies and start the local development server:
```bash
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

---

## 🏗️ Architecture Overview

The application is built as a **React Single Page Application (SPA)** using **Vite**.

- **Routing**: Handled by `react-router-dom` v6, featuring a nested `DashboardLayout`.
- **State Management**: Uses React Context (`AuthContext`) for authentication and local `useState` for module-specific data.
- **Data Layer**: Direct integration with **Supabase** via the JS SDK.
- **Styling**: Vanilla **CSS Modules** utilizing a unified Design System (`globals.css`).
- **Typography**: Strictly follows the **Material Design 3 (MD3)** type scale with the Inter font family.

---

## 🔐 Security & Role-Based Access (RBAC)

Access is gated by five distinct roles defined in `src/lib/rbac.js`. 

### Testing Roles
To test different views, you must update the `role` column in the `admins` table for your test user:
- **Super Admin**: Full access to all modules, including Audit Logs and Settings.
- **Finance Admin**: Access to Earnings, Accounting, and Wallet Adjustments.
- **Ops Admin**: Access to Drivers, Applications, Inspections, and Rides.
- **Support Agent**: Access to Complaints and Rider Directory.

### Row Level Security (RLS)
Every database table is protected by PostgreSQL RLS policies. Even if a user bypasses the UI, the database will reject unauthorized read/write attempts based on their `auth.uid()`.

---

## 🔄 Core Operational Workflows

### 1. Driver Onboarding
- **Path**: `Drivers -> Applications`
- **Action**: Click a "New" application to enter the **Review Detail** view.
- **Review**: Inspect Government ID and License docs.
- **Decision**: Approve to move to "Inspection Scheduled" or Reject with a **mandatory reason**.

### 2. Manual Wallet Adjustments
- **Path**: `Earnings`
- **Action**: Click **Manual Adjustment**.
- **Process**: Select "Deduct" for commission or "Add" for payouts. 
- **Accountability**: You **must** provide a reason. This action is dual-logged in the financial ledger and the system audit trail.

### 3. Ride Monitoring
- **Path**: `Rides`
- **Real-time**: The queue updates automatically via **Supabase Realtime**. 
- **Safety**: Monitor the "Active Queue" for any unassigned requests or long-running trips.

---

## 📁 Key File Map

| Path | Purpose |
|---|---|
| `src/components/ui/` | Primitive components (Button, Input, DataTable, ConfirmModal) |
| `src/pages/dashboard/` | KPI cards and real-time activity feed |
| `src/lib/supabase.js` | Centralized Supabase client initialization |
| `src/utils/formatters.js` | Global currency, date, and rating formatters |
| `supabase/migrations/` | The full SQL schema and RLS policy versioning |

---

## 🛡️ Forensic Audit Trail
The **Audit Logs** module (`/audit-logs`) is the system's "Black Box." Every administrative action that modifies data is recorded here. 
- **Metadata**: Click the blue Info icon in any log row to see the raw JSON data associated with that action.
- **Immutability**: This trail is read-only and cannot be cleared via the UI.

---

## 🎨 Design System
The dashboard uses a **Light Mode** high-density UI.
- **Primary Color**: `#1A1A2E` (Brand Navy)
- **Accent Color**: `#C9A84C` (Brand Gold)
- **Semantic Colors**: Green (Success), Yellow (Warning), Red (Danger/SOS).

---

© 2026 Chauffeur Operations. Confidential Internal Tool.
