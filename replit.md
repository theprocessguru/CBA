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
- **Session Management**: Express sessions with PostgreSQL store.
- **Data Storage**: PostgreSQL for primary data and sessions; base64 encoded images stored directly in the database.

### Core Features
- **Authentication & Authorization**: Dual authentication, secure HTTP-only cookies, PostgreSQL session store, role-based access (admin/user), and email-based password recovery. Role-based dashboards provide tailored navigation for admins, students, volunteers, and business members.
- **Business Process Management**: Workflow automation, task management, performance analytics, and integration capabilities. Includes a visual process builder, automated notification system, and real-time reporting dashboards.
- **Membership System**: Five-tier membership system with over 245 practical business benefits, automated membership limit enforcement, usage tracking, and upgrade prompts.
- **Event Management**: Comprehensive system supporting multiple event types (networking, workshops, summits, conferences, exhibitions, seminars) with registration calendar, venue capacity management, exhibitor management (including stand details), speaker management (with slot selection and assignment), and comprehensive sponsorship management. Includes a volunteer profile system with scanner functionality.
- **AI Services**: Simplified AI service add-on pricing focusing on practical tools like content writing, chatbots, and document processing, including HMRC compliance warnings.
- **Badge System**: Comprehensive badge generation and download with QR codes for multiple participant roles, optimized for standard badge holders.
- **Location Services**: Location-based welcome system and venue directions.
- **Affiliate Programme**: Complete referral system with automatic enrollment, commission tracking, and Stripe integration for payouts.
- **Admin Tools**: Business analytics dashboard focused on funding and impact reporting (total members, trained individuals, events, jobs, stakeholder percentages, economic impact KPIs), enhanced membership benefits management, event management, and contact import system. Comprehensive admin management including editing, password reset, and removal with safety features and email domain validation.
- **Onboarding System**: Personalized welcome messages for all stakeholder types (volunteers, VIPs, attendees, team members, speakers, exhibitors, sponsors) with automatic onboarding on registration, admin management interface for manual triggers, and bulk send capabilities.

## External Dependencies
- **Database**: Neon PostgreSQL serverless database.
- **Email Service**: NodeMailer and SendGrid.
- **Payment Processing**: Stripe.
- **AI Chatbot**: MyT Automation.
- **Third-party APIs**: General integration capabilities for external business tools, including Companies House for business data synchronization.