import { db } from "./db";
import { personTypes } from "../shared/schema";

const DEFAULT_PERSON_TYPES = [
  {
    name: "attendee",
    displayName: "Attendee",
    description: "General event attendees with full access to business features",
    color: "blue",
    icon: "Users",
    priority: 1,
    isActive: true
  },
  {
    name: "business",
    displayName: "Business Member",
    description: "Business owners and members with full business profile access",
    color: "indigo",
    icon: "Building2",
    priority: 2,
    isActive: true
  },
  {
    name: "volunteer",
    displayName: "Volunteer",
    description: "Community volunteers with limited business features",
    color: "green",
    icon: "HandHeart",
    priority: 3,
    isActive: true
  },
  {
    name: "resident",
    displayName: "Resident",
    description: "Local residents with community access only",
    color: "teal",
    icon: "Home",
    priority: 4,
    isActive: true
  },
  {
    name: "student",
    displayName: "Student",
    description: "Students with educational access and networking features",
    color: "purple",
    icon: "GraduationCap",
    priority: 5,
    isActive: true
  },
  {
    name: "vip",
    displayName: "VIP Guest",
    description: "VIP guests with special access privileges",
    color: "yellow",
    icon: "Star",
    priority: 6,
    isActive: true
  },
  {
    name: "speaker",
    displayName: "Speaker",
    description: "Event speakers with speaker-specific features",
    color: "purple",
    icon: "Mic",
    priority: 7,
    isActive: true
  },
  {
    name: "exhibitor",
    displayName: "Exhibitor",
    description: "Exhibition participants with booth management access",
    color: "orange",
    icon: "Store",
    priority: 8,
    isActive: true
  },
  {
    name: "team",
    displayName: "Team Member",
    description: "Staff and team members with admin access",
    color: "red",
    icon: "Shield",
    priority: 9,
    isActive: true
  }
];

export async function seedPersonTypes() {
  try {
    console.log('🌱 Seeding person types...');
    
    // Check if person types already exist
    const existingTypes = await db.select().from(personTypes);
    if (existingTypes.length > 0) {
      console.log('✅ Person types already exist, skipping seed');
      return;
    }

    // Insert all default person types
    await db.insert(personTypes).values(DEFAULT_PERSON_TYPES);
    
    console.log('✅ Successfully seeded person types');
    return DEFAULT_PERSON_TYPES;
  } catch (error) {
    console.error('❌ Error seeding person types:', error);
    throw error;
  }
}

// Auto-run if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  seedPersonTypes()
    .then(() => {
      console.log('Person types seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Person types seeding failed:', error);
      process.exit(1);
    });
}