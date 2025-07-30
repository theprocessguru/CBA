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