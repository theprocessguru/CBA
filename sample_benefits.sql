-- Sample benefits for the CBA membership system
INSERT INTO benefits (name, description, category, is_active, sort_order) VALUES
-- Networking & Events
('Enhanced directory listing', 'Premium placement in the member directory with full business details', 'networking', true, 1),
('Monthly networking events', 'Access to exclusive monthly networking sessions', 'networking', true, 2),
('Event priority booking', 'First access to book popular events before general release', 'networking', true, 3),
('Annual conference access', 'Complimentary tickets to the annual CBA conference', 'networking', true, 4),
('Member-only mixers', 'Invitation to quarterly member-only social events', 'networking', true, 5),

-- Business Support
('1-on-1 business mentoring', 'Monthly one-hour sessions with experienced business mentors', 'support', true, 1),
('Legal consultation hours', 'Complimentary legal advice sessions with partner law firms', 'support', true, 2),
('Accounting support', 'Basic accounting and tax advice from certified accountants', 'support', true, 3),
('Business plan review', 'Professional review and feedback on business plans', 'support', true, 4),
('Grant application assistance', 'Help with finding and applying for business grants', 'support', true, 5),

-- Marketing & Promotion
('Social media promotion', 'Featured posts on CBA social media channels', 'marketing', true, 1),
('Newsletter inclusion', 'Business highlights in monthly member newsletter', 'marketing', true, 2),
('Website feature', 'Spotlight placement on CBA website homepage', 'marketing', true, 3),
('Press release distribution', 'Distribution of member press releases to local media', 'marketing', true, 4),
('Marketing workshop access', 'Free access to digital marketing workshops', 'marketing', true, 5),

-- AI Services
('AI content writing', 'Monthly AI-generated blog posts and social media content', 'ai_services', true, 1),
('AI chatbot setup', 'Custom AI chatbot for member websites', 'ai_services', true, 2),
('AI analytics dashboard', 'Business insights powered by AI analysis', 'ai_services', true, 3),
('AI email campaigns', 'Automated email marketing campaigns with AI optimization', 'ai_services', true, 4),
('AI customer insights', 'Advanced customer behavior analysis using AI', 'ai_services', true, 5),

-- Automation
('CRM integration', 'Setup and optimization of customer relationship management systems', 'automation', true, 1),
('Invoice automation', 'Automated invoicing and payment processing setup', 'automation', true, 2),
('Social media scheduling', 'Automated social media posting and scheduling', 'automation', true, 3),
('Email automation', 'Customer journey email sequences automation', 'automation', true, 4),
('Workflow optimization', 'Business process automation consulting', 'automation', true, 5),

-- Directory & Visibility
('Premium directory placement', 'Top-tier placement in online business directory', 'directory', true, 1),
('Featured business badge', 'Special verification badge on directory listing', 'directory', true, 2),
('SEO optimization', 'Search engine optimization for business listings', 'directory', true, 3),
('Multiple category listing', 'Ability to list business in multiple categories', 'directory', true, 4),
('Enhanced business profile', 'Extended profile with photos, videos, and detailed descriptions', 'directory', true, 5),

-- Other Benefits
('Member discounts', 'Exclusive discounts from partner businesses', 'other', true, 1),
('Banking perks', 'Special rates and services from partner banks', 'other', true, 2),
('Insurance discounts', 'Reduced rates on business insurance through partnerships', 'other', true, 3),
('Training credits', 'Annual credits for professional development courses', 'other', true, 4),
('Co-working space access', 'Day passes to partner co-working spaces', 'other', true, 5);