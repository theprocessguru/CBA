# Business Automation Platform

## Overview
This platform is a comprehensive business automation solution designed to help businesses automate operations, manage workflows, track performance, and streamline processes to improve efficiency and productivity. Its vision is to be the UK's leading AI-powered business association, offering practical AI tools and automation services tailored for small businesses, with ambitions to educate, motivate, develop, inspire, and empower entrepreneurs.

## User Preferences
Preferred communication style: Simple, everyday language.
Volunteers: No business listing menu items in dashboard (they don't need business features).

## Recent Changes
- **Admin Login Fix (August 12, 2025)**: Fixed admin login issues by marking admin accounts as email verified. Both admin accounts (admin@croydonba.org.uk and rithu@croydonba.co.uk) can now successfully login with password Admin2025!
- **Critical Database Schema Fix (August 12, 2025)**: Resolved critical bug preventing all AI Summit registrations. Added missing columns: email verification fields to users table, user_id to exhibitor and volunteer tables. All registration forms now successfully save data to database.
- **Test Data Buttons Added to Registration Forms (August 2025)**: Added "Fill with Test Data" buttons to all AI Summit registration forms that appear only in development mode. These buttons instantly populate forms with realistic test data, generate unique emails to avoid duplicates, and significantly speed up testing workflow. Buttons have a distinctive yellow color with test tube emoji (🧪) for easy identification.
- **Password Fields Added to All Registration Forms (August 2025)**: Added password creation fields to all AI Summit registration forms. Users must now create passwords during registration to access their QR codes and event badges later. Added clear "Create Your Account" sections with password/confirm password fields in attendee, exhibitor, and volunteer forms (speaker and sponsor forms already had them).
- **Required Fields Update for All Registration Forms (August 2025)**: Made email and mobile phone numbers required fields in all AI Summit registration forms (attendees, speakers, exhibitors, volunteers, sponsors). All forms now properly validate that users provide complete contact information for better event communication and coordination.
- **AI Summit Attendee Registration Fix (August 2025)**: Removed inappropriate "Role at the Event" dropdown from main registration form. Main registration is now exclusively for general attendees, with separate dedicated forms for speakers, sponsors, exhibitors, and volunteers. Each participant type uses their own registration button and tailored form.

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
- **AI Chatbot**: GoHighLevel.
- **Third-party APIs**: General integration capabilities for external business tools.