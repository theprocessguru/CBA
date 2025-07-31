export interface MembershipTierConfig {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  businessExamples: string[];
  monthlyPrice: number;
  annualPrice: number;
  color: string;
  badge: string;
  popularBadge?: boolean;
  features: string[];
  limits: {
    businessListings: number;
    productListings: number;
    offerListings: number;
    imageUploads: number;
    directoryPriority: number;
    eventBookingsPerMonth: number;
    referralsPerMonth: number;
    newsletterSubscribers: number;
    socialMediaPosts: number;
  };
  benefits: {
    // MyT Accounting Software Benefits
    mytAccountingDiscount: number;
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
    
    // Directory & Visibility (8 benefits)
    enhancedListing: boolean;
    featuredPlacement: boolean;
    premiumBadge: boolean;
    searchPriority: boolean;
    homepageFeature: boolean;
    logoInDirectory: boolean;
    multiplePhotos: boolean;
    videoProfile: boolean;
    
    // Networking & Events (10 benefits)
    networkingEvents: boolean;
    exclusiveEvents: boolean;
    vipEventAccess: boolean;
    eventHosting: boolean;
    speakingOpportunities: boolean;
    boardMeetingAccess: boolean;
    executiveNetworking: boolean;
    monthlyMeetings: boolean;
    quarterlyGatherings: boolean;
    annualConference: boolean;
    
    // Business Support (15 benefits)
    businessConsultation: boolean;
    mentoringAccess: boolean;
    legalSupport: boolean;
    accountingSupport: boolean;
    hrSupport: boolean;
    marketingConsultation: boolean;
    digitalMarketingSupport: boolean;
    websiteSupport: boolean;
    seoSupport: boolean;
    socialMediaSupport: boolean;
    businessPlanSupport: boolean;
    financialPlanningSupport: boolean;
    complianceSupport: boolean;
    taxSupport: boolean;
    insuranceGuidance: boolean;
    
    // Marketing & Promotion (15 benefits)
    newsletterPromotion: boolean;
    socialMediaPromotion: boolean;
    pressReleaseSupport: boolean;
    mediaKitCreation: boolean;
    prSupport: boolean;
    advertisingSupport: boolean;
    coMarketingOpportunities: boolean;
    crossPromotion: boolean;
    eventSponsorship: boolean;
    brandingSupport: boolean;
    contentCreation: boolean;
    videoMarketing: boolean;
    emailMarketingSupport: boolean;
    seoMarketing: boolean;
    socialMediaManagement: boolean;
    
    // Training & Development (15 benefits)
    businessTraining: boolean;
    leadershipTraining: boolean;
    skillsWorkshops: boolean;
    industryInsights: boolean;
    marketResearch: boolean;
    trendReports: boolean;
    webinars: boolean;
    onlineResources: boolean;
    certificatePrograms: boolean;
    expertSpeakers: boolean;
    mentorshipPrograms: boolean;
    careerDevelopment: boolean;
    technicalTraining: boolean;
    salesTraining: boolean;
    customerServiceTraining: boolean;
    
    // Communication & Support (15 benefits)
    prioritySupport: boolean;
    dedicatedAccountManager: boolean;
    phoneSupport: boolean;
    emailSupport: boolean;
    liveChat: boolean;
    monthlyNewsletters: boolean;
    weeklyUpdates: boolean;
    memberAlerts: boolean;
    businessReferrals: boolean;
    leadGeneration: boolean;
    customerSupport: boolean;
    technicalSupport: boolean;
    emergencySupport: boolean;
    weekendSupport: boolean;
    multilanguageSupport: boolean;
    
    // Digital & Technology (15 benefits)
    analyticsAccess: boolean;
    performanceReports: boolean;
    dataInsights: boolean;
    mobileAppAccess: boolean;
    apiAccess: boolean;
    integrationSupport: boolean;
    cloudStorage: boolean;
    backupServices: boolean;
    securitySupport: boolean;
    techSupport: boolean;
    websiteBuilder: boolean;
    ecommerceSupport: boolean;
    paymentGateway: boolean;
    inventoryManagement: boolean;
    crmAccess: boolean;
    
    // Financial & Discounts (15 benefits)
    eventDiscounts: boolean;
    serviceDiscounts: boolean;
    partnerDiscounts: boolean;
    bulkPurchaseDiscounts: boolean;
    memberOnlyDeals: boolean;
    earlyBirdPricing: boolean;
    freeServices: boolean;
    creditProgram: boolean;
    paymentPlans: boolean;
    invoiceSupport: boolean;
    accountingDiscounts: boolean;
    legalDiscounts: boolean;
    insuranceDiscounts: boolean;
    bankingBenefits: boolean;
    financingSupport: boolean;
    
    // Special Access & Networking (15 benefits)
    memberDirectory: boolean;
    businessMatchmaking: boolean;
    partnershipOpportunities: boolean;
    vendorRecommendations: boolean;
    supplierNetwork: boolean;
    buyerNetwork: boolean;
    investorNetwork: boolean;
    mentorNetwork: boolean;
    advisoryBoard: boolean;
    strategicPlanning: boolean;
    boardroomAccess: boolean;
    executiveClub: boolean;
    vipLounge: boolean;
    privateEvents: boolean;
    exclusivePartnerships: boolean;
    
    // AI Support & Business Intelligence (15 benefits)
    basicAiTraining: boolean;
    aiAutomationConsult: boolean;
    aiChatbotSupport: boolean;
    aiContentTools: boolean;
    aiProcessOptimization: boolean;
    customAiSolutions: boolean;
    aiEthicsGuidance: boolean;
    aiRoiAnalysis: boolean;
    advancedAiTraining: boolean;
    aiStrategyConsult: boolean;
    mlImplementation: boolean;
    aiSystemIntegration: boolean;
    dedicatedAiSupport: boolean;
    aiVendorPartnerships: boolean;
    aiBusinessIntelligence: boolean;
    
    // Advanced AI Tools & Automation (15 benefits)
    aiToolsAccess: boolean;
    aiContentGenerator: boolean;
    aiBusinessAnalytics: boolean;
    aiChatbotBuilder: boolean;
    aiProcessAnalyzer: boolean;
    aiCustomerInsights: boolean;
    aiMarketingOptimizer: boolean;
    aiPredictiveAnalytics: boolean;
    aiAutomationPlatform: boolean;
    ai24x7Assistant: boolean;
    aiDocumentProcessing: boolean;
    aiDataAnalysis: boolean;
    aiWorkflowAutomation: boolean;
    aiCustomerService: boolean;
    aiSalesOptimization: boolean;
    
    // Premium Business Services (15 benefits)
    aiSalesForecasting: boolean;
    aiCompetitorAnalysis: boolean;
    aiMarketResearch: boolean;
    aiFinancialModeling: boolean;
    aiRiskAssessment: boolean;
    aiComplianceMonitoring: boolean;
    aiWorkforceOptimization: boolean;
    aiSupplyChainAnalysis: boolean;
    aiCustomerRetention: boolean;
    aiRevenueOptimization: boolean;
    aiInventoryOptimization: boolean;
    aiPricingOptimization: boolean;
    aiQualityAssurance: boolean;
    aiPerformanceTracking: boolean;
    aiBusinessForecasting: boolean;
    
    // Integration & API Services (10 benefits)
    apiIntegrations: boolean;
    workflowAutomation: boolean;
    dataPipelines: boolean;
    notificationSystems: boolean;
    reportGeneration: boolean;
    systemOptimization: boolean;
    thirdPartyIntegrations: boolean;
    customIntegrations: boolean;
    webhookSupport: boolean;
    realTimeSync: boolean;
    
    // Advanced Analytics & Reporting (10 benefits)
    realTimeAnalytics: boolean;
    predictiveModeling: boolean;
    anomalyDetection: boolean;
    sentimentAnalysis: boolean;
    behaviorTracking: boolean;
    trendForecasting: boolean;
    competitiveIntelligence: boolean;
    marketSignals: boolean;
    customerJourney: boolean;
    conversionOptimization: boolean;
    
    // Communication & Engagement Tools (10 benefits)
    chatbotDevelopment: boolean;
    voiceAssistants: boolean;
    contentPersonalization: boolean;
    emailOptimization: boolean;
    socialMediaAI: boolean;
    customerSegmentation: boolean;
    leadScoring: boolean;
    communicationAI: boolean;
    engagementTracking: boolean;
    responseOptimization: boolean;
    
    // Professional Development & Certification (10 benefits)
    professionalCertification: boolean;
    industryAccreditation: boolean;
    skillAssessment: boolean;
    careerCoaching: boolean;
    executiveCoaching: boolean;
    leadershipDevelopment: boolean;
    teamBuilding: boolean;
    projectManagement: boolean;
    changeManagement: boolean;
    innovationTraining: boolean;
  };
}

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
      "50% discount on MyT Accounting Software",
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
      // MyT Services
      mytAccountingDiscount: 50,
      mytAccountingSupport: false,
      mytAccountingTraining: false,
      mytAccountingMultiUser: false,
      mytAccountingAdvancedFeatures: false,
      mytAccountingPrioritySupport: false,
      mytAiBasicAccess: true,
      mytAiAdvancedTools: false,
      mytAiCustomSolutions: false,
      mytAiConsultation: false,
      mytAiTraining: false,
      mytAiPrioritySupport: false,
      mytAiApiAccess: false,
      mytAiModelTraining: false,
      mytAutomationBasic: true,
      mytAutomationAdvanced: false,
      mytAutomationCustom: false,
      mytAutomationConsultation: false,
      mytAutomationImplementation: false,
      mytAutomationSupport: false,
      mytAutomationTraining: false,
      mytAutomationMonitoring: false,
      
      // Directory & Visibility
      enhancedListing: false,
      featuredPlacement: false,
      premiumBadge: false,
      searchPriority: false,
      homepageFeature: false,
      logoInDirectory: true,
      multiplePhotos: false,
      videoProfile: false,
      
      // Networking & Events
      networkingEvents: false,
      exclusiveEvents: false,
      vipEventAccess: false,
      eventHosting: false,
      speakingOpportunities: false,
      boardMeetingAccess: false,
      executiveNetworking: false,
      monthlyMeetings: true,
      quarterlyGatherings: false,
      annualConference: false,
      
      // Business Support
      businessConsultation: false,
      mentoringAccess: false,
      legalSupport: false,
      accountingSupport: false,
      hrSupport: false,
      marketingConsultation: false,
      digitalMarketingSupport: false,
      websiteSupport: false,
      seoSupport: false,
      socialMediaSupport: false,
      businessPlanSupport: false,
      financialPlanningSupport: false,
      complianceSupport: false,
      taxSupport: false,
      insuranceGuidance: false,
      
      // Marketing & Promotion
      newsletterPromotion: false,
      socialMediaPromotion: false,
      pressReleaseSupport: false,
      mediaKitCreation: false,
      prSupport: false,
      advertisingSupport: false,
      coMarketingOpportunities: false,
      crossPromotion: false,
      eventSponsorship: false,
      brandingSupport: false,
      contentCreation: false,
      videoMarketing: false,
      emailMarketingSupport: false,
      seoMarketing: false,
      socialMediaManagement: false,
      
      // Training & Development
      businessTraining: false,
      leadershipTraining: false,
      skillsWorkshops: false,
      industryInsights: false,
      marketResearch: false,
      trendReports: false,
      webinars: false,
      onlineResources: true,
      certificatePrograms: false,
      expertSpeakers: false,
      mentorshipPrograms: false,
      careerDevelopment: false,
      technicalTraining: false,
      salesTraining: false,
      customerServiceTraining: false,
      
      // Communication & Support
      prioritySupport: false,
      dedicatedAccountManager: false,
      phoneSupport: false,
      emailSupport: true,
      liveChat: false,
      monthlyNewsletters: true,
      weeklyUpdates: false,
      memberAlerts: true,
      businessReferrals: false,
      leadGeneration: false,
      customerSupport: false,
      technicalSupport: false,
      emergencySupport: false,
      weekendSupport: false,
      multilanguageSupport: false,
      
      // Digital & Technology
      analyticsAccess: false,
      performanceReports: false,
      dataInsights: false,
      mobileAppAccess: true,
      apiAccess: false,
      integrationSupport: false,
      cloudStorage: false,
      backupServices: false,
      securitySupport: false,
      techSupport: false,
      websiteBuilder: false,
      ecommerceSupport: false,
      paymentGateway: false,
      inventoryManagement: false,
      crmAccess: false,
      
      // Financial & Discounts
      eventDiscounts: false,
      serviceDiscounts: false,
      partnerDiscounts: false,
      bulkPurchaseDiscounts: false,
      memberOnlyDeals: false,
      earlyBirdPricing: false,
      freeServices: false,
      creditProgram: false,
      paymentPlans: false,
      invoiceSupport: false,
      accountingDiscounts: false,
      legalDiscounts: false,
      insuranceDiscounts: false,
      bankingBenefits: false,
      financingSupport: false,
      
      // Special Access & Networking
      memberDirectory: true,
      businessMatchmaking: false,
      partnershipOpportunities: false,
      vendorRecommendations: false,
      supplierNetwork: false,
      buyerNetwork: false,
      investorNetwork: false,
      mentorNetwork: false,
      advisoryBoard: false,
      strategicPlanning: false,
      boardroomAccess: false,
      executiveClub: false,
      vipLounge: false,
      privateEvents: false,
      exclusivePartnerships: false,
      
      // AI Support & Business Intelligence
      basicAiTraining: true,
      aiAutomationConsult: false,
      aiChatbotSupport: false,
      aiContentTools: false,
      aiProcessOptimization: false,
      customAiSolutions: false,
      aiEthicsGuidance: false,
      aiRoiAnalysis: false,
      advancedAiTraining: false,
      aiStrategyConsult: false,
      mlImplementation: false,
      aiSystemIntegration: false,
      dedicatedAiSupport: false,
      aiVendorPartnerships: false,
      aiBusinessIntelligence: false,
      
      // Advanced AI Tools & Automation
      aiToolsAccess: true,
      aiContentGenerator: false,
      aiBusinessAnalytics: false,
      aiChatbotBuilder: false,
      aiProcessAnalyzer: false,
      aiCustomerInsights: false,
      aiMarketingOptimizer: false,
      aiPredictiveAnalytics: false,
      aiAutomationPlatform: false,
      ai24x7Assistant: false,
      aiDocumentProcessing: false,
      aiDataAnalysis: false,
      aiWorkflowAutomation: false,
      aiCustomerService: false,
      aiSalesOptimization: false,
      
      // Premium Business Services
      aiSalesForecasting: false,
      aiCompetitorAnalysis: false,
      aiMarketResearch: false,
      aiFinancialModeling: false,
      aiRiskAssessment: false,
      aiComplianceMonitoring: false,
      aiWorkforceOptimization: false,
      aiSupplyChainAnalysis: false,
      aiCustomerRetention: false,
      aiRevenueOptimization: false,
      aiInventoryOptimization: false,
      aiPricingOptimization: false,
      aiQualityAssurance: false,
      aiPerformanceTracking: false,
      aiBusinessForecasting: false,
      
      // Integration & API Services
      apiIntegrations: false,
      workflowAutomation: false,
      dataPipelines: false,
      notificationSystems: false,
      reportGeneration: false,
      systemOptimization: false,
      thirdPartyIntegrations: false,
      customIntegrations: false,
      webhookSupport: false,
      realTimeSync: false,
      
      // Advanced Analytics & Reporting
      realTimeAnalytics: false,
      predictiveModeling: false,
      anomalyDetection: false,
      sentimentAnalysis: false,
      behaviorTracking: false,
      trendForecasting: false,
      competitiveIntelligence: false,
      marketSignals: false,
      customerJourney: false,
      conversionOptimization: false,
      
      // Communication & Engagement Tools
      chatbotDevelopment: false,
      voiceAssistants: false,
      contentPersonalization: false,
      emailOptimization: false,
      socialMediaAI: false,
      customerSegmentation: false,
      leadScoring: false,
      communicationAI: false,
      engagementTracking: false,
      responseOptimization: false,
      
      // Professional Development & Certification
      professionalCertification: false,
      industryAccreditation: false,
      skillAssessment: false,
      careerCoaching: false,
      executiveCoaching: false,
      leadershipDevelopment: false,
      teamBuilding: false,
      projectManagement: false,
      changeManagement: false,
      innovationTraining: false
    }
  },
  // Additional tiers would follow the same pattern with increasing benefits
};

export interface AIServiceAddon {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  features: string[];
  targetAudience: string;
}

export const AI_SERVICE_ADDONS: Record<string, AIServiceAddon> = {
  "ai-basics": {
    id: "ai-basics",
    name: "AI Basics",
    description: "Essential AI tools for small businesses",
    monthlyPrice: 29.99,
    features: [
      "AI Content Writing Assistant",
      "Basic Chatbot Builder",
      "Document Analysis (50 docs/month)",
      "Email Template Generator",
      "Social Media Content Creator"
    ],
    targetAudience: "Small businesses starting their AI journey"
  },
  "ai-professional": {
    id: "ai-professional", 
    name: "AI Professional",
    description: "Advanced AI automation for growing businesses",
    monthlyPrice: 79.99,
    features: [
      "Advanced Content Generation",
      "Custom AI Workflows",
      "Document Analysis (200 docs/month)",
      "Customer Service Automation",
      "Predictive Analytics Dashboard",
      "API Access for Integrations"
    ],
    targetAudience: "Growing businesses seeking competitive advantages"
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

export type InsertMembershipTier = Omit<MembershipTierConfig, 'id'>;