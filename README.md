<div align="center">
  <img src="/public/assets/logo.webp" alt="VTEAM Logo" width="200"/>
  <p>
    <strong>Real-time ticket management system for Vinschool Central Park Student Council events</strong>
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
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Neon-PostgreSQL-4A9EFF?logo=postgresql&logoColor=white" alt="Neon PostgreSQL" />
  </p>
</div>

---

## 📖 Introduction

**VTEAM Ticket Selling** is a comprehensive real-time ticket management system built exclusively for the **Vinschool Central Park Student Council** to manage large-scale events. Designed to handle event ticket sales for up to 600+ attendees, this platform streamlines both offline (staff-managed) and online (self-service) ticket purchasing, provides real-time revenue tracking, automated email confirmations, and detailed analytics for event coordinators.

The system was developed to support major student council events like PROM and other large gatherings, ensuring smooth ticket operations, secure payment verification, and efficient staff coordination.

## ✨ Features

VTEAM Ticket Selling is packed with powerful features designed for efficient event ticket management:

### 🎫 Dual Ticket Sales System

- **Offline Ticket Sales**: Staff-managed ticket selling interface with real-time inventory tracking

  - **Smart Student Autocomplete System**: Revolutionary feature that solves critical operational challenges

    - **Instant Lookup**: Type any part of student name, email, student ID, or homeroom to get immediate suggestions
    - **Eliminates Miscommunication**: No more spelling mistakes or verbal misunderstandings between staff and students
    - **Faster Verification**: Reduces verification time from minutes to seconds - students don't need to repeat information
    - **Data Accuracy**: Ensures 100% accurate student information by pulling directly from the school database
    - **Improved Efficiency**: Staff can process tickets 3x faster compared to manual entry
    - **Better Customer Experience**: Students simply confirm their info instead of dictating it
    - **Multi-field Search**: Works across name, email, student ID, and homeroom simultaneously for maximum flexibility

  - Support for both cash and bank transfer payments
  - Customizable ticket types with color coding
  - Order queue management with subtotal calculation
  - Print-friendly receipt generation

<img src="/public/assets/screenshots/offline-sales.png" alt="Offline Ticket Sales Interface" style="border-radius: 10px; margin-bottom: 10px; margin-top: -10px;" />
  
- **Online Ticket Sales**: Self-service ticket purchasing portal for students
  - Secure payment proof upload system
  - Automated order verification workflow (pending → approved/rejected)
  - Email notifications for order status updates

<img src="/public/assets/screenshots/online-portal.png" alt="Online Ticket Sales Portal" style="border-radius: 10px; margin-bottom: 10px; margin-top: -10px;" />

### 📊 Real-time Statistics & Analytics

- **Revenue Tracking**: Live revenue monitoring for both offline and online sales
  - Total revenue aggregation across all sales channels
  - Per-ticket-type revenue breakdown
  - Staff contribution analytics
- **Interactive Charts & Visualizations** (powered by Recharts):
  - Ticket distribution pie charts
  - Sales trend line charts
  - Staff contribution bar charts
  - Payment method distribution
  - Class-wise ticket distribution
- **Staff Performance Dashboard**:
  - Individual staff sales statistics
  - Revenue contribution percentages
  - Order count tracking

<img src="/public/assets/screenshots/statistics-dashboard.png" alt="Statistics Dashboard with Charts" style="border-radius: 10px; margin-bottom: 10px; margin-top: -10px;" />

### 📧 Automated Email System

Fully automated email notifications for ticket buyers using custom HTML templates:

- **Success Emails**: Sent when ticket purchase is approved
  - Personalized buyer information
  - Event details and ticket type
  - Important event reminders and instructions
  - Event-specific links (e.g., haunted house queue number system)
- **Rejection Emails**: Sent when payment verification fails
  - Clear rejection reason explanation
  - Proof of payment link for review
  - Contact information for support

<img src="/public/assets/screenshots/rejection-email.png" alt="Rejection Email Template" style="border-radius: 10px; margin-bottom: 10px; margin-top: -10px;" />

Email templates feature:

- Professional branding with VTEAM logos and colors
- Mobile-responsive design

