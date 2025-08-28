// Access control utilities for participant types

export interface AccessControlConfig {
  restrictedTypes: string[];
  restrictedMessage?: string;
}

// Default restricted participant types
// Note: residents and students are treated as full members for training purposes  
// Updated to match database person types - using 'vip' instead of 'vip_guest'
export const RESTRICTED_PARTICIPANT_TYPES = [
  'volunteer', 
  'exhibitor',
  'speaker',
  'vip'
];

// Check if a user has restricted access based on participant type
export function hasRestrictedAccess(participantType?: string | null): boolean {
  if (!participantType) return false;
  return RESTRICTED_PARTICIPANT_TYPES.includes(participantType);
}

// Get user-friendly message for restricted access
export function getRestrictedAccessMessage(participantType?: string | null): string {
  if (!participantType) return "";
  
  const messages: Record<string, string> = {
    'volunteer': 'As a volunteer, your access is limited to event-related features and volunteer coordination tools.',
    'exhibitor': 'As an exhibitor, you have access to event features and exhibitor-specific tools.',
    'speaker': 'As a speaker, you have access to event schedules and speaker resources.',
    'vip': 'As a VIP guest, you have special event access privileges.'
  };
  
  return messages[participantType] || 'Your account type has limited access to certain features.';
}

// Get list of restricted features for a participant type
export function getRestrictedFeatures(participantType?: string | null): string[] {
  if (!participantType || !hasRestrictedAccess(participantType)) return [];
  
  // Common restrictions for all limited access types
  const commonRestrictions = [
    'Membership Management',
    'Business Directory Listing',
    'Special Offers Creation',
    'Product/Service Management',
    'Marketplace Access'
  ];
  
  // Type-specific additional restrictions
  const typeSpecificRestrictions: Record<string, string[]> = {
    'volunteer': [...commonRestrictions, 'Admin Features', 'Payment Processing'],
    'exhibitor': [...commonRestrictions, 'Admin Features'],
    'speaker': [...commonRestrictions, 'Admin Features', 'Exhibitor Management'],
    'vip': [...commonRestrictions, 'Admin Features', 'Content Management']
  };
  
  return typeSpecificRestrictions[participantType] || commonRestrictions;
}

// Check if a specific feature is accessible for a participant type
export function canAccessFeature(participantType: string | null | undefined, feature: string): boolean {
  if (!participantType || !hasRestrictedAccess(participantType)) {
    // Full access for regular members and admins
    return true;
  }
  
  const restrictedFeatures = getRestrictedFeatures(participantType);
  return !restrictedFeatures.includes(feature);
}