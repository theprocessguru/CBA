import {
  LayoutDashboard,
  Building,
  Package,
  Tag,
  Users,
  Calendar,
  QrCode,
  Heart,
  DollarSign,
  Upload,
  GraduationCap,
  HandHeart,
  MapPin,
  Home,
  Briefcase,
  Star,
  FileText,
  MessageSquare,
  UserCheck,
  Zap,
  BookOpen,
  Award,
  Target,
  Settings
} from "lucide-react";

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  description?: string;
  requiresMembership?: string[];
  excludeForRoles?: string[];
}

export interface RoleConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  sidebarItems: SidebarItem[];
  profileSections?: string[];
}

// Base sidebar items available to all users
export const BASE_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your activity and quick actions"
  },
  {
    id: "member-directory",
    label: "Member Directory",
    href: "/dashboard/member-directory",
    icon: Users,
    description: "Connect with other members"
  },
  {
    id: "personal-badge",
    label: "My Personal Badge",
    href: "/my-personal-badge",
    icon: QrCode,
    description: "Generate QR codes for events"
  },
  {
    id: "events-badges",
    label: "My Events & Badges",
    href: "/my-qr-code",
    icon: Calendar,
    description: "View your event registrations and badges"
  }
];

// Role configurations for different user types
export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  // Business Owner segment roles
  business_owner: {
    id: "business_owner",
    name: "business_owner",
    displayName: "Business Owner",
    description: "Business management and growth tools",
    sidebarItems: [
      ...BASE_SIDEBAR_ITEMS,
      {
        id: "business-profile",
        label: "Business Profile",
        href: "/dashboard/business-profile",
        icon: Building,
        description: "Manage your business information"
      },
      {
        id: "products-services",
        label: "Products & Services",
        href: "/dashboard/products-services",
        icon: Package,
        description: "Showcase your offerings"
      },
      {
        id: "special-offers",
        label: "Special Offers",
        href: "/dashboard/special-offers",
        icon: Tag,
        description: "Create and manage promotional offers"
      },
      {
        id: "affiliate-programme",
        label: "Affiliate Programme",
        href: "/dashboard/affiliate",
        icon: DollarSign,
        description: "Earn through referrals"
      }
    ]
  },
  
  // Resident segment roles
  educator: {
    id: "educator",
    name: "educator",
    displayName: "Educator",
    description: "Teaching and training resources",
    sidebarItems: [
      ...BASE_SIDEBAR_ITEMS,
      {
        id: "my-courses",
        label: "My Courses",
        href: "/educator/courses",
        icon: BookOpen,
        description: "Manage your teaching content"
      },
      {
        id: "student-progress",
        label: "Student Progress",
        href: "/educator/students",
        icon: GraduationCap,
        description: "Track student achievements"
      },
      {
        id: "resources",
        label: "Teaching Resources",
        href: "/educator/resources",
        icon: FileText,
        description: "Access educational materials"
      }
    ]
  },
  
  volunteer: {
    id: "volunteer",
    name: "volunteer",
    displayName: "Volunteer",
    description: "Community service and event support",
    sidebarItems: [
      ...BASE_SIDEBAR_ITEMS,
      {
        id: "volunteer-events",
        label: "Volunteer Events",
        href: "/volunteer/events",
        icon: Calendar,
        description: "Find volunteer opportunities"
      },
      {
        id: "scanner",
        label: "Event Scanner",
        href: "/scanner",
        icon: QrCode,
        description: "Scan attendee badges"
      },
      {
        id: "volunteer-hours",
        label: "My Volunteer Hours",
        href: "/volunteer/hours",
        icon: HandHeart,
        description: "Track your contribution"
      }
    ]
  },
  
  student: {
    id: "student",
    name: "student",
    displayName: "Student",
    description: "Learning and development opportunities",
    sidebarItems: [
      ...BASE_SIDEBAR_ITEMS,
      {
        id: "my-learning",
        label: "My Learning",
        href: "/student/courses",
        icon: GraduationCap,
        description: "Access your enrolled courses"
      },
      {
        id: "achievements",
        label: "Achievements",
        href: "/student/achievements",
        icon: Award,
        description: "View your progress and certificates"
      },
      {
        id: "jobs-board",
        label: "Jobs Board",
        href: "/jobs",
        icon: Briefcase,
        description: "Find career opportunities"
      }
    ]
  },
  
  startup_founder: {
    id: "startup_founder",
    name: "startup_founder",
    displayName: "Startup Founder",
    description: "Entrepreneurship and innovation support",
    sidebarItems: [
      ...BASE_SIDEBAR_ITEMS,
      {
        id: "startup-toolkit",
        label: "Startup Toolkit",
        href: "/startup/toolkit",
        icon: Zap,
        description: "Access startup resources"
      },
      {
        id: "pitch-practice",
        label: "Pitch Practice",
        href: "/startup/pitch",
        icon: MessageSquare,
        description: "Prepare your investor pitch"
      },
      {
        id: "funding-opportunities",
        label: "Funding Opportunities",
        href: "/startup/funding",
        icon: Target,
        description: "Find investment opportunities"
      }
    ]
  },
  
  job_seeker: {
    id: "job_seeker",
    name: "job_seeker",
    displayName: "Job Seeker",
    description: "Career development and opportunities",
    sidebarItems: [
      ...BASE_SIDEBAR_ITEMS,
      {
        id: "jobs-board",
        label: "Jobs Board",
        href: "/jobs",
        icon: Briefcase,
        description: "Browse job opportunities"
      },
      {
        id: "my-applications",
        label: "My Applications",
        href: "/my-applications",
        icon: FileText,
        description: "Track job applications"
      },
      {
        id: "career-resources",
        label: "Career Resources",
        href: "/career/resources",
        icon: BookOpen,
        description: "CV tips and interview prep"
      }
    ]
  },
  
  resident: {
    id: "resident",
    name: "resident",
    displayName: "Local Resident",
    description: "Community engagement and local services",
    sidebarItems: [
      ...BASE_SIDEBAR_ITEMS,
      {
        id: "local-events",
        label: "Local Events",
        href: "/resident/events",
        icon: Calendar,
        description: "Community events and activities"
      },
      {
        id: "local-services",
        label: "Local Services",
        href: "/resident/services",
        icon: MapPin,
        description: "Find local businesses and services"
      }
    ]
  }
};

