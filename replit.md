# Business Automation Platform

## Overview
This platform is a comprehensive business automation solution designed to help businesses automate operations, manage workflows, track performance, and streamline processes to improve efficiency and productivity. Its vision is to be the UK's leading AI-powered business association, offering practical AI tools and automation services tailored for small businesses, with ambitions to educate, motivate, develop, inspire, and empower entrepreneurs.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Membership System**: Five-tier membership system (Starter, Growth, Strategic, Patron, Partner) with over 245 practical business benefits including networking, support, training, discounts, and AI tools. Includes an automated membership limit enforcement system with real-time usage tracking and upgrade prompts.
- **Event Management**: Registration calendar system, venue capacity management, and a comprehensive volunteer profile system with enhanced scanner functionality to display volunteer-specific information.
- **AI Services**: Simplified AI service add-on pricing (AI Basics, AI Professional) focusing on practical tools like content writing, chatbots, and document processing. Includes HMRC compliance warning system and income threshold checker.
- **Badge System**: Comprehensive badge generation and download functionality with QR codes, supporting multiple participant roles for complex events.

## External Dependencies
- **Database**: Neon PostgreSQL serverless database.
- **Email Service**: Configurable SMTP (NodeMailer) and SendGrid integration.
- **Payment Processing**: Stripe integration for subscription management.
- **AI Chatbot**: GoHighLevel for AI-powered chatbot with intelligent fallback responses.
- **Third-party APIs**: General integration capabilities for external business tools.
- **Development Tools (used in project)**: TypeScript, ESBuild, Tailwind CSS, Zod.