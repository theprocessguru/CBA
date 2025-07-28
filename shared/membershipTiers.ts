export interface MembershipTierConfig {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  color: string;
  features: string[];
  limits: {
    businessListings: number;
    productListings: number;
    offerListings: number;
    imageUploads: number;
    directoryPriority: number; // 1-5, higher = better placement
  };
  benefits: {
    eventDiscounts: boolean;
    networkingEvents: boolean;
    consultationAccess: boolean;
    marketingSupport: boolean;
    featuredListings: boolean;
    prioritySupport: boolean;
    analyticsAccess: boolean;
  };
}

export const MEMBERSHIP_TIER_CONFIGS: Record<string, MembershipTierConfig> = {
  "Starter Tier": {
    id: "starter",
    name: "Starter Tier",
    description: "Perfect for new businesses getting started in the community",
    monthlyPrice: 0,
    annualPrice: 0,
    color: "bg-blue-500",
    features: [
      "Basic directory listing",
      "Access to member directory", 
      "Email newsletters",
      "Community forum access"
    ],
    limits: {
      businessListings: 1,
      productListings: 5,
      offerListings: 2,
      imageUploads: 3,
      directoryPriority: 1
    },
    benefits: {
      eventDiscounts: false,
      networkingEvents: false,
      consultationAccess: false,
      marketingSupport: false,
      featuredListings: false,
      prioritySupport: false,
      analyticsAccess: false
    }
  },
  "Growth Tier": {
    id: "growth", 
    name: "Growth Tier",
    description: "Enhanced features for growing businesses",
    monthlyPrice: 29.99,
    annualPrice: 299.99,
    color: "bg-green-500",
    features: [
      "Enhanced directory listing",
      "Business profile with images",
      "Event discounts",
      "Basic networking events",
      "Monthly business tips"
    ],
    limits: {
      businessListings: 1,
      productListings: 15,
      offerListings: 5,
      imageUploads: 10,
      directoryPriority: 2
    },
    benefits: {
      eventDiscounts: true,
      networkingEvents: true,
      consultationAccess: false,
      marketingSupport: false,
      featuredListings: false,
      prioritySupport: false,
      analyticsAccess: true
    }
  },
  "Strategic Tier": {
    id: "strategic",
    name: "Strategic Tier", 
    description: "Premium features for established businesses",
    monthlyPrice: 59.99,
    annualPrice: 599.99,
    color: "bg-purple-500",
    features: [
      "Premium directory placement",
      "Multiple business images",
      "Priority event booking",
      "Quarterly networking sessions",
      "Business consultation access",
      "Marketing support"
    ],
    limits: {
      businessListings: 2,
      productListings: 30,
      offerListings: 10,
      imageUploads: 25,
      directoryPriority: 3
    },
    benefits: {
      eventDiscounts: true,
      networkingEvents: true,
      consultationAccess: true,
      marketingSupport: true,
      featuredListings: false,
      prioritySupport: true,
      analyticsAccess: true
    }
  },
  "Patron Tier": {
    id: "patron",
    name: "Patron Tier",
    description: "Exclusive access and premium benefits",
    monthlyPrice: 99.99,
    annualPrice: 999.99,
    color: "bg-orange-500",
    features: [
      "Featured directory listings",
      "Event hosting opportunities",
      "Speaking opportunities", 
      "Exclusive patron events",
      "Business mentoring access",
      "PR and media support"
    ],
    limits: {
      businessListings: 3,
      productListings: 50,
      offerListings: 20,
      imageUploads: 50,
      directoryPriority: 4
    },
    benefits: {
      eventDiscounts: true,
      networkingEvents: true,
      consultationAccess: true,
      marketingSupport: true,
      featuredListings: true,
      prioritySupport: true,
      analyticsAccess: true
    }
  },
  "Partner": {
    id: "partner",
    name: "Partner",
    description: "Strategic partnership with full benefits",
    monthlyPrice: 199.99,
    annualPrice: 1999.99,
    color: "bg-amber-500",
    features: [
      "Top-tier directory prominence",
      "Co-branded event opportunities",
      "Board meeting participation",
      "Strategic planning input",
      "Executive networking access",
      "Full marketing partnership"
    ],
    limits: {
      businessListings: 5,
      productListings: 100,
      offerListings: 50,
      imageUploads: 100,
      directoryPriority: 5
    },
    benefits: {
      eventDiscounts: true,
      networkingEvents: true,
      consultationAccess: true,
      marketingSupport: true,
      featuredListings: true,
      prioritySupport: true,
      analyticsAccess: true
    }
  }
};

export function getMembershipTierConfig(tierName: string): MembershipTierConfig | null {
  return MEMBERSHIP_TIER_CONFIGS[tierName] || null;
}

export function getTierPriority(tierName: string): number {
  const config = getMembershipTierConfig(tierName);
  return config?.limits.directoryPriority || 1;
}

export function canAccessFeature(tierName: string, feature: keyof MembershipTierConfig['benefits']): boolean {
  const config = getMembershipTierConfig(tierName);
  return config?.benefits[feature] || false;
}

export function getTierLimits(tierName: string) {
  const config = getMembershipTierConfig(tierName);
  return config?.limits || MEMBERSHIP_TIER_CONFIGS["Starter Tier"].limits;
}