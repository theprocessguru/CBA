import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface PersonType {
  id: number;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  priority: number;
  isActive: boolean;
}

interface UserPersonType {
  id: number;
  userId: string;
  personTypeId: number;
  isPrimary: boolean;
  assignedAt: string;
  assignedBy: string;
  notes?: string;
}

export function usePersonTypes() {
  const { user, isAuthenticated } = useAuth();

  // Fetch all available person types
  const { data: allPersonTypes = [], isLoading: typesLoading } = useQuery<PersonType[]>({
    queryKey: ['/api/person-types'],
  });

  // Fetch user's current person types
  const { data: userPersonTypes = [], isLoading: userTypesLoading } = useQuery<UserPersonType[]>({
    queryKey: [`/api/users/${user?.id}/person-types`],
    enabled: !!user?.id && isAuthenticated,
  });

  // Derive user's assigned person type names
  const assignedTypeNames = userPersonTypes
    .map(upt => {
      const personType = allPersonTypes.find(pt => pt.id === upt.personTypeId);
      return personType?.name;
    })
    .filter(Boolean) as string[];

  const assignedTypeIds = userPersonTypes.map(upt => upt.personTypeId);

  // Check specific person type assignments
  const hasBusinessType = assignedTypeNames.includes('business') || assignedTypeNames.includes('attendee');
  const hasVolunteerType = assignedTypeNames.includes('volunteer');
  const hasResidentType = assignedTypeNames.includes('resident');
  const hasStudentType = assignedTypeNames.includes('student');
  const hasVipType = assignedTypeNames.includes('vip');
  const hasSpeakerType = assignedTypeNames.includes('speaker');
  const hasExhibitorType = assignedTypeNames.includes('exhibitor');
  const hasTeamType = assignedTypeNames.includes('team');

  // Get primary person type
  const primaryPersonType = userPersonTypes.find(upt => upt.isPrimary);
  const primaryType = primaryPersonType 
    ? allPersonTypes.find(pt => pt.id === primaryPersonType.personTypeId)
    : null;

  return {
    allPersonTypes,
    userPersonTypes,
    assignedTypeNames,
    assignedTypeIds,
    hasBusinessType,
    hasVolunteerType,
    hasResidentType,
    hasStudentType,
    hasVipType,
    hasSpeakerType,
    hasExhibitorType,
    hasTeamType,
    primaryType,
    isLoading: typesLoading || userTypesLoading,
  };
}