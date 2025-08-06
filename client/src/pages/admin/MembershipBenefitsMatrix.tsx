import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Filter, Download, Users, Star, Crown, Diamond, Gem, Pencil, Trash2 } from "lucide-react";
import type { Benefit, MembershipTier } from "@shared/schema";

const TIER_ICONS = {
  starter: Users,
  growth: Star,
  strategic: Crown,
  patron: Diamond,
  partner: Gem
};

const TIER_COLORS = {
  starter: "bg-gray-500",
  growth: "bg-blue-500", 
  strategic: "bg-purple-500",
  patron: "bg-gold-500",
  partner: "bg-emerald-500"
};

const BENEFIT_CATEGORIES = [
  { value: "ai_services", label: "AI Services", count: 72 },
  { value: "technology", label: "Technology", count: 26 },
  { value: "support", label: "Business Support", count: 21 },
  { value: "access", label: "Access & Networking", count: 18 },
  { value: "financial", label: "Financial & Discounts", count: 18 },
  { value: "marketing", label: "Marketing & Promotion", count: 18 },
  { value: "communication", label: "Communication", count: 15 },
  { value: "training", label: "Training & Development", count: 15 },
  { value: "networking", label: "Networking & Events", count: 10 },
  { value: "automation", label: "Automation", count: 9 },
  { value: "directory", label: "Directory & Visibility", count: 8 },
  { value: "accounting", label: "Accounting Services", count: 5 }
];

