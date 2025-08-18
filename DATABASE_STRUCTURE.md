# CBA Business Platform - Database Structure
## (Microsoft Access Style Relationships View)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               CORE SYSTEM TABLES                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      USERS      │──────▶│   BUSINESSES    │──────▶│   CATEGORIES    │
│  (38 fields)    │ 1:M   │  (19 fields)    │ M:1   │  (7 fields)     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ user_id (FK)    │       │ name            │
│ first_name      │       │ category_id(FK) │       │ description     │
│ last_name       │       │ name            │       │ icon            │
│ is_admin        │       │ description     │       │ image_url       │
│ membership_tier │       │ address         │       └─────────────────┘
│ participant_type│       │ phone           │               │
│ company         │       │ website         │               │
│ job_title       │       │ logo            │               │
│ phone           │       │ is_verified     │               │
│ qr_handle       │       └─────────────────┘               │
│ email_verified  │               │                         │
└─────────────────┘               │                         │
         │                        ▼                         │
         │               ┌─────────────────┐                 │
         │               │    PRODUCTS     │◀────────────────┘
         │               │  (11 fields)    │ M:1
         │               ├─────────────────┤
         │               │ id (PK)         │
         │               │ business_id(FK) │
         │               │ category_id(FK) │
         │               │ name            │
         │               │ description     │
         │               │ price           │
         │               │ is_service      │
         │               └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AI SUMMIT SYSTEM                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

       ┌─────────────────┐
       │      USERS      │
       │                 │
       └─────────────────┘
         │      │      │
         │      │      │ 1:M
         ▼      ▼      ▼
┌────────────────┐ ┌───────────────────┐ ┌─────────────────────┐
│AI_SUMMIT_REGS  │ │AI_SUMMIT_SPEAKERS │ │AI_SUMMIT_EXHIBITORS │
│ (17 fields)    │ │   (26 fields)     │ │    (21 fields)      │
├────────────────┤ ├───────────────────┤ ├─────────────────────┤
│ id (PK)        │ │ id (PK)           │ │ id (PK)             │
│ user_id (FK)   │ │ user_id (FK)      │ │ user_id (FK)        │
│ name           │ │ name              │ │ company_name        │
│ email          │ │ email             │ │ contact_name        │
│ company        │ │ company           │ │ contact_email       │
│ job_title      │ │ job_title         │ │ booth_size          │
│ phone_number   │ │ bio               │ │ stand_location      │
│ ai_interest    │ │ talk_title        │ │ products_services   │
│ registered_at  │ │ talk_description  │ │ website             │
└────────────────┘ │ session_type      │ │ logo                │
                   │ audience_level    │ └─────────────────────┘
                   │ tech_requirements │
                   └───────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           EVENT MANAGEMENT SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   CBA_EVENTS    │──────▶│EVENT_TIME_SLOTS │──────▶│TIME_SLOT_SPEAKERS│
│  (27 fields)    │ 1:M   │  (21 fields)    │ 1:M   │  (6 fields)     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ event_name      │       │ event_id (FK)   │       │ time_slot_id(FK)│
│ event_date      │       │ title           │       │ speaker_id (FK) │
│ start_time      │       │ description     │       │ role            │
│ end_time        │       │ start_time      │       │ display_order   │
│ venue           │       │ end_time        │       └─────────────────┘
│ max_capacity    │       │ room            │               │
│ event_type      │       │ max_capacity    │               │
│ is_active       │       │ speaker_id (FK) │               │
│ created_by (FK) │       │ is_break        │               │
└─────────────────┘       └─────────────────┘               │
         │                                                  │
         │ 1:M                                              │
         ▼                                                  │
┌─────────────────┐                                         │
│EVENT_REGISTRATIONS│                                       │
│  (29 fields)    │                                        │
├─────────────────┤                                        │
│ id (PK)         │                                        │
│ event_id (FK)   │                                        │
│ user_id (FK)    │                                        │
│ participant_name│                ┌─────────────────┐      │
│ checked_in      │                │     USERS       │◀─────┘
│ registration_   │                │                 │ M:1
│   status        │                └─────────────────┘
└─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           SCANNING & BADGE SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ PERSONAL_BADGES │──────▶│EVENT_SCANNERS   │──────▶│  SCAN_HISTORY   │
│  (7 fields)     │ 1:M   │  (8 fields)     │ 1:M   │  (12 fields)    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ user_id (FK)    │       │ scanner_id (FK) │
│ badge_id        │       │ event_id (FK)   │       │ scanned_user(FK)│
│ qr_code         │       │ scanner_role    │       │ event_id (FK)   │
│ display_name    │       │ is_active       │       │ scan_type       │
│ title           │       │ total_scans     │       │ scan_timestamp  │
│ is_active       │       └─────────────────┘       │ is_valid_scan   │
└─────────────────┘                                 └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              JOBS & SERVICES                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  JOB_POSTINGS   │──────▶│ JOB_APPLICATIONS│       │ AFFILIATE_SYSTEM│
│  (24 fields)    │ 1:M   │  (13 fields)    │       │   Multiple      │
├─────────────────┤       ├─────────────────┤       │    Tables       │
│ id (PK)         │       │ id (PK)         │       ├─────────────────┤
│ business_id(FK) │       │ job_id (FK)     │       │ affiliates      │
│ title           │       │ applicant_name  │       │ referrals       │
│ description     │       │ applicant_email │       │ commissions     │
│ salary_min      │       │ cv_file_path    │       │ payouts         │
│ salary_max      │       │ cover_letter    │       │ clicks          │
│ job_type        │       │ application_date│       └─────────────────┘
│ location        │       │ status          │
│ is_active       │       └─────────────────┘
│ expires_at      │
└─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              KEY RELATIONSHIPS                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

USERS is the central table connecting to:
├── BUSINESSES (1:M) - User can own multiple businesses
├── AI_SUMMIT_REGISTRATIONS (1:M) - User can register for events
├── AI_SUMMIT_SPEAKER_INTERESTS (1:M) - User can submit speaker proposals
├── PERSONAL_BADGES (1:M) - User can have multiple badges
├── EVENT_SCANNERS (1:M) - User can be scanner at multiple events
├── TIME_SLOT_SPEAKERS (M:M) - Users can speak at multiple time slots

EVENTS connect to:
├── EVENT_TIME_SLOTS (1:M) - Each event has multiple time slots
├── EVENT_REGISTRATIONS (1:M) - Each event has multiple registrations
├── EVENT_SCANNERS (1:M) - Each event has designated scanners

BUSINESSES connect to:
├── PRODUCTS (1:M) - Each business can have multiple products/services
├── JOB_POSTINGS (1:M) - Each business can post multiple jobs
├── CATEGORIES (M:1) - Each business belongs to a category


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                CURRENT ISSUES                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

❌ TIME SLOTS: Tables exist but NO time slots created in EVENT_TIME_SLOTS
❌ SPEAKER ALLOCATION: No interface for speakers to choose their time slots  
❌ EMPTY SESSIONS: TIME_SLOT_SPEAKERS table is completely empty
❌ MISSING WORKFLOW: Speakers can't self-assign to available presentation slots

✅ SPEAKER DATA: You (Steven Ball) confirmed as speaker in USERS table
✅ POTENTIAL SPEAKERS: 15+ high-profile registrants in AI_SUMMIT_REGISTRATIONS
✅ RECOVERY TOOL: Admin interface exists to convert attendees to speakers
✅ DATABASE STRUCTURE: All tables and relationships properly established
```