<img src="/public/assets/screenshots/success-email.png" alt="Success Email Template" style="border-radius: 10px; margin-bottom: 10px; margin-top: -10px;" />

- Social media links (Facebook, Instagram, TikTok, Spotify)
- Vietnamese language support

### 👥 Staff Management & Permissions

- **Google OAuth Authentication**: Secure staff login via Google accounts
- **Role-based Access Control**:
  - Regular staff: Can sell offline tickets and view their own statistics
  - Online coordinators: Additional access to manage online ticket verification
- **Teacher Verification**: Special interface for teacher authorization checks

### 💾 Data Persistence & Offline Support

- **IndexedDB Caching**: Client-side caching for improved performance and offline resilience
  - Student list caching
  - Event information caching
  - Ticket information caching
- **LocalStorage**: Auto-save current orders and form data to prevent data loss
- **Data Synchronization**: Manual refresh controls for fetching latest data from Google Sheets

### 🎨 User Experience Features

- **Dark Mode Support**: System-wide dark/light theme with Next Themes
- **Responsive Design**: Optimized for desktop tablet use at ticket selling booths
- **Interactive Sidebar**: Collapsible sidebar with quick access to all features
- **Built-in Calculator**: Change calculator for cash transactions
- **Color-coded Tickets**: Visual ticket type identification with customizable colors
- **Real-time Validation**: Immediate feedback on form inputs and ticket availability

<img src="/public/assets/screenshots/main-dashboard.png" alt="Main Dashboard Interface" style="border-radius: 10px; margin-bottom: 10px; margin-top: -10px;" />

### 🔒 Security & Data Integrity

- **Session Management**: Secure session handling with Better Auth
- **Staff Authorization**: Email-based staff verification against Google Sheets
- **Retry Mechanisms**: Automatic retry logic for critical API calls
- **Error Handling**: Comprehensive error codes and user-friendly error messages
- **Backup Orders**: Database backup for all transactions

## 🛠️ Tech Stack

VTEAM Ticket Selling leverages cutting-edge technologies for performance and developer experience:

