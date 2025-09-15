import { RoleSection } from "../RoleSection";

interface StartupFounderSectionProps {
  roleData: Record<string, any>;
  onSave: (roleName: string, data: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function StartupFounderSection({
  roleData,
  onSave,
  isSaving = false,
  isOpen = false,
  onToggle
}: StartupFounderSectionProps) {
  const fields = [
    {
      name: 'companyName',
      label: 'Company/Startup Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter your company name',
      description: 'What is the name of your startup or company?'
    },
    {
      name: 'companyStage',
      label: 'Company Stage',
      type: 'select' as const,
      required: true,
      options: [
        'Idea stage',
        'Pre-MVP',
        'MVP development',
        'MVP launched',
        'Early customers',
        'Product-market fit',
        'Growth stage',
        'Scale-up',
        'Established business'
      ],
      description: 'What stage is your company currently at?'
    },
    {
      name: 'industry',
      label: 'Industry/Sector',
      type: 'select' as const,
      required: true,
      options: [
        'Technology/Software',
        'AI/Machine Learning',
        'Fintech',
        'Healthtech',
        'Edtech',
        'E-commerce',
        'SaaS',
        'Mobile Apps',
        'Biotech',
        'Clean Tech/Green Energy',
        'Food & Beverage',
        'Fashion/Retail',
        'Media/Entertainment',
        'Professional Services',
        'Social Impact',
        'Other'
      ],
      description: 'Which industry does your startup operate in?'
    },
    {
      name: 'businessModel',
      label: 'Business Model',
      type: 'select' as const,
      options: [
        'B2B SaaS',
        'B2C SaaS',
        'Marketplace',
        'E-commerce',
        'Subscription',
        'Freemium',
        'Advertising',
        'Commission-based',
        'Consulting/Services',
        'Product sales',
        'Licensing',
        'Other'
      ],
      description: 'How does your business make money?'
    },
    {
      name: 'teamSize',
      label: 'Team Size',
      type: 'select' as const,
      required: true,
      options: [
        'Just me (solo founder)',
        '2-3 people',
        '4-6 people',
        '7-10 people',
        '11-20 people',
        '21-50 people',
        'More than 50 people'
      ],
      description: 'How many people are currently on your team?'
    },
    {
      name: 'foundingYear',
      label: 'Founded',
      type: 'select' as const,
      options: [
        '2024',
        '2023',
        '2022',
        '2021',
        '2020',
        '2019',
        '2018',
        'Earlier'
      ],
      description: 'When was your company founded?'
    },
    {
      name: 'fundingStage',
      label: 'Funding Stage',
      type: 'select' as const,
      options: [
        'Self-funded/Bootstrapped',
        'Pre-seed',
        'Seed funding',
        'Series A',
        'Series B+',
        'Government grants',
        'Crowdfunding',
        'Angel investors',
        'Not seeking funding',
        'Actively fundraising'
      ],
      description: 'What is your current funding situation?'
    },
    {
      name: 'fundingNeeds',
      label: 'Funding Needs',
      type: 'textarea' as const,
      placeholder: 'Describe your funding requirements, what you need investment for, and your timeline...',
      description: 'What are your current funding requirements?'
    },
    {
      name: 'keyPriorities',
      label: 'Current Key Priorities',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Product development',
        'Customer acquisition',
        'Fundraising',
        'Team building',
        'Market validation',
        'Partnership development',
        'Technology development',
        'Regulatory compliance',
        'International expansion',
        'Operational efficiency',
        'Marketing & branding',
        'Legal & IP protection'
      ],
      description: 'What are your main focus areas right now?'
    },
    {
      name: 'challenges',
      label: 'Current Challenges',
      type: 'multiselect' as const,
      options: [
        'Finding customers',
        'Product-market fit',
        'Raising capital',
        'Hiring talent',
        'Competition',
        'Technology challenges',
        'Marketing & visibility',
        'Scaling operations',
        'Cash flow management',
        'Regulatory hurdles',
        'Partnership development',
        'Work-life balance'
      ],
      description: 'What challenges are you currently facing?'
    },
    {
      name: 'supportNeeded',
      label: 'Support Needed from CBA',
      type: 'multiselect' as const,
      options: [
        'Mentorship',
        'Investor introductions',
        'Customer introductions',
        'Partnership opportunities',
        'Technical advice',
        'Business strategy guidance',
        'Marketing support',
        'Legal/regulatory advice',
        'Networking opportunities',
        'Speaking opportunities',
        'Office space/co-working',
        'Grant application support'
      ],
      description: 'How can the CBA community support your startup?'
    },
    {
      name: 'achievements',
      label: 'Key Achievements',
      type: 'textarea' as const,
      placeholder: 'Notable milestones, awards, partnerships, customer wins, etc.',
      description: 'What are your key achievements to date?'
    },
    {
      name: 'location',
      label: 'Company Location',
      type: 'text' as const,
      placeholder: 'Where is your company based?',
      description: 'Primary location of your business operations'
    },
    {
      name: 'websiteUrl',
      label: 'Website URL',
      type: 'text' as const,
      placeholder: 'https://yourcompany.com',
      description: 'Link to your company website'
    },
    {
      name: 'lookingForCoFounder',
      label: 'Looking for Co-founder',
      type: 'checkbox' as const,
      description: 'Are you actively seeking a co-founder?'
    },
    {
      name: 'openToPartnerships',
      label: 'Open to Partnerships',
      type: 'checkbox' as const,
      description: 'Interested in exploring strategic partnerships?'
    },
    {
      name: 'willingToMentor',
      label: 'Willing to Mentor Others',
      type: 'checkbox' as const,
      description: 'Would you be interested in mentoring other entrepreneurs?'
    },
    {
      name: 'canSpeak',
      label: 'Available for Speaking',
      type: 'checkbox' as const,
      description: 'Interested in speaking at CBA events about your journey?'
    }
  ];

  return (
    <RoleSection
      roleName="startup_founder"
      roleDisplayName="Startup Founder Profile"
      roleIcon="🚀"
      roleColor="bg-purple-100 text-purple-800"
      roleData={roleData}
      fields={fields}
      onSave={onSave}
      isSaving={isSaving}
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
}