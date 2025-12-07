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
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js 16" />
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
  - Immediate email confirmation.
- **Offline Resilience**:
  - **IndexedDB Caching**: Prevent unnecessary API calls and improve performance.
  - **Local State Persistence**: Never lose a partial order.

<img src="https://github.com/caocchinh/VTEAM-ticket-manager/blob/master/public/assets/github/overal1.webp?raw=true" alt="Walk-in Sales Interface" style="border-radius: 10px; margin-bottom: 5px; margin-top: 10px;" />
<img src="https://github.com/caocchinh/VTEAM-ticket-manager/blob/master/public/assets/github/overal2.webp?raw=true" alt="Walk-in Sales Interface" style="border-radius: 10px; margin-bottom: 5px; margin-top: 10px;" />
<img src="https://github.com/caocchinh/VTEAM-ticket-manager/blob/master/public/assets/github/order.webp?raw=true" alt="Walk-in Sales Interface" style="border-radius: 10px; margin-bottom: 5px; margin-top: 10px;" />
<img src="https://github.com/caocchinh/VTEAM-ticket-manager/blob/master/public/assets/github/colorpicker.webp?raw=true" alt="Walk-in Sales Interface" style="border-radius: 10px; margin-bottom: 5px; margin-top: 10px;" />
<img src="https://github.com/caocchinh/VTEAM-ticket-manager/blob/master/public/assets/github/email.webp?raw=true" alt="Walk-in Sales Interface" style="border-radius: 10px; margin-bottom: 5px; margin-top: 10px;" />

### 📊 Real-Time Analytics

- **Live Revenue Tracking**: Monitor total funds collected across all channels.
- **Staff Performance**: Track individual sales and verification counts.
- **Visual Charts**: Interactive breakdowns of ticket types, sales velocity, and payment methods.

<img src="https://github.com/caocchinh/VTEAM-ticket-manager/blob/master/public/assets/github/statistic.webp?raw=true" alt="Statistics Dashboard" style="border-radius: 10px; margin-bottom: 5px; margin-top: 10px;" />
<img src="https://github.com/caocchinh/VTEAM-ticket-manager/blob/master/public/assets/github/revenue1.webp?raw=true" alt="Statistics Dashboard" style="border-radius: 10px; margin-bottom: 5px; margin-top: 10px;" />
<img src="https://github.com/caocchinh/VTEAM-ticket-manager/blob/master/public/assets/github/revenue2.webp?raw=true" alt="Statistics Dashboard" style="border-radius: 10px; margin-bottom: 5px; margin-top: 10px;" />
<img src="https://github.com/caocchinh/VTEAM-ticket-manager/blob/master/public/assets/github/revenue3.webp?raw=true" alt="Statistics Dashboard" style="border-radius: 10px; margin-bottom: 5px; margin-top: 10px;" />

### 📢 Google Spreadsheet Integration

> [!IMPORTANT] > **Direct Google Ecosystem Integration**
> Unlike traditional architectures, this system communicates **directly** with the Google Spreadsheet API to function as a dynamic backend CMS.

- **Real-time Synchronization**:

  - **Student Data**: Fetches the latest student list from a central "Master Sheet".
  - **Orders**: Automatically syncs every offline order to daily sales sheets (e.g., "Offline sales 07-12-2025").
  - **Inventory**: Pulls ticket types, prices, and inventory limits directly from the spreadsheet configuration.

- **Resilient Data Pipeline**:
  - **Auto-Provisioning**: Automatically creates and formats new sheets for each sales day.
  - **Hybrid Storage**: Persists data to Neon PostgreSQL for reliability while simultaneously mirroring to Google Sheets for operations team accessibility.
  - **Smart Formatting**: Applies conditional formatting and headers programmatically to new sheets.

## 🛠️ Tech Stack

### Core

- **[Next.js 16](https://nextjs.org/)** - App Router & Turbopack.
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
  <p>Developed with ❤️ by Cao Cự Chính</p>
</div>