const MembershipBenefitsMatrix = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", description: "", category: "", isActive: true });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [benefitToDelete, setBenefitToDelete] = useState<Benefit | null>(null);

  // Fetch benefits
  const { data: benefits = [], isLoading: benefitsLoading } = useQuery({
    queryKey: ['/api/admin/benefits'],
    queryFn: () => apiRequest('GET', '/api/admin/benefits').then(res => res.json())
  });

  // Fetch membership tiers
  const { data: membershipTiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ['/api/membership-tiers'],
    queryFn: () => apiRequest('GET', '/api/membership-tiers').then(res => res.json())
  });

  // Update benefit assignment mutation
  const updateBenefitAssignment = useMutation({
    mutationFn: ({ benefitId, tierName, assigned }: { benefitId: number, tierName: string, assigned: boolean }) =>
      apiRequest('PUT', `/api/admin/benefits/${benefitId}/tier-assignment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierName, assigned })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/benefits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/membership-tiers'] });
      toast({ title: "Success", description: "Benefit assignment updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update assignment", variant: "destructive" });
    }
  });

  // Update benefit mutation
  const updateBenefit = useMutation({
    mutationFn: ({ benefitId, data }: { benefitId: number, data: any }) =>
      apiRequest('PUT', `/api/admin/benefits/${benefitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/benefits'] });
      toast({ title: "Success", description: "Benefit updated successfully" });
      setEditingBenefit(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update benefit", variant: "destructive" });
    }
  });

  // Delete benefit mutation
  const deleteBenefit = useMutation({
    mutationFn: (benefitId: number) =>
      apiRequest('DELETE', `/api/admin/benefits/${benefitId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/benefits'] });
      toast({ title: "Success", description: "Benefit deleted successfully" });
      setDeleteConfirmOpen(false);
      setBenefitToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete benefit", variant: "destructive" });
    }
  });

  // Filter benefits based on search and filters
  const filteredBenefits = benefits.filter((benefit: Benefit) => {
    const matchesSearch = benefit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (benefit.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || benefit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group benefits by category
  const benefitsByCategory = filteredBenefits.reduce((acc: Record<string, Benefit[]>, benefit: Benefit) => {
    if (!acc[benefit.category]) {
      acc[benefit.category] = [];
    }
    acc[benefit.category].push(benefit);
    return acc;
  }, {});

  const handleBenefitToggle = (benefitId: number, tierName: string, currentlyAssigned: boolean) => {
    updateBenefitAssignment.mutate({
      benefitId,
      tierName,
      assigned: !currentlyAssigned
    });
  };

  const getTierAssignment = (benefit: Benefit & { tierAssignments?: string[] }, tierName: string): boolean => {
    // Check if this benefit is assigned to this tier
    // This would come from your membership tier benefits data
    return benefit.tierAssignments?.includes(tierName) || false;
  };

  const handleEditBenefit = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setEditFormData({
      name: benefit.name,
      description: benefit.description || "",
      category: benefit.category,
      isActive: benefit.isActive ?? true
    });
  };

  const handleSaveEdit = () => {
    if (!editingBenefit) return;
    updateBenefit.mutate({
      benefitId: editingBenefit.id,
      data: editFormData
    });
  };

  const handleDeleteBenefit = (benefit: Benefit) => {
    setBenefitToDelete(benefit);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!benefitToDelete) return;
    deleteBenefit.mutate(benefitToDelete.id);
  };

  const exportMatrix = () => {
    // Create CSV export of the benefits matrix
    const csvData = [
      ['Benefit Name', 'Category', 'Description', ...membershipTiers.map((t: MembershipTier) => t.name.charAt(0).toUpperCase() + t.name.slice(1))],
      ...filteredBenefits.map((benefit: Benefit) => [
        benefit.name,
        benefit.category,
        benefit.description || '',
        ...membershipTiers.map((tier: MembershipTier) => getTierAssignment(benefit, tier.name) ? 'Yes' : 'No')
      ])
    ].map(row => row.map((cell: any) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'membership-benefits-matrix.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (benefitsLoading || tiersLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageHeader title="Benefits Matrix" />
        <div className="p-4 pb-24">
          <div className="text-center">Loading benefits matrix...</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader title="Membership Benefits Matrix" />
      
      <div className="p-4 pb-24 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-center">{benefits.length}</div>
              <div className="text-sm text-center text-neutral-600">Total Benefits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-center">{membershipTiers.length}</div>
              <div className="text-sm text-center text-neutral-600">Membership Tiers</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search benefits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {BENEFIT_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportMatrix} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Membership Tiers Header */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {membershipTiers.map((tier: MembershipTier) => {
                const IconComponent = TIER_ICONS[tier.name as keyof typeof TIER_ICONS] || Users;
                return (
                  <div key={tier.name} className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full ${TIER_COLORS[tier.name as keyof typeof TIER_COLORS] || 'bg-gray-500'} flex items-center justify-center`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-sm font-medium capitalize">{tier.name}</div>
                    <div className="text-xs text-neutral-600">
                      {tier.id === "patron" || tier.id === "partner" ? "Call for price" : `$${tier.monthlyPrice}/mo`}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Matrix */}
        <div className="space-y-4">
          {Object.entries(benefitsByCategory).map(([category, categoryBenefits]: [string, any]) => {
            const categoryConfig = BENEFIT_CATEGORIES.find(c => c.value === category);
            
            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {categoryConfig?.label || category}
                    </CardTitle>
                    <Badge variant="outline">
                      {categoryBenefits.length} benefits
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(categoryBenefits as Benefit[]).map((benefit: Benefit & { tierAssignments?: string[] }) => (
                      <div key={benefit.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm">{benefit.name}</h4>
                              <Badge variant={benefit.isActive ? "default" : "secondary"} className="text-xs">
                                {benefit.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {benefit.description && (
                              <p className="text-xs text-neutral-600 mb-3">{benefit.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBenefit(benefit)}
                              className="h-8 w-8 p-0"
                              title="Edit benefit"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBenefit(benefit)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
                              title="Delete benefit"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Tier Assignments */}
                        <div className="flex flex-wrap gap-3 mt-3">
                          {membershipTiers.map((tier: MembershipTier) => {
                            const isAssigned = getTierAssignment(benefit, tier.name);
                            return (
                              <div key={tier.name} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg border hover:bg-neutral-100 transition-colors">
                                <Checkbox
                                  checked={isAssigned}
                                  onCheckedChange={() => handleBenefitToggle(benefit.id, tier.name, isAssigned)}
                                  disabled={updateBenefitAssignment.isPending}
                                />
                                <label className="text-sm font-medium capitalize cursor-pointer">
                                  {tier.name}
                                </label>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ backgroundColor: tier.color + '20', borderColor: tier.color }}
                                >
                                  ${tier.monthlyPrice/100}/mo
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBenefits.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-neutral-500">No benefits found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      {editingBenefit && (
        <Dialog open={!!editingBenefit} onOpenChange={() => setEditingBenefit(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Benefit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Benefit Name</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter benefit name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter benefit description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={editFormData.category} onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BENEFIT_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={editFormData.isActive}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isActive: checked === true }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEdit} disabled={updateBenefit.isPending} className="flex-1">
                  {updateBenefit.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditingBenefit(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the benefit "{benefitToDelete?.name}". 
              This action cannot be undone and will remove all tier assignments for this benefit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmOpen(false);
              setBenefitToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteBenefit.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteBenefit.isPending ? "Deleting..." : "Delete Benefit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <BottomNavigation />
    </div>
  );
};

export default MembershipBenefitsMatrix;