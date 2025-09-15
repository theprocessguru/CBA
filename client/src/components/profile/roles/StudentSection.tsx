import { RoleSection } from "../RoleSection";

interface StudentSectionProps {
  roleData: Record<string, any>;
  onSave: (roleName: string, data: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function StudentSection({
  roleData,
  onSave,
  isSaving = false,
  isOpen = false,
  onToggle
}: StudentSectionProps) {
  const fields = [
    {
      name: 'studyLevel',
      label: 'Current Study Level',
      type: 'select' as const,
      required: true,
      options: [
        'High School/A-Levels',
        'Undergraduate',
        'Postgraduate',
        'PhD/Doctorate',
        'Professional Course',
        'Apprenticeship',
        'Self-learning',
        'Career Change Learning'
      ],
      description: 'What level are you currently studying at?'
    },
    {
      name: 'fieldOfStudy',
      label: 'Field of Study',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., Business Administration, Computer Science, Marketing',
      description: 'What is your main area of study?'
    },
    {
      name: 'institution',
      label: 'Institution',
      type: 'text' as const,
      placeholder: 'University, college, or learning platform',
      description: 'Where are you studying?'
    },
    {
      name: 'yearOfStudy',
      label: 'Year/Stage of Study',
      type: 'select' as const,
      options: [
        '1st Year',
        '2nd Year',
        '3rd Year',
        '4th Year',
        'Final Year',
        'Part-time study',
        'Evening/Weekend study',
        'Distance learning',
        'Recently graduated'
      ],
      description: 'What stage are you at in your studies?'
    },
    {
      name: 'careerGoals',
      label: 'Career Goals',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Describe your career aspirations and what you hope to achieve...',
      description: 'What do you want to do after your studies?'
    },
    {
      name: 'skillsInterests',
      label: 'Skills & Interests',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Business Strategy',
        'Marketing & Sales',
        'Finance & Accounting',
        'Technology & Programming',
        'Data Science & Analytics',
        'Digital Marketing',
        'Project Management',
        'Graphic Design',
        'Content Creation',
        'Social Media',
        'Research & Analysis',
        'Public Speaking',
        'Leadership',
        'Entrepreneurship',
        'AI & Machine Learning'
      ],
      description: 'What skills are you developing or interested in?'
    },
    {
      name: 'learningGoals',
      label: 'Current Learning Goals',
      type: 'textarea' as const,
      placeholder: 'What specific skills or knowledge are you trying to gain right now?',
      description: 'Help us understand what you\'re focusing on learning'
    },
    {
      name: 'workExperience',
      label: 'Work Experience',
      type: 'select' as const,
      options: [
        'No work experience',
        'Part-time work only',
        'Summer internships',
        '1-2 years experience',
        '3+ years experience',
        'Significant work experience'
      ],
      description: 'What level of work experience do you have?'
    },
    {
      name: 'internshipInterest',
      label: 'Types of Experience Sought',
      type: 'multiselect' as const,
      options: [
        'Internships',
        'Work placements',
        'Mentorship',
        'Job shadowing',
        'Volunteer projects',
        'Freelance work',
        'Part-time roles',
        'Graduate schemes',
        'Networking opportunities'
      ],
      description: 'What types of experience are you looking for?'
    },
    {
      name: 'preferredIndustries',
      label: 'Preferred Industries',
      type: 'multiselect' as const,
      options: [
        'Technology',
        'Finance',
        'Marketing/Advertising',
        'Consulting',
        'Healthcare',
        'Education',
        'Non-profit',
        'Startups',
        'Government',
        'Media & Entertainment',
        'Retail',
        'Manufacturing',
        'Real Estate',
        'Professional Services'
      ],
      description: 'Which industries interest you most?'
    },
    {
      name: 'availability',
      label: 'Availability',
      type: 'multiselect' as const,
      options: [
        'Weekday mornings',
        'Weekday afternoons',
        'Weekday evenings',
        'Weekend mornings',
        'Weekend afternoons',
        'Weekend evenings',
        'School holidays',
        'Summer break',
        'Flexible schedule'
      ],
      description: 'When are you typically available for opportunities?'
    },
    {
      name: 'challengesSupport',
      label: 'Challenges & Support Needed',
      type: 'textarea' as const,
      placeholder: 'What challenges are you facing in your studies or career planning? What support would be helpful?',
      description: 'Help us understand how CBA can best support your journey'
    },
    {
      name: 'networkingGoals',
      label: 'Networking Goals',
      type: 'textarea' as const,
      placeholder: 'What do you hope to gain from networking with CBA members?',
      description: 'How can our community help you achieve your goals?'
    },
    {
      name: 'hasLinkedIn',
      label: 'Active LinkedIn Profile',
      type: 'checkbox' as const,
      description: 'Do you have a professional LinkedIn profile?'
    },
    {
      name: 'openToMentorship',
      label: 'Interested in Mentorship',
      type: 'checkbox' as const,
      description: 'Would you like to be matched with a professional mentor?'
    },
    {
      name: 'canVolunteer',
      label: 'Available to Volunteer at Events',
      type: 'checkbox' as const,
      description: 'Interested in gaining experience by volunteering at CBA events?'
    }
  ];

  return (
    <RoleSection
      roleName="student"
      roleDisplayName="Student Profile"
      roleIcon="📚"
      roleColor="bg-cyan-100 text-cyan-800"
      roleData={roleData}
      fields={fields}
      onSave={onSave}
      isSaving={isSaving}
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
}