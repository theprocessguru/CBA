-- Create Jobs Board Tables
-- Run this script to create the necessary tables for the jobs board feature

-- Job Postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  work_mode TEXT NOT NULL,
  salary TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  application_email TEXT,
  application_url TEXT,
  deadline TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  category TEXT,
  experience_level TEXT,
  tags TEXT[]
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES job_postings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  linkedin_profile TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP
);

-- Job Saved Searches table
CREATE TABLE IF NOT EXISTS job_saved_searches (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  search_name TEXT NOT NULL,
  keywords TEXT,
  location TEXT,
  job_type TEXT,
  work_mode TEXT,
  category TEXT,
  experience_level TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  email_alerts BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON job_postings(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_business_id ON job_postings(business_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_saved_searches_user_id ON job_saved_searches(user_id);