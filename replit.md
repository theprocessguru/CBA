# Business Automation Platform

## Overview
This platform is a comprehensive business automation solution designed to help businesses automate operations, manage workflows, track performance, and streamline processes to improve efficiency and productivity. Its vision is to be the UK's leading AI-powered business association, offering practical AI tools and automation services tailored for small businesses, with ambitions to educate, motivate, develop, inspire, and empower entrepreneurs.

## User Preferences
Preferred communication style: Simple, everyday language.
Volunteers: No business listing menu items in dashboard (they don't need business features).

## Recent Changes
- **MyT Automation Rebranding Complete (August 14, 2025)**: Successfully changed all GoHighLevel (GHL) references to "MyT Automation" throughout the application. Updated file names (ghlService.ts → mytAutomationService.ts, GHLChatbot → MyTAutomationChatbot, ghl-admin → myt-automation-admin), component names, documentation, and all references across frontend and backend. Environment variable GHL_API_KEY kept for compatibility.
- **Multiple Event Types Support (August 14, 2025)**: Added comprehensive events management system supporting networking events, workshops, summits, conferences, exhibitions, and seminars. Created new database tables for generic event management including registrations, exhibitors, speakers, volunteers, and sponsors.
- **Exhibition Stand Management (August 14, 2025)**: Added stand location, stand number, and stand size fields to AI Summit exhibitor registrations for proper exhibition space management. Exhibitors can now specify their exact stand details during registration.
- **Jobs Board Confirmed (August 14, 2025)**: Confirmed jobs board is fully implemented with job postings, applications, and saved searches functionality. Accessible via Membership dropdown in navigation at /jobs.
- **MyT Automation Custom Fields Documentation (August 14, 2025)**: Created comprehensive MYT_AUTOMATION_CUSTOM_FIELDS_SETUP.md guide with 150+ custom fields needed for complete data synchronization. Document includes field names, types, dropdown options, tags, and automation triggers organized by user type (members, exhibitors, speakers, volunteers, sponsors).
- **MyT Automation API Key Update (August 14, 2025)**: Successfully updated GHL_API_KEY (environment variable still uses this name for compatibility) to connect to new MyT Automation account. All integrations now point to new account including contact management, SMS/email notifications, and chatbot features.
- **Membership Stats Page Fix (August 14, 2025)**: Fixed "Failed to fetch stats" error by adding credentials: 'include' to fetch requests in MembershipManagement.tsx. Stats now properly display member counts and tier distribution.
- **Website Links Completed (August 14, 2025)**: Added https://theprocess.guru link to all Steve Ball references throughout the application. All company websites now properly linked: The Process Guru, MyT Automation, MyT AI, Wagner Caleap Consultancy.
- **Admin Login Fix (August 12, 2025)**: Fixed admin login issues by marking admin accounts as email verified. Both admin accounts (admin@croydonba.org.uk and rithu@croydonba.co.uk) can now successfully login with password Admin2025!
- **Critical Database Schema Fix (August 12, 2025)**: Resolved critical bug preventing all AI Summit registrations. Added missing columns: email verification fields to users table, user_id to exhibitor and volunteer tables. All registration forms now successfully save data to database.

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
- **Authentication & Authorization**: Dual authentication, secure HTTP-only cookies, PostgreSQL session store, role-based access (admin/user), and email-based password recovery.
- **Business Process Management**: Workflow automation, task management, performance analytics, and integration capabilities for external tools.
- **Automation Features**: Visual process builder, automated notification system, data import/export, and real-time reporting dashboards.
- **Membership System**: Five-tier membership system with over 245 practical business benefits including networking, support, training, discounts, and AI tools. Includes an automated membership limit enforcement system with real-time usage tracking and upgrade prompts.
- **Event Management**: Registration calendar system, venue capacity management, comprehensive volunteer profile system with enhanced scanner functionality, and event scheduling with time slots and speaker assignments. Features for exhibitor visitor scanning and comprehensive sponsorship management.
- **AI Services**: Simplified AI service add-on pricing focusing on practical tools like content writing, chatbots, and document processing. Includes HMRC compliance warning system and income threshold checker.
- **Badge System**: Comprehensive badge generation and download functionality with QR codes, supporting multiple participant roles. Badges optimized for standard badge holders (102mm x 76mm).
- **Location Services**: Location-based welcome system and venue directions.
- **Affiliate Programme**: Complete affiliate referral system with automatic enrollment, commission tracking, and Stripe integration for payouts.
- **Admin Tools**: Business analytics dashboard, enhanced membership benefits management, admin event management system, contact import system.

## External Dependencies
- **Database**: Neon PostgreSQL serverless database.
- **Email Service**: NodeMailer and SendGrid.
- **Payment Processing**: Stripe.
- **AI Chatbot**: MyT Automation.
- **Third-party APIs**: General integration capabilities for external business tools.