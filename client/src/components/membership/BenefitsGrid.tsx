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
  "Member Benefits": [
    { key: "memberDirectory", label: "Member Directory Access" },
    { key: "networkingEvents", label: "Networking Events" },
    { key: "prioritySupport", label: "Priority Support" },
    { key: "monthlyNewsletter", label: "Monthly Newsletter" },
    { key: "businessReferrals", label: "Business Referrals" },
  ],
};

export default function BenefitsGrid({ selectedTier, showComparison = true }: BenefitsGridProps) {
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