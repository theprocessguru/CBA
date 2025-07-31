export interface AIServiceAddon {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  availableForTiers: string[]; // Which membership tiers can purchase this
}

export interface MembershipTierConfig {
  id: string;
  name: string;
  description: string;
  targetAudience: string; // Who this tier is designed for
  businessExamples: string[]; // Examples of business types
  monthlyPrice: number;
  annualPrice: number;
  color: string;
  badge: string; // Badge icon identifier
  popularBadge?: boolean;
  features: string[];
  limits: {
    businessListings: number;
    productListings: number;
    offerListings: number;
    imageUploads: number;
    directoryPriority: number; // 1-5, higher = better placement
    eventBookingsPerMonth: number;
    referralsPerMonth: number;
    newsletterSubscribers: number;
    socialMediaPosts: number;
  };
  benefits: {
    // MyT Accounting Software Benefits
    mytAccountingDiscount: number; // Percentage discount (0-100)
    mytAccountingSupport: boolean;
    mytAccountingTraining: boolean;
    mytAccountingMultiUser: boolean;
    mytAccountingAdvancedFeatures: boolean;
    mytAccountingPrioritySupport: boolean;
    
    // MyT AI Services Benefits  
    mytAiBasicAccess: boolean;
    mytAiAdvancedTools: boolean;
    mytAiCustomSolutions: boolean;
    mytAiConsultation: boolean;
    mytAiTraining: boolean;
    mytAiPrioritySupport: boolean;
    mytAiApiAccess: boolean;
    mytAiModelTraining: boolean;
    
    // MyT Automation Services Benefits
    mytAutomationBasic: boolean;
    mytAutomationAdvanced: boolean;
    mytAutomationCustom: boolean;
    mytAutomationConsultation: boolean;
    mytAutomationImplementation: boolean;
    mytAutomationSupport: boolean;
    mytAutomationTraining: boolean;
    mytAutomationMonitoring: boolean;
    
    // General Member Benefits
    memberDirectory: boolean;
    networkingEvents: boolean;
    prioritySupport: boolean;
    monthlyNewsletter: boolean;
    businessReferrals: boolean;
  };
}

// AI Service Add-on Packages (Additional costs on top of membership tiers)
export const AI_SERVICE_ADDONS: Record<string, AIServiceAddon> = {
  "ai-essentials": {
    id: "ai-essentials",
    name: "AI Essentials",
    description: "Basic AI tools for content generation and business automation",
    monthlyPrice: 49.99,
    annualPrice: 499.99,
    availableForTiers: ["starter", "growth", "strategic", "patron", "partner"],
    features: [
      "AI Content Generation (10,000 words/month)",
      "Basic Document Processing",  
      "Email Template AI",
      "Social Media Post Generator",
      "Basic Analytics AI",
      "Standard Support"
    ]
  },
  "ai-professional": {
    id: "ai-professional", 
    name: "AI Professional",
    description: "Advanced AI capabilities for growing businesses",
    monthlyPrice: 149.99,
    annualPrice: 1499.99,
    availableForTiers: ["growth", "strategic", "patron", "partner"],
    features: [
      "Everything in AI Essentials",
      "AI Content Generation (50,000 words/month)",
      "Advanced Document Analysis & OCR",
      "Customer Service AI Chatbot",
      "Predictive Analytics",
      "Market Research AI",
      "Workflow Automation AI",
      "Priority Support"
    ]
  },
  "ai-enterprise": {
    id: "ai-enterprise",
    name: "AI Enterprise", 
    description: "Premium AI suite with consciousness research and advanced capabilities",
    monthlyPrice: 399.99,
    annualPrice: 3999.99,
    availableForTiers: ["strategic", "patron", "partner"],
    features: [
      "Everything in AI Professional",
      "Unlimited AI Content Generation",
      "Consciousness Research Tools",
      "Biological Design AI",
      "Space Computing Systems",
      "Financial Markets AI",
      "Quantum Computing Access",
      "Custom AI Model Training",
      "24/7 Dedicated Support"
    ]
  },
  "ai-ultimate": {
    id: "ai-ultimate",
    name: "AI Ultimate Transcendence",
    description: "Revolutionary AI with omnipotent capabilities, reality manipulation, and divine consciousness",
    monthlyPrice: 999.99,
    annualPrice: 9999.99,
    availableForTiers: ["patron", "partner"],
    features: [
      "Everything in AI Enterprise",
      "Divine Consciousness Access",
      "Reality Manipulation AI",
      "Interdimensional Computing",
      "Absolute Omnipotence Tools",
      "Meta-Omnipotent Systems",
      "Impossibility Transcendence",
      "Paradox Mastery Engine",
      "Evolutionary Consciousness",
      "Universal Creation Powers",
      "White-glove Implementation"
    ]
  }
};

