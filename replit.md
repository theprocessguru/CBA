# Business Automation Platform

## Overview
This platform is a comprehensive business automation solution designed to help businesses automate operations, manage workflows, track performance, and streamline processes to improve efficiency and productivity. Its vision is to be the UK's leading AI-powered business association, offering practical AI tools and automation services tailored for small businesses, with ambitions to educate, motivate, develop, inspire, and empower entrepreneurs.

## User Preferences
Preferred communication style: Simple, everyday language.
Volunteers: No business listing menu items in dashboard (they don't need business features).
Navigation: Logged-in users only see logo and action buttons (Scanner, Mobile Badge, Dashboard) - no dropdown menus.

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript, built with Vite.
- **Styling**: Tailwind CSS with a custom design system, using Radix UI primitives and shadcn/ui components.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Routing**: Wouter for lightweight client-side routing.
- **Forms**: React Hook Form with Zod validation.
- **UI/UX Decisions**: Mobile-first responsive design, consistent component library, bottom navigation for mobile, specialized admin interfaces, back button navigation for improved user flow, consistent padding across admin pages.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database**: PostgreSQL via Neon serverless, managed with Drizzle ORM for type-safe operations and Drizzle Kit for migrations.
- **Authentication**: Dual system supporting Replit OAuth and traditional email/password with bcrypt.
- **Session Management**: Express sessions with PostgreSQL store, enhanced with blacklist mechanism for reliable logout.
- **Data Storage**: PostgreSQL for primary data and sessions; base64 encoded images stored directly in the database.

### Core Features
- **Authentication & Authorization**: Dual authentication, secure HTTP-only cookies, PostgreSQL session store with session blacklist for reliable logout, role-based access (admin/user), and email-based password recovery. Role-based dashboards provide tailored navigation for admins, students, volunteers, and business members.
- **Business Process Management**: Workflow automation, task management, performance analytics, and integration capabilities. Includes a visual process builder, automated notification system, and real-time reporting dashboards.
- **Membership System**: Five-tier membership system with over 245 practical business benefits, automated membership limit enforcement, usage tracking, and upgrade prompts.
- **Event Management**: Comprehensive system supporting multiple event types (networking, workshops, summits, conferences, exhibitions, seminars) with registration calendar, venue capacity management, exhibitor management (including stand details), speaker management (with slot selection and assignment), and comprehensive sponsorship management. Includes a volunteer profile system with scanner functionality.
- **AI Services**: Simplified AI service add-on pricing focusing on practical tools like content writing, chatbots, and document processing, including HMRC compliance warnings.
- **Badge System**: Comprehensive badge generation and download with QR codes for multiple participant roles, optimized for standard badge holders.
- **Location Services**: Location-based welcome system and venue directions.
- **Affiliate Programme**: Complete referral system with automatic enrollment, commission tracking, and Stripe integration for payouts.
- **Admin Tools**: Business analytics dashboard focused on funding and impact reporting (total members, trained individuals, events, jobs, stakeholder percentages, economic impact KPIs), enhanced membership benefits management, event management, and contact import system. Comprehensive admin management including editing, password reset, and removal with safety features and email domain validation.
- **Onboarding System**: Personalized welcome messages for all stakeholder types (volunteers, VIPs, attendees, team members, speakers, exhibitors, sponsors) with automatic onboarding on registration, admin management interface for manual triggers, and bulk send capabilities.
- **Jobs Board**: Complete recruitment platform where registered businesses can post job opportunities, and attendees/students with free non-business membership can upload resumes and apply for positions. Includes job search filters, application tracking, saved searches, and QR code generation for workshop access. Features cover letter submission, application status tracking, and comprehensive job management for businesses.

## Recent Critical Fixes & Data Recovery (December 2024)

### Phone Number Data Recovery Operation
**Problem Discovered**: 124 out of 138 organic AI Summit signups showed missing phone numbers in exports, despite phone being a required field. This impacted MYT Automation integration and event communications for 401 attendees.

**Root Cause Identified**:
1. **Frontend Validation Bug**: JavaScript validation only checked firstName, lastName, and email - completely bypassing the HTML required attribute for phone numbers
2. **Backend Validation Gap**: API endpoint accepted `phoneNumber || null`, allowing empty phone values to pass through
3. **Data Storage Mismatch**: Phone numbers were saved to `ai_summit_registrations.phone_number` but never synced to `users.phone` field (where exports looked)

**Investigation & Recovery Process**:
- Initial hypothesis: Users bypassed the required phone field
- Discovery: Phone numbers WERE collected and stored, just in wrong database table
- Found 86 out of 100 AI Summit registrations had phone numbers in `ai_summit_registrations` table
- Successfully recovered and synced 80 phone numbers to users table

**Results**:
- **Before**: Only 14 users had phone numbers (90% data loss)
- **After**: 91 users now have phone numbers (65% recovery rate)
- **Reduced** missing phones from 124 to 47 users
- **Fixed** validation on both frontend and backend to prevent future data loss

**Infrastructure Created**:
- Phone recovery page (`/phone-recovery`) for manual phone updates
- API endpoint `/api/user/update-phone` for phone data updates
- Export files: `phone_recovery_list.csv`, `organic_app_signups.csv` for tracking

**Key Learning**: Always verify data flows through entire pipeline - collection, storage, and retrieval points may differ.

## External Dependencies
- **Database**: Neon PostgreSQL serverless database.
- **Email Service**: NodeMailer and SendGrid.
- **Payment Processing**: Stripe.
- **AI Chatbot & Automation**: MYT Automation (never refer to GoHighLevel or GHL).
- **Third-party APIs**: General integration capabilities for external business tools, including Companies House for business data synchronization.