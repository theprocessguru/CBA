# Croydon Business Association - Member Directory & Marketplace

## Overview

This is a full-stack web application for the Croydon Business Association (CBA), built with React/TypeScript frontend and Express backend. The platform serves as a comprehensive business directory and marketplace where local businesses can showcase their services, products, and special offers to members and the public.

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
- **Role-Based Access**: Admin and member roles with different permissions
- **Password Reset**: Email-based password recovery system

### Business Management
- **Business Profiles**: Comprehensive business information with images
- **Product/Service Catalog**: Structured product and service listings
- **Special Offers**: Time-limited promotional offers for members
- **Category System**: Organized business and product categorization

### User Interface
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Component Library**: Consistent UI components across the application
- **Mobile Navigation**: Bottom navigation bar for mobile users
- **Admin Interface**: Specialized admin panels for content management

### Content Management
- **Member Import**: CSV bulk import functionality for businesses
- **Content Reporting**: User-generated content moderation system
- **Analytics**: Interaction tracking and business analytics
- **Email System**: Configurable SMTP integration for notifications

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OAuth or local registration
2. **Business Registration**: Authenticated users can claim/create business profiles
3. **Content Creation**: Business owners add products, services, and offers
4. **Public Discovery**: Visitors browse directory and marketplace
5. **Member Interactions**: Members access exclusive offers and networking features
6. **Admin Oversight**: Administrators moderate content and manage users

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Email Service**: Configurable SMTP (NodeMailer) and SendGrid integration
- **Payment Processing**: Stripe integration for membership payments
- **Go High Level**: CRM integration for lead management

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
- **Image Optimization**: Base64 encoding for simple image storage
- **Caching Strategy**: Query caching with TanStack Query
- **Bundle Splitting**: Vite automatically splits code for optimal loading

## Changelog
```
Changelog:
- June 24, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```