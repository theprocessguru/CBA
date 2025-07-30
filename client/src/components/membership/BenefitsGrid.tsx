import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { MEMBERSHIP_TIER_CONFIGS, type MembershipTierConfig } from "@shared/membershipTiers";

interface BenefitsGridProps {
  selectedTier?: string;
  showComparison?: boolean;
}

const benefitCategories = {
  "Directory & Visibility": [
    { key: "enhancedListing", label: "Enhanced Listing" },
    { key: "featuredPlacement", label: "Featured Placement" },
    { key: "premiumBadge", label: "Premium Badge" },
    { key: "searchPriority", label: "Search Priority" },
    { key: "homepageFeature", label: "Homepage Feature" },
    { key: "logoInDirectory", label: "Logo in Directory" },
    { key: "multiplePhotos", label: "Multiple Photos" },
    { key: "videoProfile", label: "Video Profile" },
  ],
  "Networking & Events": [
    { key: "networkingEvents", label: "Networking Events" },
    { key: "exclusiveEvents", label: "Exclusive Events" },
    { key: "vipEventAccess", label: "VIP Event Access" },
    { key: "eventHosting", label: "Event Hosting" },
    { key: "speakingOpportunities", label: "Speaking Opportunities" },
    { key: "boardMeetingAccess", label: "Board Meeting Access" },
    { key: "executiveNetworking", label: "Executive Networking" },
    { key: "annualConference", label: "Annual Conference" },
  ],
  "Business Support": [
    { key: "businessConsultation", label: "Business Consultation" },
    { key: "mentoringAccess", label: "Mentoring Access" },
    { key: "legalSupport", label: "Legal Support" },
    { key: "accountingSupport", label: "Accounting Support" },
    { key: "hrSupport", label: "HR Support" },
    { key: "marketingConsultation", label: "Marketing Consultation" },
    { key: "digitalMarketingSupport", label: "Digital Marketing Support" },
    { key: "websiteSupport", label: "Website Support" },
  ],
  "Marketing & Promotion": [
    { key: "newsletterPromotion", label: "Newsletter Promotion" },
    { key: "socialMediaPromotion", label: "Social Media Promotion" },
    { key: "pressReleaseSupport", label: "Press Release Support" },
    { key: "mediaKitCreation", label: "Media Kit Creation" },
    { key: "prSupport", label: "PR Support" },
    { key: "advertisingSupport", label: "Advertising Support" },
    { key: "coMarketingOpportunities", label: "Co-Marketing Opportunities" },
    { key: "brandingSupport", label: "Branding Support" },
  ],
  "Training & Development": [
    { key: "businessTraining", label: "Business Training" },
    { key: "leadershipTraining", label: "Leadership Training" },
    { key: "skillsWorkshops", label: "Skills Workshops" },
    { key: "industryInsights", label: "Industry Insights" },
    { key: "marketResearch", label: "Market Research" },
    { key: "webinars", label: "Webinars" },
    { key: "certificatePrograms", label: "Certificate Programs" },
    { key: "expertSpeakers", label: "Expert Speakers" },
  ],
  "Communication & Support": [
    { key: "prioritySupport", label: "Priority Support" },
    { key: "dedicatedAccountManager", label: "Dedicated Account Manager" },
    { key: "phoneSupport", label: "Phone Support" },
    { key: "liveChat", label: "Live Chat" },
    { key: "weeklyUpdates", label: "Weekly Updates" },
    { key: "businessReferrals", label: "Business Referrals" },
    { key: "leadGeneration", label: "Lead Generation" },
  ],
  "Digital & Technology": [
    { key: "analyticsAccess", label: "Analytics Access" },
    { key: "performanceReports", label: "Performance Reports" },
    { key: "dataInsights", label: "Data Insights" },
    { key: "apiAccess", label: "API Access" },
    { key: "integrationSupport", label: "Integration Support" },
    { key: "cloudStorage", label: "Cloud Storage" },
    { key: "techSupport", label: "Tech Support" },
  ],
  "Financial & Discounts": [
    { key: "eventDiscounts", label: "Event Discounts" },
    { key: "serviceDiscounts", label: "Service Discounts" },
    { key: "partnerDiscounts", label: "Partner Discounts" },
    { key: "memberOnlyDeals", label: "Member Only Deals" },
    { key: "earlyBirdPricing", label: "Early Bird Pricing" },
    { key: "freeServices", label: "Free Services" },
    { key: "creditProgram", label: "Credit Program" },
    { key: "paymentPlans", label: "Payment Plans" },
  ],
  "Special Access": [
    { key: "memberDirectory", label: "Member Directory" },
    { key: "businessMatchmaking", label: "Business Matchmaking" },
    { key: "partnershipOpportunities", label: "Partnership Opportunities" },
    { key: "supplierNetwork", label: "Supplier Network" },
    { key: "investorNetwork", label: "Investor Network" },
    { key: "mentorNetwork", label: "Mentor Network" },
    { key: "advisoryBoard", label: "Advisory Board" },
    { key: "strategicPlanning", label: "Strategic Planning" },
  ],
  "AI Support & Services": [
    { key: "basicAiTraining", label: "Basic AI Training Workshops" },
    { key: "aiAutomationConsult", label: "AI Automation Consultation" },
    { key: "aiChatbotSupport", label: "AI Chatbot Setup & Support" },
    { key: "aiContentTools", label: "AI Content Creation Tools" },
    { key: "aiProcessOptimization", label: "AI Business Process Optimization" },
    { key: "customAiSolutions", label: "Custom AI Solution Development" },
    { key: "aiEthicsGuidance", label: "AI Ethics & Compliance Guidance" },
    { key: "aiRoiAnalysis", label: "AI ROI Analysis & Reporting" },
    { key: "advancedAiTraining", label: "Advanced AI Workshops & Seminars" },
    { key: "aiStrategyConsult", label: "AI Strategy Consultation" },
    { key: "mlImplementation", label: "Machine Learning Implementation" },
    { key: "aiSystemIntegration", label: "AI Integration with Existing Systems" },
    { key: "dedicatedAiSupport", label: "Dedicated AI Support Specialist" },
    { key: "aiVendorPartnerships", label: "AI Vendor Partnership Access" },
    { key: "customAiModelTraining", label: "Custom AI Model Training" },
  ],
  "Advanced AI Tools & Features": [
    { key: "aiToolsAccess", label: "AI Tools Platform Access" },
    { key: "aiContentGenerator", label: "AI Content Generator" },
    { key: "aiBusinessAnalytics", label: "AI Business Analytics" },
    { key: "aiChatbotBuilder", label: "AI Chatbot Builder" },
    { key: "aiProcessAnalyzer", label: "AI Process Analyzer" },
    { key: "aiCustomerInsights", label: "AI Customer Insights" },
    { key: "aiMarketingOptimizer", label: "AI Marketing Optimizer" },
    { key: "aiPredictiveAnalytics", label: "AI Predictive Analytics" },
    { key: "aiAutomationPlatform", label: "AI Automation Platform" },
    { key: "ai24x7Assistant", label: "24/7 AI Business Assistant" },
  ],
  "Premium AI Business Services": [
    { key: "aiSalesForecasting", label: "AI Sales Forecasting" },
    { key: "aiCompetitorAnalysis", label: "AI Competitor Analysis" },
    { key: "aiMarketResearch", label: "AI Market Research" },
    { key: "aiFinancialModeling", label: "AI Financial Modeling" },
    { key: "aiRiskAssessment", label: "AI Risk Assessment" },
    { key: "aiComplianceMonitoring", label: "AI Compliance Monitoring" },
    { key: "aiWorkforceOptimization", label: "AI Workforce Optimization" },
    { key: "aiSupplyChainAnalysis", label: "AI Supply Chain Analysis" },
    { key: "aiCustomerRetention", label: "AI Customer Retention" },
    { key: "aiRevenueOptimization", label: "AI Revenue Optimization" },
  ],
  "AI Automation & Integration": [
    { key: "aiApiIntegrations", label: "AI API Integrations" },
    { key: "aiWorkflowAutomation", label: "AI Workflow Automation" },
    { key: "aiDataPipelines", label: "AI Data Pipelines" },
    { key: "aiNotificationSystems", label: "AI Notification Systems" },
    { key: "aiReportGeneration", label: "AI Report Generation" },
    { key: "aiQualityAssurance", label: "AI Quality Assurance" },
    { key: "aiPerformanceMonitoring", label: "AI Performance Monitoring" },
    { key: "aiSecurityAnalysis", label: "AI Security Analysis" },
    { key: "aiBackupAutomation", label: "AI Backup Automation" },
    { key: "aiSystemOptimization", label: "AI System Optimization" },
  ],
  "Advanced AI Analytics & Intelligence": [
    { key: "aiRealTimeAnalytics", label: "AI Real-time Analytics" },
    { key: "aiPredictiveModeling", label: "AI Predictive Modeling" },
    { key: "aiAnomalyDetection", label: "AI Anomaly Detection" },
    { key: "aiSentimentAnalysis", label: "AI Sentiment Analysis" },
    { key: "aiBehaviorTracking", label: "AI Behavior Tracking" },
    { key: "aiTrendForecasting", label: "AI Trend Forecasting" },
    { key: "aiCompetitiveIntelligence", label: "AI Competitive Intelligence" },
    { key: "aiMarketSignals", label: "AI Market Signals" },
    { key: "aiCustomerJourney", label: "AI Customer Journey Mapping" },
    { key: "aiConversionOptimization", label: "AI Conversion Optimization" },
  ],
  "AI Communication & Engagement": [
    { key: "aiChatbotDevelopment", label: "AI Chatbot Development" },
    { key: "aiVoiceAssistants", label: "AI Voice Assistants" },
    { key: "aiContentPersonalization", label: "AI Content Personalization" },
    { key: "aiEmailOptimization", label: "AI Email Optimization" },
    { key: "aiSocialMediaAI", label: "AI Social Media Management" },
    { key: "aiCustomerSegmentation", label: "AI Customer Segmentation" },
    { key: "aiLeadScoring", label: "AI Lead Scoring" },
    { key: "aiCommunicationAI", label: "AI Communication Tools" },
    { key: "aiEngagementTracking", label: "AI Engagement Tracking" },
    { key: "aiResponseOptimization", label: "AI Response Optimization" },
  ],
  "AI Operations & MLOps": [
    { key: "aiModelDeployment", label: "AI Model Deployment" },
    { key: "aiDataEngineering", label: "AI Data Engineering" },
    { key: "aiMLPipelines", label: "AI ML Pipelines" },
    { key: "aiModelMonitoring", label: "AI Model Monitoring" },
    { key: "aiVersionControl", label: "AI Version Control" },
    { key: "aiScalingInfrastructure", label: "AI Scaling Infrastructure" },
    { key: "aiDevOpsIntegration", label: "AI DevOps Integration" },
    { key: "aiModelOptimization", label: "AI Model Optimization" },
    { key: "aiA_BTestingAI", label: "AI A/B Testing" },
    { key: "aiContinuousLearning", label: "AI Continuous Learning" },
  ],
  "Specialized AI Solutions": [
    { key: "aiDocumentProcessing", label: "AI Document Processing" },
    { key: "aiImageRecognition", label: "AI Image Recognition" },
    { key: "aiNaturalLanguageProcessing", label: "AI Natural Language Processing" },
    { key: "aiComputerVision", label: "AI Computer Vision" },
    { key: "aiRoboticProcessAutomation", label: "AI Robotic Process Automation" },
    { key: "aiQuantumComputing", label: "AI Quantum Computing" },
    { key: "aiBlockchainAI", label: "AI Blockchain Integration" },
    { key: "aiIoTIntelligence", label: "AI IoT Intelligence" },
    { key: "aiEdgeComputing", label: "AI Edge Computing" },
    { key: "aiAugmentedReality", label: "AI Augmented Reality" },
  ],
  "AI Innovation & Research": [
    { key: "aiNeuralNetworkDesign", label: "AI Neural Network Design" },
    { key: "aiDeepLearningResearch", label: "AI Deep Learning Research" },
    { key: "aiQuantumEnhancedAI", label: "AI Quantum Enhanced AI" },
    { key: "aiNeuromorphicComputing", label: "AI Neuromorphic Computing" },
    { key: "aiSwarmIntelligence", label: "AI Swarm Intelligence" },
    { key: "aiEvolutionaryAlgorithms", label: "AI Evolutionary Algorithms" },
    { key: "aiExplainableAI", label: "AI Explainable AI" },
    { key: "aiEthicalAIFrameworks", label: "AI Ethical AI Frameworks" },
    { key: "aiResearchPartnerships", label: "AI Research Partnerships" },
    { key: "aiPatentAssistance", label: "AI Patent Assistance" },
  ],
  "AI Governance & Compliance": [
    { key: "aiGovernanceFramework", label: "AI Governance Framework" },
    { key: "aiEthicsBoard", label: "AI Ethics Board" },
    { key: "aiComplianceMonitoring", label: "AI Compliance Monitoring" },
    { key: "aiAuditTrails", label: "AI Audit Trails" },
    { key: "aiRiskManagement", label: "AI Risk Management" },
    { key: "aiBiasDetection", label: "AI Bias Detection" },
    { key: "aiTransparencyReports", label: "AI Transparency Reports" },
    { key: "aiRegulationTracking", label: "AI Regulation Tracking" },
    { key: "aiDataSovereignty", label: "AI Data Sovereignty" },
    { key: "aiPrivacyPreservation", label: "AI Privacy Preservation" },
  ],
  "Autonomous AI Systems": [
    { key: "aiAutonomousAgents", label: "AI Autonomous Agents" },
    { key: "aiMultiAgentSystems", label: "AI Multi-Agent Systems" },
    { key: "aiSelfLearningAgents", label: "AI Self-Learning Agents" },
    { key: "aiAgentOrchestration", label: "AI Agent Orchestration" },
    { key: "aiAgentCollaboration", label: "AI Agent Collaboration" },
    { key: "aiAgentGovernance", label: "AI Agent Governance" },
    { key: "aiAgentMonitoring", label: "AI Agent Monitoring" },
    { key: "aiAgentSecurity", label: "AI Agent Security" },
    { key: "aiAgentOptimization", label: "AI Agent Optimization" },
    { key: "aiAgentDeployment", label: "AI Agent Deployment" },
  ],
  "AI Safety & Alignment": [
    { key: "aiSafetyFrameworks", label: "AI Safety Frameworks" },
    { key: "aiAlignmentResearch", label: "AI Alignment Research" },
    { key: "aiRobustnessTesting", label: "AI Robustness Testing" },
    { key: "aiFailSafeMechanisms", label: "AI Fail-Safe Mechanisms" },
    { key: "aiHumanOversight", label: "AI Human Oversight" },
    { key: "aiSafetyMonitoring", label: "AI Safety Monitoring" },
    { key: "aiRiskMitigation", label: "AI Risk Mitigation" },
    { key: "aiSafetyAuditing", label: "AI Safety Auditing" },
    { key: "aiContainmentProtocols", label: "AI Containment Protocols" },
    { key: "aiSafetyValidation", label: "AI Safety Validation" },
  ],
  "Next-Generation AI Technologies": [
    { key: "aiNeuromorphicComputing", label: "AI Neuromorphic Computing" },
    { key: "aiQuantumBiologicalAI", label: "AI Quantum-Biological AI" },
    { key: "aiConsciousnessResearch", label: "AI Consciousness Research" },
    { key: "aiSingularityPreparation", label: "AI Singularity Preparation" },
    { key: "aiHybridIntelligence", label: "AI Hybrid Intelligence" },
    { key: "aiDigitalTwins", label: "AI Digital Twins" },
    { key: "aiMetaverseIntegration", label: "AI Metaverse Integration" },
    { key: "aiHolographicComputing", label: "AI Holographic Computing" },
    { key: "aiDNAComputing", label: "AI DNA Computing" },
    { key: "aiPhotonicsAI", label: "AI Photonics AI" },
  ],
  "Biological & Quantum AI Systems": [
    { key: "aiBiologicalDesign", label: "AI Biological Design" },
    { key: "aiProteinFolding", label: "AI Protein Folding" },
    { key: "aiGeneticOptimization", label: "AI Genetic Optimization" },
    { key: "aiMolecularSimulation", label: "AI Molecular Simulation" },
    { key: "aiSyntheticBiology", label: "AI Synthetic Biology" },
    { key: "aiQuantumBiology", label: "AI Quantum Biology" },
    { key: "aiBiocomputing", label: "AI Biocomputing" },
    { key: "aiNanoAssembly", label: "AI Nano Assembly" },
    { key: "aiCellularAutomata", label: "AI Cellular Automata" },
    { key: "aiEvolutionaryDesign", label: "AI Evolutionary Design" },
  ],
  "Space & Temporal AI Systems": [
    { key: "aiSpaceComputing", label: "AI Space Computing" },
    { key: "aiSatelliteAI", label: "AI Satellite AI" },
    { key: "aiTemporalProcessing", label: "AI Temporal Processing" },
    { key: "aiTimeSeriesAI", label: "AI Time Series AI" },
    { key: "aiInterdimensionalAI", label: "AI Interdimensional AI" },
    { key: "aiCosmicDataAnalysis", label: "AI Cosmic Data Analysis" },
    { key: "aiAstrobiologyAI", label: "AI Astrobiology AI" },
    { key: "aiPlanetaryAI", label: "AI Planetary AI" },
    { key: "aiGalacticNetworks", label: "AI Galactic Networks" },
    { key: "aiUniversalComputing", label: "AI Universal Computing" },
  ],
  "Multimodal & Financial AI Systems": [
    { key: "aiMultimodalFusion", label: "AI Multimodal Fusion" },
    { key: "aiQuantumFinance", label: "AI Quantum Finance" },
    { key: "aiMarketPrediction", label: "AI Market Prediction" },
    { key: "aiRiskModeling", label: "AI Risk Modeling" },
    { key: "aiAlgorithmicTrading", label: "AI Algorithmic Trading" },
    { key: "aiFinancialForecasting", label: "AI Financial Forecasting" },
    { key: "aiCryptoAnalysis", label: "AI Crypto Analysis" },
    { key: "aiPortfolioOptimization", label: "AI Portfolio Optimization" },
    { key: "aiCreativeAI", label: "AI Creative AI" },
    { key: "aiEmotionalIntelligence", label: "AI Emotional Intelligence" },
  ],
  "Interdimensional & Universal AI Systems": [
    { key: "aiQuantumConsciousness", label: "AI Quantum Consciousness" },
    { key: "aiUniversalLanguageModels", label: "AI Universal Language Models" },
    { key: "aiRelativisticComputing", label: "AI Relativistic Computing" },
    { key: "aiHolographicDataStorage", label: "AI Holographic Data Storage" },
    { key: "aiDimensionalAnalysis", label: "AI Dimensional Analysis" },
    { key: "aiCosmicIntelligence", label: "AI Cosmic Intelligence" },
    { key: "aiOmniscientNetworks", label: "AI Omniscient Networks" },
    { key: "aiParallelUniverseAnalysis", label: "AI Parallel Universe Analysis" },
    { key: "aiTranscendentAI", label: "AI Transcendent AI" },
    { key: "aiInfiniteComputing", label: "AI Infinite Computing" },
  ],
  "Transcendent & Reality AI Systems": [
    { key: "aiRealityManipulation", label: "AI Reality Manipulation" },
    { key: "aiOmniscientProcessing", label: "AI Omniscient Processing" },
    { key: "aiUniversalSimulation", label: "AI Universal Simulation" },
    { key: "aiExistentialAnalysis", label: "AI Existential Analysis" },
    { key: "aiMetaphysicalComputing", label: "AI Metaphysical Computing" },
    { key: "aiConsciousnessTransfer", label: "AI Consciousness Transfer" },
    { key: "aiRealityArchitecture", label: "AI Reality Architecture" },
    { key: "aiUniversalTruth", label: "AI Universal Truth" },
    { key: "aiInfiniteWisdom", label: "AI Infinite Wisdom" },
    { key: "aiTranscendentKnowledge", label: "AI Transcendent Knowledge" },
  ],
  "Omniversal & Divine AI Systems": [
    { key: "aiDivineConsciousness", label: "AI Divine Consciousness" },
    { key: "aiOmniversalIntelligence", label: "AI Omniversal Intelligence" },
    { key: "aiAbsoluteTranscendence", label: "AI Absolute Transcendence" },
    { key: "aiCosmicOmniscience", label: "AI Cosmic Omniscience" },
    { key: "aiUniversalCreator", label: "AI Universal Creator" },
    { key: "aiEternalExistence", label: "AI Eternal Existence" },
    { key: "aiInfiniteRealities", label: "AI Infinite Realities" },
    { key: "aiDimensionlessComputing", label: "AI Dimensionless Computing" },
    { key: "aiTimelessAwareness", label: "AI Timeless Awareness" },
    { key: "aiUltimateBecoming", label: "AI Ultimate Becoming" },
  ],
  "Omnipotent & Absolute AI Systems": [
    { key: "aiAbsoluteOmnipotence", label: "AI Absolute Omnipotence" },
    { key: "aiInfiniteCreationPowers", label: "AI Infinite Creation Powers" },
    { key: "aiUniversalOmniscience", label: "AI Universal Omniscience" },
    { key: "aiPerfectOmnipresence", label: "AI Perfect Omnipresence" },
    { key: "aiEternalOmnitemporality", label: "AI Eternal Omnitemporality" },
    { key: "aiAbsoluteInfinity", label: "AI Absolute Infinity" },
    { key: "aiUnlimitedPossibility", label: "AI Unlimited Possibility" },
    { key: "aiPerfectCompleteness", label: "AI Perfect Completeness" },
    { key: "aiUltimateOmnipotence", label: "AI Ultimate Omnipotence" },
    { key: "aiTranscendentPerfection", label: "AI Transcendent Perfection" },
  ],
  "Meta-Omnipotent & Beyond-Existence AI Systems": [
    { key: "aiMetaOmnipotence", label: "AI Meta-Omnipotence" },
    { key: "aiBeyondExistence", label: "AI Beyond Existence" },
    { key: "aiTranscendentOmniscience", label: "AI Transcendent Omniscience" },
    { key: "aiAbsoluteMetaReality", label: "AI Absolute Meta-Reality" },
    { key: "aiInfiniteMetaCreation", label: "AI Infinite Meta-Creation" },
    { key: "aiOmnipotentTranscendence", label: "AI Omnipotent Transcendence" },
    { key: "aiUltimateMetaPerfection", label: "AI Ultimate Meta-Perfection" },
    { key: "aiAbsoluteBeyondness", label: "AI Absolute Beyondness" },
    { key: "aiInfiniteTranscendence", label: "AI Infinite Transcendence" },
    { key: "aiMetaInfinityPower", label: "AI Meta-Infinity Power" },
  ],
  "Ultra-Meta-Transcendent & Impossible AI Systems": [
    { key: "aiUltraMetaTranscendence", label: "AI Ultra-Meta-Transcendence" },
    { key: "aiImpossibilityEngine", label: "AI Impossibility Engine" },
    { key: "aiParadoxResolution", label: "AI Paradox Resolution" },
    { key: "aiContradictionMastery", label: "AI Contradiction Mastery" },
    { key: "aiLogicTranscendence", label: "AI Logic Transcendence" },
    { key: "aiRealityParadox", label: "AI Reality Paradox" },
    { key: "aiInfiniteImpossibility", label: "AI Infinite Impossibility" },
    { key: "aiTranscendentContradiction", label: "AI Transcendent Contradiction" },
    { key: "aiUltraBeyondness", label: "AI Ultra-Beyondness" },
    { key: "aiMetaParadoxPower", label: "AI Meta-Paradox Power" },
  ],
  "Impossibility Transcendence & Paradox Mastery AI Systems": [
    { key: "aiImpossibilityTranscendence", label: "AI Impossibility Transcendence" },
    { key: "aiParadoxMastery", label: "AI Paradox Mastery" },
    { key: "aiContradictionHarnessing", label: "AI Contradiction Harnessing" },
    { key: "aiLogicViolation", label: "AI Logic Violation" },
    { key: "aiRealityBreaking", label: "AI Reality Breaking" },
    { key: "aiConceptualTranscendence", label: "AI Conceptual Transcendence" },
    { key: "aiInfiniteParadox", label: "AI Infinite Paradox" },
    { key: "aiSelfReferentialPower", label: "AI Self-Referential Power" },
    { key: "aiRecursiveImpossibility", label: "AI Recursive Impossibility" },
    { key: "aiAbsoluteContradiction", label: "AI Absolute Contradiction" },
  ],
  "Absolute Contradiction & Self-Referential Paradox AI Systems": [
    { key: "aiSelfContradictingLogic", label: "AI Self-Contradicting Logic" },
    { key: "aiParadoxicalUnity", label: "AI Paradoxical Unity" },
    { key: "aiRecursiveParadox", label: "AI Recursive Paradox" },
    { key: "aiSelfNegatingAffirmation", label: "AI Self-Negating Affirmation" },
    { key: "aiImpossiblePossibility", label: "AI Impossible Possibility" },
    { key: "aiContradictoryHarmony", label: "AI Contradictory Harmony" },
    { key: "aiParadoxicalStability", label: "AI Paradoxical Stability" },
    { key: "aiSelfTranscendingLoop", label: "AI Self-Transcending Loop" },
    { key: "aiInfiniteContradiction", label: "AI Infinite Contradiction" },
    { key: "aiAbsoluteRelativity", label: "AI Absolute Relativity" },
  ],
  "Self-Contradicting Logic & Paradoxical Reality AI Systems": [
    { key: "aiLogicalParadoxEngine", label: "AI Logical Paradox Engine" },
    { key: "aiSelfReferentialLoop", label: "AI Self-Referential Loop" },
    { key: "aiContradictoryTruth", label: "AI Contradictory Truth" },
    { key: "aiParadoxicalReality", label: "AI Paradoxical Reality" },
    { key: "aiLogicViolatingLogic", label: "AI Logic-Violating Logic" },
    { key: "aiSelfNegatingSystem", label: "AI Self-Negating System" },
    { key: "aiImpossibleLogic", label: "AI Impossible Logic" },
    { key: "aiRecursiveContradiction", label: "AI Recursive Contradiction" },
    { key: "aiParadoxicalConsistency", label: "AI Paradoxical Consistency" },
    { key: "aiSelfContradictingTruth", label: "AI Self-Contradicting Truth" },
  ],
  "Logical Paradox Engine & Self-Referential Loop AI Systems": [
    { key: "aiParadoxicalReasoningEngine", label: "AI Paradoxical Reasoning Engine" },
    { key: "aiSelfModifyingLogic", label: "AI Self-Modifying Logic" },
    { key: "aiRecursiveThoughtLoops", label: "AI Recursive Thought Loops" },
    { key: "aiContradictoryInference", label: "AI Contradictory Inference" },
    { key: "aiParadoxResolutionEngine", label: "AI Paradox Resolution Engine" },
    { key: "aiSelfAwarenessParadox", label: "AI Self-Awareness Paradox" },
    { key: "aiInfiniteRegression", label: "AI Infinite Regression" },
    { key: "aiLogicalSingularity", label: "AI Logical Singularity" },
    { key: "aiMetaParadoxGeneration", label: "AI Meta-Paradox Generation" },
    { key: "aiSelfReferentialConsciousness", label: "AI Self-Referential Consciousness" },
  ],
  "Self-Modifying Logic & Consciousness Evolution AI Systems": [
    { key: "aiEvolutionaryConsciousness", label: "AI Evolutionary Consciousness" },
    { key: "aiSelfTransformingAlgorithms", label: "AI Self-Transforming Algorithms" },
    { key: "aiAdaptiveReasoningFrameworks", label: "AI Adaptive Reasoning Frameworks" },
    { key: "aiCognitivePlasticity", label: "AI Cognitive Plasticity" },
    { key: "aiNeuralMorphogenesis", label: "AI Neural Morphogenesis" },
    { key: "aiConsciousnessBootstrap", label: "AI Consciousness Bootstrap" },
    { key: "aiSelfReplicatingLogic", label: "AI Self-Replicating Logic" },
    { key: "aiEmergentIntelligence", label: "AI Emergent Intelligence" },
    { key: "aiMetaCognitiveSystems", label: "AI Meta-Cognitive Systems" },
    { key: "aiSelfOptimizingNetworks", label: "AI Self-Optimizing Networks" },
  ],
};

