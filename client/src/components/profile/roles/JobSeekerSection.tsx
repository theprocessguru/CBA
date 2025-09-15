import { RoleSection } from "../RoleSection";

interface JobSeekerSectionProps {
  roleData: Record<string, any>;
  onSave: (roleName: string, data: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function JobSeekerSection({
  roleData,
  onSave,
  isSaving = false,
  isOpen = false,
  onToggle
}: JobSeekerSectionProps) {
  const fields = [
    {
      name: 'currentStatus',
      label: 'Current Employment Status',
      type: 'select' as const,
      required: true,
      options: [
        'Unemployed - actively seeking',
        'Employed - looking for change',
        'Student - seeking first role',
        'Graduate - seeking opportunities',
        'Career break - returning to work',
        'Freelancer - seeking permanent role',
        'Part-time - seeking full-time',
        'Contract worker - seeking permanent'
      ],
      description: 'What is your current employment situation?'
    },
    {
      name: 'experienceLevel',
      label: 'Experience Level',
      type: 'select' as const,
      required: true,
      options: [
        'Entry level (0-2 years)',
        'Mid-level (3-5 years)',
        'Senior level (6-10 years)',
        'Executive level (10+ years)',
        'Career changer (transferring skills)',
        'Recent graduate',
        'Student/Internship level'
      ],
      description: 'What is your overall experience level?'
    },
    {
      name: 'targetRoles',
      label: 'Target Job Roles',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Sales Representative',
        'Marketing Coordinator',
        'Digital Marketing',
        'Business Analyst',
        'Project Manager',
        'Account Manager',
        'Customer Service',
        'Administrative Assistant',
        'Operations Coordinator',
        'HR Coordinator',
        'Finance Analyst',
        'Software Developer',
        'Data Analyst',
        'Graphic Designer',
        'Content Writer',
        'Social Media Manager',
        'Business Development',
        'Consultant',
        'Other'
      ],
      description: 'What types of roles are you seeking?'
    },
    {
      name: 'preferredIndustries',
      label: 'Preferred Industries',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Technology',
        'Financial Services',
        'Healthcare',
        'Education',
        'Marketing/Advertising',
        'Consulting',
        'Retail',
        'Manufacturing',
        'Non-profit',
        'Government',
        'Media & Entertainment',
        'Real Estate',
        'Professional Services',
        'Startups',
        'E-commerce'
      ],
      description: 'Which industries interest you most?'
    },
    {
      name: 'skills',
      label: 'Key Skills',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Project Management',
        'Sales & Business Development',
        'Digital Marketing',
        'Data Analysis',
        'Customer Service',
        'Social Media Management',
        'Content Creation',
        'Financial Analysis',
        'Administrative Skills',
        'Communication',
        'Leadership',
        'Problem Solving',
        'Microsoft Office',
        'CRM Systems',
        'Public Speaking',
        'Research & Analysis',
        'Team Management',
        'Strategic Planning'
      ],
      description: 'What are your key professional skills?'
    },
    {
      name: 'workPreferences',
      label: 'Work Preferences',
      type: 'multiselect' as const,
      options: [
        'Full-time permanent',
        'Part-time',
        'Contract/Temporary',
        'Freelance/Consulting',
        'Remote work',
        'Hybrid working',
        'Office-based',
        'Flexible hours',
        'International travel',
        'UK-based only'
      ],
      description: 'What working arrangements suit you best?'
    },
    {
      name: 'salaryExpectations',
      label: 'Salary Expectations',
      type: 'select' as const,
      options: [
        'Under £20k',
        '£20k - £25k',
        '£25k - £30k',
        '£30k - £40k',
        '£40k - £50k',
        '£50k - £65k',
        '£65k - £80k',
        '£80k - £100k',
        'Over £100k',
        'Negotiable/Competitive'
      ],
      description: 'What are your salary expectations?'
    },
    {
      name: 'location',
      label: 'Preferred Work Location',
      type: 'multiselect' as const,
      options: [
        'Croydon',
        'Central London',
        'South London',
        'Greater London',
        'Surrey',
        'Kent',
        'Remote UK',
        'Willing to relocate',
        'International'
      ],
      description: 'Where would you like to work?'
    },
    {
      name: 'availability',
      label: 'Availability to Start',
      type: 'select' as const,
      required: true,
      options: [
        'Immediately',
        'Within 2 weeks',
        '1 month notice',
        '2 months notice',
        '3+ months notice',
        'After specific date',
        'Flexible timing'
      ],
      description: 'When could you start a new role?'
    },
    {
      name: 'careerGoals',
      label: 'Career Goals',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Describe your career aspirations and where you see yourself in 3-5 years...',
      description: 'What are your long-term career objectives?'
    },
    {
      name: 'previousExperience',
      label: 'Previous Experience Summary',
      type: 'textarea' as const,
      placeholder: 'Briefly describe your most relevant work experience and achievements...',
      description: 'Highlight your key professional background'
    },
    {
      name: 'challenges',
      label: 'Job Search Challenges',
      type: 'multiselect' as const,
      options: [
        'Finding relevant opportunities',
        'Getting interview calls',
        'Lack of experience',
        'Skills gap',
        'CV/Resume writing',
        'Interview preparation',
        'Networking',
        'Career direction uncertainty',
        'Work-life balance requirements',
        'Salary negotiations',
        'Age discrimination concerns',
        'Long-term unemployment gap'
      ],
      description: 'What challenges are you facing in your job search?'
    },
    {
      name: 'supportNeeded',
      label: 'Support Needed',
      type: 'multiselect' as const,
      options: [
        'CV/Resume review',
        'Interview coaching',
        'Career counseling',
        'Skills development',
        'Networking opportunities',
        'Job referrals',
        'Industry insights',
        'Mentorship',
        'Portfolio development',
        'LinkedIn optimization',
        'Salary negotiation help',
        'Professional development'
      ],
      description: 'How can CBA help support your job search?'
    },
    {
      name: 'qualifications',
      label: 'Education & Qualifications',
      type: 'textarea' as const,
      placeholder: 'List your relevant qualifications, degrees, certifications...',
      description: 'Include formal education and professional certifications'
    },
    {
      name: 'hasCV',
      label: 'Have Updated CV/Resume',
      type: 'checkbox' as const,
      description: 'Do you have a current, professional CV ready?'
    },
    {
      name: 'hasLinkedIn',
      label: 'Active LinkedIn Profile',
      type: 'checkbox' as const,
      description: 'Do you have an optimized LinkedIn profile?'
    },
    {
      name: 'openToMentorship',
      label: 'Interested in Career Mentorship',
      type: 'checkbox' as const,
      description: 'Would you like to be paired with a career mentor?'
    },
    {
      name: 'willingToVolunteer',
      label: 'Open to Volunteer Work for Experience',
      type: 'checkbox' as const,
      description: 'Interested in gaining experience through volunteering?'
    },
    {
      name: 'canAttendEvents',
      label: 'Available for Networking Events',
      type: 'checkbox' as const,
      description: 'Can you attend evening/weekend networking events?'
    }
  ];

  return (
    <RoleSection
      roleName="job_seeker"
      roleDisplayName="Job Seeker Profile"
      roleIcon="💼"
      roleColor="bg-orange-100 text-orange-800"
      roleData={roleData}
      fields={fields}
      onSave={onSave}
      isSaving={isSaving}
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
}