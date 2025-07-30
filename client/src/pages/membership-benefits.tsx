import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BenefitsGrid } from "@/components/membership/BenefitsGrid";
import { MEMBERSHIP_TIER_CONFIGS } from "@shared/membershipTiers";
import { Crown, Star, Gift, Zap, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";

const MembershipBenefits = () => {
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");

  const tiers = Object.values(MEMBERSHIP_TIER_CONFIGS);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-neutral-900">
              Membership Benefits & Tiers
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Discover the comprehensive benefits available to Croydon Business Association members 
              across all membership tiers.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Compare All</TabsTrigger>
            <TabsTrigger value="individual">Individual Tiers</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Crown className="h-8 w-8 mx-auto mb-3 text-amber-500" />
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm text-muted-foreground">Membership Tiers</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Gift className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <div className="text-2xl font-bold">755+</div>
                  <div className="text-sm text-muted-foreground">Total Benefits</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Star className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <div className="text-2xl font-bold">34</div>
                  <div className="text-sm text-muted-foreground">Benefit Categories</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                  <div className="text-2xl font-bold">£0</div>
                  <div className="text-sm text-muted-foreground">Starting Price</div>
                </CardContent>
              </Card>
            </div>

            {/* Tier Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {tiers.map((tier) => (
                <Card key={tier.id} className="relative border-2 hover:shadow-lg transition-shadow">
                  {tier.popularBadge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="text-3xl mb-2">{tier.badge}</div>
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <div className="text-2xl font-bold">
                      £{tier.monthlyPrice === 0 ? 'Free' : tier.monthlyPrice}
                      {tier.monthlyPrice > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Gift className="h-4 w-4 text-green-500" />
                        <span>{Object.values(tier.benefits).filter(Boolean).length} benefits</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span>{tier.features.length} key features</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Link href="/membership">
                        <Button 
                          className={tier.popularBadge ? "w-full" : "w-full"} 
                          variant={tier.popularBadge ? "default" : "outline"}
                        >
                          Choose Plan
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Benefits Comparison</CardTitle>
                <p className="text-muted-foreground">
                  Compare all benefits across all membership tiers to find the perfect fit.
                </p>
              </CardHeader>
              <CardContent>
                <BenefitsGrid showComparison={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Individual Tier Benefits</CardTitle>
                <p className="text-muted-foreground">
                  Select a membership tier to view its specific benefits and features.
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select a membership tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MEMBERSHIP_TIER_CONFIGS).map(([key, tier]) => (
                        <SelectItem key={key} value={key}>
                          {tier.badge} {tier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTier && (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">{MEMBERSHIP_TIER_CONFIGS[selectedTier].badge}</div>
                        <div>
                          <h3 className="text-2xl font-bold">{MEMBERSHIP_TIER_CONFIGS[selectedTier].name}</h3>
                          <p className="text-muted-foreground">{MEMBERSHIP_TIER_CONFIGS[selectedTier].description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <div className="text-sm text-muted-foreground">Monthly Price</div>
                          <div className="text-xl font-bold">
                            £{MEMBERSHIP_TIER_CONFIGS[selectedTier].monthlyPrice === 0 ? 'Free' : MEMBERSHIP_TIER_CONFIGS[selectedTier].monthlyPrice}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Annual Price</div>
                          <div className="text-xl font-bold">
                            £{MEMBERSHIP_TIER_CONFIGS[selectedTier].annualPrice === 0 ? 'Free' : MEMBERSHIP_TIER_CONFIGS[selectedTier].annualPrice}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total Benefits</div>
                          <div className="text-xl font-bold">
                            {Object.values(MEMBERSHIP_TIER_CONFIGS[selectedTier].benefits).filter(Boolean).length}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <BenefitsGrid selectedTier={selectedTier} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Value Comparison</CardTitle>
                <p className="text-muted-foreground">
                  Compare pricing options and value propositions across all tiers.
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-4">Membership Tier</th>
                        <th className="text-center py-4 px-4">Monthly Price</th>
                        <th className="text-center py-4 px-4">Annual Price</th>
                        <th className="text-center py-4 px-4">Annual Savings</th>
                        <th className="text-center py-4 px-4">Benefits Count</th>
                        <th className="text-center py-4 px-4">Value Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiers.map((tier) => {
                        const monthlyCost = tier.monthlyPrice * 12;
                        const annualSavings = monthlyCost - tier.annualPrice;
                        const benefitsCount = Object.values(tier.benefits).filter(Boolean).length;
                        const valueScore = tier.monthlyPrice === 0 ? "∞" : (benefitsCount / tier.monthlyPrice).toFixed(1);
                        
                        return (
                          <tr key={tier.id} className="border-b hover:bg-neutral-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{tier.badge}</span>
                                <div>
                                  <div className="font-medium">{tier.name}</div>
                                  {tier.popularBadge && (
                                    <Badge variant="secondary" className="text-xs">Most Popular</Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-4 px-4 font-medium">
                              £{tier.monthlyPrice === 0 ? 'Free' : tier.monthlyPrice}
                            </td>
                            <td className="text-center py-4 px-4 font-medium">
                              £{tier.annualPrice === 0 ? 'Free' : tier.annualPrice}
                            </td>
                            <td className="text-center py-4 px-4">
                              {annualSavings > 0 ? (
                                <span className="text-green-600 font-medium">£{annualSavings}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="text-center py-4 px-4 font-medium">{benefitsCount}</td>
                            <td className="text-center py-4 px-4">
                              <Badge variant="outline">{valueScore}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MembershipBenefits;