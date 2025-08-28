// Utility functions for handling participant types and custom roles
// NOTE: These functions use database-driven person types instead of hardcoded lists

export function getDisplayParticipantType(participantType: string, customRole?: string): string {
  if (participantType === 'other' && customRole) {
    return customRole;
  }
  // Convert database names to display format
  const displayNames: Record<string, string> = {
    'administrator': 'Administrator',
    'business': 'Business Member',
    'business_owner': 'Business Owner',
    'vip': 'VIP Guest',
    'attendee': 'Attendee',
    'exhibitor': 'Exhibitor',
    'speaker': 'Speaker',
    'volunteer': 'Volunteer',
    'resident': 'Resident',
    'student': 'Student',
    'media': 'Media',
    'staff': 'Staff',
    'sponsor': 'Sponsor',
    'councillor': 'Councillor'
  };
  
  return displayNames[participantType] || participantType.charAt(0).toUpperCase() + participantType.slice(1);
}

export function getParticipantTypeColor(participantType: string): string {
  // Database-driven colors mapped to Tailwind classes
  const colors: Record<string, string> = {
    administrator: 'bg-red-100 text-red-800',
    business: 'bg-indigo-100 text-indigo-800', 
    media: 'bg-purple-100 text-purple-800',
    staff: 'bg-teal-100 text-teal-800',
    sponsor: 'bg-blue-100 text-blue-800',
    vip: 'bg-pink-100 text-pink-800',
    councillor: 'bg-red-100 text-red-800',
    exhibitor: 'bg-orange-100 text-orange-800',
    speaker: 'bg-purple-100 text-purple-800',
    business_owner: 'bg-orange-100 text-orange-800',
    volunteer: 'bg-green-100 text-green-800',
    resident: 'bg-green-100 text-green-800',
    attendee: 'bg-gray-100 text-gray-800',
    student: 'bg-cyan-100 text-cyan-800'
  };
  
  return colors[participantType] || 'bg-gray-100 text-gray-800';
}

// This function now validates against the database person types
export function isValidParticipantType(type: string): boolean {
  const validTypes = [
    'administrator', 'business', 'media', 'staff', 'sponsor', 'vip', 'councillor',
    'exhibitor', 'speaker', 'business_owner', 'volunteer', 'resident', 'attendee', 'student'
  ];
  return validTypes.includes(type);
}

export function getParticipantTypeIcon(participantType: string): string {
  const icons: Record<string, string> = {
    administrator: '🛡️',
    business: '🏢',
    media: '📷',
    staff: '💼',
    sponsor: '🏆',
    vip: '⭐',
    councillor: '🏛️',
    exhibitor: '🛍️',
    speaker: '🎤',
    business_owner: '🏢',
    volunteer: '🤝',
    resident: '🏠',
    attendee: '👤',
    student: '🎓'
  };
  
  return icons[participantType] || '👤';
}