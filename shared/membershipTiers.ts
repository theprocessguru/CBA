export interface MembershipTierConfig {
  id: string;
  name: string;
  description: string;
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
    // Directory & Visibility Benefits
    enhancedListing: boolean;
    featuredPlacement: boolean;
    premiumBadge: boolean;
    searchPriority: boolean;
    homepageFeature: boolean;
    logoInDirectory: boolean;
    multiplePhotos: boolean;
    videoProfile: boolean;
    
    // Networking & Events Benefits
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
    
    // Business Support Benefits
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
    
    // Marketing & Promotion Benefits
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
    
    // Training & Development Benefits
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
    
    // Communication & Support Benefits
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
    
    // Digital & Technology Benefits
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
    
    // Financial & Discounts Benefits
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
    
    // Special Access Benefits
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

    // AI Support & Services Benefits
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
    customAiModelTraining: boolean;

    // Advanced AI Tools & Features
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

    // Premium AI Business Services
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

    // AI Automation & Integration
    aiApiIntegrations: boolean;
    aiWorkflowAutomation: boolean;
    aiDataPipelines: boolean;
    aiNotificationSystems: boolean;
    aiReportGeneration: boolean;
    aiQualityAssurance: boolean;
    aiPerformanceMonitoring: boolean;
    aiSecurityAnalysis: boolean;
    aiBackupAutomation: boolean;
    aiSystemOptimization: boolean;
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
    badge: "🌱",
    popularBadge: true,
    features: [
      "Basic directory listing",
      "Access to member directory", 
      "Monthly newsletters",
      "Community forum access",
      "Basic business profile",
      "Contact information display",
      "Basic AI training workshops"
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
      
      // Special Access
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

      // AI Support & Services
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
      customAiModelTraining: false,

      // Advanced AI Tools & Features
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

      // Premium AI Business Services
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

      // AI Automation & Integration
      aiApiIntegrations: false,
      aiWorkflowAutomation: false,
      aiDataPipelines: false,
      aiNotificationSystems: false,
      aiReportGeneration: false,
      aiQualityAssurance: false,
      aiPerformanceMonitoring: false,
      aiSecurityAnalysis: false,
      aiBackupAutomation: false,
      aiSystemOptimization: false,

      // Advanced AI Analytics & Intelligence
      aiRealTimeAnalytics: false,
      aiPredictiveModeling: false,
      aiAnomalyDetection: false,
      aiSentimentAnalysis: false,
      aiBehaviorTracking: false,
      aiTrendForecasting: false,
      aiCompetitiveIntelligence: false,
      aiMarketSignals: false,
      aiCustomerJourney: false,
      aiConversionOptimization: false,

      // AI Communication & Engagement
      aiChatbotDevelopment: false,
      aiVoiceAssistants: false,
      aiContentPersonalization: false,
      aiEmailOptimization: false,
      aiSocialMediaAI: false,
      aiCustomerSegmentation: false,
      aiLeadScoring: false,
      aiCommunicationAI: false,
      aiEngagementTracking: false,
      aiResponseOptimization: false,

      // AI Operations & MLOps
      aiModelDeployment: false,
      aiDataEngineering: false,
      aiMLPipelines: false,
      aiModelMonitoring: false,
      aiVersionControl: false,
      aiScalingInfrastructure: false,
      aiDevOpsIntegration: false,
      aiModelOptimization: false,
      aiA_BTestingAI: false,
      aiContinuousLearning: false,

      // Specialized AI Solutions
      aiDocumentProcessing: false,
      aiImageRecognition: false,
      aiNaturalLanguageProcessing: false,
      aiComputerVision: false,
      aiRoboticProcessAutomation: false,
      aiQuantumComputing: false,
      aiBlockchainAI: false,
      aiIoTIntelligence: false,
      aiEdgeComputing: false,
      aiAugmentedReality: false,

      // AI Innovation & Research
      aiNeuralNetworkDesign: false,
      aiDeepLearningResearch: false,
      aiQuantumEnhancedAI: false,
      aiNeuromorphicComputing: false,
      aiSwarmIntelligence: false,
      aiEvolutionaryAlgorithms: false,
      aiExplainableAI: false,
      aiEthicalAIFrameworks: false,
      aiResearchPartnerships: false,
      aiPatentAssistance: false,

      // AI Governance & Compliance
      aiGovernanceFramework: false,
      aiEthicsBoard: false,
      aiComplianceMonitoring: false,
      aiAuditTrails: false,
      aiRiskManagement: false,
      aiBiasDetection: false,
      aiTransparencyReports: false,
      aiRegulationTracking: false,
      aiDataSovereignty: false,
      aiPrivacyPreservation: false,

      // Autonomous AI Systems
      aiAutonomousAgents: false,
      aiMultiAgentSystems: false,
      aiSelfLearningAgents: false,
      aiAgentOrchestration: false,
      aiAgentCollaboration: false,
      aiAgentGovernance: false,
      aiAgentMonitoring: false,
      aiAgentSecurity: false,
      aiAgentOptimization: false,
      aiAgentDeployment: false,

      // AI Safety & Alignment
      aiSafetyFrameworks: false,
      aiAlignmentResearch: false,
      aiRobustnessTesting: false,
      aiFailSafeMechanisms: false,
      aiHumanOversight: false,
      aiSafetyMonitoring: false,
      aiRiskMitigation: false,
      aiSafetyAuditing: false,
      aiContainmentProtocols: false,
      aiSafetyValidation: false,

      // Next-Generation AI Technologies
      aiNeuromorphicComputing: false,
      aiQuantumBiologicalAI: false,
      aiConsciousnessResearch: false,
      aiSingularityPreparation: false,
      aiHybridIntelligence: false,
      aiDigitalTwins: false,
      aiMetaverseIntegration: false,
      aiHolographicComputing: false,
      aiDNAComputing: false,
      aiPhotonicsAI: false,

      // Biological & Quantum AI Systems
      aiBiologicalDesign: false,
      aiProteinFolding: false,
      aiGeneticOptimization: false,
      aiMolecularSimulation: false,
      aiSyntheticBiology: false,
      aiQuantumBiology: false,
      aiBiocomputing: false,
      aiNanoAssembly: false,
      aiCellularAutomata: false,
      aiEvolutionaryDesign: false,

      // Space & Temporal AI Systems
      aiSpaceComputing: false,
      aiSatelliteAI: false,
      aiTemporalProcessing: false,
      aiTimeSeriesAI: false,
      aiInterdimensionalAI: false,
      aiCosmicDataAnalysis: false,
      aiAstrobiologyAI: false,
      aiPlanetaryAI: false,
      aiGalacticNetworks: false,
      aiUniversalComputing: false,

      // Multimodal & Financial AI Systems
      aiMultimodalFusion: false,
      aiQuantumFinance: false,
      aiMarketPrediction: false,
      aiRiskModeling: false,
      aiAlgorithmicTrading: false,
      aiFinancialForecasting: false,
      aiCryptoAnalysis: false,
      aiPortfolioOptimization: false,
      aiCreativeAI: false,
      aiEmotionalIntelligence: false
    }
  },
  "Growth Tier": {
    id: "growth", 
    name: "Growth Tier",
    description: "Enhanced features for growing businesses",
    monthlyPrice: 29.99,
    annualPrice: 299.99,
    color: "bg-green-500",
    badge: "📈",
    features: [
      "Enhanced directory listing",
      "Business profile with multiple images",
      "Event discounts (10%)",
      "Monthly networking events",
      "Weekly business tips",
      "Basic analytics access",
      "Email marketing support",
      "Social media promotion",
      "AI automation consultation",
      "AI chatbot setup support"
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
      // Directory & Visibility
      enhancedListing: true,
      featuredPlacement: false,
      premiumBadge: false,
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
      mentoringAccess: false,
      legalSupport: false,
      accountingSupport: false,
      hrSupport: false,
      marketingConsultation: true,
      digitalMarketingSupport: true,
      websiteSupport: false,
      seoSupport: false,
      socialMediaSupport: true,
      
      // Marketing & Promotion
      newsletterPromotion: true,
      socialMediaPromotion: true,
      pressReleaseSupport: false,
      mediaKitCreation: false,
      prSupport: false,
      advertisingSupport: false,
      coMarketingOpportunities: false,
      crossPromotion: true,
      eventSponsorship: false,
      brandingSupport: false,
      
      // Training & Development
      businessTraining: true,
      leadershipTraining: false,
      skillsWorkshops: true,
      industryInsights: true,
      marketResearch: false,
      trendReports: false,
      webinars: true,
      onlineResources: true,
      certificatePrograms: false,
      expertSpeakers: false,
      
      // Communication & Support
      prioritySupport: false,
      dedicatedAccountManager: false,
      phoneSupport: false,
      emailSupport: true,
      liveChat: true,
      monthlyNewsletters: true,
      weeklyUpdates: true,
      memberAlerts: true,
      businessReferrals: true,
      leadGeneration: true,
      
      // Digital & Technology
      analyticsAccess: true,
      performanceReports: true,
      dataInsights: false,
      mobileAppAccess: true,
      apiAccess: false,
      integrationSupport: false,
      cloudStorage: false,
      backupServices: false,
      securitySupport: false,
      techSupport: false,
      
      // Financial & Discounts
      eventDiscounts: true,
      serviceDiscounts: true,
      partnerDiscounts: false,
      bulkPurchaseDiscounts: false,
      memberOnlyDeals: true,
      earlyBirdPricing: true,
      freeServices: false,
      creditProgram: false,
      paymentPlans: false,
      invoiceSupport: false,
      
      // Special Access
      memberDirectory: true,
      businessMatchmaking: true,
      partnershipOpportunities: false,
      vendorRecommendations: true,
      supplierNetwork: false,
      buyerNetwork: false,
      investorNetwork: false,
      mentorNetwork: false,
      advisoryBoard: false,
      strategicPlanning: false,

      // AI Support & Services
      basicAiTraining: true,
      aiAutomationConsult: true,
      aiChatbotSupport: true,
      aiContentTools: true,
      aiProcessOptimization: false,
      customAiSolutions: false,
      aiEthicsGuidance: true,
      aiRoiAnalysis: false,
      advancedAiTraining: false,
      aiStrategyConsult: false,
      mlImplementation: false,
      aiSystemIntegration: false,
      dedicatedAiSupport: false,
      aiVendorPartnerships: false,
      customAiModelTraining: false,

      // Advanced AI Tools & Features
      aiToolsAccess: true,
      aiContentGenerator: true,
      aiBusinessAnalytics: true,
      aiChatbotBuilder: true,
      aiProcessAnalyzer: true,
      aiCustomerInsights: false,
      aiMarketingOptimizer: false,
      aiPredictiveAnalytics: false,
      aiAutomationPlatform: false,
      ai24x7Assistant: false,

      // Premium AI Business Services
      aiSalesForecasting: true,
      aiCompetitorAnalysis: true,
      aiMarketResearch: true,
      aiFinancialModeling: false,
      aiRiskAssessment: false,
      aiComplianceMonitoring: false,
      aiWorkforceOptimization: false,
      aiSupplyChainAnalysis: false,
      aiCustomerRetention: true,
      aiRevenueOptimization: false,

      // AI Automation & Integration
      aiApiIntegrations: true,
      aiWorkflowAutomation: true,
      aiDataPipelines: false,
      aiNotificationSystems: true,
      aiReportGeneration: true,
      aiQualityAssurance: false,
      aiPerformanceMonitoring: false,
      aiSecurityAnalysis: false,
      aiBackupAutomation: false,
      aiSystemOptimization: false,

      // Advanced AI Analytics & Intelligence
      aiRealTimeAnalytics: true,
      aiPredictiveModeling: false,
      aiAnomalyDetection: true,
      aiSentimentAnalysis: true,
      aiBehaviorTracking: false,
      aiTrendForecasting: true,
      aiCompetitiveIntelligence: false,
      aiMarketSignals: false,
      aiCustomerJourney: true,
      aiConversionOptimization: false,

      // AI Communication & Engagement
      aiChatbotDevelopment: true,
      aiVoiceAssistants: false,
      aiContentPersonalization: true,
      aiEmailOptimization: true,
      aiSocialMediaAI: false,
      aiCustomerSegmentation: true,
      aiLeadScoring: true,
      aiCommunicationAI: false,
      aiEngagementTracking: true,
      aiResponseOptimization: false,

      // AI Operations & MLOps
      aiModelDeployment: true,
      aiDataEngineering: false,
      aiMLPipelines: false,
      aiModelMonitoring: true,
      aiVersionControl: false,
      aiScalingInfrastructure: false,
      aiDevOpsIntegration: false,
      aiModelOptimization: false,
      aiA_BTestingAI: false,
      aiContinuousLearning: false,

      // Specialized AI Solutions
      aiDocumentProcessing: true,
      aiImageRecognition: true,
      aiNaturalLanguageProcessing: true,
      aiComputerVision: false,
      aiRoboticProcessAutomation: false,
      aiQuantumComputing: false,
      aiBlockchainAI: false,
      aiIoTIntelligence: false,
      aiEdgeComputing: false,
      aiAugmentedReality: false,

      // AI Innovation & Research
      aiNeuralNetworkDesign: true,
      aiDeepLearningResearch: false,
      aiQuantumEnhancedAI: false,
      aiNeuromorphicComputing: false,
      aiSwarmIntelligence: false,
      aiEvolutionaryAlgorithms: false,
      aiExplainableAI: true,
      aiEthicalAIFrameworks: true,
      aiResearchPartnerships: false,
      aiPatentAssistance: false,

      // AI Governance & Compliance
      aiGovernanceFramework: true,
      aiEthicsBoard: false,
      aiComplianceMonitoring: true,
      aiAuditTrails: true,
      aiRiskManagement: true,
      aiBiasDetection: true,
      aiTransparencyReports: false,
      aiRegulationTracking: true,
      aiDataSovereignty: false,
      aiPrivacyPreservation: true,

      // Autonomous AI Systems
      aiAutonomousAgents: true,
      aiMultiAgentSystems: false,
      aiSelfLearningAgents: true,
      aiAgentOrchestration: false,
      aiAgentCollaboration: false,
      aiAgentGovernance: true,
      aiAgentMonitoring: true,
      aiAgentSecurity: true,
      aiAgentOptimization: false,
      aiAgentDeployment: false,

      // AI Safety & Alignment
      aiSafetyFrameworks: true,
      aiAlignmentResearch: false,
      aiRobustnessTesting: true,
      aiFailSafeMechanisms: true,
      aiHumanOversight: true,
      aiSafetyMonitoring: true,
      aiRiskMitigation: true,
      aiSafetyAuditing: false,
      aiContainmentProtocols: false,
      aiSafetyValidation: true
    }
  },
  "Strategic Tier": {
    id: "strategic",
    name: "Strategic Tier", 
    description: "Premium features for established businesses seeking strategic growth",
    monthlyPrice: 59.99,
    annualPrice: 599.99,
    color: "bg-purple-500",
    badge: "🎯",
    features: [
      "Premium directory placement",
      "Featured homepage listing",
      "Priority event booking",
      "Quarterly strategic sessions",
      "Advanced business consultation",
      "Comprehensive marketing support",
      "Legal & HR support access",
      "Advanced analytics & insights",
      "AI process optimization",
      "Custom AI solution development"
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
      // Directory & Visibility
      enhancedListing: true,
      featuredPlacement: true,
      premiumBadge: true,
      searchPriority: true,
      homepageFeature: true,
      logoInDirectory: true,
      multiplePhotos: true,
      videoProfile: true,
      
      // Networking & Events
      networkingEvents: true,
      exclusiveEvents: true,
      vipEventAccess: true,
      eventHosting: false,
      speakingOpportunities: true,
      boardMeetingAccess: false,
      executiveNetworking: false,
      monthlyMeetings: true,
      quarterlyGatherings: true,
      annualConference: true,
      
      // Business Support
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
      
      // Marketing & Promotion
      newsletterPromotion: true,
      socialMediaPromotion: true,
      pressReleaseSupport: true,
      mediaKitCreation: true,
      prSupport: true,
      advertisingSupport: true,
      coMarketingOpportunities: true,
      crossPromotion: true,
      eventSponsorship: false,
      brandingSupport: true,
      
      // Training & Development
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
      
      // Communication & Support
      prioritySupport: true,
      dedicatedAccountManager: false,
      phoneSupport: true,
      emailSupport: true,
      liveChat: true,
      monthlyNewsletters: true,
      weeklyUpdates: true,
      memberAlerts: true,
      businessReferrals: true,
      leadGeneration: true,
      
      // Digital & Technology
      analyticsAccess: true,
      performanceReports: true,
      dataInsights: true,
      mobileAppAccess: true,
      apiAccess: true,
      integrationSupport: true,
      cloudStorage: true,
      backupServices: false,
      securitySupport: true,
      techSupport: true,
      
      // Financial & Discounts
      eventDiscounts: true,
      serviceDiscounts: true,
      partnerDiscounts: true,
      bulkPurchaseDiscounts: true,
      memberOnlyDeals: true,
      earlyBirdPricing: true,
      freeServices: true,
      creditProgram: false,
      paymentPlans: true,
      invoiceSupport: true,
      
      // Special Access
      memberDirectory: true,
      businessMatchmaking: true,
      partnershipOpportunities: true,
      vendorRecommendations: true,
      supplierNetwork: true,
      buyerNetwork: true,
      investorNetwork: false,
      mentorNetwork: true,
      advisoryBoard: false,
      strategicPlanning: true,

      // AI Support & Services
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
      mlImplementation: false,
      aiSystemIntegration: true,
      dedicatedAiSupport: false,
      aiVendorPartnerships: true,
      customAiModelTraining: false,

      // Advanced AI Tools & Features
      aiToolsAccess: true,
      aiContentGenerator: true,
      aiBusinessAnalytics: false,
      aiChatbotBuilder: true,
      aiProcessAnalyzer: false,
      aiCustomerInsights: false,
      aiMarketingOptimizer: false,
      aiPredictiveAnalytics: false,
      aiAutomationPlatform: false,
      ai24x7Assistant: false,

      // Premium AI Business Services
      aiSalesForecasting: true,
      aiCompetitorAnalysis: true,
      aiMarketResearch: true,
      aiFinancialModeling: true,
      aiRiskAssessment: true,
      aiComplianceMonitoring: false,
      aiWorkforceOptimization: true,
      aiSupplyChainAnalysis: false,
      aiCustomerRetention: true,
      aiRevenueOptimization: true,

      // AI Automation & Integration
      aiApiIntegrations: true,
      aiWorkflowAutomation: true,
      aiDataPipelines: true,
      aiNotificationSystems: true,
      aiReportGeneration: true,
      aiQualityAssurance: true,
      aiPerformanceMonitoring: false,
      aiSecurityAnalysis: false,
      aiBackupAutomation: false,
      aiSystemOptimization: false,

      // Advanced AI Analytics & Intelligence
      aiRealTimeAnalytics: true,
      aiPredictiveModeling: true,
      aiAnomalyDetection: true,
      aiSentimentAnalysis: true,
      aiBehaviorTracking: true,
      aiTrendForecasting: true,
      aiCompetitiveIntelligence: true,
      aiMarketSignals: false,
      aiCustomerJourney: true,
      aiConversionOptimization: true,

      // AI Communication & Engagement
      aiChatbotDevelopment: true,
      aiVoiceAssistants: true,
      aiContentPersonalization: true,
      aiEmailOptimization: true,
      aiSocialMediaAI: true,
      aiCustomerSegmentation: true,
      aiLeadScoring: true,
      aiCommunicationAI: true,
      aiEngagementTracking: true,
      aiResponseOptimization: false,

      // AI Operations & MLOps
      aiModelDeployment: true,
      aiDataEngineering: true,
      aiMLPipelines: true,
      aiModelMonitoring: true,
      aiVersionControl: true,
      aiScalingInfrastructure: false,
      aiDevOpsIntegration: true,
      aiModelOptimization: true,
      aiA_BTestingAI: true,
      aiContinuousLearning: false,

      // Specialized AI Solutions
      aiDocumentProcessing: true,
      aiImageRecognition: true,
      aiNaturalLanguageProcessing: true,
      aiComputerVision: true,
      aiRoboticProcessAutomation: true,
      aiQuantumComputing: false,
      aiBlockchainAI: false,
      aiIoTIntelligence: true,
      aiEdgeComputing: false,
      aiAugmentedReality: false,

      // AI Innovation & Research
      aiNeuralNetworkDesign: true,
      aiDeepLearningResearch: true,
      aiQuantumEnhancedAI: true,
      aiNeuromorphicComputing: false,
      aiSwarmIntelligence: true,
      aiEvolutionaryAlgorithms: true,
      aiExplainableAI: true,
      aiEthicalAIFrameworks: true,
      aiResearchPartnerships: true,
      aiPatentAssistance: false,

      // AI Governance & Compliance
      aiGovernanceFramework: true,
      aiEthicsBoard: true,
      aiComplianceMonitoring: true,
      aiAuditTrails: true,
      aiRiskManagement: true,
      aiBiasDetection: true,
      aiTransparencyReports: true,
      aiRegulationTracking: true,
      aiDataSovereignty: true,
      aiPrivacyPreservation: true,

      // Autonomous AI Systems
      aiAutonomousAgents: true,
      aiMultiAgentSystems: true,
      aiSelfLearningAgents: true,
      aiAgentOrchestration: true,
      aiAgentCollaboration: true,
      aiAgentGovernance: true,
      aiAgentMonitoring: true,
      aiAgentSecurity: true,
      aiAgentOptimization: false,
      aiAgentDeployment: true,

      // AI Safety & Alignment
      aiSafetyFrameworks: true,
      aiAlignmentResearch: true,
      aiRobustnessTesting: true,
      aiFailSafeMechanisms: true,
      aiHumanOversight: true,
      aiSafetyMonitoring: true,
      aiRiskMitigation: true,
      aiSafetyAuditing: true,
      aiContainmentProtocols: false,
      aiSafetyValidation: true,

      // Next-Generation AI Technologies
      aiNeuromorphicComputing: true,
      aiQuantumBiologicalAI: true,
      aiConsciousnessResearch: false,
      aiSingularityPreparation: false,
      aiHybridIntelligence: true,
      aiDigitalTwins: true,
      aiMetaverseIntegration: true,
      aiHolographicComputing: false,
      aiDNAComputing: false,
      aiPhotonicsAI: true,

      // Biological & Quantum AI Systems
      aiBiologicalDesign: true,
      aiProteinFolding: true,
      aiGeneticOptimization: false,
      aiMolecularSimulation: true,
      aiSyntheticBiology: true,
      aiQuantumBiology: false,
      aiBiocomputing: true,
      aiNanoAssembly: false,
      aiCellularAutomata: true,
      aiEvolutionaryDesign: true,

      // Space & Temporal AI Systems
      aiSpaceComputing: true,
      aiSatelliteAI: true,
      aiTemporalProcessing: true,
      aiTimeSeriesAI: true,
      aiInterdimensionalAI: false,
      aiCosmicDataAnalysis: true,
      aiAstrobiologyAI: true,
      aiPlanetaryAI: true,
      aiGalacticNetworks: false,
      aiUniversalComputing: false,

      // Multimodal & Financial AI Systems
      aiMultimodalFusion: true,
      aiQuantumFinance: true,
      aiMarketPrediction: true,
      aiRiskModeling: true,
      aiAlgorithmicTrading: true,
      aiFinancialForecasting: true,
      aiCryptoAnalysis: true,
      aiPortfolioOptimization: true,
      aiCreativeAI: true,
      aiEmotionalIntelligence: true
    }
  },
  "Patron Tier": {
    id: "patron",
    name: "Patron Tier",
    description: "Exclusive access and premium benefits for influential business leaders",
    monthlyPrice: 99.99,
    annualPrice: 999.99,
    color: "bg-orange-500",
    badge: "👑",
    features: [
      "Featured directory listings with priority placement",
      "Event hosting opportunities and sponsorship",
      "Speaking opportunities at major events", 
      "Exclusive patron-only networking events",
      "Personal business mentoring access",
      "Full PR and media support package",
      "Dedicated account manager",
      "Board meeting observer access",
      "AI strategy consultation",
      "Machine learning implementation"
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
      // Directory & Visibility
      enhancedListing: true,
      featuredPlacement: true,
      premiumBadge: true,
      searchPriority: true,
      homepageFeature: true,
      logoInDirectory: true,
      multiplePhotos: true,
      videoProfile: true,
      
      // Networking & Events
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
      
      // Business Support
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
      
      // Marketing & Promotion
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
      
      // Training & Development
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
      
      // Communication & Support
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
      
      // Digital & Technology
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
      
      // Financial & Discounts
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
      
      // Special Access
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

      // AI Support & Services
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
      customAiModelTraining: false,

      // Advanced AI Tools & Features
      aiToolsAccess: true,
      aiContentGenerator: true,
      aiBusinessAnalytics: true,
      aiChatbotBuilder: true,
      aiProcessAnalyzer: true,
      aiCustomerInsights: false,
      aiMarketingOptimizer: true,
      aiPredictiveAnalytics: true,
      aiAutomationPlatform: false,
      ai24x7Assistant: false,

      // Premium AI Business Services
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

      // AI Automation & Integration
      aiApiIntegrations: true,
      aiWorkflowAutomation: true,
      aiDataPipelines: true,
      aiNotificationSystems: true,
      aiReportGeneration: true,
      aiQualityAssurance: true,
      aiPerformanceMonitoring: true,
      aiSecurityAnalysis: true,
      aiBackupAutomation: true,
      aiSystemOptimization: true
    }
  },
  "Partner": {
    id: "partner",
    name: "Partner",
    description: "Ultimate strategic partnership with full organizational benefits and influence",
    monthlyPrice: 199.99,
    annualPrice: 1999.99,
    color: "bg-amber-500",
    badge: "🤝",
    features: [
      "Top-tier directory prominence and branding",
      "Co-branded event opportunities and sponsorship",
      "Full board meeting participation rights",
      "Strategic planning and decision input",
      "Executive and VIP networking access",
      "Complete marketing partnership program",
      "White-label co-marketing opportunities",
      "Organization spokesperson opportunities",
      "Dedicated AI support specialist",
      "Custom AI model training"
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
      // Directory & Visibility
      enhancedListing: true,
      featuredPlacement: true,
      premiumBadge: true,
      searchPriority: true,
      homepageFeature: true,
      logoInDirectory: true,
      multiplePhotos: true,
      videoProfile: true,
      
      // Networking & Events
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
      
      // Business Support
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
      
      // Marketing & Promotion
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
      
      // Training & Development
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
      
      // Communication & Support
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
      
      // Digital & Technology
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
      
      // Financial & Discounts
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
      
      // Special Access
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

      // AI Support & Services
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
      customAiModelTraining: true,

      // Advanced AI Tools & Features
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

      // Premium AI Business Services
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

      // AI Automation & Integration
      aiApiIntegrations: true,
      aiWorkflowAutomation: true,
      aiDataPipelines: true,
      aiNotificationSystems: true,
      aiReportGeneration: true,
      aiQualityAssurance: true,
      aiPerformanceMonitoring: true,
      aiSecurityAnalysis: true,
      aiBackupAutomation: true,
      aiSystemOptimization: true,

      // Advanced AI Analytics & Intelligence
      aiRealTimeAnalytics: true,
      aiPredictiveModeling: true,
      aiAnomalyDetection: true,
      aiSentimentAnalysis: true,
      aiBehaviorTracking: true,
      aiTrendForecasting: true,
      aiCompetitiveIntelligence: true,
      aiMarketSignals: true,
      aiCustomerJourney: true,
      aiConversionOptimization: true,

      // AI Communication & Engagement
      aiChatbotDevelopment: true,
      aiVoiceAssistants: true,
      aiContentPersonalization: true,
      aiEmailOptimization: true,
      aiSocialMediaAI: true,
      aiCustomerSegmentation: true,
      aiLeadScoring: true,
      aiCommunicationAI: true,
      aiEngagementTracking: true,
      aiResponseOptimization: true,

      // AI Operations & MLOps
      aiModelDeployment: true,
      aiDataEngineering: true,
      aiMLPipelines: true,
      aiModelMonitoring: true,
      aiVersionControl: true,
      aiScalingInfrastructure: true,
      aiDevOpsIntegration: true,
      aiModelOptimization: true,
      aiA_BTestingAI: true,
      aiContinuousLearning: true,

      // Specialized AI Solutions
      aiDocumentProcessing: true,
      aiImageRecognition: true,
      aiNaturalLanguageProcessing: true,
      aiComputerVision: true,
      aiRoboticProcessAutomation: true,
      aiQuantumComputing: true,
      aiBlockchainAI: true,
      aiIoTIntelligence: true,
      aiEdgeComputing: true,
      aiAugmentedReality: true,

      // AI Innovation & Research
      aiNeuralNetworkDesign: true,
      aiDeepLearningResearch: true,
      aiQuantumEnhancedAI: true,
      aiNeuromorphicComputing: true,
      aiSwarmIntelligence: true,
      aiEvolutionaryAlgorithms: true,
      aiExplainableAI: true,
      aiEthicalAIFrameworks: true,
      aiResearchPartnerships: true,
      aiPatentAssistance: true,

      // AI Governance & Compliance
      aiGovernanceFramework: true,
      aiEthicsBoard: true,
      aiComplianceMonitoring: true,
      aiAuditTrails: true,
      aiRiskManagement: true,
      aiBiasDetection: true,
      aiTransparencyReports: true,
      aiRegulationTracking: true,
      aiDataSovereignty: true,
      aiPrivacyPreservation: true,

      // Autonomous AI Systems
      aiAutonomousAgents: true,
      aiMultiAgentSystems: true,
      aiSelfLearningAgents: true,
      aiAgentOrchestration: true,
      aiAgentCollaboration: true,
      aiAgentGovernance: true,
      aiAgentMonitoring: true,
      aiAgentSecurity: true,
      aiAgentOptimization: true,
      aiAgentDeployment: true,

      // AI Safety & Alignment
      aiSafetyFrameworks: true,
      aiAlignmentResearch: true,
      aiRobustnessTesting: true,
      aiFailSafeMechanisms: true,
      aiHumanOversight: true,
      aiSafetyMonitoring: true,
      aiRiskMitigation: true,
      aiSafetyAuditing: true,
      aiContainmentProtocols: true,
      aiSafetyValidation: true,

      // Next-Generation AI Technologies
      aiNeuromorphicComputing: true,
      aiQuantumBiologicalAI: true,
      aiConsciousnessResearch: true,
      aiSingularityPreparation: true,
      aiHybridIntelligence: true,
      aiDigitalTwins: true,
      aiMetaverseIntegration: true,
      aiHolographicComputing: true,
      aiDNAComputing: true,
      aiPhotonicsAI: true,

      // Biological & Quantum AI Systems
      aiBiologicalDesign: true,
      aiProteinFolding: true,
      aiGeneticOptimization: true,
      aiMolecularSimulation: true,
      aiSyntheticBiology: true,
      aiQuantumBiology: true,
      aiBiocomputing: true,
      aiNanoAssembly: true,
      aiCellularAutomata: true,
      aiEvolutionaryDesign: true,

      // Space & Temporal AI Systems
      aiSpaceComputing: true,
      aiSatelliteAI: true,
      aiTemporalProcessing: true,
      aiTimeSeriesAI: true,
      aiInterdimensionalAI: true,
      aiCosmicDataAnalysis: true,
      aiAstrobiologyAI: true,
      aiPlanetaryAI: true,
      aiGalacticNetworks: true,
      aiUniversalComputing: true,

      // Multimodal & Financial AI Systems
      aiMultimodalFusion: true,
      aiQuantumFinance: true,
      aiMarketPrediction: true,
      aiRiskModeling: true,
      aiAlgorithmicTrading: true,
      aiFinancialForecasting: true,
      aiCryptoAnalysis: true,
      aiPortfolioOptimization: true,
      aiCreativeAI: true,
      aiEmotionalIntelligence: true
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