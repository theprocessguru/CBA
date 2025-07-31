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
  "Growth+ Tier": {
    id: "growth",
    name: "Growth+ Tier",
    description: "Enhanced benefits for growing businesses",
    targetAudience: "Established small businesses looking to expand their network and access advanced resources",
    businessExamples: ["Retail shops with 2-5 employees", "Service businesses", "Restaurants", "Professional services", "Growing consultancies"],
    monthlyPrice: 29.99,
    annualPrice: 299.99,
    color: "bg-green-500",
    badge: "🚀",
    popularBadge: false,
    features: [
      "Enhanced business listing",
      "Quarterly networking events",
      "Business consultation sessions",
      "50% discount on MyT Accounting Software",
      "Advanced MyT AI tools",
      "MyT Automation consultation",
      "Priority email support"
    ],
    limits: {
      businessListings: 2,
      productListings: 10,
      offerListings: 3,
      imageUploads: 5,
      directoryPriority: 2,
      eventBookingsPerMonth: 5,
      referralsPerMonth: 15,
      newsletterSubscribers: 500,
      socialMediaPosts: 10
    },
    benefits: {
      // MyT Services
      mytAccountingDiscount: 50,
      mytAccountingSupport: true,
      mytAccountingTraining: true,
      mytAccountingMultiUser: false,
      mytAccountingAdvancedFeatures: false,
      mytAccountingPrioritySupport: false,
      mytAiBasicAccess: true,
      mytAiAdvancedTools: true,
      mytAiCustomSolutions: false,
      mytAiConsultation: true,
      mytAiTraining: true,
      mytAiPrioritySupport: false,
      mytAiApiAccess: false,
      mytAiModelTraining: false,
      mytAutomationBasic: true,
      mytAutomationAdvanced: true,
      mytAutomationCustom: false,
      mytAutomationConsultation: true,
      mytAutomationImplementation: false,
      mytAutomationSupport: true,
      mytAutomationTraining: true,
      mytAutomationMonitoring: false,
      
      // Directory & Visibility
      enhancedListing: true,
      featuredPlacement: false,
      premiumBadge: true,
      searchPriority: true,
      homepageFeature: false,
      logoInDirectory: true,
      multiplePhotos: true,
      videoProfile: false,
      
      // Networking & Events
      networkingEvents: true,
      exclusiveEvents: false,
      vipEventAccess: false,
      eventHosting: false,
      speakingOpportunities: false,
      boardMeetingAccess: false,
      executiveNetworking: false,
      monthlyMeetings: true,
      quarterlyGatherings: true,
      annualConference: false,
      
      // Business Support
      businessConsultation: true,
      mentoringAccess: true,
      legalSupport: false,
      accountingSupport: true,
      hrSupport: false,
      marketingConsultation: true,
      digitalMarketingSupport: true,
      websiteSupport: false,
      seoSupport: false,
      socialMediaSupport: true,
      businessPlanSupport: false,
      financialPlanningSupport: false,
      complianceSupport: false,
      taxSupport: false,
      insuranceGuidance: false,
      
      // Marketing & Promotion
      newsletterPromotion: true,
      socialMediaPromotion: true,
      pressReleaseSupport: false,
      mediaKitCreation: false,
      prSupport: false,
      advertisingSupport: false,
      coMarketingOpportunities: true,
      crossPromotion: true,
      eventSponsorship: false,
      brandingSupport: false,
      contentCreation: true,
      videoMarketing: false,
      emailMarketingSupport: true,
      seoMarketing: false,
      socialMediaManagement: false,
      
      // Training & Development
      businessTraining: true,
      leadershipTraining: false,
      skillsWorkshops: true,
      industryInsights: true,
      marketResearch: false,
      trendReports: true,
      webinars: true,
      onlineResources: true,
      certificatePrograms: false,
      expertSpeakers: false,
      mentorshipPrograms: true,
      careerDevelopment: false,
      technicalTraining: false,
      salesTraining: true,
      customerServiceTraining: true,
      
      // Communication & Support
      prioritySupport: true,
      dedicatedAccountManager: false,
      phoneSupport: false,
      emailSupport: true,
      liveChat: false,
      monthlyNewsletters: true,
      weeklyUpdates: false,
      memberAlerts: true,
      businessReferrals: true,
      leadGeneration: true,
      customerSupport: true,
      technicalSupport: false,
      emergencySupport: false,
      weekendSupport: false,
      multilanguageSupport: false,
      
      // Digital & Technology
      analyticsAccess: true,
      performanceReports: true,
      dataInsights: false,
      mobileAppAccess: true,
      apiAccess: false,
      integrationSupport: false,
      cloudStorage: true,
      backupServices: false,
      securitySupport: false,
      techSupport: true,
      websiteBuilder: false,
      ecommerceSupport: false,
      paymentGateway: false,
      inventoryManagement: false,
      crmAccess: false,
      
      // Financial & Discounts
      eventDiscounts: true,
      serviceDiscounts: true,
      partnerDiscounts: true,
      bulkPurchaseDiscounts: false,
      memberOnlyDeals: true,
      earlyBirdPricing: true,
      freeServices: false,
      creditProgram: false,
      paymentPlans: false,
      invoiceSupport: false,
      accountingDiscounts: true,
      legalDiscounts: false,
      insuranceDiscounts: false,
      bankingBenefits: false,
      financingSupport: false,
      
      // Special Access & Networking
      memberDirectory: true,
      businessMatchmaking: true,
      partnershipOpportunities: true,
      vendorRecommendations: true,
      supplierNetwork: false,
      buyerNetwork: false,
      investorNetwork: false,
      mentorNetwork: true,
      advisoryBoard: false,
      strategicPlanning: false,
      boardroomAccess: false,
      executiveClub: false,
      vipLounge: false,
      privateEvents: false,
      exclusivePartnerships: false,
      
      // AI Support & Business Intelligence
      basicAiTraining: true,
      aiAutomationConsult: true,
      aiChatbotSupport: true,
      aiContentTools: true,
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
      aiContentGenerator: true,
      aiBusinessAnalytics: true,
      aiChatbotBuilder: true,
      aiProcessAnalyzer: false,
      aiCustomerInsights: true,
      aiMarketingOptimizer: false,
      aiPredictiveAnalytics: false,
      aiAutomationPlatform: false,
      ai24x7Assistant: false,
      aiDocumentProcessing: true,
      aiDataAnalysis: false,
      aiWorkflowAutomation: false,
      aiCustomerService: true,
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
      workflowAutomation: true,
      dataPipelines: false,
      notificationSystems: true,
      reportGeneration: true,
      systemOptimization: false,
      thirdPartyIntegrations: false,
      customIntegrations: false,
      webhookSupport: false,
      realTimeSync: false,
      
      // Advanced Analytics & Reporting
      realTimeAnalytics: false,
      predictiveModeling: false,
      anomalyDetection: false,
      sentimentAnalysis: true,
      behaviorTracking: false,
      trendForecasting: false,
      competitiveIntelligence: false,
      marketSignals: false,
      customerJourney: false,
      conversionOptimization: false,
      
      // Communication & Engagement Tools
      chatbotDevelopment: true,
      voiceAssistants: false,
      contentPersonalization: true,
      emailOptimization: true,
      socialMediaAI: true,
      customerSegmentation: true,
      leadScoring: false,
      communicationAI: false,
      engagementTracking: true,
      responseOptimization: false,
      
      // Professional Development & Certification
      professionalCertification: false,
      industryAccreditation: false,
      skillAssessment: true,
      careerCoaching: false,
      executiveCoaching: false,
      leadershipDevelopment: false,
      teamBuilding: true,
      projectManagement: false,
      changeManagement: false,
      innovationTraining: false
    }
  },
  "Strategic+ Tier": {
    id: "strategic",
    name: "Strategic+ Tier",
    description: "Advanced features for strategic business growth",
    targetAudience: "Medium businesses with 5-15 employees seeking strategic partnerships and premium services",
    businessExamples: ["Regional businesses", "Manufacturing companies", "Professional firms", "Multi-location businesses", "Franchise operations"],
    monthlyPrice: 99.99,
    annualPrice: 999.99,
    color: "bg-blue-500",
    badge: "⭐",
    popularBadge: true,
    features: [
      "Premium directory placement",
      "Monthly networking events",
      "Strategic business consultation",
      "50% discount on MyT Accounting Software",
      "Full MyT AI suite access",
      "Custom MyT Automation solutions",
      "Phone & email support"
    ],
    limits: {
      businessListings: 5,
      productListings: 25,
      offerListings: 10,
      imageUploads: 15,
      directoryPriority: 3,
      eventBookingsPerMonth: 15,
      referralsPerMonth: 50,
      newsletterSubscribers: 2000,
      socialMediaPosts: 25
    },
    benefits: {
      // MyT Services
      mytAccountingDiscount: 50,
      mytAccountingSupport: true,
      mytAccountingTraining: true,
      mytAccountingMultiUser: true,
      mytAccountingAdvancedFeatures: true,
      mytAccountingPrioritySupport: true,
      mytAiBasicAccess: true,
      mytAiAdvancedTools: true,
      mytAiCustomSolutions: true,
      mytAiConsultation: true,
      mytAiTraining: true,
      mytAiPrioritySupport: true,
      mytAiApiAccess: true,
      mytAiModelTraining: false,
      mytAutomationBasic: true,
      mytAutomationAdvanced: true,
      mytAutomationCustom: true,
      mytAutomationConsultation: true,
      mytAutomationImplementation: true,
      mytAutomationSupport: true,
      mytAutomationTraining: true,
      mytAutomationMonitoring: true,
      
      // All other benefits set to progressively more true values
      // Directory & Visibility
      enhancedListing: true,
      featuredPlacement: true,
      premiumBadge: true,
      searchPriority: true,
      homepageFeature: true,
      logoInDirectory: true,
      multiplePhotos: true,
      videoProfile: true,
      
      // Continue with all other categories...
      // Setting most benefits to true for Strategic+ tier
      networkingEvents: true,
      exclusiveEvents: true,
      vipEventAccess: true,
      eventHosting: true,
      speakingOpportunities: true,
      boardMeetingAccess: false,
      executiveNetworking: true,
      monthlyMeetings: true,
      quarterlyGatherings: true,
      annualConference: true,
      
      businessConsultation: true,
      mentoringAccess: true,
      legalSupport: true,
      accountingSupport: true,
      hrSupport: true,
      marketingConsultation: true,
      digitalMarketingSupport: true,
      websiteSupport: true,
      seoSupport: true,
      socialMediaSupport: true,
      businessPlanSupport: true,
      financialPlanningSupport: true,
      complianceSupport: true,
      taxSupport: true,
      insuranceGuidance: true,
      
      newsletterPromotion: true,
      socialMediaPromotion: true,
      pressReleaseSupport: true,
      mediaKitCreation: true,
      prSupport: true,
      advertisingSupport: true,
      coMarketingOpportunities: true,
      crossPromotion: true,
      eventSponsorship: true,
      brandingSupport: true,
      contentCreation: true,
      videoMarketing: true,
      emailMarketingSupport: true,
      seoMarketing: true,
      socialMediaManagement: true,
      
      businessTraining: true,
      leadershipTraining: true,
      skillsWorkshops: true,
      industryInsights: true,
      marketResearch: true,
      trendReports: true,
      webinars: true,
      onlineResources: true,
      certificatePrograms: true,
      expertSpeakers: true,
      mentorshipPrograms: true,
      careerDevelopment: true,
      technicalTraining: true,
      salesTraining: true,
      customerServiceTraining: true,
      
      prioritySupport: true,
      dedicatedAccountManager: true,
      phoneSupport: true,
      emailSupport: true,
      liveChat: true,
      monthlyNewsletters: true,
      weeklyUpdates: true,
      memberAlerts: true,
      businessReferrals: true,
      leadGeneration: true,
      customerSupport: true,
      technicalSupport: true,
      emergencySupport: false,
      weekendSupport: false,
      multilanguageSupport: false,
      
      analyticsAccess: true,
      performanceReports: true,
      dataInsights: true,
      mobileAppAccess: true,
      apiAccess: true,
      integrationSupport: true,
      cloudStorage: true,
      backupServices: true,
      securitySupport: true,
      techSupport: true,
      websiteBuilder: true,
      ecommerceSupport: true,
      paymentGateway: true,
      inventoryManagement: true,
      crmAccess: true,
      
      eventDiscounts: true,
      serviceDiscounts: true,
      partnerDiscounts: true,
      bulkPurchaseDiscounts: true,
      memberOnlyDeals: true,
      earlyBirdPricing: true,
      freeServices: true,
      creditProgram: true,
      paymentPlans: true,
      invoiceSupport: true,
      accountingDiscounts: true,
      legalDiscounts: true,
      insuranceDiscounts: true,
      bankingBenefits: true,
      financingSupport: true,
      
      memberDirectory: true,
      businessMatchmaking: true,
      partnershipOpportunities: true,
      vendorRecommendations: true,
      supplierNetwork: true,
      buyerNetwork: true,
      investorNetwork: true,
      mentorNetwork: true,
      advisoryBoard: true,
      strategicPlanning: true,
      boardroomAccess: false,
      executiveClub: false,
      vipLounge: false,
      privateEvents: true,
      exclusivePartnerships: true,
      
      basicAiTraining: true,
      aiAutomationConsult: true,
      aiChatbotSupport: true,
      aiContentTools: true,
      aiProcessOptimization: true,
      customAiSolutions: true,
      aiEthicsGuidance: true,
      aiRoiAnalysis: true,
      advancedAiTraining: true,
      aiStrategyConsult: true,
      mlImplementation: true,
      aiSystemIntegration: true,
      dedicatedAiSupport: false,
      aiVendorPartnerships: true,
      aiBusinessIntelligence: true,
      
      aiToolsAccess: true,
      aiContentGenerator: true,
      aiBusinessAnalytics: true,
      aiChatbotBuilder: true,
      aiProcessAnalyzer: true,
      aiCustomerInsights: true,
      aiMarketingOptimizer: true,
      aiPredictiveAnalytics: true,
      aiAutomationPlatform: true,
      ai24x7Assistant: true,
      aiDocumentProcessing: true,
      aiDataAnalysis: true,
      aiWorkflowAutomation: true,
      aiCustomerService: true,
      aiSalesOptimization: true,
      
      aiSalesForecasting: true,
      aiCompetitorAnalysis: true,
      aiMarketResearch: true,
      aiFinancialModeling: true,
      aiRiskAssessment: true,
      aiComplianceMonitoring: true,
      aiWorkforceOptimization: true,
      aiSupplyChainAnalysis: true,
      aiCustomerRetention: true,
      aiRevenueOptimization: true,
      aiInventoryOptimization: true,
      aiPricingOptimization: true,
      aiQualityAssurance: true,
      aiPerformanceTracking: true,
      aiBusinessForecasting: true,
      
      apiIntegrations: true,
      workflowAutomation: true,
      dataPipelines: true,
      notificationSystems: true,
      reportGeneration: true,
      systemOptimization: true,
      thirdPartyIntegrations: true,
      customIntegrations: true,
      webhookSupport: true,
      realTimeSync: true,
      
      realTimeAnalytics: true,
      predictiveModeling: true,
      anomalyDetection: true,
      sentimentAnalysis: true,
      behaviorTracking: true,
      trendForecasting: true,
      competitiveIntelligence: true,
      marketSignals: true,
      customerJourney: true,
      conversionOptimization: true,
      
      chatbotDevelopment: true,
      voiceAssistants: true,
      contentPersonalization: true,
      emailOptimization: true,
      socialMediaAI: true,
      customerSegmentation: true,
      leadScoring: true,
      communicationAI: true,
      engagementTracking: true,
      responseOptimization: true,
      
      professionalCertification: true,
      industryAccreditation: true,
      skillAssessment: true,
      careerCoaching: true,
      executiveCoaching: true,
      leadershipDevelopment: true,
      teamBuilding: true,
      projectManagement: true,
      changeManagement: true,
      innovationTraining: true
    }
  },
  "Patron+ Tier": {
    id: "patron",
    name: "Patron+ Tier",
    description: "Premium tier with exclusive benefits and priority access",
    targetAudience: "Large businesses and organizations with 15+ employees requiring premium services and exclusive access",
    businessExamples: ["Corporate offices", "Large retailers", "Major service providers", "Industry leaders", "Established enterprises"],
    monthlyPrice: 249.99,
    annualPrice: 2499.99,
    color: "bg-purple-500",
    badge: "👑",
    popularBadge: false,
    features: [
      "Top-tier directory placement",
      "Exclusive executive events",
      "Dedicated account manager",
      "50% discount on MyT Accounting Software",
      "Enterprise MyT AI solutions",
      "Priority MyT Automation support",
      "24/7 phone & email support"
    ],
    limits: {
      businessListings: 10,
      productListings: 100,
      offerListings: 25,
      imageUploads: 50,
      directoryPriority: 4,
      eventBookingsPerMonth: 50,
      referralsPerMonth: 100,
      newsletterSubscribers: 10000,
      socialMediaPosts: 100
    },
    benefits: {
      // All MyT Services at full access
      mytAccountingDiscount: 50,
      mytAccountingSupport: true,
      mytAccountingTraining: true,
      mytAccountingMultiUser: true,
      mytAccountingAdvancedFeatures: true,
      mytAccountingPrioritySupport: true,
      mytAiBasicAccess: true,
      mytAiAdvancedTools: true,
      mytAiCustomSolutions: true,
      mytAiConsultation: true,
      mytAiTraining: true,
      mytAiPrioritySupport: true,
      mytAiApiAccess: true,
      mytAiModelTraining: true,
      mytAutomationBasic: true,
      mytAutomationAdvanced: true,
      mytAutomationCustom: true,
      mytAutomationConsultation: true,
      mytAutomationImplementation: true,
      mytAutomationSupport: true,
      mytAutomationTraining: true,
      mytAutomationMonitoring: true,
      
      // All benefits set to true for Patron+ tier
      enhancedListing: true,
      featuredPlacement: true,
      premiumBadge: true,
      searchPriority: true,
      homepageFeature: true,
      logoInDirectory: true,
      multiplePhotos: true,
      videoProfile: true,
      
      networkingEvents: true,
      exclusiveEvents: true,
      vipEventAccess: true,
      eventHosting: true,
      speakingOpportunities: true,
      boardMeetingAccess: true,
      executiveNetworking: true,
      monthlyMeetings: true,
      quarterlyGatherings: true,
      annualConference: true,
      
      businessConsultation: true,
      mentoringAccess: true,
      legalSupport: true,
      accountingSupport: true,
      hrSupport: true,
      marketingConsultation: true,
      digitalMarketingSupport: true,
      websiteSupport: true,
      seoSupport: true,
      socialMediaSupport: true,
      businessPlanSupport: true,
      financialPlanningSupport: true,
      complianceSupport: true,
      taxSupport: true,
      insuranceGuidance: true,
      
      newsletterPromotion: true,
      socialMediaPromotion: true,
      pressReleaseSupport: true,
      mediaKitCreation: true,
      prSupport: true,
      advertisingSupport: true,
      coMarketingOpportunities: true,
      crossPromotion: true,
      eventSponsorship: true,
      brandingSupport: true,
      contentCreation: true,
      videoMarketing: true,
      emailMarketingSupport: true,
      seoMarketing: true,
      socialMediaManagement: true,
      
      businessTraining: true,
      leadershipTraining: true,
      skillsWorkshops: true,
      industryInsights: true,
      marketResearch: true,
      trendReports: true,
      webinars: true,
      onlineResources: true,
      certificatePrograms: true,
      expertSpeakers: true,
      mentorshipPrograms: true,
      careerDevelopment: true,
      technicalTraining: true,
      salesTraining: true,
      customerServiceTraining: true,
      
      prioritySupport: true,
      dedicatedAccountManager: true,
      phoneSupport: true,
      emailSupport: true,
      liveChat: true,
      monthlyNewsletters: true,
      weeklyUpdates: true,
      memberAlerts: true,
      businessReferrals: true,
      leadGeneration: true,
      customerSupport: true,
      technicalSupport: true,
      emergencySupport: true,
      weekendSupport: true,
      multilanguageSupport: true,
      
      analyticsAccess: true,
      performanceReports: true,
      dataInsights: true,
      mobileAppAccess: true,
      apiAccess: true,
      integrationSupport: true,
      cloudStorage: true,
      backupServices: true,
      securitySupport: true,
      techSupport: true,
      websiteBuilder: true,
      ecommerceSupport: true,
      paymentGateway: true,
      inventoryManagement: true,
      crmAccess: true,
      
      eventDiscounts: true,
      serviceDiscounts: true,
      partnerDiscounts: true,
      bulkPurchaseDiscounts: true,
      memberOnlyDeals: true,
      earlyBirdPricing: true,
      freeServices: true,
      creditProgram: true,
      paymentPlans: true,
      invoiceSupport: true,
      accountingDiscounts: true,
      legalDiscounts: true,
      insuranceDiscounts: true,
      bankingBenefits: true,
      financingSupport: true,
      
      memberDirectory: true,
      businessMatchmaking: true,
      partnershipOpportunities: true,
      vendorRecommendations: true,
      supplierNetwork: true,
      buyerNetwork: true,
      investorNetwork: true,
      mentorNetwork: true,
      advisoryBoard: true,
      strategicPlanning: true,
      boardroomAccess: true,
      executiveClub: true,
      vipLounge: true,
      privateEvents: true,
      exclusivePartnerships: true,
      
      basicAiTraining: true,
      aiAutomationConsult: true,
      aiChatbotSupport: true,
      aiContentTools: true,
      aiProcessOptimization: true,
      customAiSolutions: true,
      aiEthicsGuidance: true,
      aiRoiAnalysis: true,
      advancedAiTraining: true,
      aiStrategyConsult: true,
      mlImplementation: true,
      aiSystemIntegration: true,
      dedicatedAiSupport: true,
      aiVendorPartnerships: true,
      aiBusinessIntelligence: true,
      
      aiToolsAccess: true,
      aiContentGenerator: true,
      aiBusinessAnalytics: true,
      aiChatbotBuilder: true,
      aiProcessAnalyzer: true,
      aiCustomerInsights: true,
      aiMarketingOptimizer: true,
      aiPredictiveAnalytics: true,
      aiAutomationPlatform: true,
      ai24x7Assistant: true,
      aiDocumentProcessing: true,
      aiDataAnalysis: true,
      aiWorkflowAutomation: true,
      aiCustomerService: true,
      aiSalesOptimization: true,
      
      aiSalesForecasting: true,
      aiCompetitorAnalysis: true,
      aiMarketResearch: true,
      aiFinancialModeling: true,
      aiRiskAssessment: true,
      aiComplianceMonitoring: true,
      aiWorkforceOptimization: true,
      aiSupplyChainAnalysis: true,
      aiCustomerRetention: true,
      aiRevenueOptimization: true,
      aiInventoryOptimization: true,
      aiPricingOptimization: true,
      aiQualityAssurance: true,
      aiPerformanceTracking: true,
      aiBusinessForecasting: true,
      
      apiIntegrations: true,
      workflowAutomation: true,
      dataPipelines: true,
      notificationSystems: true,
      reportGeneration: true,
      systemOptimization: true,
      thirdPartyIntegrations: true,
      customIntegrations: true,
      webhookSupport: true,
      realTimeSync: true,
      
      realTimeAnalytics: true,
      predictiveModeling: true,
      anomalyDetection: true,
      sentimentAnalysis: true,
      behaviorTracking: true,
      trendForecasting: true,
      competitiveIntelligence: true,
      marketSignals: true,
      customerJourney: true,
      conversionOptimization: true,
      
      chatbotDevelopment: true,
      voiceAssistants: true,
      contentPersonalization: true,
      emailOptimization: true,
      socialMediaAI: true,
      customerSegmentation: true,
      leadScoring: true,
      communicationAI: true,
      engagementTracking: true,
      responseOptimization: true,
      
      professionalCertification: true,
      industryAccreditation: true,
      skillAssessment: true,
      careerCoaching: true,
      executiveCoaching: true,
      leadershipDevelopment: true,
      teamBuilding: true,
      projectManagement: true,
      changeManagement: true,
      innovationTraining: true
    }
  },
  "Partner Tier": {
    id: "partner",
    name: "Partner Tier",
    description: "Ultimate partnership tier with full access to all benefits and services",
    targetAudience: "Major corporate partners, industry leaders, and strategic business allies requiring complete access",
    businessExamples: ["Major corporations", "Industry leaders", "Strategic partners", "Corporate sponsors", "Enterprise clients"],
    monthlyPrice: 499.99,
    annualPrice: 4999.99,
    color: "bg-amber-500",
    badge: "💎",
    popularBadge: false,
    features: [
      "Platinum directory placement",
      "All exclusive events included",
      "Executive account management",
      "50% discount on MyT Accounting Software", 
      "Full enterprise MyT AI platform",
      "White-label MyT Automation solutions",
      "Dedicated 24/7 support team"
    ],
    limits: {
      businessListings: 999,
      productListings: 999,
      offerListings: 999,
      imageUploads: 999,
      directoryPriority: 5,
      eventBookingsPerMonth: 999,
      referralsPerMonth: 999,
      newsletterSubscribers: 999999,
      socialMediaPosts: 999
    },
    benefits: {
      // All benefits set to true for Partner tier (highest level)
      mytAccountingDiscount: 50,
      mytAccountingSupport: true,
      mytAccountingTraining: true,
      mytAccountingMultiUser: true,
      mytAccountingAdvancedFeatures: true,
      mytAccountingPrioritySupport: true,
      mytAiBasicAccess: true,
      mytAiAdvancedTools: true,
      mytAiCustomSolutions: true,
      mytAiConsultation: true,
      mytAiTraining: true,
      mytAiPrioritySupport: true,
      mytAiApiAccess: true,
      mytAiModelTraining: true,
      mytAutomationBasic: true,
      mytAutomationAdvanced: true,
      mytAutomationCustom: true,
      mytAutomationConsultation: true,
      mytAutomationImplementation: true,
      mytAutomationSupport: true,
      mytAutomationTraining: true,
      mytAutomationMonitoring: true,
      
      enhancedListing: true,
      featuredPlacement: true,
      premiumBadge: true,
      searchPriority: true,
      homepageFeature: true,
      logoInDirectory: true,
      multiplePhotos: true,
      videoProfile: true,
      
      networkingEvents: true,
      exclusiveEvents: true,
      vipEventAccess: true,
      eventHosting: true,
      speakingOpportunities: true,
      boardMeetingAccess: true,
      executiveNetworking: true,
      monthlyMeetings: true,
      quarterlyGatherings: true,
      annualConference: true,
      
      businessConsultation: true,
      mentoringAccess: true,
      legalSupport: true,
      accountingSupport: true,
      hrSupport: true,
      marketingConsultation: true,
      digitalMarketingSupport: true,
      websiteSupport: true,
      seoSupport: true,
      socialMediaSupport: true,
      businessPlanSupport: true,
      financialPlanningSupport: true,
      complianceSupport: true,
      taxSupport: true,
      insuranceGuidance: true,
      
      newsletterPromotion: true,
      socialMediaPromotion: true,
      pressReleaseSupport: true,
      mediaKitCreation: true,
      prSupport: true,
      advertisingSupport: true,
      coMarketingOpportunities: true,
      crossPromotion: true,
      eventSponsorship: true,
      brandingSupport: true,
      contentCreation: true,
      videoMarketing: true,
      emailMarketingSupport: true,
      seoMarketing: true,
      socialMediaManagement: true,
      
      businessTraining: true,
      leadershipTraining: true,
      skillsWorkshops: true,
      industryInsights: true,
      marketResearch: true,
      trendReports: true,
      webinars: true,
      onlineResources: true,
      certificatePrograms: true,
      expertSpeakers: true,
      mentorshipPrograms: true,
      careerDevelopment: true,
      technicalTraining: true,
      salesTraining: true,
      customerServiceTraining: true,
      
      prioritySupport: true,
      dedicatedAccountManager: true,
      phoneSupport: true,
      emailSupport: true,
      liveChat: true,
      monthlyNewsletters: true,
      weeklyUpdates: true,
      memberAlerts: true,
      businessReferrals: true,
      leadGeneration: true,
      customerSupport: true,
      technicalSupport: true,
      emergencySupport: true,
      weekendSupport: true,
      multilanguageSupport: true,
      
      analyticsAccess: true,
      performanceReports: true,
      dataInsights: true,
      mobileAppAccess: true,
      apiAccess: true,
      integrationSupport: true,
      cloudStorage: true,
      backupServices: true,
      securitySupport: true,
      techSupport: true,
      websiteBuilder: true,
      ecommerceSupport: true,
      paymentGateway: true,
      inventoryManagement: true,
      crmAccess: true,
      
      eventDiscounts: true,
      serviceDiscounts: true,
      partnerDiscounts: true,
      bulkPurchaseDiscounts: true,
      memberOnlyDeals: true,
      earlyBirdPricing: true,
      freeServices: true,
      creditProgram: true,
      paymentPlans: true,
      invoiceSupport: true,
      accountingDiscounts: true,
      legalDiscounts: true,
      insuranceDiscounts: true,
      bankingBenefits: true,
      financingSupport: true,
      
      memberDirectory: true,
      businessMatchmaking: true,
      partnershipOpportunities: true,
      vendorRecommendations: true,
      supplierNetwork: true,
      buyerNetwork: true,
      investorNetwork: true,
      mentorNetwork: true,
      advisoryBoard: true,
      strategicPlanning: true,
      boardroomAccess: true,
      executiveClub: true,
      vipLounge: true,
      privateEvents: true,
      exclusivePartnerships: true,
      
      basicAiTraining: true,
      aiAutomationConsult: true,
      aiChatbotSupport: true,
      aiContentTools: true,
      aiProcessOptimization: true,
      customAiSolutions: true,
      aiEthicsGuidance: true,
      aiRoiAnalysis: true,
      advancedAiTraining: true,
      aiStrategyConsult: true,
      mlImplementation: true,
      aiSystemIntegration: true,
      dedicatedAiSupport: true,
      aiVendorPartnerships: true,
      aiBusinessIntelligence: true,
      
      aiToolsAccess: true,
      aiContentGenerator: true,
      aiBusinessAnalytics: true,
      aiChatbotBuilder: true,
      aiProcessAnalyzer: true,
      aiCustomerInsights: true,
      aiMarketingOptimizer: true,
      aiPredictiveAnalytics: true,
      aiAutomationPlatform: true,
      ai24x7Assistant: true,
      aiDocumentProcessing: true,
      aiDataAnalysis: true,
      aiWorkflowAutomation: true,
      aiCustomerService: true,
      aiSalesOptimization: true,
      
      aiSalesForecasting: true,
      aiCompetitorAnalysis: true,
      aiMarketResearch: true,
      aiFinancialModeling: true,
      aiRiskAssessment: true,
      aiComplianceMonitoring: true,
      aiWorkforceOptimization: true,
      aiSupplyChainAnalysis: true,
      aiCustomerRetention: true,
      aiRevenueOptimization: true,
      aiInventoryOptimization: true,
      aiPricingOptimization: true,
      aiQualityAssurance: true,
      aiPerformanceTracking: true,
      aiBusinessForecasting: true,
      
      apiIntegrations: true,
      workflowAutomation: true,
      dataPipelines: true,
      notificationSystems: true,
      reportGeneration: true,
      systemOptimization: true,
      thirdPartyIntegrations: true,
      customIntegrations: true,
      webhookSupport: true,
      realTimeSync: true,
      
      realTimeAnalytics: true,
      predictiveModeling: true,
      anomalyDetection: true,
      sentimentAnalysis: true,
      behaviorTracking: true,
      trendForecasting: true,
      competitiveIntelligence: true,
      marketSignals: true,
      customerJourney: true,
      conversionOptimization: true,
      
      chatbotDevelopment: true,
      voiceAssistants: true,
      contentPersonalization: true,
      emailOptimization: true,
      socialMediaAI: true,
      customerSegmentation: true,
      leadScoring: true,
      communicationAI: true,
      engagementTracking: true,
      responseOptimization: true,
      
      professionalCertification: true,
      industryAccreditation: true,
      skillAssessment: true,
      careerCoaching: true,
      executiveCoaching: true,
      leadershipDevelopment: true,
      teamBuilding: true,
      projectManagement: true,
      changeManagement: true,
      innovationTraining: true
    }
  }
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
  const benefit = config?.benefits[feature];
  return Boolean(benefit);
}

export function getTierLimits(tierName: string) {
  const config = getMembershipTierConfig(tierName);
  return config?.limits || MEMBERSHIP_TIER_CONFIGS["Starter Tier"].limits;
}

export type InsertMembershipTier = Omit<MembershipTierConfig, 'id'>;