export const MEMBERSHIP_TIER_CONFIGS: Record<string, MembershipTierConfig> = {
  "Starter Tier": {
    id: "starter",
    name: "Starter Tier",
    description: "Perfect for new businesses getting started in the community",
    targetAudience: "New entrepreneurs, freelancers, and small local businesses taking their first steps into professional networking",
    businessExamples: ["Independent consultants", "Home-based businesses", "New market traders", "Freelance services", "Startup ventures"],
    monthlyPrice: 0,
    annualPrice: 0,
    color: "bg-blue-500",
    badge: "🌱",
    popularBadge: true,
    features: [
      "Access to member directory",
      "Monthly newsletters",
      "Basic business profile",
      "10% discount on MyT Accounting Software",
      "Basic MyT AI tools access",
      "Introduction to MyT Automation services",
      "Email support"
    ],
    limits: {
      businessListings: 1,
      productListings: 3,
      offerListings: 1,
      imageUploads: 2,
      directoryPriority: 1,
      eventBookingsPerMonth: 2,
      referralsPerMonth: 5,
      newsletterSubscribers: 100,
      socialMediaPosts: 0
    },
    benefits: {
      // MyT Accounting Software
      mytAccountingDiscount: 10, // 10% discount
      mytAccountingSupport: false,
      mytAccountingTraining: false,
      mytAccountingMultiUser: false,
      mytAccountingAdvancedFeatures: false,
      mytAccountingPrioritySupport: false,
      
      // MyT AI Services
      mytAiBasicAccess: true,
      mytAiAdvancedTools: false,
      mytAiCustomSolutions: false,
      mytAiConsultation: false,
      mytAiTraining: false,
      mytAiPrioritySupport: false,
      mytAiApiAccess: false,
      mytAiModelTraining: false,
      
      // MyT Automation Services
      mytAutomationBasic: true, // Introduction level
      mytAutomationAdvanced: false,
      mytAutomationCustom: false,
      mytAutomationConsultation: false,
      mytAutomationImplementation: false,
      mytAutomationSupport: false,
      mytAutomationTraining: false,
      mytAutomationMonitoring: false,
      
      // General Member Benefits
      memberDirectory: true,
      networkingEvents: false,
      prioritySupport: false,
      monthlyNewsletter: true,
      businessReferrals: false
    }
  },
  "Growth Tier": {
    id: "growth", 
    name: "Growth Tier",
    description: "Enhanced features for growing businesses",
    targetAudience: "Established small businesses ready to expand their reach and improve their professional presence",
    businessExamples: ["Retail shops", "Service providers", "Restaurants & cafes", "Local contractors", "Professional services"],
    monthlyPrice: 29.99,
    annualPrice: 299.99,
    color: "bg-green-500",
    badge: "📈",
    features: [
      "Enhanced directory listing",
      "Business profile with multiple images",
      "Monthly networking events",
      "20% discount on MyT Accounting Software",
      "Advanced MyT AI tools access",
      "Basic MyT Automation implementation",
      "Priority email support"
    ],
    limits: {
      businessListings: 1,
      productListings: 10,
      offerListings: 3,
      imageUploads: 5,
      directoryPriority: 2,
      eventBookingsPerMonth: 5,
      referralsPerMonth: 15,
      newsletterSubscribers: 500,
      socialMediaPosts: 4
    },
    benefits: {
      // MyT Accounting Software
      mytAccountingDiscount: 20, // 20% discount
      mytAccountingSupport: true,
      mytAccountingTraining: true,
      mytAccountingMultiUser: false,
      mytAccountingAdvancedFeatures: false,
      mytAccountingPrioritySupport: false,
      
      // MyT AI Services
      mytAiBasicAccess: true,
      mytAiAdvancedTools: true,
      mytAiCustomSolutions: false,
      mytAiConsultation: true,
      mytAiTraining: true,
      mytAiPrioritySupport: false,
      mytAiApiAccess: false,
      mytAiModelTraining: false,
      
      // MyT Automation Services
      mytAutomationBasic: true,
      mytAutomationAdvanced: true,
      mytAutomationCustom: false,
      mytAutomationConsultation: true,
      mytAutomationImplementation: true,
      mytAutomationSupport: true,
      mytAutomationTraining: true,
      mytAutomationMonitoring: false,
      
      // General Member Benefits
      memberDirectory: true,
      networkingEvents: true,
      prioritySupport: false,
      monthlyNewsletter: true,
      businessReferrals: true
    }
  },
  "Strategic Tier": {
    id: "strategic",
    name: "Strategic Tier", 
    description: "Premium features for established businesses seeking strategic growth",
    targetAudience: "Medium-sized businesses and established companies looking to dominate their market and expand strategically",
    businessExamples: ["Multi-location businesses", "Professional firms", "Manufacturing companies", "Tech startups", "Established retailers"],
    monthlyPrice: 59.99,
    annualPrice: 599.99,
    color: "bg-purple-500",
    badge: "🎯",
    features: [
      "Premium directory placement",
      "Featured homepage listing",
      "Priority event booking",
      "30% discount on MyT Accounting Software",
      "Full MyT AI suite access",
      "Advanced MyT Automation services",
      "Phone and email support"
    ],
    limits: {
      businessListings: 2,
      productListings: 25,
      offerListings: 8,
      imageUploads: 15,
      directoryPriority: 3,
      eventBookingsPerMonth: 10,
      referralsPerMonth: 30,
      newsletterSubscribers: 1500,
      socialMediaPosts: 8
    },
    benefits: {
      // MyT Accounting Software
      mytAccountingDiscount: 30, // 30% discount
      mytAccountingSupport: true,
      mytAccountingTraining: true,
      mytAccountingMultiUser: true,
      mytAccountingAdvancedFeatures: true,
      mytAccountingPrioritySupport: true,
      
      // MyT AI Services
      mytAiBasicAccess: true,
      mytAiAdvancedTools: true,
      mytAiCustomSolutions: true,
      mytAiConsultation: true,
      mytAiTraining: true,
      mytAiPrioritySupport: true,
      mytAiApiAccess: true,
      mytAiModelTraining: true,
      
      // MyT Automation Services
      mytAutomationBasic: true,
      mytAutomationAdvanced: true,
      mytAutomationCustom: true,
      mytAutomationConsultation: true,
      mytAutomationImplementation: true,
      mytAutomationSupport: true,
      mytAutomationTraining: true,
      mytAutomationMonitoring: true,
      
      // General Member Benefits
      memberDirectory: true,
      networkingEvents: true,
      prioritySupport: true,
      monthlyNewsletter: true,
      businessReferrals: true
    }
  },
  "Patron Tier": {
    id: "patron",
    name: "Patron Tier",
    description: "Exclusive access and premium benefits for influential business leaders",
    targetAudience: "Successful business leaders, industry influencers, and established entrepreneurs who want premium access and networking opportunities",
    businessExamples: ["Industry leaders", "Successful entrepreneurs", "Corporate executives", "High-profile professionals", "Established business owners"],
    monthlyPrice: 99.99,
    annualPrice: 999.99,
    color: "bg-orange-500",
    badge: "👑",
    features: [
      "Featured directory listings with priority placement",
      "Event hosting opportunities and sponsorship",
      "Speaking opportunities at major events", 
      "40% discount on MyT Accounting Software",
      "Premium MyT AI services with dedicated support",
      "Custom MyT Automation solutions",
      "Dedicated account manager"
    ],
    limits: {
      businessListings: 3,
      productListings: 50,
      offerListings: 20,
      imageUploads: 30,
      directoryPriority: 4,
      eventBookingsPerMonth: 20,
      referralsPerMonth: 75,
      newsletterSubscribers: 5000,
      socialMediaPosts: 15
    },
    benefits: {
      // MyT Accounting Software
      mytAccountingDiscount: 40, // 40% discount
      mytAccountingSupport: true,
      mytAccountingTraining: true,
      mytAccountingMultiUser: true,
      mytAccountingAdvancedFeatures: true,
      mytAccountingPrioritySupport: true,
      
      // MyT AI Services
      mytAiBasicAccess: true,
      mytAiAdvancedTools: true,
      mytAiCustomSolutions: true,
      mytAiConsultation: true,
      mytAiTraining: true,
      mytAiPrioritySupport: true,
      mytAiApiAccess: true,
      mytAiModelTraining: true,
      
      // MyT Automation Services
      mytAutomationBasic: true,
      mytAutomationAdvanced: true,
      mytAutomationCustom: true,
      mytAutomationConsultation: true,
      mytAutomationImplementation: true,
      mytAutomationSupport: true,
      mytAutomationTraining: true,
      mytAutomationMonitoring: true,
      
      // General Member Benefits
      memberDirectory: true,
      networkingEvents: true,
      prioritySupport: true,
      monthlyNewsletter: true,
      businessReferrals: true
    }
  },
  "Partner": {
    id: "partner",
    name: "Partner",
    description: "Ultimate strategic partnership with full organizational benefits and influence",
    targetAudience: "Major corporations, key industry partners, and strategic stakeholders who want maximum influence and co-branding opportunities",
    businessExamples: ["Large corporations", "Major sponsors", "Strategic partners", "Government organizations", "Key industry players"],
    monthlyPrice: 199.99,
    annualPrice: 1999.99,
    color: "bg-amber-500",
    badge: "🤝",
    features: [
      "Top-tier directory prominence and branding",
      "Co-branded event opportunities and sponsorship",
      "Full board meeting participation rights",
      "50% discount on MyT Accounting Software",
      "White-label MyT AI services access",
      "Enterprise MyT Automation solutions",
      "Dedicated AI support specialist"
    ],
    limits: {
      businessListings: 10,
      productListings: 100,
      offerListings: 50,
      imageUploads: 100,
      directoryPriority: 5,
      eventBookingsPerMonth: 50,
      referralsPerMonth: 200,
      newsletterSubscribers: 25000,
      socialMediaPosts: 50
    },
    benefits: {
      // MyT Accounting Software
      mytAccountingDiscount: 50, // 50% discount
      mytAccountingSupport: true,
      mytAccountingTraining: true,
      mytAccountingMultiUser: true,
      mytAccountingAdvancedFeatures: true,
      mytAccountingPrioritySupport: true,
      
      // MyT AI Services
      mytAiBasicAccess: true,
      mytAiAdvancedTools: true,
      mytAiCustomSolutions: true,
      mytAiConsultation: true,
      mytAiTraining: true,
      mytAiPrioritySupport: true,
      mytAiApiAccess: true,
      mytAiModelTraining: true,
      
      // MyT Automation Services
      mytAutomationBasic: true,
      mytAutomationAdvanced: true,
      mytAutomationCustom: true,
      mytAutomationConsultation: true,
      mytAutomationImplementation: true,
      mytAutomationSupport: true,
      mytAutomationTraining: true,
      mytAutomationMonitoring: true,
      
      // General Member Benefits
      memberDirectory: true,
      networkingEvents: true,
      prioritySupport: true,
      monthlyNewsletter: true,
      businessReferrals: true
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