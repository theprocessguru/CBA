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
- July 30, 2025. Advanced AI Support & Services Enhancement:
  * Added 25 new AI-specific benefits across all membership tiers
  * Created comprehensive AI Services page with 8 service categories
  * Built interactive AI Tools page with functional AI features
  * Added "Advanced AI Tools & Features" benefit category with 10 tools
  * Implemented progressive AI capabilities from basic training to custom models
  * Added AI Tools navigation link and cross-page integration
  * Enhanced benefits total from 95+ to 105+ across 12 categories
  * Progressive AI tool access: Starter (basic), Growth+ (content tools), Strategic+ (analytics), Patron+ (insights), Partner (full suite)

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