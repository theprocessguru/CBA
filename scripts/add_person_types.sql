-- Create person_types table
CREATE TABLE IF NOT EXISTS person_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  description TEXT,
  color VARCHAR,
  icon VARCHAR,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_person_types junction table
CREATE TABLE IF NOT EXISTS user_person_types (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  person_type_id INTEGER NOT NULL REFERENCES person_types(id),
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by VARCHAR REFERENCES users(id),
  notes TEXT,
  UNIQUE(user_id, person_type_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_person_types_user_idx ON user_person_types(user_id);
CREATE INDEX IF NOT EXISTS user_person_types_type_idx ON user_person_types(person_type_id);

-- Insert default person types
INSERT INTO person_types (name, display_name, description, color, icon, priority) VALUES
  ('attendee', 'Attendee', 'General event attendee', '#6B7280', 'User', 100),
  ('volunteer', 'Volunteer', 'Event volunteer or helper', '#10B981', 'Heart', 90),
  ('speaker', 'Speaker', 'Event speaker or presenter', '#8B5CF6', 'Mic', 80),
  ('exhibitor', 'Exhibitor', 'Event exhibitor with a booth or stand', '#F59E0B', 'ShoppingBag', 70),
  ('councillor', 'Councillor', 'Local councillor or government official', '#EF4444', 'Building', 60),
  ('vip', 'VIP Guest', 'VIP or special guest', '#EC4899', 'Star', 50),
  ('sponsor', 'Sponsor', 'Event sponsor', '#3B82F6', 'Trophy', 40),
  ('staff', 'Staff', 'Event staff member', '#14B8A6', 'Briefcase', 30),
  ('media', 'Media', 'Press or media representative', '#A855F7', 'Camera', 20),
  ('student', 'Student', 'Student attendee', '#22D3EE', 'GraduationCap', 110)
ON CONFLICT (name) DO NOTHING;

-- Migrate existing participantType data to user_person_types
INSERT INTO user_person_types (user_id, person_type_id, is_primary)
SELECT 
  u.id,
  pt.id,
  true
FROM users u
JOIN person_types pt ON pt.name = LOWER(u.participant_type)
WHERE u.participant_type IS NOT NULL
ON CONFLICT (user_id, person_type_id) DO NOTHING;