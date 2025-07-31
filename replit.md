# Business Automation Platform

## Overview

This is a comprehensive business automation platform built with React/TypeScript frontend and Express backend. The platform helps businesses automate their operations, manage workflows, track performance, and streamline processes for improved efficiency and productivity.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Dual authentication system (Replit OAuth + local auth with bcrypt)
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon serverless platform
- **Session Storage**: PostgreSQL sessions table
- **File Storage**: Base64 encoded images stored directly in database
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Authentication & Authorization
- **Dual Auth System**: Supports both Replit OAuth and traditional email/password
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session store
- **Role-Based Access**: Admin and user roles with different permissions
- **Password Reset**: Email-based password recovery system

### Business Process Management
- **Workflow Automation**: Automated business process execution
- **Task Management**: Structured task and activity tracking
- **Performance Analytics**: Business metrics and KPI monitoring
- **Integration Hub**: Connect with external business tools and APIs

### User Interface
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Component Library**: Consistent UI components across the application
- **Mobile Navigation**: Bottom navigation bar for mobile users
- **Admin Interface**: Specialized admin panels for system management

### Automation Features
- **Process Builder**: Visual workflow creation and management
- **Notification System**: Automated alerts and communication
- **Data Import/Export**: Bulk data processing capabilities
- **Reporting Dashboard**: Real-time business insights and analytics

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OAuth or local registration
2. **Process Setup**: Authenticated users create and configure automation workflows
3. **Task Execution**: System automatically executes defined business processes
4. **Monitoring**: Real-time tracking of automation performance and results
5. **Analytics**: Generate insights and reports on business efficiency
6. **Admin Oversight**: Administrators manage users and system configuration

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Email Service**: Configurable SMTP (NodeMailer) and SendGrid integration
- **Payment Processing**: Stripe integration for subscription management
- **External APIs**: Integration capabilities for third-party business tools

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast production builds
- **Tailwind CSS**: Utility-first styling framework
- **Zod**: Runtime type validation and schema definition

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with hot reloading via Vite
- **Production**: Containerized deployment on Replit autoscale infrastructure
- **Database**: Serverless PostgreSQL with connection pooling
- **Static Assets**: Served via Express with Vite build output

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets
2. **Backend Build**: ESBuild bundles server code with external packages
3. **Database Migration**: Drizzle Kit manages schema changes
4. **Deployment**: Replit handles container orchestration and scaling

### Performance Optimizations
- **Connection Pooling**: Optimized database connections for serverless
- **Caching Strategy**: Query caching with TanStack Query
- **Bundle Splitting**: Vite automatically splits code for optimal loading
- **Real-time Updates**: WebSocket integration for live process monitoring

## Changelog
```
Changelog:
- July 31, 2025. Navigation Enhancement + MyT Accounting Pricing Updates:
  * Added tagline "UK's Leading AI-Powered Business Association" under CBA logo
  * Fixed login button z-index layering issue - no longer hidden by menu elements
  * Updated MyT Accounting pricing to Standard/Plus/Pro at £5/£10/£15 (50% CBA discount)
  * Corrected AI analytics document limits: 75/150/300 documents per month respectively
  * Enhanced navigation with proper layering and improved mobile responsiveness
- July 31, 2025. MyT Accounting & Bookkeeping Software Integration + Premium AI Service Pricing:
  * Added comprehensive MyT Accounting software page with AI document scanning capabilities
  * Implemented HMRC compliance warning system for businesses earning over £50,000
  * Created income threshold checker widget for automatic compliance alerts
  * Updated navigation to prominently feature MyT Accounting software
  * Enhanced membership benefits page with MyT Accounting software highlight
  * Added mobile-responsive MyT Accounting page with pricing tiers and CBA member discounts
  * Integrated IncomeWarningWidget into dashboard for member compliance tracking
  * Updated navigation structure with improved AI menu organization and horizontal submenus
  * Positioned MyT Accounting as core CBA member benefit with 35% discount structure
  * MAJOR UPDATE: Simplified AI service add-on pricing structure for small businesses
  * Reduced to 2 practical AI tiers: AI Basics (£29.99), AI Professional (£79.99)
  * Removed excessive AI features that were overwhelming for small business owners
  * Streamlined benefits back to approximately 280 total across all categories
  * AI services now focused on practical tools: content writing, chatbots, document processing
  * BREAKTHROUGH: Created First AI Summit Croydon 2025 event page - October 1st, 10 AM-4 PM
  * Positioned CBA as AI experts with inaugural free educational event at LSBU Croydon
  * Comprehensive summit with speakers, workshops, micro business exhibition
  * Prominently featured AI Summit in navigation to drive registrations and establish AI leadership
  * Event designed to educate, motivate, develop, inspire, and empower entrepreneurs and residents

- July 30, 2025. Simplified AI Services Platform for Small Business Owners:
  * Refined from extensive AI features to approximately 245+ comprehensive business benefits across all categories
  * Created 6 dedicated AI pages: Services, Tools, Automation, Strategy, Enterprise, Analytics
  * Built practical AI backend service with real API endpoints for small business operations
  * Implemented working AI content generation, document processing, and basic analytics
  * Focused on small business needs: content creation, customer service, basic automation
  * Removed overwhelming features like consciousness research, reality manipulation, divine computing
  * Progressive AI access: Starter (basic tools), Growth+ (business automation), Strategic+ (advanced tools), Patron+ (premium features), Partner (full business suite)
  * AI services now appropriate for local businesses, restaurants, shops, and service providers

- July 28, 2025. Comprehensive Membership Benefits System Implementation:
  * Created detailed 80+ business association benefits across 10 categories
  * Implemented 5-tier membership system (Starter, Growth, Strategic, Patron, Partner)
  * Added comprehensive benefits comparison interface for admins
  * Built benefits grid component with category-based organization
  * Enhanced membership management with usage limits and tier restrictions
  * Added membership benefits public page with pricing comparison
  * Maintained original CBA branding as requested by user

- July 23, 2025. Initial setup as business automation platform
- Copied from CBA member directory application with complete functionality
- Updated branding and messaging for business automation focus
- Modified home page and hero section for automation platform
- Retained all technical infrastructure: authentication, database, security
- Ready for customization with automation-specific features
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```