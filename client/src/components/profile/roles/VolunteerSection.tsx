import { RoleSection } from "../RoleSection";

interface VolunteerSectionProps {
  roleData: Record<string, any>;
  onSave: (roleName: string, data: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function VolunteerSection({
  roleData,
  onSave,
  isSaving = false,
  isOpen = false,
  onToggle
}: VolunteerSectionProps) {
  const fields = [
    {
      name: 'experience',
      label: 'Volunteer Experience',
      type: 'select' as const,
      required: true,
      options: [
        'New to volunteering',
        '6 months - 1 year',
        '1-3 years',
        '3-5 years',
        'More than 5 years'
      ],
      description: 'How long have you been volunteering?'
    },
    {
      name: 'skills',
      label: 'Skills & Abilities',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Event registration/check-in',
        'Customer service',
        'Public speaking/presentations',
        'Technical support',
        'Social media management',
        'Photography/videography',
        'Administrative tasks',
        'Translation services',
        'First aid certified',
        'Security/crowd management',
        'Catering/hospitality',
        'Setup/breakdown',
        'Marketing/promotion',
        'Project coordination'
      ],
      description: 'What skills can you contribute as a volunteer?'
    },
    {
      name: 'availability',
      label: 'General Availability',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Weekday mornings (9am-1pm)',
        'Weekday afternoons (1pm-6pm)',
        'Weekday evenings (6pm-9pm)',
        'Saturday mornings',
        'Saturday afternoons',
        'Saturday evenings',
        'Sunday mornings',
        'Sunday afternoons',
        'Sunday evenings'
      ],
      description: 'When are you typically available to volunteer?'
    },
    {
      name: 'preferredEvents',
      label: 'Preferred Event Types',
      type: 'multiselect' as const,
      options: [
        'AI Summit & Tech Events',
        'Business networking events',
        'Educational workshops',
        'Community outreach',
        'Fundraising events',
        'Member meetings',
        'Conference/large events',
        'Small group sessions',
        'Online events',
        'Outdoor events'
      ],
      description: 'What types of events would you most like to help with?'
    },
    {
      name: 'timeCommitment',
      label: 'Time Commitment',
      type: 'select' as const,
      required: true,
      options: [
        '1-2 hours per month',
        '3-5 hours per month',
        '6-10 hours per month',
        '11-20 hours per month',
        'More than 20 hours per month',
        'Project-based (varies)',
        'Event-based only'
      ],
      description: 'How much time can you typically commit per month?'
    },
    {
      name: 'interests',
      label: 'Areas of Interest',
      type: 'multiselect' as const,
      options: [
        'Supporting new businesses',
        'Helping job seekers',
        'Technology education',
        'Community development',
        'Youth mentorship',
        'Senior support',
        'Environmental initiatives',
        'Cultural events',
        'Health & wellness',
        'Arts & creativity'
      ],
      description: 'What causes or areas are you passionate about?'
    },
    {
      name: 'previousExperience',
      label: 'Previous Volunteer Experience',
      type: 'textarea' as const,
      placeholder: 'Describe your previous volunteer work and any leadership roles...',
      description: 'Help us understand your volunteer background'
    },
    {
      name: 'specialRequirements',
      label: 'Special Requirements or Accommodations',
      type: 'textarea' as const,
      placeholder: 'Any accessibility needs, dietary requirements, or other considerations...',
      description: 'Help us ensure all volunteer opportunities are accessible to you'
    },
    {
      name: 'emergencyContact',
      label: 'Emergency Contact Name',
      type: 'text' as const,
      placeholder: 'Name of emergency contact',
      description: 'Required for event volunteering'
    },
    {
      name: 'emergencyPhone',
      label: 'Emergency Contact Phone',
      type: 'text' as const,
      placeholder: 'Emergency contact phone number',
      description: 'Required for event volunteering'
    },
    {
      name: 'hasTransport',
      label: 'Have Own Transportation',
      type: 'checkbox' as const,
      description: 'Can you get to venues independently?'
    },
    {
      name: 'willingToTravel',
      label: 'Willing to Travel within Greater London',
      type: 'checkbox' as const,
      description: 'Available for events outside of Croydon but within Greater London?'
    },
    {
      name: 'leadershipInterest',
      label: 'Interested in Leadership Opportunities',
      type: 'checkbox' as const,
      description: 'Would you like to take on team leader or coordinator roles?'
    },
    {
      name: 'backgroundCheck',
      label: 'Willing to Undergo Background Check',
      type: 'checkbox' as const,
      description: 'Some volunteer roles may require DBS or background checking'
    }
  ];

  return (
    <RoleSection
      roleName="volunteer"
      roleDisplayName="Volunteer Profile"
      roleIcon="🤝"
      roleColor="bg-green-100 text-green-800"
      roleData={roleData}
      fields={fields}
      onSave={onSave}
      isSaving={isSaving}
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
}