import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { MEMBERSHIP_TIER_CONFIGS, type MembershipTierConfig } from "@shared/membershipTiers";

interface BenefitsGridProps {
  selectedTier?: string;
  showComparison?: boolean;
}

const benefitCategories = {
  "MyT Accounting Software": [
    { key: "mytAccountingDiscount", label: "Accounting Software Discount", type: "percentage" },
    { key: "mytAccountingSupport", label: "Technical Support" },
    { key: "mytAccountingTraining", label: "Training & Onboarding" },
    { key: "mytAccountingMultiUser", label: "Multi-User Access" },
    { key: "mytAccountingAdvancedFeatures", label: "Advanced Features" },
    { key: "mytAccountingPrioritySupport", label: "Priority Support" },
  ],
  "MyT AI Services": [
    { key: "mytAiBasicAccess", label: "Basic AI Tools" },
    { key: "mytAiAdvancedTools", label: "Advanced AI Tools" },
    { key: "mytAiCustomSolutions", label: "Custom AI Solutions" },
    { key: "mytAiConsultation", label: "AI Strategy Consultation" },
    { key: "mytAiTraining", label: "AI Training & Support" },
    { key: "mytAiPrioritySupport", label: "Priority AI Support" },
    { key: "mytAiApiAccess", label: "AI API Access" },
    { key: "mytAiModelTraining", label: "Custom Model Training" },
  ],
  "MyT Automation Services": [
    { key: "mytAutomationBasic", label: "Basic Automation" },
    { key: "mytAutomationAdvanced", label: "Advanced Automation" },
    { key: "mytAutomationCustom", label: "Custom Automation" },
    { key: "mytAutomationConsultation", label: "Automation Consultation" },
    { key: "mytAutomationImplementation", label: "Implementation Support" },
    { key: "mytAutomationSupport", label: "Ongoing Support" },
    { key: "mytAutomationTraining", label: "Training & Documentation" },
    { key: "mytAutomationMonitoring", label: "Performance Monitoring" },
  ],
  "Directory & Visibility": [
    { key: "enhancedListing", label: "Enhanced Directory Listing" },
    { key: "featuredPlacement", label: "Featured Placement" },
    { key: "premiumBadge", label: "Premium Member Badge" },
    { key: "searchPriority", label: "Search Priority Ranking" },
    { key: "homepageFeature", label: "Homepage Feature" },
    { key: "logoInDirectory", label: "Logo in Directory" },
    { key: "multiplePhotos", label: "Multiple Photos" },
    { key: "videoProfile", label: "Video Profile" },
  ],
  "Networking & Events": [
    { key: "networkingEvents", label: "Networking Events Access" },
    { key: "exclusiveEvents", label: "Exclusive Member Events" },
    { key: "vipEventAccess", label: "VIP Event Access" },
    { key: "eventHosting", label: "Event Hosting Support" },
    { key: "speakingOpportunities", label: "Speaking Opportunities" },
    { key: "boardMeetingAccess", label: "Board Meeting Access" },
    { key: "executiveNetworking", label: "Executive Networking" },
    { key: "monthlyMeetings", label: "Monthly Member Meetings" },
    { key: "quarterlyGatherings", label: "Quarterly Gatherings" },
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
    { key: "seoSupport", label: "SEO Support" },
    { key: "socialMediaSupport", label: "Social Media Support" },
    { key: "businessPlanSupport", label: "Business Plan Support" },
    { key: "financialPlanningSupport", label: "Financial Planning Support" },
    { key: "complianceSupport", label: "Compliance Support" },
    { key: "taxSupport", label: "Tax Support" },
    { key: "insuranceGuidance", label: "Insurance Guidance" },
  ],
  "Marketing & Promotion": [
    { key: "newsletterPromotion", label: "Newsletter Promotion" },
    { key: "socialMediaPromotion", label: "Social Media Promotion" },
    { key: "pressReleaseSupport", label: "Press Release Support" },
    { key: "mediaKitCreation", label: "Media Kit Creation" },
    { key: "prSupport", label: "PR Support" },
    { key: "advertisingSupport", label: "Advertising Support" },
    { key: "coMarketingOpportunities", label: "Co-Marketing Opportunities" },
    { key: "crossPromotion", label: "Cross Promotion" },
    { key: "eventSponsorship", label: "Event Sponsorship" },
    { key: "brandingSupport", label: "Branding Support" },
    { key: "contentCreation", label: "Content Creation" },
    { key: "videoMarketing", label: "Video Marketing" },
    { key: "emailMarketingSupport", label: "Email Marketing Support" },
    { key: "seoMarketing", label: "SEO Marketing" },
    { key: "socialMediaManagement", label: "Social Media Management" },
  ],
  "Communication & Support": [
    { key: "prioritySupport", label: "Priority Support" },
    { key: "dedicatedAccountManager", label: "Dedicated Account Manager" },
    { key: "phoneSupport", label: "Phone Support" },
    { key: "emailSupport", label: "Email Support" },
    { key: "liveChat", label: "Live Chat Support" },
    { key: "monthlyNewsletters", label: "Monthly Newsletters" },
    { key: "weeklyUpdates", label: "Weekly Updates" },
    { key: "memberAlerts", label: "Member Alerts" },
    { key: "businessReferrals", label: "Business Referrals" },
    { key: "leadGeneration", label: "Lead Generation" },
    { key: "customerSupport", label: "Customer Support" },
    { key: "technicalSupport", label: "Technical Support" },
    { key: "emergencySupport", label: "Emergency Support" },
    { key: "weekendSupport", label: "Weekend Support" },
    { key: "multilanguageSupport", label: "Multi-language Support" },
  ],
  "Digital & Technology": [
    { key: "analyticsAccess", label: "Analytics Access" },
    { key: "performanceReports", label: "Performance Reports" },
    { key: "dataInsights", label: "Data Insights" },
    { key: "mobileAppAccess", label: "Mobile App Access" },
    { key: "apiAccess", label: "API Access" },
    { key: "integrationSupport", label: "Integration Support" },
    { key: "cloudStorage", label: "Cloud Storage" },
    { key: "backupServices", label: "Backup Services" },
    { key: "securitySupport", label: "Security Support" },
    { key: "techSupport", label: "Tech Support" },
    { key: "websiteBuilder", label: "Website Builder" },
    { key: "ecommerceSupport", label: "E-commerce Support" },
    { key: "paymentGateway", label: "Payment Gateway" },
    { key: "inventoryManagement", label: "Inventory Management" },
    { key: "crmAccess", label: "CRM Access" },
  ],
  "Special Access & Networking": [
    { key: "memberDirectory", label: "Member Directory Access" },
    { key: "businessMatchmaking", label: "Business Matchmaking" },
    { key: "partnershipOpportunities", label: "Partnership Opportunities" },
    { key: "vendorRecommendations", label: "Vendor Recommendations" },
    { key: "supplierNetwork", label: "Supplier Network" },
    { key: "buyerNetwork", label: "Buyer Network" },
    { key: "investorNetwork", label: "Investor Network" },
    { key: "mentorNetwork", label: "Mentor Network" },
    { key: "advisoryBoard", label: "Advisory Board Access" },
    { key: "strategicPlanning", label: "Strategic Planning" },
    { key: "boardroomAccess", label: "Boardroom Access" },
    { key: "executiveClub", label: "Executive Club" },
    { key: "vipLounge", label: "VIP Lounge" },
    { key: "privateEvents", label: "Private Events" },
    { key: "exclusivePartnerships", label: "Exclusive Partnerships" },
  ],
};

