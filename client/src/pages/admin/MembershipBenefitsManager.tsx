import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search, Users, Tag, ChevronDown, X } from "lucide-react";
import type { Benefit, MembershipTier } from "@shared/schema";

const TIER_NAMES = [
  "Starter Tier",
  "Growth Tier", 
  "Strategic Tier",
  "Patron Tier",
  "Partner Tier"
];

const MembershipBenefitsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showAddBenefit, setShowAddBenefit] = useState(false);

  // Fetch active benefits for dropdown
  const { data: allBenefits = [] } = useQuery({
    queryKey: ['/api/admin/benefits', { active: true }],
    queryFn: () => apiRequest('GET', '/api/admin/benefits?active=true').then(res => res.json())
  });

  // Fetch membership tiers
  const { data: membershipTiers = [] } = useQuery({
    queryKey: ['/api/admin/membership-tiers'],
    queryFn: () => apiRequest('GET', '/api/admin/membership-tiers').then(res => res.json())
  });

  // Fetch benefits for selected tier
  const { data: tierBenefits = [], isLoading } = useQuery({
    queryKey: ['/api/admin/membership-tiers', selectedTier, 'benefits'],
    queryFn: () => apiRequest('GET', `/api/admin/membership-tiers/${selectedTier}/benefits`).then(res => res.json()),
    enabled: !!selectedTier
  });

  // Add benefit to tier mutation
  const addBenefitToTier = useMutation({
    mutationFn: ({ tierName, benefitId }: { tierName: string, benefitId: number }) =>
      apiRequest('POST', `/api/admin/membership-tiers/${tierName}/benefits`, { benefitId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/membership-tiers', selectedTier, 'benefits'] });
      toast({ title: "Success", description: "Benefit added to tier successfully" });
      setShowAddBenefit(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add benefit", variant: "destructive" });
    }
  });

  // Remove benefit from tier mutation
  const removeBenefitFromTier = useMutation({
    mutationFn: ({ tierName, benefitId }: { tierName: string, benefitId: number }) =>
      apiRequest('DELETE', `/api/admin/membership-tiers/${tierName}/benefits/${benefitId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/membership-tiers', selectedTier, 'benefits'] });
      toast({ title: "Success", description: "Benefit removed from tier successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to remove benefit", variant: "destructive" });
    }
  });

  // Bulk update benefits for tier
  const bulkUpdateBenefits = useMutation({
    mutationFn: ({ tierName, benefitIds }: { tierName: string, benefitIds: number[] }) =>
      apiRequest('PUT', `/api/admin/membership-tiers/${tierName}/benefits`, { benefitIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/membership-tiers', selectedTier, 'benefits'] });
      toast({ title: "Success", description: "Tier benefits updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update benefits", variant: "destructive" });
    }
  });

  const handleAddBenefit = (benefitId: number) => {
    if (!selectedTier) return;
    addBenefitToTier.mutate({ tierName: selectedTier, benefitId });
  };

  const handleRemoveBenefit = (benefitId: number) => {
    if (!selectedTier) return;
    if (confirm("Are you sure you want to remove this benefit from the tier?")) {
      removeBenefitFromTier.mutate({ tierName: selectedTier, benefitId });
    }
  };

  // Get categories from all benefits
  const categories = [...new Set(allBenefits.map((b: Benefit) => b.category))];

  // Filter benefits for add dropdown
  const filteredBenefits = allBenefits.filter((benefit: Benefit) => {
    const matchesSearch = benefit.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || benefit.category === selectedCategory;
    const notAlreadyAdded = !tierBenefits.some((tb: any) => tb.benefit.id === benefit.id);
    return matchesSearch && matchesCategory && notAlreadyAdded;
  });

  // Group tier benefits by category
  const tierBenefitsByCategory = tierBenefits.reduce((acc: Record<string, any[]>, item: any) => {
    const category = item.benefit.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader title="Membership Benefits Manager" showBack={true} />
      
      <div className="p-4 pb-24 space-y-6">
        {/* Tier Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Membership Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a membership tier to manage" />
              </SelectTrigger>
              <SelectContent>
                {TIER_NAMES.map(tierName => (
                  <SelectItem key={tierName} value={tierName}>
                    {tierName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedTier && (
          <>
            {/* Tier Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-center">{tierBenefits.length}</div>
                  <div className="text-sm text-center text-neutral-600">Total Benefits</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-center text-green-600">
                    {filteredBenefits.length}
                  </div>
                  <div className="text-sm text-center text-neutral-600">Available to Add</div>
                </CardContent>
              </Card>
            </div>

            {/* Add New Benefit */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Benefits to {selectedTier}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddBenefit(!showAddBenefit)}
                  >
                    {showAddBenefit ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              
              {showAddBenefit && (
                <CardContent className="space-y-4">
                  {/* Search and Filter */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search benefits..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Available Benefits */}
                  {filteredBenefits.length === 0 ? (
                    <div className="text-center text-neutral-500 py-4">
                      {searchTerm || selectedCategory ? 'No benefits match your filters' : 'All available benefits have been added to this tier'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredBenefits.map((benefit: Benefit) => (
                        <div key={benefit.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{benefit.name}</span>
                              <Badge variant="outline">
                                {benefit.category.replace('_', ' ')}
                              </Badge>
                            </div>
                            {benefit.description && (
                              <p className="text-sm text-neutral-600 mt-1">{benefit.description}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddBenefit(benefit.id)}
                            disabled={addBenefitToTier.isPending}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Current Tier Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Current Benefits for {selectedTier}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading benefits...</div>
                ) : tierBenefits.length === 0 ? (
                  <div className="text-center text-neutral-500 py-4">
                    No benefits assigned to this tier yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(tierBenefitsByCategory)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([category, benefits]) => (
                        <div key={category}>
                          <h4 className="font-medium text-sm text-neutral-700 mb-2 flex items-center gap-2">
                            <Tag className="h-3 w-3" />
                            {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                            <Badge variant="secondary" className="text-xs">
                              {benefits.length}
                            </Badge>
                          </h4>
                          <div className="space-y-2 ml-4">
                            {benefits
                              .sort((a, b) => a.benefit.sortOrder - b.benefit.sortOrder || a.benefit.name.localeCompare(b.benefit.name))
                              .map((item: any) => (
                                <div key={item.benefit.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{item.benefit.name}</span>
                                      <Badge variant={item.isIncluded ? "default" : "secondary"}>
                                        {item.isIncluded ? "Included" : "Not Included"}
                                      </Badge>
                                    </div>
                                    {item.benefit.description && (
                                      <p className="text-sm text-neutral-600 mt-1">{item.benefit.description}</p>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveBenefit(item.benefit.id)}
                                    disabled={removeBenefitFromTier.isPending}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default MembershipBenefitsManager;