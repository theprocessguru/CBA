// Utility functions for handling participant types and custom roles

export function getDisplayParticipantType(participantType: string, customRole?: string): string {
  if (participantType === 'other' && customRole) {
    return customRole;
  }
  if (participantType === 'special_guest') {
    return 'Special Guest';
  }
  return participantType.charAt(0).toUpperCase() + participantType.slice(1);
}

export function getParticipantTypeColor(participantType: string): string {
  const colors: Record<string, string> = {
    attendee: 'bg-blue-100 text-blue-800',
    exhibitor: 'bg-purple-100 text-purple-800',
    speaker: 'bg-green-100 text-green-800',
    volunteer: 'bg-amber-100 text-amber-800',
    team: 'bg-red-100 text-red-800',
    special_guest: 'bg-red-200 text-red-900',
    other: 'bg-gray-100 text-gray-800'
  };
  
  return colors[participantType] || 'bg-gray-100 text-gray-800';
}

export function isValidParticipantType(type: string): boolean {
  const validTypes = ['attendee', 'exhibitor', 'speaker', 'volunteer', 'team', 'special_guest', 'other'];
  return validTypes.includes(type);
}

export function getParticipantTypeIcon(participantType: string): string {
  const icons: Record<string, string> = {
    attendee: '👤',
    exhibitor: '🏢',
    speaker: '🎤',
    volunteer: '🤝',
    team: '👥',
    special_guest: '👑',
    other: '⭐'
  };
  
  return icons[participantType] || '👤';
}