function BenefitsGrid({ selectedTier, showComparison = true }: BenefitsGridProps) {
  const tiers = Object.values(MEMBERSHIP_TIER_CONFIGS);
  const displayTiers = showComparison ? tiers : selectedTier ? [MEMBERSHIP_TIER_CONFIGS[selectedTier]] : tiers;

  const renderBenefitValue = (tier: MembershipTierConfig, benefitKey: string, benefitConfig: { key: string; label: string; type?: string }) => {
    const value = tier.benefits[benefitKey as keyof typeof tier.benefits];
    
    if (benefitConfig.type === "percentage" && typeof value === "number") {
      return value > 0 ? (
        <div className="flex items-center text-green-600">
          <Check className="w-4 h-4 mr-1" />
          <span className="font-medium">{value}% off</span>
        </div>
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      );
    }
    
    return value ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-gray-400" />
    );
  };

  return (
    <div className="space-y-8">
      {Object.entries(benefitCategories).map(([categoryName, benefits]) => (
        <Card key={categoryName} className="w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
              {categoryName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Feature</th>
                    {displayTiers.map((tier) => (
                      <th key={tier.id} className="text-center py-3 px-4 min-w-[120px]">
                        <div className="flex flex-col items-center">
                          <Badge 
                            className={`${tier.color} text-white mb-1`}
                          >
                            {tier.badge} {tier.name}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            £{tier.monthlyPrice}/mo
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {benefits.map((benefit) => (
                    <tr key={benefit.key} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{benefit.label}</td>
                      {displayTiers.map((tier) => (
                        <td key={tier.id} className="py-3 px-4 text-center">
                          {renderBenefitValue(tier, benefit.key, benefit)}
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

export default BenefitsGrid;
export { BenefitsGrid };