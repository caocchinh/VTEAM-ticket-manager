# AI Agent Instructions for vteam-ticket-selling

## Project Overview

This is a Next.js ticket selling platform with both offline and online ticket management capabilities. The system handles ticket sales, verification, and tracking for events.

## Core Architecture

### Key Components

- **Frontend**: Next.js App Router with React components
- **Database**:
  - Drizzle ORM for both online and offline ticket management
  - Separate configurations for offline/online ticket databases (`offline-ticket-drizzle.config.ts`, `online-ticket-drizzle.config.ts`)
- **External Services**:
  - Google Sheets API for data storage and synchronization
  - Email service for ticket confirmations
  - Google Auth for staff authentication

### Data Flow

1. Staff authentication via Google Auth
2. Ticket data synchronization with Google Sheets
3. Local state management with React Query
4. Database operations with separate offline/online Drizzle instances
5. Real-time updates via React Query mutations

## Key Patterns

### Data Management

- Use `fetchOfflineSales()`, `fetchOnlineSales()` for retrieving sales data
- Always handle errors and loading states for data fetching operations
- Cache management through Drizzle's IndexedDB implementation

### Component Architecture

- Sidebar-based layout with collapsible sections
- Shared UI components in `src/components/ui/`
- Form handling with controlled inputs and validation
- Mobile-responsive design with `useIsMobile` hook

### Authentication & Authorization

- Staff verification through Google Auth
- Role-based access control for online coordinators
- Session validation in route handlers

## Common Operations

### Adding New Ticket Sales

```typescript
// Example structure for offline sales
const sale = {
  staffName: string,
  paymentMedium: "Tiền mặt" | "Chuyển khoản",
  buyerName: string,
  buyerClass: string,
  buyerEmail: string,
  buyerId: string,
  ticketType: string,
  notice: string,
};
```

### Database Commands

```bash
# Generate offline database migrations
npm run db:generate:offline

# Generate online database migrations
npm run db:generate:online

# Run database studio
npm run db:studio:offline
npm run db:studio:online
```

## Project Structure

- `/src/app` - Next.js pages and API routes
- `/src/components` - React components
- `/src/lib` - Utility functions and core services
- `/src/dal` - Data access layer
- `/src/constants` - Type definitions and constants
- `/src/drizzle` - Database configurations and migrations

## Common Issues & Solutions

1. **Data Sync Issues**

   - Use `UpdateDataDialog` component to force refresh data
   - Check Google Sheets API quotas and rate limits

2. **Authorization Errors**

   - Verify staff email in Google Sheets staff list
   - Check Google service account credentials

3. **Performance Optimization**
   - Use React Query's caching capabilities
   - Implement pagination for large datasets
   - Optimize Google Sheets operations with batch requests

## Development Workflow

1. Run development server: `npm run dev --turbopack`
2. Test changes locally
3. Verify Google Sheets integration
4. Deploy to production (Vercel)