### Core Framework

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[React 19](https://react.dev/)** - Latest React with concurrent features

### Styling & UI

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Lucide React](https://lucide.dev/)** - Modern icon library
- **[Motion](https://motion.dev/)** - Smooth animations
- **[Next Themes](https://github.com/pacocoursey/next-themes)** - Dark mode support

### Database & ORM

- **[Neon PostgreSQL](https://neon.tech/)** - Serverless PostgreSQL with dual database architecture:
  - `offline-ticket` database for staff-managed sales
  - `online-ticket` database for self-service purchases
  - `silencio-queue` database for event-specific features
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript-first ORM
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Database migrations and studio

### Authentication & Authorization

- **[Better Auth](https://github.com/better-auth/better-auth)** - Modern authentication library
- **Google OAuth** - Staff authentication via Google accounts
- **[Google APIs](https://www.npmjs.com/package/googleapis)** - Integration with Google services

### Data & State Management

- **[TanStack Query](https://tanstack.com/query/latest)** - Powerful async state management
- **[TanStack Virtual](https://tanstack.com/virtual/latest)** - Virtual scrolling for large lists
- **[IndexedDB (via idb)](https://github.com/jakearchibald/idb)** - Client-side database caching

### Email & Notifications

- **[Nodemailer](https://nodemailer.com/)** - Email sending with Gmail SMTP
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### Data Visualization

- **[Recharts](https://recharts.org/)** - Composable charting library for React

### External Data Sources

- **Google Sheets API** - Integration for:
  - Student database lookups
  - Staff authorization lists
  - Event configuration
  - Ticket inventory management
  - Sales data storage

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **Turbopack** - Next-generation bundler for faster development

### 3D & Visual Effects

- **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/)** - React renderer for Three.js
- **[@react-three/drei](https://github.com/pmndrs/drei)** - Helper components for React Three Fiber

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **pnpm** package manager
- **Neon PostgreSQL** account with three databases
- **Google Cloud Project** with OAuth 2.0 credentials
- **Gmail account** with App Password for email sending
- **Google Sheets** for data storage

### Environment Variables

Create a `.env` file in the root directory with the required configuration. Reference the `copy.env` file for all necessary environment variables:

```bash
cp copy.env .env
```

Key environment variables include:

- **Database URLs**: Neon PostgreSQL connection strings for offline, online, and queue databases
- **Google OAuth**: Client ID and Client Secret
- **Email Configuration**: Gmail credentials and SMTP settings
- **Better Auth**: Secret key and trusted origins
- **Google Sheets**: Sheet IDs and API credentials

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd vteam-offline-ticket
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up databases**:

   ```bash
   # Generate migrations for offline database
   npm run db:generate:offline

   # Run migrations for offline database
   npm run db:migrate:offline

   # Generate migrations for online database
   npm run db:generate:online

   # Run migrations for online database
   npm run db:migrate:online
   ```

4. **Configure Google Sheets**:

   - Set up Google Sheets for student database, staff list, ticket info, and sales tracking
   - Update sheet IDs in environment variables
   - Ensure proper sharing permissions

5. **Start development server**:

   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Log in with authorized Google account

### Database Management

Inspect and manage databases using Drizzle Studio:

```bash
# Open Drizzle Studio for offline database
npm run db:studio:offline

# Open Drizzle Studio for online database
npm run db:studio:online
```

```

## 🎯 Usage

### For Staff (Offline Ticket Sales)

1. **Login**: Access the platform with your authorized Google account
2. **Student Lookup**: Use autocomplete to quickly find student information
3. **Select Ticket Type**: Choose from available ticket types (inventory updates in real-time)
4. **Add to Order**: Build orders with multiple tickets before submitting
5. **Payment**: Select payment method (cash or bank transfer)
6. **Submit Order**: Finalize the order - email notifications are sent automatically
7. **View Statistics**: Monitor your sales performance in the sidebar

### For Online Coordinators

1. **Access Online Management**: Click "Online Ticket Management" in the sidebar
2. **Review Orders**: See all pending online ticket purchases
3. **Verify Payments**: Check submitted payment proofs
4. **Approve/Reject**: Process orders with appropriate status updates
5. **Monitor Analytics**: View comprehensive sales statistics across all channels

### For Event Administrators

1. **Update Event Info**: Modify event details in Google Sheets
2. **Manage Ticket Types**: Add/remove ticket types and adjust pricing
3. **Staff Management**: Control staff access via Google Sheets authorization list
4. **Data Refresh**: Use "Update Data" dialog to sync latest information
5. **Export Reports**: Access sales data from Google Sheets for analysis

## 📊 Key Features Deep Dive

### Real-time Inventory Management

The system tracks ticket availability across both offline and online channels:

- Sold tickets are counted in real-time
- Maximum quantities enforced per ticket type
- Visual indicators for sold-out tickets
- Prevents overselling through validation

### Email Automation Workflow

1. **Order Submission**: Customer completes purchase
2. **Database Entry**: Order recorded in appropriate database
3. **Email Trigger**: System automatically sends templated email
4. **Personalization**: Email populated with buyer and event details
5. **Delivery Tracking**: Success/failure logged for troubleshooting

### Data Synchronization Architecture

- **Google Sheets as Source of Truth**: Master data stored in Sheets
- **API Layer**: Next.js API routes fetch from Sheets
- **Client Caching**: IndexedDB stores data locally for performance
- **Manual Refresh**: Staff can trigger data sync when needed
- **Automatic Updates**: Sales data written back to Sheets in real-time

## 🔧 Troubleshooting

### Common Issues

**Issue**: Cannot log in

- **Solution**: Verify your email is in the authorized staff list in Google Sheets

**Issue**: Email not sending

- **Solution**: Check Gmail App Password and SMTP configuration in `.env`

**Issue**: Student data not loading

- **Solution**: Ensure Google Sheets API credentials are correct and sheets are shared properly

**Issue**: Ticket inventory not updating

- **Solution**: Click "Update Data" in the sidebar to refresh from Google Sheets

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Developed with ❤️ by the Vinschool Central Park Student Council Tech Team</p>
  <p>For event inquiries, contact VTEAM at Vinschool Central Park</p>
</div>
```
