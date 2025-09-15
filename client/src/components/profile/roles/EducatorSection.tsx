import { RoleSection } from "../RoleSection";

interface EducatorSectionProps {
  roleData: Record<string, any>;
  onSave: (roleName: string, data: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function EducatorSection({
  roleData,
  onSave,
  isSaving = false,
  isOpen = false,
  onToggle
}: EducatorSectionProps) {
  const fields = [
    {
      name: 'teachingExperience',
      label: 'Years of Teaching Experience',
      type: 'select' as const,
      required: true,
      options: [
        'Less than 1 year',
        '1-3 years',
        '4-7 years',
        '8-15 years',
        'More than 15 years'
      ],
      description: 'How long have you been teaching or training others?'
    },
    {
      name: 'subjects',
      label: 'Subjects/Areas of Expertise',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Business Strategy',
        'Marketing & Sales',
        'Finance & Accounting',
        'Technology & Programming',
        'Data Science & Analytics',
        'Digital Marketing',
        'Leadership & Management',
        'Entrepreneurship',
        'AI & Machine Learning',
        'Project Management',
        'Human Resources',
        'Operations',
        'Communication Skills',
        'Other'
      ],
      description: 'Select all areas where you have teaching expertise'
    },
    {
      name: 'qualifications',
      label: 'Teaching Qualifications',
      type: 'textarea' as const,
      placeholder: 'List your relevant qualifications, certifications, and degrees...',
      description: 'Include degrees, teaching certifications, professional qualifications, etc.'
    },
    {
      name: 'currentRole',
      label: 'Current Teaching Role',
      type: 'text' as const,
      placeholder: 'e.g., University Lecturer, Corporate Trainer, Workshop Facilitator',
      description: 'Your current primary teaching or training position'
    },
    {
      name: 'institution',
      label: 'Institution/Organization',
      type: 'text' as const,
      placeholder: 'Where do you currently teach or have taught?',
      description: 'Current or most recent teaching institution'
    },
    {
      name: 'teachingFormats',
      label: 'Preferred Teaching Formats',
      type: 'multiselect' as const,
      options: [
        'In-person workshops',
        'Online webinars',
        'One-on-one mentoring',
        'Group training sessions',
        'Conference presentations',
        'Written tutorials/guides',
        'Video courses',
        'Hybrid sessions'
      ],
      description: 'How do you prefer to deliver your teaching content?'
    },
    {
      name: 'availability',
      label: 'Availability for CBA Events',
      type: 'select' as const,
      options: [
        'Very flexible - available most times',
        'Weekends only',
        'Weekdays only',
        'Evenings only',
        'Monthly availability',
        'Quarterly availability',
        'By special arrangement only'
      ],
      description: 'When are you typically available to teach at CBA events?'
    },
    {
      name: 'targetAudience',
      label: 'Target Audience',
      type: 'multiselect' as const,
      options: [
        'Beginners/Entrepreneurs',
        'Small business owners',
        'Corporate professionals',
        'Students',
        'Job seekers',
        'Career changers',
        'Startup founders',
        'Tech professionals',
        'All levels'
      ],
      description: 'Who do you most enjoy teaching?'
    },
    {
      name: 'specialties',
      label: 'Teaching Specialties',
      type: 'textarea' as const,
      placeholder: 'Describe your unique teaching approach, methodologies, or special areas...',
      description: 'What makes your teaching style unique? Any special methodologies?'
    },
    {
      name: 'previousWorkshops',
      label: 'Previous CBA/Community Workshops',
      type: 'textarea' as const,
      placeholder: 'List any workshops or sessions you\'ve previously delivered for CBA or similar organizations...',
      description: 'Help us understand your community teaching experience'
    },
    {
      name: 'willingToMentor',
      label: 'Available for Individual Mentoring',
      type: 'checkbox' as const,
      description: 'Check if you\'re interested in one-on-one mentoring opportunities'
    },
    {
      name: 'canTravelLocal',
      label: 'Can Travel within Greater London',
      type: 'checkbox' as const,
      description: 'Willing to teach at venues outside of Croydon but within Greater London?'
    }
  ];

  return (
    <RoleSection
      roleName="educator"
      roleDisplayName="Educator Profile"
      roleIcon="🎓"
      roleColor="bg-blue-100 text-blue-800"
      roleData={roleData}
      fields={fields}
      onSave={onSave}
      isSaving={isSaving}
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
}