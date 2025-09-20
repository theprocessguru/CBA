import { RoleSection } from '../RoleSection';

interface WorkshopProviderSectionProps {
  roleData: Record<string, any>;
  onSave: (roleName: string, data: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function WorkshopProviderSection({ 
  roleData, 
  onSave, 
  isSaving = false, 
  isOpen = false, 
  onToggle 
}: WorkshopProviderSectionProps) {
  const fields = [
    {
      name: 'trainingExperience',
      label: 'Years of Training/Workshop Experience',
      type: 'select' as const,
      required: true,
      options: [
        'New to workshop delivery',
        'Less than 1 year',
        '1-3 years',
        '4-7 years',
        '8-15 years',
        'More than 15 years'
      ],
      description: 'How long have you been delivering workshops or training?'
    },
    {
      name: 'workshopTopics',
      label: 'Workshop Topics & Specializations',
      type: 'multiselect' as const,
      required: true,
      options: [
        'AI & Machine Learning Fundamentals',
        'Digital Marketing & Social Media',
        'Business Development & Sales',
        'Financial Planning & Management',
        'Leadership & Team Building',
        'Project Management',
        'Data Analysis & Excel Skills',
        'Website & E-commerce Setup',
        'Cybersecurity Awareness',
        'Content Creation & Copywriting',
        'Customer Service Excellence',
        'Networking & Relationship Building',
        'Time Management & Productivity',
        'Public Speaking & Presentation Skills',
        'Negotiation & Communication',
        'Innovation & Creative Thinking',
        'Personal Branding',
        'Startup Fundamentals',
        'Legal Basics for Business',
        'Tax & Compliance Essentials',
        'Import/Export Procedures',
        'Grant Writing & Funding',
        'Mental Health & Wellbeing',
        'Diversity & Inclusion',
        'Sustainability in Business',
        'Other'
      ],
      description: 'Select all topics you can deliver workshops on'
    },
    {
      name: 'workshops',
      label: 'Available Workshops',
      type: 'textarea' as const,
      required: true,
      placeholder: 'List your workshop offerings (one per line with duration):\n\n• "AI for Small Business - Getting Started" (3 hours)\n• "Digital Marketing on a Budget" (Half day)\n• "Building Your Business Plan" (Full day)\n• "Excel Mastery for Business Owners" (2 hours)',
      description: 'List the specific workshops you offer with their typical duration'
    },
    {
      name: 'trainerBio',
      label: 'Trainer Biography',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Write a professional trainer biography highlighting your qualifications, experience, and teaching approach...',
      description: 'A bio that organizers can use to promote your workshops (100-300 words)'
    },
    {
      name: 'qualifications',
      label: 'Training Qualifications & Certifications',
      type: 'textarea' as const,
      placeholder: 'List your relevant qualifications:\n• Certified Professional Trainer (CPT)\n• MBA in Business Management\n• Google Analytics Certified\n• Microsoft Excel Expert',
      description: 'Professional qualifications, certifications, and credentials'
    },
    {
      name: 'workshopFormats',
      label: 'Workshop Delivery Formats',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Half-day workshops (3-4 hours)',
        'Full-day workshops (6-8 hours)',
        'Multi-day intensive courses',
        'Short seminars (1-2 hours)',
        'Online/virtual workshops',
        'Hybrid workshops',
        'One-on-one training',
        'Small group sessions (5-15 people)',
        'Large group workshops (15+ people)',
        'Hands-on practical sessions',
        'Theory + practical combination'
      ],
      description: 'What workshop formats can you deliver?'
    },
    {
      name: 'targetAudience',
      label: 'Target Audience',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Complete beginners',
        'Business owners/entrepreneurs',
        'Employees/staff training',
        'Students & graduates',
        'Professionals seeking upskilling',
        'Senior management/executives',
        'Startups & small businesses',
        'Established businesses',
        'Non-profit organizations',
        'Government/public sector',
        'Specific industries only'
      ],
      description: 'Who are your workshops designed for?'
    },
    {
      name: 'workshopStyle',
      label: 'Training Style & Approach',
      type: 'multiselect' as const,
      options: [
        'Interactive and engaging',
        'Hands-on practical activities',
        'Case study based',
        'Group discussions',
        'Individual exercises',
        'Real-world problem solving',
        'Step-by-step guidance',
        'Q&A focused',
        'Collaborative learning',
        'Technology-enhanced learning'
      ],
      description: 'How would you describe your training style?'
    },
    {
      name: 'groupSizePreference',
      label: 'Preferred Group Size',
      type: 'select' as const,
      required: true,
      options: [
        'Small groups (5-12 people)',
        'Medium groups (12-25 people)',
        'Large groups (25-50 people)',
        'Very large groups (50+ people)',
        'Flexible - any size',
        'One-on-one preferred'
      ],
      description: 'What group size works best for your workshops?'
    },
    {
      name: 'equipmentRequirements',
      label: 'Equipment & Setup Requirements',
      type: 'textarea' as const,
      placeholder: 'List what you need for your workshops:\n• Projector and screen\n• Flip chart and markers\n• Laptops/tablets for participants\n• Reliable WiFi\n• Tables for group work\n• Power outlets',
      description: 'Technical and room setup requirements for your workshops'
    },
    {
      name: 'materialsProvided',
      label: 'Materials & Resources Provided',
      type: 'textarea' as const,
      placeholder: 'What do you provide to participants:\n• Workbooks/handouts\n• Digital resources\n• Templates and tools\n• Follow-up materials\n• Certificate of completion',
      description: 'What materials, resources, or takeaways do participants receive?'
    },
    {
      name: 'pricingStructure',
      label: 'Pricing & Availability',
      type: 'select' as const,
      required: true,
      options: [
        'Available for paid workshops only',
        'Available for free community workshops',
        'Both paid and free workshops',
        'Member-exclusive workshops',
        'Corporate training rates',
        'Flexible - depends on audience',
        'Currently not available'
      ],
      description: 'What type of workshop opportunities are you open to?'
    },
    {
      name: 'onlineCapability',
      label: 'Online Workshop Capability',
      type: 'select' as const,
      required: true,
      options: [
        'In-person workshops only',
        'Online workshops only',
        'Both online and in-person',
        'Hybrid workshops preferred',
        'Flexible based on needs'
      ],
      description: 'Can you deliver workshops online as well as in-person?'
    },
    {
      name: 'followUpSupport',
      label: 'Follow-up Support Offered',
      type: 'multiselect' as const,
      options: [
        'Email support for 30 days',
        'Follow-up session included',
        'Access to private community',
        'Additional resources provided',
        'One-on-one consultations',
        'Progress check-ins',
        'Implementation support',
        'No follow-up support'
      ],
      description: 'What ongoing support do you offer after workshops?'
    },
    {
      name: 'portfolioUrl',
      label: 'Workshop Portfolio/Website',
      type: 'text' as const,
      placeholder: 'https://your-training-website.com',
      description: 'Link to your training portfolio or professional website'
    },
    {
      name: 'sampleWorkshops',
      label: 'Sample Workshop Materials/Videos',
      type: 'text' as const,
      placeholder: 'https://youtube.com/watch?v=sample-workshop',
      description: 'Link to sample workshop content or demo videos'
    },
    {
      name: 'clientTestimonials',
      label: 'Client Testimonials',
      type: 'textarea' as const,
      placeholder: 'Include testimonials from previous workshop participants:\n\n"The Excel workshop was exactly what our team needed. Clear, practical, and immediately applicable." - Business Manager, Tech Company',
      description: 'Feedback and testimonials from previous workshop participants'
    }
  ];

  return (
    <RoleSection
      roleName="workshop_provider"
      roleDisplayName="Workshop Provider"
      roleIcon="🎯"
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