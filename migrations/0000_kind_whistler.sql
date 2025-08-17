CREATE TABLE "affiliate_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"affiliate_code" varchar NOT NULL,
	"ip_address" varchar,
	"user_agent" text,
	"referrer_url" text,
	"landing_page" text,
	"converted_to_referral" boolean DEFAULT false,
	"referral_id" integer,
	"clicked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "affiliate_commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"referral_id" integer NOT NULL,
	"payment_id" varchar,
	"stripe_payment_intent_id" varchar,
	"amount" numeric(10, 2) NOT NULL,
	"commission_amount" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"payment_date" timestamp NOT NULL,
	"status" varchar DEFAULT 'pending',
	"payout_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "affiliate_payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'GBP',
	"method" varchar NOT NULL,
	"stripe_transfer_id" varchar,
	"transaction_reference" varchar,
	"status" varchar DEFAULT 'pending',
	"processed_at" timestamp,
	"failure_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "affiliate_referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"referred_user_id" varchar NOT NULL,
	"referral_date" timestamp DEFAULT now(),
	"signup_date" timestamp,
	"first_payment_date" timestamp,
	"current_membership_tier" varchar,
	"membership_status" varchar DEFAULT 'pending',
	"lifetime_value" numeric(10, 2) DEFAULT '0.00',
	"total_commission_earned" numeric(10, 2) DEFAULT '0.00',
	"last_commission_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_referral" UNIQUE("referred_user_id")
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"affiliate_code" varchar NOT NULL,
	"stripe_account_id" varchar,
	"commission_rate" numeric(5, 2) DEFAULT '5.00',
	"total_earnings" numeric(10, 2) DEFAULT '0.00',
	"pending_earnings" numeric(10, 2) DEFAULT '0.00',
	"paid_earnings" numeric(10, 2) DEFAULT '0.00',
	"last_payout_date" timestamp,
	"payout_method" varchar DEFAULT 'stripe',
	"payout_details" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "affiliates_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "affiliates_affiliate_code_unique" UNIQUE("affiliate_code")
);
--> statement-breakpoint
CREATE TABLE "ai_summit_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"badge_id" varchar NOT NULL,
	"participant_roles" text DEFAULT '["attendee"]' NOT NULL,
	"primary_role" varchar DEFAULT 'attendee' NOT NULL,
	"custom_role" varchar,
	"participant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"company" varchar,
	"job_title" varchar,
	"badge_design" varchar DEFAULT 'standard',
	"qr_code_data" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"printed_at" timestamp,
	"issued_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_summit_badges_badge_id_unique" UNIQUE("badge_id")
);
--> statement-breakpoint
CREATE TABLE "ai_summit_check_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"badge_id" varchar NOT NULL,
	"check_in_type" varchar NOT NULL,
	"check_in_time" timestamp DEFAULT now(),
	"check_in_location" varchar DEFAULT 'main_entrance',
	"check_in_method" varchar DEFAULT 'qr_scan',
	"notes" text,
	"staff_member" varchar
);
--> statement-breakpoint
CREATE TABLE "ai_summit_exhibitor_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"company_name" varchar NOT NULL,
	"contact_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"website" varchar,
	"business_description" text,
	"products_services" text,
	"exhibition_goals" text,
	"booth_requirements" varchar,
	"stand_location" varchar,
	"stand_number" varchar,
	"stand_size" varchar,
	"electrical_needs" boolean DEFAULT false,
	"internet_needs" boolean DEFAULT false,
	"special_requirements" text,
	"marketing_materials" text,
	"number_of_attendees" integer DEFAULT 2,
	"previous_exhibitor" boolean DEFAULT false,
	"referral_source" varchar,
	"agrees_to_terms" boolean DEFAULT false,
	"attendees" text,
	"registered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_summit_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"company" varchar,
	"job_title" varchar,
	"phone_number" varchar,
	"business_type" varchar,
	"ai_interest" varchar,
	"accessibility_needs" varchar,
	"comments" text,
	"participant_roles" text DEFAULT '["attendee"]' NOT NULL,
	"custom_role" varchar,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" varchar,
	"email_verification_sent_at" timestamp,
	"registered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_summit_session_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"badge_id" varchar NOT NULL,
	"attendee_name" varchar NOT NULL,
	"attendee_email" varchar NOT NULL,
	"attendee_company" varchar,
	"attendee_job_title" varchar,
	"specific_interests" text,
	"questions_for_speaker" text,
	"registration_source" varchar DEFAULT 'direct',
	"registered_at" timestamp DEFAULT now(),
	"checked_in" boolean DEFAULT false,
	"checked_in_at" timestamp,
	"no_show" boolean DEFAULT false,
	CONSTRAINT "ai_summit_session_registrations_session_id_badge_id_pk" PRIMARY KEY("session_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "ai_summit_speaker_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"company" varchar,
	"job_title" varchar,
	"website" varchar,
	"linked_in" varchar,
	"bio" text,
	"session_type" varchar DEFAULT 'talk',
	"talk_title" varchar,
	"talk_description" text,
	"talk_duration" varchar,
	"audience_level" varchar,
	"speaking_experience" text,
	"previous_speaking" boolean DEFAULT false,
	"tech_requirements" text,
	"available_slots" text,
	"motivation_to_speak" text,
	"key_takeaways" text,
	"interactive_elements" boolean DEFAULT false,
	"handouts_provided" boolean DEFAULT false,
	"agrees_to_terms" boolean DEFAULT false,
	"source" varchar,
	"registered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_summit_speaking_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"speaker_name" varchar NOT NULL,
	"speaker_bio" text,
	"speaker_company" varchar,
	"speaker_job_title" varchar,
	"co_speakers" text,
	"session_type" varchar NOT NULL,
	"duration" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"venue" varchar NOT NULL,
	"max_capacity" integer NOT NULL,
	"current_registrations" integer DEFAULT 0,
	"audience_level" varchar NOT NULL,
	"topics" text,
	"key_takeaways" text,
	"is_live_streamed" boolean DEFAULT false,
	"is_recorded" boolean DEFAULT false,
	"requires_registration" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_summit_team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"role" varchar NOT NULL,
	"department" varchar,
	"access_level" varchar DEFAULT 'standard',
	"permissions" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_summit_volunteers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"role" varchar NOT NULL,
	"shift" varchar,
	"experience" text,
	"availability" text,
	"emergency_contact" varchar,
	"t_shirt_size" varchar,
	"dietary_requirements" text,
	"agrees_to_terms" boolean DEFAULT false,
	"registered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_summit_workshop_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"workshop_id" integer NOT NULL,
	"badge_id" varchar NOT NULL,
	"attendee_name" varchar NOT NULL,
	"attendee_email" varchar NOT NULL,
	"attendee_company" varchar,
	"attendee_job_title" varchar,
	"experience_level" varchar,
	"specific_interests" text,
	"dietary_requirements" text,
	"accessibility_needs" text,
	"registration_source" varchar DEFAULT 'direct',
	"registered_at" timestamp DEFAULT now(),
	"checked_in" boolean DEFAULT false,
	"checked_in_at" timestamp,
	"no_show" boolean DEFAULT false,
	CONSTRAINT "ai_summit_workshop_registrations_workshop_id_badge_id_pk" PRIMARY KEY("workshop_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "ai_summit_workshops" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"facilitator" varchar NOT NULL,
	"facilitator_bio" text,
	"facilitator_company" varchar,
	"duration" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"room" varchar NOT NULL,
	"max_capacity" integer NOT NULL,
	"current_registrations" integer DEFAULT 0,
	"category" varchar NOT NULL,
	"tags" text,
	"prerequisites" text,
	"learning_objectives" text,
	"materials" text,
	"is_active" boolean DEFAULT true,
	"registration_deadline" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "barter_exchanges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" integer,
	"initiator_business_id" integer NOT NULL,
	"responder_business_id" integer NOT NULL,
	"initiator_offer" text NOT NULL,
	"responder_offer" text NOT NULL,
	"status" varchar DEFAULT 'proposed' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "barter_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"image_url" varchar,
	"offering" text NOT NULL,
	"looking_for" text NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"category_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "benefits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "benefits_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"address" text,
	"city" varchar DEFAULT 'Croydon',
	"postcode" varchar,
	"phone" varchar,
	"email" varchar,
	"website" varchar,
	"logo" varchar,
	"cover_image" varchar,
	"category_id" integer,
	"established" varchar,
	"employee_count" integer,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "cba_causes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"target_amount" numeric(10, 2),
	"raised_amount" numeric(10, 2) DEFAULT '0.00',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cba_event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" varchar,
	"personal_badge_id" integer,
	"participant_name" varchar NOT NULL,
	"participant_email" varchar NOT NULL,
	"participant_phone" varchar,
	"participant_company" varchar,
	"participant_job_title" varchar,
	"membership_tier" varchar,
	"registration_source" varchar DEFAULT 'website',
	"special_requirements" text,
	"dietary_requirements" text,
	"accessibility_needs" text,
	"networking_interests" text,
	"registration_status" varchar DEFAULT 'confirmed',
	"payment_status" varchar DEFAULT 'not_required',
	"payment_amount" integer DEFAULT 0,
	"checked_in" boolean DEFAULT false,
	"checked_in_at" timestamp,
	"checked_out" boolean DEFAULT false,
	"checked_out_at" timestamp,
	"no_show" boolean DEFAULT false,
	"feedback_rating" integer,
	"feedback_comments" text,
	"ghl_contact_id" varchar,
	"ghl_tags_applied" text,
	"registered_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cba_event_sponsors" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"package_id" integer NOT NULL,
	"company_name" varchar NOT NULL,
	"contact_name" varchar NOT NULL,
	"contact_email" varchar NOT NULL,
	"contact_phone" varchar,
	"company_website" varchar,
	"logo_url" text,
	"company_description" text,
	"sponsorship_amount" numeric(10, 2) NOT NULL,
	"payment_status" varchar DEFAULT 'pending',
	"payment_date" timestamp,
	"invoice_number" varchar,
	"special_requests" text,
	"approval_status" varchar DEFAULT 'pending',
	"approved_by" varchar,
	"approved_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cba_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" varchar NOT NULL,
	"event_slug" varchar NOT NULL,
	"description" text,
	"event_type" varchar NOT NULL,
	"event_date" timestamp NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"venue" varchar NOT NULL,
	"venue_address" text,
	"max_capacity" integer NOT NULL,
	"current_registrations" integer DEFAULT 0,
	"registration_deadline" timestamp,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"requires_approval" boolean DEFAULT false,
	"registration_fee" integer DEFAULT 0,
	"member_price" integer DEFAULT 0,
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" varchar,
	"tags" text,
	"image_url" text,
	"ghl_workflow_id" varchar,
	"ghl_tag_name" varchar,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_user_id" varchar NOT NULL,
	"content_type" varchar NOT NULL,
	"content_id" integer NOT NULL,
	"reason" varchar NOT NULL,
	"description" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"cause_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"stripe_payment_intent_id" varchar,
	"is_trial_donation" boolean DEFAULT false,
	"donation_date" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'completed'
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_type" varchar NOT NULL,
	"template_name" varchar NOT NULL,
	"subject" text NOT NULL,
	"html_content" text NOT NULL,
	"sms_content" text,
	"myt_tags" jsonb DEFAULT '[]'::jsonb,
	"myt_workflow" varchar,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"last_updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_attendance_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" varchar,
	"user_email" varchar NOT NULL,
	"attendance_pattern" varchar,
	"total_events_registered" integer DEFAULT 0,
	"total_events_attended" integer DEFAULT 0,
	"total_no_shows" integer DEFAULT 0,
	"attendance_rate" numeric(5, 2) DEFAULT '0',
	"last_event_attended" timestamp,
	"missed_event_workflow_triggered" boolean DEFAULT false,
	"missed_event_workflow_date" timestamp,
	"ghl_workflows_triggered" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_badge_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"badge_id" varchar NOT NULL,
	"event_id" varchar NOT NULL,
	"event_name" varchar NOT NULL,
	"participant_roles" text DEFAULT '["attendee"]' NOT NULL,
	"primary_role" varchar DEFAULT 'attendee' NOT NULL,
	"badge_color" varchar NOT NULL,
	"access_level" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_exhibitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"registration_id" integer,
	"company_name" varchar NOT NULL,
	"contact_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"website" varchar,
	"business_description" text,
	"products_services" text,
	"booth_type" varchar,
	"stand_location" varchar,
	"stand_number" varchar,
	"stand_size" varchar,
	"electrical_needs" boolean DEFAULT false,
	"internet_needs" boolean DEFAULT false,
	"special_requirements" text,
	"setup_time" timestamp,
	"breakdown_time" timestamp,
	"staff_count" integer DEFAULT 1,
	"status" varchar DEFAULT 'confirmed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" varchar,
	"participant_email" varchar NOT NULL,
	"overall_rating" integer NOT NULL,
	"content_quality" integer,
	"organization_rating" integer,
	"networking_value" integer,
	"venue_rating" integer,
	"would_recommend" boolean,
	"most_valuable" text,
	"improvements" text,
	"future_topics" text,
	"additional_comments" text,
	"is_anonymous" boolean DEFAULT false,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_mood_aggregations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"session_name" varchar,
	"mood_type" varchar NOT NULL,
	"total_count" integer DEFAULT 0,
	"average_intensity" numeric(3, 2) DEFAULT '0.00',
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_mood_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"user_id" varchar,
	"session_name" varchar,
	"mood_type" varchar NOT NULL,
	"intensity" integer DEFAULT 5 NOT NULL,
	"comment" text,
	"is_anonymous" boolean DEFAULT false,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" varchar,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"company" varchar,
	"job_title" varchar,
	"participant_type" varchar DEFAULT 'attendee',
	"dietary_requirements" text,
	"accessibility_needs" text,
	"special_requests" text,
	"ticket_type" varchar,
	"payment_status" varchar DEFAULT 'pending',
	"payment_amount" numeric(10, 2),
	"payment_date" timestamp,
	"checked_in" boolean DEFAULT false,
	"check_in_time" timestamp,
	"badge_id" varchar,
	"registered_at" timestamp DEFAULT now(),
	CONSTRAINT "event_registrations_badge_id_unique" UNIQUE("badge_id"),
	CONSTRAINT "unique_event_registration" UNIQUE("event_id","email")
);
--> statement-breakpoint
CREATE TABLE "event_scanners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_id" integer,
	"scanner_role" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"assigned_by" text,
	"assigned_at" timestamp DEFAULT now(),
	"total_scans_completed" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "event_speakers" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"registration_id" integer,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"bio" text,
	"company" varchar,
	"job_title" varchar,
	"linked_in" varchar,
	"website" varchar,
	"photo_url" varchar,
	"session_title" varchar,
	"session_description" text,
	"session_type" varchar,
	"session_duration" integer,
	"session_time" timestamp,
	"session_room" varchar,
	"tech_requirements" text,
	"status" varchar DEFAULT 'confirmed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_sponsors" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"company_name" varchar NOT NULL,
	"contact_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"website" varchar,
	"logo_url" varchar,
	"sponsorship_tier" varchar,
	"sponsorship_amount" numeric(10, 2),
	"benefits" text,
	"special_requests" text,
	"invoice_sent" boolean DEFAULT false,
	"payment_received" boolean DEFAULT false,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_time_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"slot_type" varchar NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"room" varchar,
	"max_capacity" integer,
	"current_attendees" integer DEFAULT 0,
	"speaker_id" varchar,
	"moderator_id" varchar,
	"is_break" boolean DEFAULT false,
	"materials" text,
	"streaming_url" varchar,
	"recording_url" varchar,
	"tags" text,
	"requires_registration" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_volunteers" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"registration_id" integer,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"role" varchar,
	"shift" varchar,
	"experience" text,
	"availability" text,
	"t_shirt_size" varchar,
	"emergency_contact" varchar,
	"status" varchar DEFAULT 'confirmed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"description" text,
	"venue" varchar NOT NULL,
	"venue_address" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"registration_start_date" timestamp,
	"registration_end_date" timestamp,
	"max_capacity" integer,
	"current_registrations" integer DEFAULT 0,
	"ticket_price" numeric(10, 2),
	"member_price" numeric(10, 2),
	"early_bird_price" numeric(10, 2),
	"early_bird_deadline" timestamp,
	"image_url" varchar,
	"banner_url" varchar,
	"status" varchar DEFAULT 'draft',
	"has_exhibition" boolean DEFAULT false,
	"has_speakers" boolean DEFAULT false,
	"has_workshops" boolean DEFAULT false,
	"has_networking" boolean DEFAULT true,
	"has_volunteers" boolean DEFAULT false,
	"has_sponsors" boolean DEFAULT false,
	"tags" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "events_event_code_unique" UNIQUE("event_code")
);
--> statement-breakpoint
CREATE TABLE "exhibitor_stand_visitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"exhibitor_id" text NOT NULL,
	"visitor_id" text NOT NULL,
	"event_id" integer,
	"stand_number" varchar,
	"scan_time" timestamp DEFAULT now(),
	"visitor_type" varchar,
	"visitor_name" varchar,
	"visitor_email" varchar,
	"visitor_phone" varchar,
	"visitor_company" varchar,
	"visitor_title" varchar,
	"visitor_university" varchar,
	"visitor_course" varchar,
	"notes" text,
	"follow_up_status" varchar DEFAULT 'pending',
	"follow_up_notes" text,
	"last_contacted_at" timestamp,
	"tags" text,
	"interested_in" text,
	"lead_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"content_type" varchar NOT NULL,
	"content_id" integer NOT NULL,
	"interaction_type" varchar NOT NULL,
	"metadata" text,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"user_id" text NOT NULL,
	"applicant_name" text NOT NULL,
	"applicant_email" text NOT NULL,
	"applicant_phone" text,
	"cover_letter" text,
	"resume_url" text,
	"cv_data" text,
	"cv_file_name" text,
	"cv_file_type" text,
	"cv_uploaded_at" timestamp,
	"linkedin_profile" text,
	"status" text DEFAULT 'pending',
	"notes" text,
	"applied_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text NOT NULL,
	"job_type" text NOT NULL,
	"work_mode" text NOT NULL,
	"salary" text,
	"salary_min" integer,
	"salary_max" integer,
	"description" text NOT NULL,
	"requirements" text,
	"benefits" text,
	"application_email" text,
	"application_url" text,
	"deadline" timestamp,
	"is_active" boolean DEFAULT true,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"category" text,
	"experience_level" text,
	"tags" text[]
);
--> statement-breakpoint
CREATE TABLE "job_saved_searches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"search_name" text NOT NULL,
	"keywords" text,
	"location" text,
	"job_type" text,
	"work_mode" text,
	"category" text,
	"experience_level" text,
	"salary_min" integer,
	"salary_max" integer,
	"email_alerts" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"image_url" varchar,
	"quantity" integer DEFAULT 1,
	"status" varchar DEFAULT 'active' NOT NULL,
	"category_id" integer,
	"is_service" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "member_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" varchar NOT NULL,
	"filename" varchar NOT NULL,
	"imported_count" integer DEFAULT 0,
	"failures" jsonb,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "membership_tier_benefits" (
	"id" serial PRIMARY KEY NOT NULL,
	"tier_name" varchar NOT NULL,
	"benefit_id" integer NOT NULL,
	"is_included" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_tier_benefit" UNIQUE("tier_name","benefit_id")
);
--> statement-breakpoint
CREATE TABLE "membership_tiers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"monthly_price" integer NOT NULL,
	"yearly_price" integer NOT NULL,
	"description" text NOT NULL,
	"features" text[] DEFAULT '{}'::text[] NOT NULL,
	"ai_credits" integer DEFAULT 0 NOT NULL,
	"max_events" integer DEFAULT 0 NOT NULL,
	"max_networking" integer DEFAULT 0 NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"color" text DEFAULT '#3B82F6' NOT NULL,
	"icon" text DEFAULT 'crown' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ghl_automation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"user_id" varchar,
	"user_email" varchar NOT NULL,
	"automation_type" varchar NOT NULL,
	"workflow_id" varchar NOT NULL,
	"trigger_reason" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"ghl_response" text,
	"retry_count" integer DEFAULT 0,
	"last_retry_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"discount_percentage" integer,
	"discount_value" numeric(10, 2),
	"original_price" numeric(10, 2),
	"member_only_discount" boolean DEFAULT false,
	"member_discount_percentage" integer,
	"member_discount_value" numeric(10, 2),
	"image_url" varchar,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "person_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"color" varchar,
	"icon" varchar,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "person_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "personal_badge_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"personal_badge_id" integer NOT NULL,
	"event_id" integer NOT NULL,
	"role_at_event" varchar DEFAULT 'attendee',
	"badge_design" varchar DEFAULT 'standard',
	"custom_fields" text,
	"qr_code_data" text NOT NULL,
	"checked_in" boolean DEFAULT false,
	"checked_in_at" timestamp,
	"checked_out" boolean DEFAULT false,
	"checked_out_at" timestamp,
	"badge_printed" boolean DEFAULT false,
	"badge_printed_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "personal_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_id" varchar NOT NULL,
	"qr_handle" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "personal_badges_badge_id_unique" UNIQUE("badge_id"),
	CONSTRAINT "personal_badges_qr_handle_unique" UNIQUE("qr_handle")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"price" numeric(10, 2),
	"image_url" varchar,
	"is_service" boolean DEFAULT false,
	"is_public" boolean DEFAULT true,
	"category_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scan_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"scanner_id" text NOT NULL,
	"scanned_user_id" text NOT NULL,
	"event_id" integer,
	"personal_badge_event_id" integer,
	"scan_type" text NOT NULL,
	"scan_location" text,
	"scan_notes" text,
	"device_info" text,
	"scan_timestamp" timestamp DEFAULT now(),
	"is_valid_scan" boolean DEFAULT true,
	"duplicate_scan_flag" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "scan_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"scanner_id" text NOT NULL,
	"event_id" integer,
	"session_start" timestamp DEFAULT now(),
	"session_end" timestamp,
	"total_scans" integer DEFAULT 0,
	"unique_scans" integer DEFAULT 0,
	"duplicate_scans" integer DEFAULT 0,
	"session_notes" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsorship_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"package_name" varchar NOT NULL,
	"package_level" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"benefits" text[],
	"max_sponsors" integer DEFAULT null,
	"current_sponsors" integer DEFAULT 0,
	"logo_placement" varchar,
	"banner_ads" boolean DEFAULT false,
	"lanyard_branding" boolean DEFAULT false,
	"booth_space" varchar,
	"speaking_slot" boolean DEFAULT false,
	"attendee_list_access" boolean DEFAULT false,
	"social_media_mentions" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_slot_speakers" (
	"id" serial PRIMARY KEY NOT NULL,
	"time_slot_id" integer NOT NULL,
	"speaker_id" varchar NOT NULL,
	"role" varchar DEFAULT 'speaker',
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" integer,
	"seller_business_id" integer NOT NULL,
	"buyer_business_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_person_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"person_type_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" varchar,
	"notes" text,
	CONSTRAINT "unique_user_person_type" UNIQUE("user_id","person_type_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"password_hash" varchar,
	"is_admin" boolean DEFAULT false,
	"membership_tier" varchar DEFAULT 'Starter Tier',
	"membership_status" varchar DEFAULT 'trial',
	"membership_start_date" timestamp DEFAULT now(),
	"membership_end_date" timestamp,
	"is_trial_member" boolean DEFAULT true,
	"trial_donation_paid" boolean DEFAULT false,
	"donation_amount" numeric(10, 2),
	"donation_date" timestamp,
	"account_status" varchar DEFAULT 'active' NOT NULL,
	"suspension_reason" text,
	"suspended_at" timestamp,
	"suspended_by" varchar,
	"qr_handle" varchar,
	"title" varchar,
	"company" varchar,
	"job_title" varchar,
	"phone" varchar,
	"bio" text,
	"email_verified" boolean DEFAULT false,
	"verification_token" varchar,
	"verification_token_expiry" timestamp,
	"participant_type" varchar DEFAULT 'attendee',
	"is_profile_hidden" boolean DEFAULT false,
	"university" varchar,
	"student_id" varchar,
	"course" varchar,
	"year_of_study" varchar,
	"community_role" varchar,
	"volunteer_experience" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_qr_handle_unique" UNIQUE("qr_handle")
);
--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_referral_id_affiliate_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."affiliate_referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_referral_id_affiliate_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."affiliate_referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summit_check_ins" ADD CONSTRAINT "ai_summit_check_ins_badge_id_ai_summit_badges_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."ai_summit_badges"("badge_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summit_exhibitor_registrations" ADD CONSTRAINT "ai_summit_exhibitor_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summit_registrations" ADD CONSTRAINT "ai_summit_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summit_session_registrations" ADD CONSTRAINT "ai_summit_session_registrations_session_id_ai_summit_speaking_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_summit_speaking_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summit_session_registrations" ADD CONSTRAINT "ai_summit_session_registrations_badge_id_ai_summit_badges_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."ai_summit_badges"("badge_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summit_speaker_interests" ADD CONSTRAINT "ai_summit_speaker_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summit_volunteers" ADD CONSTRAINT "ai_summit_volunteers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summit_workshop_registrations" ADD CONSTRAINT "ai_summit_workshop_registrations_workshop_id_ai_summit_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."ai_summit_workshops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summit_workshop_registrations" ADD CONSTRAINT "ai_summit_workshop_registrations_badge_id_ai_summit_badges_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."ai_summit_badges"("badge_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barter_exchanges" ADD CONSTRAINT "barter_exchanges_listing_id_barter_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."barter_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barter_exchanges" ADD CONSTRAINT "barter_exchanges_initiator_business_id_businesses_id_fk" FOREIGN KEY ("initiator_business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barter_exchanges" ADD CONSTRAINT "barter_exchanges_responder_business_id_businesses_id_fk" FOREIGN KEY ("responder_business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barter_listings" ADD CONSTRAINT "barter_listings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barter_listings" ADD CONSTRAINT "barter_listings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cba_event_registrations" ADD CONSTRAINT "cba_event_registrations_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cba_event_registrations" ADD CONSTRAINT "cba_event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cba_event_registrations" ADD CONSTRAINT "cba_event_registrations_personal_badge_id_personal_badges_id_fk" FOREIGN KEY ("personal_badge_id") REFERENCES "public"."personal_badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cba_event_sponsors" ADD CONSTRAINT "cba_event_sponsors_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cba_event_sponsors" ADD CONSTRAINT "cba_event_sponsors_package_id_sponsorship_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."sponsorship_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cba_event_sponsors" ADD CONSTRAINT "cba_event_sponsors_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cba_events" ADD CONSTRAINT "cba_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_cause_id_cba_causes_id_fk" FOREIGN KEY ("cause_id") REFERENCES "public"."cba_causes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendance_analytics" ADD CONSTRAINT "event_attendance_analytics_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendance_analytics" ADD CONSTRAINT "event_attendance_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_badge_assignments" ADD CONSTRAINT "event_badge_assignments_badge_id_personal_badges_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."personal_badges"("badge_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_exhibitors" ADD CONSTRAINT "event_exhibitors_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_exhibitors" ADD CONSTRAINT "event_exhibitors_registration_id_event_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."event_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_feedback" ADD CONSTRAINT "event_feedback_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_feedback" ADD CONSTRAINT "event_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_mood_aggregations" ADD CONSTRAINT "event_mood_aggregations_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_mood_entries" ADD CONSTRAINT "event_mood_entries_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_mood_entries" ADD CONSTRAINT "event_mood_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_scanners" ADD CONSTRAINT "event_scanners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_scanners" ADD CONSTRAINT "event_scanners_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_scanners" ADD CONSTRAINT "event_scanners_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_registration_id_event_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."event_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_sponsors" ADD CONSTRAINT "event_sponsors_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_time_slots" ADD CONSTRAINT "event_time_slots_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_time_slots" ADD CONSTRAINT "event_time_slots_speaker_id_users_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_time_slots" ADD CONSTRAINT "event_time_slots_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_volunteers" ADD CONSTRAINT "event_volunteers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_volunteers" ADD CONSTRAINT "event_volunteers_registration_id_event_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."event_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exhibitor_stand_visitors" ADD CONSTRAINT "exhibitor_stand_visitors_exhibitor_id_users_id_fk" FOREIGN KEY ("exhibitor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exhibitor_stand_visitors" ADD CONSTRAINT "exhibitor_stand_visitors_visitor_id_users_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exhibitor_stand_visitors" ADD CONSTRAINT "exhibitor_stand_visitors_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_job_postings_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_imports" ADD CONSTRAINT "member_imports_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_tier_benefits" ADD CONSTRAINT "membership_tier_benefits_tier_name_membership_tiers_name_fk" FOREIGN KEY ("tier_name") REFERENCES "public"."membership_tiers"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_tier_benefits" ADD CONSTRAINT "membership_tier_benefits_benefit_id_benefits_id_fk" FOREIGN KEY ("benefit_id") REFERENCES "public"."benefits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghl_automation_logs" ADD CONSTRAINT "ghl_automation_logs_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ghl_automation_logs" ADD CONSTRAINT "ghl_automation_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_badge_events" ADD CONSTRAINT "personal_badge_events_personal_badge_id_personal_badges_id_fk" FOREIGN KEY ("personal_badge_id") REFERENCES "public"."personal_badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_badge_events" ADD CONSTRAINT "personal_badge_events_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_badges" ADD CONSTRAINT "personal_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_history" ADD CONSTRAINT "scan_history_scanner_id_users_id_fk" FOREIGN KEY ("scanner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_history" ADD CONSTRAINT "scan_history_scanned_user_id_users_id_fk" FOREIGN KEY ("scanned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_history" ADD CONSTRAINT "scan_history_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_history" ADD CONSTRAINT "scan_history_personal_badge_event_id_personal_badge_events_id_fk" FOREIGN KEY ("personal_badge_event_id") REFERENCES "public"."personal_badge_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_sessions" ADD CONSTRAINT "scan_sessions_scanner_id_users_id_fk" FOREIGN KEY ("scanner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_sessions" ADD CONSTRAINT "scan_sessions_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsorship_packages" ADD CONSTRAINT "sponsorship_packages_event_id_cba_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."cba_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_slot_speakers" ADD CONSTRAINT "time_slot_speakers_time_slot_id_event_time_slots_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "public"."event_time_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_slot_speakers" ADD CONSTRAINT "time_slot_speakers_speaker_id_users_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_listing_id_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_business_id_businesses_id_fk" FOREIGN KEY ("seller_business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_business_id_businesses_id_fk" FOREIGN KEY ("buyer_business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_person_types" ADD CONSTRAINT "user_person_types_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_person_types" ADD CONSTRAINT "user_person_types_person_type_id_person_types_id_fk" FOREIGN KEY ("person_type_id") REFERENCES "public"."person_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_person_types" ADD CONSTRAINT "user_person_types_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_suspended_by_users_id_fk" FOREIGN KEY ("suspended_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clicks_affiliate_idx" ON "affiliate_clicks" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "clicks_code_idx" ON "affiliate_clicks" USING btree ("affiliate_code");--> statement-breakpoint
CREATE INDEX "clicks_date_idx" ON "affiliate_clicks" USING btree ("clicked_at");--> statement-breakpoint
CREATE INDEX "commissions_affiliate_idx" ON "affiliate_commissions" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "commissions_referral_idx" ON "affiliate_commissions" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "commissions_status_idx" ON "affiliate_commissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payouts_affiliate_idx" ON "affiliate_payouts" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "payouts_status_idx" ON "affiliate_payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "referrals_affiliate_idx" ON "affiliate_referrals" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX "referrals_referred_user_idx" ON "affiliate_referrals" USING btree ("referred_user_id");--> statement-breakpoint
CREATE INDEX "affiliates_user_idx" ON "affiliates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "affiliates_code_idx" ON "affiliates" USING btree ("affiliate_code");--> statement-breakpoint
CREATE INDEX "event_registrations_unique_idx" ON "cba_event_registrations" USING btree ("event_id","participant_email");--> statement-breakpoint
CREATE INDEX "membership_tier_benefits_tier_idx" ON "membership_tier_benefits" USING btree ("tier_name");--> statement-breakpoint
CREATE INDEX "membership_tier_benefits_benefit_idx" ON "membership_tier_benefits" USING btree ("benefit_id");--> statement-breakpoint
CREATE INDEX "badge_event_unique_idx" ON "personal_badge_events" USING btree ("personal_badge_id","event_id");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "user_person_types_user_idx" ON "user_person_types" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_person_types_type_idx" ON "user_person_types" USING btree ("person_type_id");