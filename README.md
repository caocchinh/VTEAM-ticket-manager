<div align="center">
 <img src="https://github.com/caocchinh/photospark/blob/master/client/public/vteam-logo.webp?raw=true" alt="VTEAK Logo" width="167"/>
  <p>
    <strong>VTEAM Ticket Management System</strong>
  </p>
  <p>
    <strong>The central command center for Vinschool Central Park Student Council events</strong>
  </p>
  <p style="margin-top: 10px;">
    <a href="#-features">Features</a> •
    <a href="#️-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-usage">Usage</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/badge/status-production-green.svg" alt="Status" />
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Neon-PostgreSQL-4A9EFF?logo=postgresql&logoColor=white" alt="Neon PostgreSQL" />
  </p>
</div>

---

## 📖 Introduction

**VTEAM Ticket Management** is the comprehensive staff-facing platform for verifying and managing ticket sales for major **Vinschool Central Park Student Council** events. Designed for high-performance and reliability, this system serves as the operational backbone for events like PROM and the SILENCIO (VTEAM's Halloween event), handling hundreds of real-time transactions and verifications.

The system provides two critical functions for the event team:

1.  **Staff-Managed Walk-in Sales ("Offline")**: A fast, efficient interface for selling tickets on-site.
2.  **Online Order Verification**: A centralized dashboard for coordinators to review and approve payment proofs from student online orders.

## ✨ Features

### 🏦 Walk-in Ticket Sales (Offline Mode)

Designed for speed and accuracy at physical ticket booths:

- **Smart Student Autocomplete**:
  - Instantly find students by Name, Event ID, Email, or Homeroom.
  - Eliminates manual entry errors and speeds up the queue.
- **Direct Sales Processing**:
  - Support for **Cash** and **Bank Transfer** payments.
  - Customizable ticket types with real-time inventory tracking.
  - Immediate receipt generation and email confirmation.
- **Offline Resilience**:
  - **IndexedDB Caching**: Prevent unnecessary API calls and improve performance.
  - **Local State Persistence**: Never lose a partial order.

<img src="/public/assets/screenshots/offline-sales.png" alt="Walk-in Sales Interface" style="border-radius: 10px; margin-bottom: 20px; margin-top: 10px;" />

### ✅ Online Order Verification

A streamlined workflow for managing self-service student orders:

- **Verification Dashboard**:
  - Real-time feed of pending online orders.
  - Split-view interface for reviewing uploaded payment proofs (bank transfer screenshots).
- **Approval Workflow**:
  - **One-Click Approve**: Instantly issues the digital ticket via email.
  - **Reject with Feedback**: Sends a clearer rejection reason to the student for correction.
- **Fuzzy Search**: Quickly locate any order to resolve student inquiries on the spot.

<img src="/public/assets/screenshots/online-portal.png" alt="Online Verification Dashboard" style="border-radius: 10px; margin-bottom: 20px; margin-top: 10px;" />

### 📊 Real-Time Analytics

- **Live Revenue Tracking**: Monitor total funds collected across all channels.
- **Staff Performance**: Track individual sales and verification counts.
- **Visual Charts**: Interactive breakdowns of ticket types, sales velocity, and payment methods.

<img src="/public/assets/screenshots/statistics-dashboard.png" alt="Statistics Dashboard" style="border-radius: 10px; margin-bottom: 20px; margin-top: 10px;" />

### 🔒 Security & Management

- **Google OAuth**: strict access control via Vinschool Google accounts.
- **Role-Based Access**:
  - **Staff**: Can sell tickets and view personal stats.
  - **Coordinators**: Can verify online orders and manage global inventory.
- **Audit Logging**: Tracks every transaction and verification action.

## 🛠️ Tech Stack

### Core

- **[Next.js 15](https://nextjs.org/)** - App Router & Turbopack.
- **[TypeScript](https://www.typescriptlang.org/)** - Strict type safety.
- **[React 19](https://react.dev/)** - Latest concurrent features.

### Data & State

- **[Neon PostgreSQL](https://neon.tech/)** - Serverless database.
- **[Drizzle ORM](https://orm.drizzle.team/)** - Database access.
- **[TanStack Query](https://tanstack.com/query/latest)** - Async state & caching.
- **IndexedDB** - Client-side caching for offline support.

### UI / UX

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Styling.
- **[Radix UI](https://www.radix-ui.com/)** - Accessible components.
- **[Framer Motion](https://motion.dev/)** - Animations.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Neon PostgreSQL Database
- Google Cloud Console Project (OAuth)
- Google Sheets (for data sync)

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/vteam/vteam-offline-ticket.git
    cd vteam-offline-ticket
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy the example env file and configure your credentials.

    ```bash
    cp copy.env .env
    ```

    _Required: Database URLs, BetterAuth Secret, Google Client ID/Secret, Google Sheets IDs._

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

---

<div align="center">
  <p>Developed with ❤️ by the Vinschool Central Park Student Council Tech Team</p>
</div>
