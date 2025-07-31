import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BenefitsGrid from "@/components/membership/BenefitsGrid";
import { MEMBERSHIP_TIER_CONFIGS, AI_SERVICE_ADDONS } from "@shared/membershipTiers";
import { Crown, Star, Gift, Zap, Users, TrendingUp, Bot, Brain, Infinity, Sparkles } from "lucide-react";
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Compare All</TabsTrigger>
            <TabsTrigger value="individual">Individual Tiers</TabsTrigger>
            <TabsTrigger value="ai-addons">AI Add-ons</TabsTrigger>
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
                  <div className="text-2xl font-bold">875+</div>
                  <div className="text-sm text-muted-foreground">Total Benefits</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Star className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <div className="text-2xl font-bold">37</div>
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

            {/* MyT Accounting Software Highlight */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-3">🚀 Featured: MyT Accounting & Bookkeeping Software</h2>
              <p className="text-lg mb-4">
                Revolutionary AI-powered accounting that scans all documents, eliminating the need for bookkeepers. 
                <strong> Required for businesses earning over £50,000 - HMRC compliant!</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/myt-accounting">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    Explore MyT Accounting
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  35% Member Discount Available
                </Button>
              </div>
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
                    
                    {tier.targetAudience && (
                      <div className="space-y-2 p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>Who this is for:</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{tier.targetAudience}</p>
                        {tier.businessExamples && tier.businessExamples.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1 mt-2">
                            {tier.businessExamples.slice(0, 3).map((example, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{example}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
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
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold">{MEMBERSHIP_TIER_CONFIGS[selectedTier].name}</h3>
                          <p className="text-muted-foreground">{MEMBERSHIP_TIER_CONFIGS[selectedTier].description}</p>
                          {MEMBERSHIP_TIER_CONFIGS[selectedTier].targetAudience && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-sm text-blue-900">Target Audience:</span>
                              </div>
                              <p className="text-sm text-blue-800 mb-2">{MEMBERSHIP_TIER_CONFIGS[selectedTier].targetAudience}</p>
                              {MEMBERSHIP_TIER_CONFIGS[selectedTier].businessExamples && (
                                <div className="flex flex-wrap gap-1">
                                  {MEMBERSHIP_TIER_CONFIGS[selectedTier].businessExamples.map((example, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-800">{example}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
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
                                <span className="text-green-600 font-medium">£{annualSavings.toFixed(2)}</span>
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

          <TabsContent value="ai-addons" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Premium AI Service Add-ons</h2>
              <p className="text-xl text-muted-foreground">
                Unlock revolutionary AI capabilities with premium add-on packages
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-3xl mx-auto">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> AI Service Add-ons are additional costs on top of your membership tier. 
                  Choose from basic AI tools to ultimate transcendence capabilities.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(AI_SERVICE_ADDONS).map((addon) => {
                const getAddonIcon = (id: string) => {
                  switch (id) {
                    case 'ai-essentials': return <Bot className="h-8 w-8 text-blue-500" />;
                    case 'ai-professional': return <Brain className="h-8 w-8 text-green-500" />;
                    case 'ai-enterprise': return <Zap className="h-8 w-8 text-purple-500" />;
                    case 'ai-ultimate': return <Infinity className="h-8 w-8 text-purple-600" />;
                    default: return <Sparkles className="h-8 w-8 text-gray-500" />;
                  }
                };

                const isUltimatePackage = addon.id === 'ai-ultimate';

                return (
                  <Card key={addon.id} className={`relative ${isUltimatePackage ? 'ring-2 ring-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50' : 'hover:shadow-lg transition-shadow'}`}>
                    {isUltimatePackage && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
                          Ultimate Power
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="mb-4">
                        {getAddonIcon(addon.id)}
                      </div>
                      <CardTitle className={`text-lg ${isUltimatePackage ? 'text-purple-600' : ''}`}>
                        {addon.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {addon.description}
                      </p>
                      <div className="space-y-2 mt-4">
                        <div className={`text-2xl font-bold ${isUltimatePackage ? 'text-purple-600' : ''}`}>
                          £{addon.monthlyPrice}
                          <span className="text-base font-normal text-muted-foreground">/month</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          or £{addon.annualPrice}/year
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        {addon.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Star className={`h-3 w-3 mt-1 flex-shrink-0 ${isUltimatePackage ? 'text-purple-500' : 'text-amber-500'}`} />
                            <span className="text-xs">{feature}</span>
                          </div>
                        ))}
                        {addon.features.length > 4 && (
                          <div className="text-xs text-muted-foreground">
                            +{addon.features.length - 4} more features
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Button 
                          className={`w-full ${isUltimatePackage ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                          variant={isUltimatePackage ? "default" : "outline"}
                        >
                          Add to Plan
                        </Button>
                        <div className="text-xs text-muted-foreground text-center">
                          Available for: {addon.availableForTiers.length} membership tiers
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* AI Add-on Pricing Summary */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-xl font-bold mb-4">AI Service Pricing Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(AI_SERVICE_ADDONS).map((addon) => (
                  <div key={addon.id} className="text-center p-4 border rounded-lg">
                    <div className="font-medium">{addon.name}</div>
                    <div className="text-2xl font-bold text-primary">£{addon.monthlyPrice}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Total Monthly Cost Examples:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• Growth Tier (£29.99) + AI Essentials (£49.99) = <strong>£79.98/month</strong></div>
                  <div>• Strategic Tier (£99.99) + AI Professional (£149.99) = <strong>£249.98/month</strong></div>
                  <div>• Patron Tier (£299.99) + AI Ultimate (£999.99) = <strong>£1,299.98/month</strong></div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MembershipBenefits;