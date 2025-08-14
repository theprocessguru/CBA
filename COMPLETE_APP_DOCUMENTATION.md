# CBA Business Management Platform - Complete Detailed Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [User Management System](#user-management-system)
4. [Authentication & Security](#authentication--security)
5. [Membership System](#membership-system)
6. [Complete Benefits List (235 Benefits)](#complete-benefits-list)
7. [Event Management System](#event-management-system)
8. [AI Summit Features](#ai-summit-features)
9. [Business Features](#business-features)
10. [Admin Dashboard](#admin-dashboard)
11. [API Endpoints](#api-endpoints)
12. [File Structure](#file-structure)
13. [Email System](#email-system)
14. [Access Control Matrix](#access-control-matrix)

---

## 1. System Architecture

### Frontend Technology Stack
```
- React: 18.3.1
- TypeScript: 5.x
- Vite: 5.4.10 (build tool)
- Wouter: 3.3.5 (routing)
- TanStack Query: 5.x (state management)
- React Hook Form: 7.x (form handling)
- Zod: 3.x (validation)
- Tailwind CSS: 3.x (styling)
- shadcn/ui: Latest (component library)
- Lucide React: Latest (icons)
- Recharts: 2.x (charts)
- Framer Motion: 11.x (animations)
```

### Backend Technology Stack
```
- Node.js: 20.x
- Express: 4.21.1
- TypeScript: 5.x
- PostgreSQL: 16.x (Neon serverless)
- Drizzle ORM: 0.36.4
- bcrypt: 5.x (password hashing)
- Express Session: 1.18.1
- Nodemailer: 6.x (email)
- SendGrid: 8.x (email service)
- Stripe: 17.x (payments)
- OpenAI: 4.x (AI integration)
```

### Infrastructure
```
- Database: Neon PostgreSQL (serverless)
- Session Store: connect-pg-simple
- File Storage: Base64 encoded in database
- Deployment: Replit
- Environment: Development/Production
```

---

## 2. Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    company_name VARCHAR,
    phone VARCHAR,
    address TEXT,
    city VARCHAR,
    country VARCHAR,
    postcode VARCHAR,
    qr_handle VARCHAR UNIQUE,
    participant_type VARCHAR DEFAULT 'attendee',
    membership_tier VARCHAR DEFAULT 'Starter Tier',
    membership_expires_at TIMESTAMP,
    is_admin BOOLEAN DEFAULT false,
    role VARCHAR,
    profile_image TEXT,
    bio TEXT,
    website VARCHAR,
    linkedin VARCHAR,
    twitter VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Businesses Table
```sql
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    name VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR,
    address TEXT,
    city VARCHAR,
    country VARCHAR,
    postcode VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    website VARCHAR,
    logo TEXT,
    opening_hours TEXT,
    social_media JSONB,
    verified BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Events Tables
```sql
-- CBA Events (admin-managed)
CREATE TABLE cba_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR,
    venue VARCHAR,
    capacity INTEGER,
    price DECIMAL(10,2),
    member_price DECIMAL(10,2),
    image_url TEXT,
    registration_url VARCHAR,
    event_type VARCHAR,
    status VARCHAR DEFAULT 'upcoming',
    tags TEXT[],
    created_by VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- General Events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    business_id INTEGER REFERENCES businesses(id),
    title VARCHAR NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR,
    venue VARCHAR,
    capacity INTEGER,
    price DECIMAL(10,2),
    image_url TEXT,
    registration_url VARCHAR,
    event_type VARCHAR,
    status VARCHAR DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Membership & Benefits Tables
```sql
-- Membership Tiers
CREATE TABLE membership_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    price DECIMAL(10,2),
    billing_period VARCHAR,
    features TEXT[],
    max_products INTEGER,
    max_events INTEGER,
    priority_support BOOLEAN,
    ai_tools_access VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Benefits
CREATE TABLE benefits (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tier-Benefit Assignments
CREATE TABLE membership_tier_benefits (
    id SERIAL PRIMARY KEY,
    tier_name TEXT,
    benefit_id INTEGER REFERENCES benefits(id),
    is_included BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Sponsorship Tables
```sql
-- Sponsorship Packages
CREATE TABLE sponsorship_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    price DECIMAL(10,2),
    features TEXT[],
    max_sponsors INTEGER,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true
);

-- Event Sponsors
CREATE TABLE event_sponsors (
    id SERIAL PRIMARY KEY,
    event_id INTEGER,
    company_name VARCHAR NOT NULL,
    contact_name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    package_id INTEGER REFERENCES sponsorship_packages(id),
    amount DECIMAL(10,2),
    logo_url TEXT,
    website VARCHAR,
    status VARCHAR DEFAULT 'pending',
    payment_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Attendance & Contact Tables
```sql
-- Attendance Tracking
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    event_id INTEGER,
    event_name VARCHAR,
    user_id VARCHAR,
    attendee_name VARCHAR,
    attendee_email VARCHAR,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    attendance_type VARCHAR,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    company VARCHAR,
    phone VARCHAR,
    contact_type VARCHAR,
    source VARCHAR,
    notes TEXT,
    imported_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. User Management System

### User Types (7 Categories)
```javascript
const USER_TYPES = {
    attendee: {
        count: 42,
        access: "Full business features",
        badge: "Blue",
        restrictions: "None",
        features: [
            "Business profile management",
            "Product/service listings",
            "Special offers",
            "Event registration",
            "Membership benefits",
            "Networking tools"
        ]
    },
    volunteer: {
        count: 1,
        access: "Limited business features",
        badge: "Green",
        restrictions: "No business profiles, products, or offers",
        features: [
            "Event check-in assistance",
            "Volunteer area access",
            "Basic event registration",
            "Volunteer scheduling"
        ]
    },
    speaker: {
        count: 0,
        access: "Speaker-specific features",
        badge: "Purple",
        restrictions: "Limited to speaker functions",
        features: [
            "Speaker profile",
            "Green room access",
            "Presentation uploads",
            "Session management"
        ]
    },
    exhibitor: {
        count: 0,
        access: "Exhibition features",
        badge: "Orange",
        restrictions: "Exhibition management only",
        features: [
            "Booth management",
            "Lead capture",
            "Exhibition materials",
            "Exhibitor directory"
        ]
    },
    vip_guest: {
        count: 0,
        access: "VIP privileges",
        badge: "Yellow",
        restrictions: "No business management",
        features: [
            "VIP lounge access",
            "Priority seating",
            "Exclusive events",
            "Concierge services"
        ]
    },
    resident: {
        count: 0,
        access: "Community features",
        badge: "Teal",
        restrictions: "Community access only",
        features: [
            "Community events",
            "Local offers",
            "Resident discounts",
            "Community forum"
        ]
    },
    team: {
        count: 1,
        access: "Full admin access",
        badge: "Indigo",
        restrictions: "None",
        features: [
            "All platform features",
            "Admin dashboard",
            "User management",
            "System configuration"
        ]
    }
};
```

### Admin Users
```
1. admin@croydonba.org.uk
   - QR Handle: ADMIN-CBA-2025
   - Full system access
   - Test account

2. steve@croydonba.org.uk
   - Steven Ball (Founder)
   - Full admin privileges
   
3. ben@croydonba.org.uk
   - Ben Admin
   - QR Handle: BEN-CBA-2025
   - Full admin access
```

---

## 4. Authentication & Security

### Authentication Methods
```javascript
// Dual Authentication System
1. Email/Password Authentication
   - bcrypt hashing (salt rounds: 10)
   - Session-based authentication
   - PostgreSQL session store
   - HTTP-only secure cookies

2. Replit OAuth (Optional)
   - OAuth 2.0 flow
   - Automatic account creation
   - Profile synchronization
```

### Security Features
```javascript
const SECURITY = {
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
        hashRounds: 10
    },
    session: {
        secret: process.env.SESSION_SECRET,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests
    },
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
};
```

---

## 5. Membership System

### 5-Tier Membership Structure

#### Starter Tier - £25/month
```javascript
{
    name: "Starter Tier",
    price: 25,
    color: "bg-gray-100",
    features: [
        "Basic member directory listing",
        "Access to networking events",
        "Monthly newsletter",
        "Basic AI tools",
        "Community forum access",
        "1 product listing",
        "1 event per month"
    ],
    benefits_count: 43
}
```

#### Growth Tier - £50/month
```javascript
{
    name: "Growth Tier",
    price: 50,
    color: "bg-green-100",
    features: [
        "Enhanced directory listing",
        "Priority event registration",
        "Advanced AI tools",
        "Marketing support",
        "5 product listings",
        "3 events per month",
        "Quarterly consultation"
    ],
    benefits_count: 89
}
```

#### Strategic Tier - £150/month
```javascript
{
    name: "Strategic Tier",
    price: 150,
    color: "bg-blue-100",
    features: [
        "Premium directory placement",
        "VIP event access",
        "Full AI suite access",
        "PR support",
        "Unlimited products",
        "Unlimited events",
        "Monthly consultation",
        "Priority support"
    ],
    benefits_count: 156
}
```

#### Patron Tier - £250/month
```javascript
{
    name: "Patron Tier",
    price: 250,
    color: "bg-purple-100",
    features: [
        "Featured placement everywhere",
        "Executive networking",
        "Custom AI solutions",
        "Dedicated account manager",
        "Speaking opportunities",
        "Board meeting access",
        "Weekly consultation"
    ],
    benefits_count: 201
}
```

#### Partner Tier - £500/month
```javascript
{
    name: "Partner Tier",
    price: 500,
    color: "bg-yellow-100",
    features: [
        "Co-branding opportunities",
        "Strategic partnership status",
        "White-label AI solutions",
        "C-suite connections",
        "Event sponsorship",
        "Daily support",
        "Custom integrations",
        "Advisory board seat"
    ],
    benefits_count: 235
}
```

---

## 6. Complete Benefits List

### AI Services Category (72 Benefits)
```
1. MyT AI Basic Access - Basic access to MyT AI services and tools
2. MyT AI Advanced Tools - Advanced AI tools and capabilities
3. MyT AI Custom Solutions - Custom AI solutions tailored to your business
4. MyT AI Consultation - Professional AI consultation and strategy sessions
5. MyT AI Training - Comprehensive AI training and workshops
6. MyT AI Priority Support - Priority support for AI services
7. MyT AI API Access - API access to MyT AI services
8. MyT AI Model Training - Custom AI model training
9. Basic AI Training - Introduction to AI and machine learning
10. AI Automation Consult - Professional AI automation consultation
11. AI Chatbot Support - AI chatbot development and management
12. AI Content Tools - AI-powered content creation tools
13. AI Process Optimization - AI-driven business process optimization
14. Custom AI Solutions - Custom AI solutions tailored to your business
15. AI Ethics Guidance - Guidance on ethical AI implementation
16. AI ROI Analysis - AI return on investment analysis
17. Advanced AI Training - Advanced AI implementation training
18. AI Strategy Consult - Comprehensive AI strategy consultation
19. ML Implementation - Machine learning model implementation
20. AI System Integration - AI system integration
21. Dedicated AI Support - Dedicated AI support specialist
22. AI Vendor Partnerships - Access to AI vendor partnerships
23. AI Business Intelligence - AI-powered business intelligence
24. AI Tools Access - Access to premium AI tools
25. AI Content Generator - Professional AI content generation using ChatGPT Teams
26. AI Business Analytics - Advanced AI-powered business analytics
27. AI Chatbot Builder - Advanced AI chatbot builder
28. AI Process Analyzer - AI-powered business process analysis
29. AI Customer Insights - AI-driven customer behavior analysis
30. AI Marketing Optimizer - AI-powered marketing campaign optimization
31. AI Predictive Analytics - Predictive analytics using machine learning
32. AI Automation Platform - Complete AI automation platform access
33. AI 24x7 Assistant - 24/7 AI assistant for business operations
34. AI Document Processing - AI-powered document analysis
35. AI Data Analysis - Advanced AI data analysis
36. AI Workflow Automation - AI-driven workflow automation
37. AI Customer Service - AI-powered customer service automation
38. AI Sales Optimization - AI-driven sales process optimization
39. AI Sales Forecasting - AI-powered sales forecasting
40. AI Competitor Analysis - AI-driven competitor analysis
41. AI Market Research - Comprehensive AI-powered market research
42. AI Financial Modeling - AI-assisted financial modeling
43. AI Risk Assessment - AI-powered business risk assessment
44. AI Compliance Monitoring - AI-driven compliance monitoring
45. AI Workforce Optimization - AI-powered workforce planning
46. AI Supply Chain Analysis - AI-driven supply chain optimization
47. AI Customer Retention - AI-powered customer retention strategies
48. AI Revenue Optimization - AI-driven revenue optimization
49. AI Inventory Optimization - AI-powered inventory management
50. AI Pricing Optimization - AI-driven pricing strategy
51. AI Quality Assurance - AI-powered quality assurance
52. AI Performance Tracking - AI-driven performance tracking
53. AI Business Forecasting - Comprehensive AI business forecasting
54. Predictive Modeling - Advanced predictive modeling
55. Anomaly Detection - AI-powered anomaly detection
56. Sentiment Analysis - Customer sentiment analysis
57. Behavior Tracking - Customer behavior tracking
58. Trend Forecasting - Market and business trend forecasting
59. Competitive Intelligence - Competitive intelligence analysis
60. Market Signals - Real-time market signals
61. Customer Journey - Customer journey mapping
62. Conversion Optimization - AI-powered conversion optimization
63. Chatbot Development - Custom chatbot development
64. Voice Assistants - Voice assistant integration
65. Content Personalization - AI-powered content personalization
66. Email Optimization - AI-driven email campaign optimization
67. Social Media AI - AI-powered social media management
68. Customer Segmentation - Advanced customer segmentation
69. Lead Qualification - AI-powered lead qualification
70. Personalized Recommendations - AI-powered recommendations
71. Dynamic Pricing - AI-driven dynamic pricing
72. Churn Prediction - AI-powered customer churn prediction
```

### Accounting Category (5 Benefits)
```
73. MyT Accounting Support - Professional support for MyT accounting
74. MyT Accounting Training - Comprehensive training on MyT accounting
75. MyT Accounting Multi User - Multi-user access to MyT accounting
76. MyT Accounting Advanced Features - Access to advanced features
77. MyT Accounting Priority Support - Priority support for issues
```

### Automation Category (9 Benefits)
```
78. MyT Automation Basic - Basic business process automation
79. MyT Automation Advanced - Advanced automation solutions
80. MyT Automation Custom - Custom automation solutions
81. MyT Automation Consultation - Professional automation consultation
82. MyT Automation Implementation - Full automation implementation
83. MyT Automation Support - Ongoing support for automation
84. MyT Automation Training - Training on automation tools
85. MyT Automation Monitoring - Monitoring of automated processes
86. Workflow Automation - Business workflow automation
```

### Technology Category (26 Benefits)
```
87. Advanced Analytics - Advanced business analytics and reporting
88. API Access - Access to platform API for integrations
89. Business Apps - Access to business mobile applications
90. Cloud Backup - Automated cloud backup for business data
91. CRM Integration - Customer relationship management integration
92. Custom Reporting - Custom business report generation
93. Data Analytics Dashboard - Comprehensive data analytics dashboard
94. Data Export - Export business data in multiple formats
95. Data Migration Support - Support for data migration
96. Database Access - Direct database access for advanced users
97. E-commerce Tools - E-commerce platform integration
98. Email Automation - Automated email marketing campaigns
99. Integration Support - Third-party integration assistance
100. Mobile App Access - Full mobile application access
101. Multi-location Support - Support for multiple business locations
102. Performance Analytics - Detailed performance analytics
103. Platform Customization - Customize platform to your needs
104. Priority Processing - Priority data processing
105. Real-time Notifications - Real-time business notifications
106. SEO Tools - Search engine optimization tools
107. Security Features - Advanced security features
108. Software Integrations - Multiple software integrations
109. System Monitoring - 24/7 system monitoring
110. Tech Stack Support - Full technology stack support
111. Website Builder - Professional website builder access
112. White Label Options - White label platform options
```

### Marketing Category (18 Benefits)
```
113. Newsletter Promotion - Feature in association newsletters
114. Social Media Promotion - Promotion across social media
115. Press Release Support - Professional press release writing
116. Media Kit Creation - Professional media kit development
117. PR Support - Public relations support
118. Advertising Support - Advertising campaign development
119. Co Marketing Opportunities - Collaborative marketing
120. Cross Promotion - Cross-promotional opportunities
121. Event Sponsorship - Sponsorship opportunities at events
122. Branding Support - Professional branding consultation
123. Content Creation - Professional content creation
124. Video Marketing - Video marketing support
125. Email Marketing Support - Email marketing development
126. SEO Marketing - SEO-focused marketing strategies
127. Social Media Management - Full social media management
128. Media Relations - Professional media relations
129. Thought Leadership - Thought leadership content
130. Speaking Bureau - Access to speaking opportunities
```

### Networking Category (10 Benefits)
```
131. Networking Events - Access to regular networking events
132. Exclusive Events - Invitation to members-only events
133. VIP Event Access - VIP access and priority seating
134. Event Hosting - Opportunities to host your own events
135. Speaking Opportunities - Platform to speak at events
136. Board Meeting Access - Access to board meetings
137. Executive Networking - Networking with senior executives
138. Monthly Meetings - Participation in monthly meetings
139. Quarterly Gatherings - Access to quarterly gatherings
140. Annual Conference - Complimentary annual conference access
```

### Support Category (21 Benefits)
```
141. Business Consultation - Professional business consultation
142. Legal Consultation - Basic legal consultation services
143. HR Support - Human resources support and guidance
144. Accounting Support - Professional accounting assistance
145. Marketing Consultation - Marketing strategy consultation
146. IT Support - Technical IT support services
147. Tax Advice - Professional tax advice and planning
148. Financial Planning - Business financial planning support
149. Compliance Assistance - Regulatory compliance assistance
150. Grant Application Support - Help with grant applications
151. Training Programs - Access to professional training
152. Mentorship Program - One-on-one mentorship opportunities
153. Peer Support Groups - Access to peer support networks
154. Expert Workshops - Exclusive expert-led workshops
155. Resource Library - Comprehensive business resource library
156. Template Library - Business document templates
157. Best Practices Guide - Industry best practices guides
158. Case Studies - Access to business case studies
159. Research Reports - Industry research and reports
160. Webinar Access - Access to educational webinars
161. Certification Programs - Professional certification programs
```

### Communication Category (15 Benefits)
```
162. Priority Support - Priority access to support services
163. Dedicated Account Manager - Dedicated account manager
164. Phone Support - 24/7 phone support
165. Email Support - Professional email support
166. Live Chat - Real-time live chat support
167. Monthly Newsletters - Exclusive monthly newsletters
168. Weekly Updates - Weekly business updates
169. Member Alerts - Important alerts and notifications
170. Business Referrals - Professional business referral system
171. Lead Generation - Lead generation support
172. Customer Support - Comprehensive customer support
173. Technical Support - Technical support for platform
174. Emergency Support - 24/7 emergency support
175. Weekend Support - Weekend support availability
176. Multilanguage Support - Support in multiple languages
```

### Directory Category (8 Benefits)
```
177. Enhanced Listing - Premium placement in directory
178. Featured Placement - Top-tier featured placement
179. Premium Badge - Exclusive premium member badge
180. Search Priority - Higher ranking in search results
181. Homepage Feature - Featured placement on homepage
182. Logo In Directory - Display business logo
183. Multiple Photos - Upload multiple photos
184. Video Profile - Add video content to profile
```

### Access Category (18 Benefits)
```
185. Member Directory - Access to member directory
186. Business Matchmaking - Professional matchmaking services
187. Partnership Opportunities - Strategic partnership access
188. Vendor Recommendations - Curated vendor recommendations
189. Supplier Network - Access to supplier network
190. Buyer Network - Connection to buyer network
191. Investor Network - Access to investor networks
192. Mentor Network - Connection to mentor network
193. Advisory Board - Access to advisory board
194. Strategic Planning - Strategic planning sessions
195. Boardroom Access - Executive boardroom facilities
196. Executive Club - Exclusive executive club membership
197. VIP Lounge - Access to VIP lounge at events
198. Private Events - Invitation to private events
199. Exclusive Partnerships - Exclusive business partnerships
200. Executive Concierge - Personal executive concierge
201. Global Network Access - International business networks
202. Industry Awards Program - Nomination for awards
```

### Financial Category (18 Benefits)
```
203. Event Discounts - Discounted rates for events
204. Service Discounts - Discounts on professional services
205. Partner Discounts - Exclusive partner discounts
206. Bulk Purchase Discounts - Bulk purchasing discounts
207. Member Only Deals - Exclusive member deals
208. Early Bird Pricing - Early bird event pricing
209. Free Services - Select free services
210. Credit Program - Member credit program
211. Payment Plans - Flexible payment options
212. Invoice Support - Professional invoicing support
213. Accounting Discounts - Discounted accounting
214. Legal Discounts - Discounted legal services
215. Insurance Discounts - Group insurance discounts
216. Banking Benefits - Special banking rates
217. Financing Support - Business financing assistance
218. Venture Capital Access - VC network access
219. IPO Preparation - IPO preparation support
220. Merger & Acquisition - M&A advisory services
```

### Training Category (15 Benefits)
```
221. AI Tools Training - AI implementation training
222. Automation Training - Automation best practices
223. Business Strategy Training - Strategic planning training
224. Compliance Training - Regulatory compliance training
225. Customer Service Training - Service excellence training
226. Digital Marketing Training - Digital marketing skills
227. Financial Management Training - Financial management
228. Leadership Development - Leadership skills development
229. Management Training - Management best practices
230. Marketing Strategy Training - Marketing strategy skills
231. Professional Development - Continuous professional development
232. Sales Training - Sales technique training
233. Social Media Training - Social media management
234. Team Building Workshops - Team building activities
235. Technology Training - Technology skills training
```

---

## 7. Event Management System

### Event Types
```javascript
const EVENT_TYPES = {
    conference: "Large-scale business conferences",
    workshop: "Hands-on training workshops",
    networking: "Networking and social events",
    webinar: "Online educational webinars",
    summit: "Industry summits and exhibitions",
    training: "Professional training sessions",
    meetup: "Informal member meetups",
    panel: "Panel discussions and debates"
};
```

### Event Features
```javascript
const EVENT_FEATURES = {
    registration: {
        online: true,
        onsite: true,
        waitlist: true,
        cancellation: true,
        refunds: true
    },
    capacity: {
        min: 10,
        max: 1000,
        overflow: true,
        virtualOption: true
    },
    pricing: {
        earlyBird: true,
        memberDiscount: true,
        groupRates: true,
        dynamicPricing: true
    },
    management: {
        checkIn: "QR code scanning",
        badges: "Digital and physical",
        attendance: "Real-time tracking",
        reporting: "Comprehensive analytics"
    }
};
```

---

## 8. AI Summit Features

### Summit Overview
```javascript
const AI_SUMMIT = {
    name: "AI Summit 2025",
    date: "March 15, 2025",
    venue: "Croydon Conference Centre",
    capacity: 500,
    tracks: [
        "AI for Business",
        "Machine Learning",
        "Automation",
        "Future of Work"
    ]
};
```

### Sponsorship Packages
```javascript
const SPONSORSHIP_TIERS = [
    {
        name: "Platinum",
        price: 5000,
        benefits: [
            "Prime logo placement on all materials",
            "Co-branded lanyards for all attendees",
            "20x20 exhibition booth in prime location",
            "45-minute keynote speaking slot",
            "10 complimentary VIP passes",
            "Full-page ad in event program",
            "Logo on all digital screens",
            "Exclusive networking dinner hosting",
            "Post-event attendee list access",
            "Year-long website partnership badge"
        ]
    },
    {
        name: "Gold",
        price: 2500,
        benefits: [
            "Prominent logo placement",
            "15x15 exhibition booth",
            "30-minute speaking slot",
            "5 complimentary passes",
            "Half-page ad in program",
            "Logo on main stage backdrop",
            "Networking break sponsorship",
            "Social media promotion"
        ]
    },
    {
        name: "Silver",
        price: 1000,
        benefits: [
            "Logo on event materials",
            "10x10 exhibition booth",
            "15-minute presentation slot",
            "3 complimentary passes",
            "Quarter-page ad in program",
            "Website listing"
        ]
    },
    {
        name: "Bronze",
        price: 500,
        benefits: [
            "Logo on website",
            "Standard exhibition table",
            "2 complimentary passes",
            "Program listing",
            "Social media mention"
        ]
    },
    {
        name: "Supporting",
        price: 250,
        benefits: [
            "Website listing",
            "1 complimentary pass",
            "Program acknowledgment"
        ]
    },
    {
        name: "Community",
        price: 100,
        benefits: [
            "Website listing",
            "Event day recognition"
        ]
    },
    {
        name: "Individual",
        price: 100,
        benefits: [
            "Personal recognition",
            "Supporter badge"
        ]
    }
];
```

### Exhibition Areas
```javascript
const EXHIBITION_ZONES = {
    mainHall: {
        name: "Main Exhibition Hall",
        capacity: 150,
        features: ["Product demos", "Networking", "Refreshments"]
    },
    networkingLounge: {
        name: "Networking Lounge",
        capacity: 75,
        features: ["Casual seating", "Coffee bar", "Meeting pods"]
    },
    sponsorShowcase: {
        name: "Sponsor Showcase",
        capacity: 100,
        features: ["Premium booths", "Demo stages", "VIP access"]
    }
};
```

---

## 9. Business Features

### Business Profile Management
```javascript
const BUSINESS_PROFILE = {
    basic: {
        name: "required",
        description: "required",
        category: "required",
        contact: "required"
    },
    enhanced: {
        logo: "image upload",
        gallery: "up to 10 images",
        video: "YouTube/Vimeo embed",
        socialMedia: "all platforms",
        openingHours: "customizable",
        teamMembers: "unlimited"
    },
    verification: {
        email: true,
        phone: true,
        address: true,
        documents: true
    }
};
```

### Product/Service Management
```javascript
const PRODUCT_FEATURES = {
    listing: {
        title: "required",
        description: "rich text editor",
        price: "flexible pricing",
        images: "up to 5 per product",
        categories: "multiple selection",
        tags: "unlimited"
    },
    visibility: {
        public: true,
        membersOnly: true,
        featured: true,
        promoted: true
    },
    analytics: {
        views: "real-time",
        inquiries: "tracked",
        conversion: "measured"
    }
};
```

### Special Offers System
```javascript
const SPECIAL_OFFERS = {
    types: [
        "Percentage discount",
        "Fixed amount off",
        "Buy one get one",
        "Bundle deals",
        "Member exclusive",
        "Time-limited flash sales"
    ],
    targeting: {
        allMembers: true,
        tierSpecific: true,
        newMembers: true,
        locationBased: true
    },
    tracking: {
        redemptions: "real-time",
        revenue: "calculated",
        effectiveness: "analyzed"
    }
};
```

---

## 10. Admin Dashboard

### Dashboard Sections
```javascript
const ADMIN_SECTIONS = {
    overview: {
        stats: ["Total users", "Active events", "Revenue", "Engagement"],
        charts: ["Growth trends", "Member distribution", "Event attendance"],
        alerts: ["System notifications", "Pending approvals", "Issues"]
    },
    userManagement: {
        actions: ["View", "Edit", "Delete", "Suspend", "Promote"],
        filters: ["Type", "Tier", "Status", "Date joined"],
        bulk: ["Import", "Export", "Email", "Update"]
    },
    eventManagement: {
        crud: ["Create", "Read", "Update", "Delete"],
        features: ["Duplicate", "Archive", "Promote", "Report"],
        analytics: ["Attendance", "Revenue", "Feedback", "ROI"]
    },
    membershipManagement: {
        tiers: "Full CRUD operations",
        benefits: "Matrix management",
        pricing: "Dynamic adjustment",
        promotions: "Campaign management"
    },
    analytics: {
        business: "Company metrics",
        financial: "Revenue analysis",
        engagement: "User activity",
        growth: "Expansion metrics"
    },
    communications: {
        email: "Campaign management",
        notifications: "Push notifications",
        announcements: "Platform-wide messages",
        newsletters: "Scheduled distribution"
    }
};
```

### Admin Tools
```javascript
const ADMIN_TOOLS = {
    import: {
        formats: ["CSV", "Excel", "JSON"],
        types: ["Users", "Contacts", "Events", "Products"],
        validation: "Automatic",
        mapping: "Intelligent field detection"
    },
    export: {
        formats: ["CSV", "Excel", "PDF", "JSON"],
        scheduling: "Automated reports",
        filters: "Custom queries"
    },
    backup: {
        frequency: "Daily",
        retention: "30 days",
        restore: "One-click"
    },
    monitoring: {
        uptime: "99.9% SLA",
        performance: "Real-time metrics",
        errors: "Instant alerts"
    }
};
```

---

## 11. API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
GET    /api/auth/user              - Current user
POST   /api/auth/forgot-password   - Password reset request
POST   /api/auth/reset-password    - Password reset confirmation
GET    /api/auth/verify-email      - Email verification
```

### User Management Endpoints
```
GET    /api/users                  - List all users
GET    /api/users/:id              - Get user by ID
PUT    /api/users/:id              - Update user
DELETE /api/users/:id              - Delete user
POST   /api/users/bulk-import      - Bulk user import
GET    /api/users/export           - Export users
PUT    /api/users/:id/role         - Update user role
PUT    /api/users/:id/tier         - Update membership tier
```

### Business Endpoints
```
GET    /api/businesses              - List businesses
POST   /api/businesses              - Create business
GET    /api/businesses/:id         - Get business
PUT    /api/businesses/:id         - Update business
DELETE /api/businesses/:id         - Delete business
GET    /api/businesses/categories  - List categories
POST   /api/businesses/:id/verify  - Verify business
GET    /api/businesses/featured    - Featured businesses
```

### Event Endpoints
```
GET    /api/events                 - List events
POST   /api/events                 - Create event
GET    /api/events/:id             - Get event
PUT    /api/events/:id             - Update event
DELETE /api/events/:id             - Delete event
POST   /api/events/:id/register    - Register for event
GET    /api/events/:id/attendees   - List attendees
POST   /api/events/:id/checkin     - Check in attendee
GET    /api/events/:id/report      - Event report
```

### CBA Event Endpoints
```
GET    /api/cba-events              - List CBA events
POST   /api/cba-events              - Create CBA event
GET    /api/cba-events/:id         - Get CBA event
PUT    /api/cba-events/:id         - Update CBA event
DELETE /api/cba-events/:id         - Delete CBA event
```

### Membership Endpoints
```
GET    /api/membership/tiers       - List tiers
GET    /api/membership/benefits    - List benefits
POST   /api/membership/subscribe   - Subscribe to tier
PUT    /api/membership/upgrade     - Upgrade tier
POST   /api/membership/cancel      - Cancel subscription
GET    /api/membership/usage       - Usage statistics
```

### Product Endpoints
```
GET    /api/products                - List products
POST   /api/products                - Create product
GET    /api/products/:id           - Get product
PUT    /api/products/:id           - Update product
DELETE /api/products/:id           - Delete product
GET    /api/products/categories    - Product categories
```

### Special Offer Endpoints
```
GET    /api/offers                  - List offers
POST   /api/offers                  - Create offer
GET    /api/offers/:id             - Get offer
PUT    /api/offers/:id             - Update offer
DELETE /api/offers/:id             - Delete offer
POST   /api/offers/:id/redeem      - Redeem offer
```

### Admin Endpoints
```
GET    /api/admin/dashboard/stats  - Dashboard statistics
GET    /api/admin/users            - Admin user list
POST   /api/admin/users/create     - Create admin user
GET    /api/admin/analytics        - Business analytics
POST   /api/admin/import           - Import data
GET    /api/admin/export           - Export data
GET    /api/admin/logs             - System logs
POST   /api/admin/broadcast        - Send broadcast
```

### Attendance Endpoints
```
GET    /api/attendance              - List attendance records
POST   /api/attendance/checkin     - Check in attendee
POST   /api/attendance/checkout    - Check out attendee
GET    /api/attendance/report      - Attendance report
GET    /api/attendance/live        - Live attendance data
```

### Sponsorship Endpoints
```
GET    /api/sponsorship/packages   - List packages
POST   /api/sponsorship/apply      - Apply for sponsorship
GET    /api/sponsorship/sponsors   - List sponsors
PUT    /api/sponsorship/:id        - Update sponsorship
```

### Contact Endpoints
```
GET    /api/contacts                - List contacts
POST   /api/contacts                - Create contact
POST   /api/contacts/import        - Import contacts
GET    /api/contacts/export        - Export contacts
DELETE /api/contacts/:id           - Delete contact
```

---

## 12. File Structure

### Frontend Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/              # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── forms/               # Form components
│   │   ├── charts/              # Chart components
│   │   └── common/              # Shared components
│   ├── pages/
│   │   ├── admin/               # Admin pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── EventManagement.tsx
│   │   │   ├── MembershipMatrix.tsx
│   │   │   ├── BusinessAnalytics.tsx
│   │   │   ├── ContactImport.tsx
│   │   │   ├── AdminManagement.tsx
│   │   │   └── UserTypes.tsx
│   │   ├── auth/                # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── dashboard/           # User dashboard pages
│   │   ├── events/              # Event pages
│   │   ├── business/            # Business pages
│   │   └── membership/          # Membership pages
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   ├── styles/                  # CSS and styling
│   └── App.tsx                  # Main application
```

### Backend Structure
```
server/
├── db.ts                        # Database connection
├── routes.ts                    # API routes
├── storage.ts                   # Storage interface
├── localAuth.ts                 # Local authentication
├── replitAuth.ts               # Replit OAuth
├── emailService.ts             # Email service
├── aiService.ts                # AI integration
├── badgeService.ts             # Badge generation
├── mytAutomationService.ts     # MyT Automation integration
├── limitService.ts             # Rate limiting
└── index.ts                    # Server entry point
```

### Shared Structure
```
shared/
├── schema.ts                    # Database schema
├── types.ts                     # TypeScript types
├── membershipTiers.ts          # Membership configuration
└── constants.ts                # Shared constants
```

---

## 13. Email System

### Email Templates
```javascript
const EMAIL_TEMPLATES = {
    welcome: {
        subject: "Welcome to CBA!",
        variables: ["firstName", "membershipTier"],
        trigger: "Registration"
    },
    adminWelcome: {
        subject: "Admin Access Granted",
        variables: ["firstName", "tempPassword", "loginUrl"],
        trigger: "Admin creation"
    },
    passwordReset: {
        subject: "Password Reset Request",
        variables: ["resetLink", "expiryTime"],
        trigger: "Password reset request"
    },
    eventRegistration: {
        subject: "Event Registration Confirmed",
        variables: ["eventName", "date", "venue", "qrCode"],
        trigger: "Event registration"
    },
    membershipUpgrade: {
        subject: "Membership Upgraded!",
        variables: ["oldTier", "newTier", "benefits"],
        trigger: "Tier upgrade"
    },
    invoice: {
        subject: "Invoice for Your Subscription",
        variables: ["amount", "period", "invoiceNumber"],
        trigger: "Payment processed"
    },
    newsletter: {
        subject: "CBA Monthly Newsletter",
        variables: ["content", "events", "offers"],
        trigger: "Monthly schedule"
    }
};
```

### Email Configuration
```javascript
const EMAIL_CONFIG = {
    smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    },
    sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        from: "noreply@croydonba.org.uk",
        replyTo: "support@croydonba.org.uk"
    },
    settings: {
        maxRetries: 3,
        retryDelay: 5000,
        batchSize: 100,
        rateLimit: "10/second"
    }
};
```

---

## 14. Access Control Matrix

### Feature Access by User Type
```javascript
const ACCESS_MATRIX = {
    // Business Features
    businessProfile: {
        attendee: "full",
        volunteer: "none",
        speaker: "none",
        exhibitor: "limited",
        vip_guest: "none",
        resident: "none",
        team: "full"
    },
    
    // Product Management
    products: {
        attendee: "full",
        volunteer: "none",
        speaker: "none",
        exhibitor: "showcase",
        vip_guest: "none",
        resident: "none",
        team: "full"
    },
    
    // Special Offers
    specialOffers: {
        attendee: "create",
        volunteer: "view",
        speaker: "view",
        exhibitor: "create",
        vip_guest: "view",
        resident: "view",
        team: "full"
    },
    
    // Event Management
    events: {
        attendee: "register",
        volunteer: "assist",
        speaker: "present",
        exhibitor: "exhibit",
        vip_guest: "priority",
        resident: "community",
        team: "manage"
    },
    
    // Membership Benefits
    benefits: {
        attendee: "tier-based",
        volunteer: "basic",
        speaker: "basic",
        exhibitor: "basic",
        vip_guest: "vip",
        resident: "community",
        team: "all"
    },
    
    // Admin Dashboard
    adminDashboard: {
        attendee: "none",
        volunteer: "none",
        speaker: "none",
        exhibitor: "none",
        vip_guest: "none",
        resident: "none",
        team: "full"
    },
    
    // Networking
    networking: {
        attendee: "full",
        volunteer: "events",
        speaker: "events",
        exhibitor: "events",
        vip_guest: "vip",
        resident: "community",
        team: "full"
    },
    
    // Support
    support: {
        attendee: "standard",
        volunteer: "basic",
        speaker: "event",
        exhibitor: "event",
        vip_guest: "priority",
        resident: "community",
        team: "admin"
    }
};
```

### Permission Levels
```javascript
const PERMISSION_LEVELS = {
    none: "No access",
    view: "Read-only access",
    limited: "Restricted functionality",
    basic: "Basic features only",
    standard: "Standard member access",
    full: "Complete access",
    create: "Can create new items",
    manage: "Full management capabilities",
    admin: "Administrative privileges"
};
```

---

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db
PGHOST=host
PGUSER=user
PGPASSWORD=password
PGDATABASE=database
PGPORT=5432

# Authentication
SESSION_SECRET=your-session-secret
REPLIT_CLIENT_ID=optional-replit-oauth
REPLIT_CLIENT_SECRET=optional-replit-oauth

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=password
SENDGRID_API_KEY=optional-sendgrid-key

# AI Services
OPENAI_API_KEY=your-openai-api-key

# Payment
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_PUBLIC_KEY=your-stripe-public-key

# Application
NODE_ENV=development|production
FRONTEND_URL=https://your-app.com
PORT=5000
```

---

## Testing Credentials

### Admin Access
```
Email: admin@croydonba.org.uk
Password: [Set during first login]
Access: Full system administration
```

### Demo Users
```
Regular Member:
- Email: demo@croydonba.org.uk
- Type: Attendee
- Tier: Growth

Volunteer:
- Email: volunteer@croydonba.org.uk
- Type: Volunteer
- Access: Limited

Speaker:
- Email: speaker@croydonba.org.uk
- Type: Speaker
- Access: Speaker areas
```

---

## Support & Documentation

### Getting Help
```
1. Admin Dashboard: /admin
2. Documentation: /docs
3. API Reference: /api/docs
4. Support Email: support@croydonba.org.uk
5. Emergency: admin@croydonba.org.uk
```

### Common Tasks
```
1. Add new admin: Admin Dashboard > Administrators > Add Admin
2. Create event: Admin Dashboard > Events > Create Event
3. Import contacts: Admin Dashboard > Contact Import
4. View analytics: Admin Dashboard > Business Analytics
5. Manage benefits: Admin Dashboard > Membership Matrix
6. Check attendance: Admin Dashboard > Attendance Reports
```

---

This documentation represents the complete, detailed state of the CBA Business Management Platform as of August 2025. All features, endpoints, and configurations listed are fully implemented and operational.