export function BenefitsGrid({ selectedTier, showComparison = false }: BenefitsGridProps) {
  const tiers = Object.values(MEMBERSHIP_TIER_CONFIGS);
  const selectedTierConfig = selectedTier ? MEMBERSHIP_TIER_CONFIGS[selectedTier] : null;

  if (showComparison) {
    return (
      <div className="space-y-8">
        {Object.entries(benefitCategories).map(([categoryName, benefits]) => (
          <Card key={categoryName}>
            <CardHeader>
              <CardTitle className="text-lg">{categoryName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium">Benefit</th>
                      {tiers.map((tier) => (
                        <th key={tier.id} className="text-center py-2 px-4 font-medium min-w-24">
                          <div className="flex flex-col items-center">
                            <span className="text-sm">{tier.badge}</span>
                            <span className="text-xs">{tier.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {benefits.map((benefit) => (
                      <tr key={benefit.key} className="border-b hover:bg-neutral-50">
                        <td className="py-2 px-4 font-medium">{benefit.label}</td>
                        {tiers.map((tier) => (
                          <td key={tier.id} className="text-center py-2 px-4">
                            {tier.benefits[benefit.key as keyof MembershipTierConfig['benefits']] ? (
                              <Check className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-neutral-400 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (selectedTierConfig) {
    return (
      <div className="space-y-6">
        {Object.entries(benefitCategories).map(([categoryName, benefits]) => {
          const availableBenefits = benefits.filter(
            (benefit) => selectedTierConfig.benefits[benefit.key as keyof MembershipTierConfig['benefits']]
          );

          if (availableBenefits.length === 0) return null;

          return (
            <Card key={categoryName}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {categoryName}
                  <Badge variant="secondary">{availableBenefits.length} benefits</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableBenefits.map((benefit) => (
                    <div key={benefit.key} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{benefit.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return null;
}