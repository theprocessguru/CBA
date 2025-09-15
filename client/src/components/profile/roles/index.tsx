export { EducatorSection } from './EducatorSection';
export { VolunteerSection } from './VolunteerSection';
export { StudentSection } from './StudentSection';
export { StartupFounderSection } from './StartupFounderSection';
export { JobSeekerSection } from './JobSeekerSection';

// Role configuration mapping
export const ROLE_COMPONENTS = {
  educator: 'EducatorSection',
  volunteer: 'VolunteerSection',
  student: 'StudentSection',
  startup_founder: 'StartupFounderSection',
  job_seeker: 'JobSeekerSection'
} as const;

export type RoleComponentType = keyof typeof ROLE_COMPONENTS;

// Role metadata for display and organization
export const ROLE_METADATA = {
  educator: {
    name: 'educator',
    displayName: 'Educator Profile',
    icon: '🎓',
    color: 'bg-blue-100 text-blue-800',
    description: 'Share your teaching experience and expertise'
  },
  volunteer: {
    name: 'volunteer',
    displayName: 'Volunteer Profile',
    icon: '🤝',
    color: 'bg-green-100 text-green-800',
    description: 'Specify your volunteer availability and skills'
  },
  student: {
    name: 'student',
    displayName: 'Student Profile',
    icon: '📚',
    color: 'bg-cyan-100 text-cyan-800',
    description: 'Outline your learning goals and career aspirations'
  },
  startup_founder: {
    name: 'startup_founder',
    displayName: 'Startup Founder Profile',
    icon: '🚀',
    color: 'bg-purple-100 text-purple-800',
    description: 'Detail your startup journey and current needs'
  },
  job_seeker: {
    name: 'job_seeker',
    displayName: 'Job Seeker Profile',
    icon: '💼',
    color: 'bg-orange-100 text-orange-800',
    description: 'Highlight your skills and career objectives'
  }
} as const;