// Admin role configuration
export const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "admin-dashboard",
    label: "Admin Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Administrative overview"
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: Star,
    description: "Business intelligence and reporting"
  },
  {
    id: "membership-management",
    label: "Membership Management",
    href: "/dashboard/membership-management",
    icon: UserCheck,
    description: "Manage member accounts and tiers"
  },
  {
    id: "user-management",
    label: "User Management",
    href: "/dashboard/user-management",
    icon: Users,
    description: "User accounts and permissions"
  },
  {
    id: "data-import",
    label: "Data Import",
    href: "/data-import",
    icon: Upload,
    description: "Import member and business data"
  },
  {
    id: "event-management",
    label: "Event Management",
    href: "/dashboard/event-management",
    icon: Calendar,
    description: "Organize and manage events"
  },
  {
    id: "content-reports",
    label: "Content Reports",
    href: "/dashboard/content-reports",
    icon: FileText,
    description: "Review flagged content"
  },
  {
    id: "mood-dashboard",
    label: "Event Mood Dashboard",
    href: "/mood-dashboard",
    icon: Heart,
    description: "Monitor event sentiment"
  },
  {
    id: "affiliate-management",
    label: "Affiliate Management",
    href: "/admin/affiliates",
    icon: DollarSign,
    description: "Manage affiliate programmes"
  }
];

// Helper function to get sidebar items for a user
export function getSidebarItemsForUser(user: any): SidebarItem[] {
  if (user?.isAdmin) {
    return ADMIN_SIDEBAR_ITEMS;
  }

  const items: SidebarItem[] = [...BASE_SIDEBAR_ITEMS];
  
  // Add member segment specific items
  if (user?.memberSegment === 'business_owner') {
    const businessItems = ROLE_CONFIGS.business_owner.sidebarItems.filter(
      item => !BASE_SIDEBAR_ITEMS.find(base => base.id === item.id)
    );
    items.push(...businessItems);
  }
  
  // Add role-specific items based on personTypes
  if (user?.personTypes && Array.isArray(user.personTypes)) {
    for (const personType of user.personTypes) {
      const roleConfig = ROLE_CONFIGS[personType.name];
      if (roleConfig) {
        const roleItems = roleConfig.sidebarItems.filter(
          item => !items.find(existing => existing.id === item.id)
        );
        items.push(...roleItems);
      }
    }
  }
  
  return items;
}

// Helper function to get dashboard title for a user
export function getDashboardTitle(user: any): string {
  if (user?.isAdmin) {
    return 'Admin Dashboard';
  }
  
  if (user?.memberSegment === 'business_owner') {
    return 'My Business Dashboard';
  }
  
  if (user?.personTypes && user.personTypes.length > 0) {
    const primaryRole = user.personTypes[0];
    const roleConfig = ROLE_CONFIGS[primaryRole.name];
    if (roleConfig) {
      return `${roleConfig.displayName} Portal`;
    }
  }
  
  return 'My Dashboard';
}