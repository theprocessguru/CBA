import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, Tag, Users, Heart, Zap, Settings, ChevronDown, ChevronUp } from "lucide-react";
import type { Benefit } from "@shared/schema";

const BENEFIT_CATEGORIES = [
  { value: "networking", label: "Networking & Events", icon: Users, color: "bg-blue-500" },
  { value: "support", label: "Business Support", icon: Heart, color: "bg-green-500" },
  { value: "marketing", label: "Marketing & Promotion", icon: Zap, color: "bg-purple-500" },
  { value: "ai_services", label: "AI Services", icon: Settings, color: "bg-orange-500" },
  { value: "automation", label: "Automation", icon: Settings, color: "bg-red-500" },
  { value: "directory", label: "Directory & Visibility", icon: Tag, color: "bg-indigo-500" },
  { value: "other", label: "Other Benefits", icon: Plus, color: "bg-gray-500" }
];

const BenefitsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['networking', 'support']);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isActive: true,
    sortOrder: 0
  });

  // Fetch benefits
  const { data: benefits = [], isLoading } = useQuery({
    queryKey: ['/api/admin/benefits'],
    queryFn: () => apiRequest('GET', '/api/admin/benefits').then(res => res.json())
  });

  // Create benefit mutation
  const createBenefit = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/benefits', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/benefits'] });
      resetForm();
      toast({ title: "Success", description: "Benefit created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create benefit", variant: "destructive" });
    }
  });

  // Update benefit mutation
  const updateBenefit = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest('PUT', `/api/admin/benefits/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/benefits'] });
      resetForm();
      toast({ title: "Success", description: "Benefit updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update benefit", variant: "destructive" });
    }
  });

  // Delete benefit mutation
  const deleteBenefit = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/benefits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/benefits'] });
      toast({ title: "Success", description: "Benefit deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete benefit", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", category: "", isActive: true, sortOrder: 0 });
    setIsCreating(false);
    setEditingBenefit(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category) {
      toast({ title: "Error", description: "Name and category are required", variant: "destructive" });
      return;
    }

    if (editingBenefit) {
      updateBenefit.mutate({ id: editingBenefit.id, data: formData });
    } else {
      createBenefit.mutate(formData);
    }
  };

  const handleEdit = (benefit: Benefit) => {
    setFormData({
      name: benefit.name,
      description: benefit.description || "",
      category: benefit.category,
      isActive: benefit.isActive,
      sortOrder: benefit.sortOrder
    });
    setEditingBenefit(benefit);
    setIsCreating(true);
  };

  const handleDelete = (benefit: Benefit) => {
    if (confirm(`Are you sure you want to delete "${benefit.name}"?`)) {
      deleteBenefit.mutate(benefit.id);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Group benefits by category
  const benefitsByCategory = benefits.reduce((acc: Record<string, Benefit[]>, benefit: Benefit) => {
    if (!acc[benefit.category]) {
      acc[benefit.category] = [];
    }
    acc[benefit.category].push(benefit);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageHeader title="Benefits Management" showBack={true} />
        <div className="p-4 pb-24">
          <div className="text-center">Loading benefits...</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader title="Benefits Management" showBack={true} />
      
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
              <div className="text-2xl font-bold text-center text-green-600">
                {benefits.filter((b: Benefit) => b.isActive).length}
              </div>
              <div className="text-sm text-center text-neutral-600">Active Benefits</div>
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Benefit Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingBenefit ? "Edit Benefit" : "Create New Benefit"}
              </CardTitle>
              {(isCreating || editingBenefit) && (
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </CardHeader>
          
          {(isCreating || editingBenefit) && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Benefit Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Enhanced directory listing"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of this benefit"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Active (will appear in dropdowns)</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={createBenefit.isPending || updateBenefit.isPending}
                  >
                    {editingBenefit ? "Update Benefit" : "Create Benefit"}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
          
          {!isCreating && !editingBenefit && (
            <CardContent>
              <Button onClick={() => setIsCreating(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Benefit
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Benefits by Category */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Manage Benefits</h3>
          
          {BENEFIT_CATEGORIES.map(categoryConfig => {
            const categoryBenefits = benefitsByCategory[categoryConfig.value] || [];
            const isExpanded = expandedCategories.includes(categoryConfig.value);
            const IconComponent = categoryConfig.icon;
            
            return (
              <Card key={categoryConfig.value}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleCategory(categoryConfig.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${categoryConfig.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{categoryConfig.label}</CardTitle>
                        <p className="text-xs text-neutral-600">
                          {categoryBenefits.length} benefit{categoryBenefits.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {categoryBenefits.filter(b => b.isActive).length} active
                      </Badge>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent>
                    {categoryBenefits.length === 0 ? (
                      <div className="text-center text-neutral-500 py-4">
                        No benefits in this category yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {categoryBenefits
                          .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                          .map((benefit) => (
                            <div key={benefit.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{benefit.name}</span>
                                  <Badge variant={benefit.isActive ? "default" : "secondary"}>
                                    {benefit.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                {benefit.description && (
                                  <p className="text-sm text-neutral-600 mt-1">{benefit.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(benefit)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(benefit)}
                                  disabled={deleteBenefit.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default BenefitsManagement;