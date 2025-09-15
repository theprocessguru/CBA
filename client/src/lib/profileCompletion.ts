import { ROLE_METADATA } from '@/components/profile/roles';

// Profile completion weights - should total 100%
export const COMPLETION_WEIGHTS = {
  BASIC_PROFILE: 30,
  MEMBER_SEGMENT: 20,
  PERSON_TYPES: 15,
  ROLE_DATA: 25,
  ORGANIZATIONS: 10
} as const;

// Completion milestones with incentive messaging
export const COMPLETION_MILESTONES = {
  25: {
    title: "Great Start!",
    message: "You're building a strong foundation.",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  50: {
    title: "Halfway There!",
    message: "Your profile is taking shape nicely.",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  75: {
    title: "Almost Complete!",
    message: "You're so close to a standout profile.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  },
  90: {
    title: "Outstanding Profile!",
    message: "Your profile looks fantastic and professional.",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  100: {
    title: "Perfect Profile!",
    message: "Your complete profile maximizes networking opportunities.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100"
  }
} as const;

export interface ProfileSection {
  id: string;
  name: string;
  description: string;
  weight: number;
  completed: number;
  total: number;
  percentage: number;
  nextSteps: string[];
  isComplete: boolean;
}

export interface ProfileCompletionResult {
  overall: {
    percentage: number;
    completed: number;
    total: number;
    milestone: typeof COMPLETION_MILESTONES[keyof typeof COMPLETION_MILESTONES];
  };
  sections: ProfileSection[];
  nextRecommendedActions: string[];
  completionBenefits: string[];
}

// Helper function to calculate field completion
function calculateFieldCompletion(data: any, fields: string[]): { completed: number; total: number } {
  let completed = 0;
  const total = fields.length;
  
  fields.forEach(field => {
    const value = data?.[field];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) completed++;
      } else {
        completed++;
      }
    }
  });
  
  return { completed, total };
}

// Calculate basic profile completion
function calculateBasicProfileCompletion(userData: any): ProfileSection {
  const basicFields = ['firstName', 'lastName', 'email', 'phone', 'bio'];
  const { completed, total } = calculateFieldCompletion(userData, basicFields);
  
  const nextSteps: string[] = [];
  if (!userData?.firstName || !userData?.lastName) nextSteps.push("Add your full name");
  if (!userData?.phone) nextSteps.push("Add your phone number");
  if (!userData?.bio) nextSteps.push("Write a professional bio");
  
  return {
    id: 'basic',
    name: 'Basic Information',
    description: 'Essential profile details',
    weight: COMPLETION_WEIGHTS.BASIC_PROFILE,
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    nextSteps,
    isComplete: completed === total
  };
}

// Calculate member segment completion
function calculateMemberSegmentCompletion(userData: any): ProfileSection {
  let fields: string[] = ['memberSegment'];
  let nextSteps: string[] = [];
  
  if (userData?.memberSegment === 'resident') {
    fields.push('homeAddress', 'homeCity', 'homePostcode', 'homeCountry');
    if (!userData?.homeAddress) nextSteps.push("Add your home address");
    if (!userData?.homeCity) nextSteps.push("Add your city");
    if (!userData?.homePostcode) nextSteps.push("Add your postcode");
  } else if (userData?.memberSegment === 'business_owner') {
    fields.push('company', 'jobTitle');
    if (!userData?.company) nextSteps.push("Add your company name");
    if (!userData?.jobTitle) nextSteps.push("Add your job title");
  } else {
    nextSteps.push("Select your member type (Resident or Business Owner)");
  }
  
  const { completed, total } = calculateFieldCompletion(userData, fields);
  
  return {
    id: 'segment',
    name: 'Member Type & Details',
    description: 'Your role in the community',
    weight: COMPLETION_WEIGHTS.MEMBER_SEGMENT,
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    nextSteps,
    isComplete: completed === total
  };
}

// Calculate person types completion
function calculatePersonTypesCompletion(userData: any): ProfileSection {
  const hasPersonTypes = userData?.personTypes && userData.personTypes.length > 0;
  const completed = hasPersonTypes ? 1 : 0;
  const total = 1;
  
  const nextSteps: string[] = [];
  if (!hasPersonTypes) {
    nextSteps.push("Select your roles (educator, volunteer, student, etc.)");
  }
  
  return {
    id: 'person-types',
    name: 'Your Roles',
    description: 'Professional and community roles',
    weight: COMPLETION_WEIGHTS.PERSON_TYPES,
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    nextSteps,
    isComplete: completed === total
  };
}

// Calculate role-specific data completion
function calculateRoleDataCompletion(userData: any): ProfileSection {
  if (!userData?.personTypes || userData.personTypes.length === 0) {
    return {
      id: 'role-data',
      name: 'Role Details',
      description: 'Specific information for your roles',
      weight: COMPLETION_WEIGHTS.ROLE_DATA,
      completed: 0,
      total: 0,
      percentage: 0,
      nextSteps: ["Select your roles first to unlock role-specific sections"],
      isComplete: false
    };
  }
  
  let totalCompleted = 0;
  let totalFields = 0;
  const nextSteps: string[] = [];
  
  // Get role names that have corresponding ROLE_METADATA
  const roleNames = userData.personTypes
    .filter((pt: any) => pt?.name && ROLE_METADATA[pt.name as keyof typeof ROLE_METADATA])
    .map((pt: any) => pt.name);
  
  roleNames.forEach((roleName: string) => {
    const roleData = userData.rolesData?.[roleName] || {};
    const metadata = ROLE_METADATA[roleName as keyof typeof ROLE_METADATA];
    
    // For now, we'll estimate role completion based on common fields
    // In the future, this could be enhanced with actual field definitions from role components
    const estimatedFields = ['experience', 'skills', 'availability', 'currentRole', 'qualifications'];
    const { completed, total } = calculateFieldCompletion(roleData, estimatedFields);
    
    totalCompleted += completed;
    totalFields += total;
    
    if (completed < total) {
      nextSteps.push(`Complete your ${metadata.displayName.toLowerCase()} details`);
    }
  });
  
  // If no role data exists but roles are assigned
  if (totalFields === 0 && roleNames.length > 0) {
    totalFields = roleNames.length * 3; // Assume 3 key fields per role minimum
    nextSteps.push("Fill out details for your assigned roles");
  }
  
  const percentage = totalFields > 0 ? Math.round((totalCompleted / totalFields) * 100) : 0;
  
  return {
    id: 'role-data',
    name: 'Role Details',
    description: 'Specific information for your roles',
    weight: COMPLETION_WEIGHTS.ROLE_DATA,
    completed: totalCompleted,
    total: totalFields,
    percentage,
    nextSteps,
    isComplete: totalCompleted === totalFields && totalFields > 0
  };
}

// Calculate organization membership completion
function calculateOrganizationCompletion(userData: any): ProfileSection {
  const hasOrganizations = userData?.organizationMemberships && userData.organizationMemberships.length > 0;
  const completed = hasOrganizations ? 1 : 0;
  const total = 1;
  
  const nextSteps: string[] = [];
  if (!hasOrganizations) {
    nextSteps.push("Join relevant organizations and professional networks");
  }
  
  return {
    id: 'organizations',
    name: 'Organizations',
    description: 'Professional and community memberships',
    weight: COMPLETION_WEIGHTS.ORGANIZATIONS,
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    nextSteps,
    isComplete: completed === total
  };
}

// Get milestone information based on completion percentage
function getCompletionMilestone(percentage: number) {
  if (percentage >= 100) return COMPLETION_MILESTONES[100];
  if (percentage >= 90) return COMPLETION_MILESTONES[90];
  if (percentage >= 75) return COMPLETION_MILESTONES[75];
  if (percentage >= 50) return COMPLETION_MILESTONES[50];
  if (percentage >= 25) return COMPLETION_MILESTONES[25];
  
  return {
    title: "Let's Get Started!",
    message: "Complete your profile to unlock networking opportunities.",
    color: "text-gray-600",
    bgColor: "bg-gray-100"
  };
}

// Generate completion benefits based on current state
function getCompletionBenefits(percentage: number): string[] {
  const benefits = [
    "Increase your visibility in member searches",
    "Get personalized event recommendations",
    "Connect with like-minded professionals",
    "Access exclusive networking opportunities"
  ];
  
  if (percentage >= 75) {
    benefits.push("Qualify for leadership opportunities");
    benefits.push("Get priority access to premium events");
  }
  
  if (percentage >= 90) {
    benefits.push("Become a featured member");
    benefits.push("Get invited to exclusive roundtables");
  }
  
  return benefits;
}

// Main profile completion calculation function
export function calculateProfileCompletion(userData: any): ProfileCompletionResult {
  if (!userData) {
    return {
      overall: {
        percentage: 0,
        completed: 0,
        total: 0,
        milestone: getCompletionMilestone(0)
      },
      sections: [],
      nextRecommendedActions: ["Complete your profile to get started"],
      completionBenefits: getCompletionBenefits(0)
    };
  }
  
  const sections = [
    calculateBasicProfileCompletion(userData),
    calculateMemberSegmentCompletion(userData),
    calculatePersonTypesCompletion(userData),
    calculateRoleDataCompletion(userData),
    calculateOrganizationCompletion(userData)
  ];
  
  // Calculate weighted overall completion
  let weightedCompletion = 0;
  let totalWeight = 0;
  let totalCompleted = 0;
  let totalPossible = 0;
  
  sections.forEach(section => {
    if (section.total > 0) {
      weightedCompletion += (section.percentage / 100) * section.weight;
      totalWeight += section.weight;
    }
    totalCompleted += section.completed;
    totalPossible += section.total;
  });
  
  const overallPercentage = totalWeight > 0 ? Math.round(weightedCompletion) : 0;
  
  // Get next recommended actions from incomplete sections
  const nextRecommendedActions = sections
    .filter(section => !section.isComplete && section.nextSteps.length > 0)
    .sort((a, b) => b.weight - a.weight) // Sort by importance
    .slice(0, 3) // Take top 3
    .flatMap(section => section.nextSteps.slice(0, 2)); // Max 2 steps per section
  
  return {
    overall: {
      percentage: overallPercentage,
      completed: totalCompleted,
      total: totalPossible,
      milestone: getCompletionMilestone(overallPercentage)
    },
    sections,
    nextRecommendedActions,
    completionBenefits: getCompletionBenefits(overallPercentage)
  };
}

// Helper function to get section-specific completion
export function getSectionCompletion(userData: any, sectionId: string): ProfileSection | null {
  const result = calculateProfileCompletion(userData);
  return result.sections.find(section => section.id === sectionId) || null;
}

// Helper function to check if profile meets minimum completion threshold
export function meetsMinimumCompletion(userData: any, threshold: number = 50): boolean {
  const result = calculateProfileCompletion(userData);
  return result.overall.percentage >= threshold;
}