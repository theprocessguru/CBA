import { RoleSection } from '../RoleSection';

interface SpeakerSectionProps {
  roleData: Record<string, any>;
  onSave: (roleName: string, data: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function SpeakerSection({ 
  roleData, 
  onSave, 
  isSaving = false, 
  isOpen = false, 
  onToggle 
}: SpeakerSectionProps) {
  const fields = [
    {
      name: 'speakingExperience',
      label: 'Years of Speaking Experience',
      type: 'select' as const,
      required: true,
      options: [
        'New to speaking',
        'Less than 1 year',
        '1-3 years',
        '4-7 years',
        '8-15 years',
        'More than 15 years'
      ],
      description: 'How long have you been speaking at events?'
    },
    {
      name: 'expertise',
      label: 'Speaking Topics & Expertise',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Artificial Intelligence & Machine Learning',
        'Business Strategy & Planning',
        'Digital Transformation',
        'Entrepreneurship & Startups',
        'Leadership & Management',
        'Marketing & Sales',
        'Finance & Investment',
        'Technology & Innovation',
        'Data Science & Analytics',
        'Cybersecurity',
        'Cloud Computing',
        'Software Development',
        'Project Management',
        'Human Resources & Talent',
        'Operations & Process Improvement',
        'Customer Experience',
        'E-commerce & Digital Marketing',
        'Social Media & Content Marketing',
        'Sustainability & Green Business',
        'International Business',
        'Legal & Compliance',
        'Personal Development',
        'Diversity & Inclusion',
        'Crisis Management',
        'Innovation & Creativity',
        'Other'
      ],
      description: 'Select all topics you can speak about with expertise'
    },
    {
      name: 'talks',
      label: 'Signature Talks/Presentations',
      type: 'textarea' as const,
      required: true,
      placeholder: 'List your signature talks/presentations (one per line):\n\n• "AI Revolution: How Small Businesses Can Leverage Technology"\n• "From Startup to Scale-up: My Journey in FinTech"\n• "Digital Marketing Strategies That Actually Work"',
      description: 'List the specific talks, presentations, or workshops you offer'
    },
    {
      name: 'bio',
      label: 'Speaker Bio',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Write a compelling speaker biography highlighting your credentials, achievements, and expertise...',
      description: 'A professional bio that event organizers can use to introduce you (100-300 words)'
    },
    {
      name: 'previousEngagements',
      label: 'Previous Speaking Engagements',
      type: 'textarea' as const,
      placeholder: 'List notable conferences, events, or organizations where you have spoken...',
      description: 'Help build credibility by listing your speaking history'
    },
    {
      name: 'presentationFormats',
      label: 'Preferred Presentation Formats',
      type: 'multiselect' as const,
      required: true,
      options: [
        'Keynote presentations (30-60 minutes)',
        'Workshop sessions (1-3 hours)',
        'Panel discussions',
        'Fireside chats',
        'Lightning talks (5-15 minutes)',
        'Masterclasses (half/full day)',
        'Q&A sessions',
        'Interactive workshops',
        'Virtual presentations',
        'Hybrid events'
      ],
      description: 'What formats do you prefer for your presentations?'
    },
    {
      name: 'audienceSize',
      label: 'Comfortable Audience Size',
      type: 'multiselect' as const,
      options: [
        'Intimate groups (5-20 people)',
        'Small groups (20-50 people)',
        'Medium audiences (50-200 people)',
        'Large audiences (200-500 people)',
        'Very large audiences (500+ people)',
        'Virtual audiences (any size)'
      ],
      description: 'What audience sizes are you comfortable speaking to?'
    },
    {
      name: 'availabilityType',
      label: 'Speaking Availability',
      type: 'select' as const,
      required: true,
      options: [
        'Available for paid speaking engagements',
        'Available for free community events',
        'Both paid and free events',
        'Selective - case by case basis',
        'Currently not available'
      ],
      description: 'What type of speaking opportunities are you open to?'
    },
    {
      name: 'travelWillingness',
      label: 'Travel Preferences',
      type: 'select' as const,
      required: true,
      options: [
        'Local events only (Greater London)',
        'UK-wide travel',
        'European travel',
        'International travel',
        'Virtual events preferred',
        'Flexible - depends on opportunity'
      ],
      description: 'How far are you willing to travel for speaking engagements?'
    },
    {
      name: 'speakerRequirements',
      label: 'Technical/Equipment Requirements',
      type: 'textarea' as const,
      placeholder: 'List any specific requirements:\n• Wireless microphone\n• Projector/screen\n• Flip chart\n• Internet access\n• Specific room setup',
      description: 'Any technical or setup requirements for your presentations'
    },
    {
      name: 'websiteUrl',
      label: 'Speaker Website/Portfolio',
      type: 'text' as const,
      placeholder: 'https://your-speaker-website.com',
      description: 'Link to your speaker page, portfolio, or personal website'
    },
    {
      name: 'linkedinUrl',
      label: 'LinkedIn Profile',
      type: 'text' as const,
      placeholder: 'https://linkedin.com/in/yourprofile',
      description: 'Your LinkedIn profile for professional verification'
    },
    {
      name: 'speakerReel',
      label: 'Speaker Demo Reel/Video',
      type: 'text' as const,
      placeholder: 'https://youtube.com/watch?v=your-speaker-demo',
      description: 'Link to a video showcasing your speaking style (YouTube, Vimeo, etc.)'
    },
    {
      name: 'testimonials',
      label: 'Speaker Testimonials',
      type: 'textarea' as const,
      placeholder: 'Include testimonials from previous events:\n\n"John delivered an outstanding presentation on AI that was both informative and engaging." - Event Organizer, Tech Summit 2024',
      description: 'Testimonials or feedback from previous speaking engagements'
    },
    {
      name: 'specialRequirements',
      label: 'Accessibility/Special Requirements',
      type: 'textarea' as const,
      placeholder: 'Any accessibility requirements or special accommodations needed...',
      description: 'Let us know about any requirements we should consider for your comfort'
    }
  ];

  return (
    <RoleSection
      roleName="speaker"
      roleDisplayName="Speaker Profile"
      roleIcon="🎤"
      roleColor="bg-red-100 text-red-800"
      roleData={roleData}
      fields={fields}
      onSave={onSave}
      isSaving={isSaving}
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
}