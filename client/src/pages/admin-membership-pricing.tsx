import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  Crown, 
  Star,
  Users,
  Zap,
  Target,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";

interface MembershipTier {
  id: string;
  name: string;
  displayName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  aiCredits: number;
  maxEvents: number;
  maxNetworking: number;
  priority: number;
  isActive: boolean;
  isPopular: boolean;
  color: string;
  icon: string;
}

const tierIcons = {
  crown: Crown,
  star: Star,
  users: Users,
  zap: Zap,
  target: Target
};

export default function AdminMembershipPricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTier, setEditingTier] = useState<any>(null);
  const [newFeature, setNewFeature] = useState("");
  const [bulkFeatures, setBulkFeatures] = useState("");

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need administrator privileges to manage membership pricing.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch membership tiers
  const { data: membershipTiers, isLoading } = useQuery<MembershipTier[]>({
    queryKey: ['/api/admin/membership-tiers']
  });

  // Update tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async (tierData: Partial<MembershipTier> & { id: string }) => {
      return await apiRequest(`/api/admin/membership-tiers/${tierData.id}`, {
        method: 'PUT',
        body: JSON.stringify(tierData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/membership-tiers'] });
      toast({
        title: "Success",
        description: "Membership tier updated successfully",
      });
      setEditingTier(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update membership tier",
        variant: "destructive",
      });
    },
  });

  // Create tier mutation  
  const createTierMutation = useMutation({
    mutationFn: async (tierData: Omit<MembershipTier, 'id'>) => {
      return await apiRequest('/api/admin/membership-tiers', {
        method: 'POST',
        body: JSON.stringify(tierData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/membership-tiers'] });
      toast({
        title: "Success",
        description: "New membership tier created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to create membership tier",
        variant: "destructive",
      });
    },
  });

  // Delete tier mutation
  const deleteTierMutation = useMutation({
    mutationFn: async (tierId: string) => {
      return await apiRequest(`/api/admin/membership-tiers/${tierId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/membership-tiers'] });
      toast({
        title: "Success",
        description: "Membership tier deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete membership tier",
        variant: "destructive",
      });
    },
  });

  const handleUpdateTier = (tier: MembershipTier) => {
    updateTierMutation.mutate(tier);
  };

  const handleDeleteTier = (tierId: string) => {
    if (confirm("Are you sure you want to delete this membership tier? This action cannot be undone.")) {
      deleteTierMutation.mutate(tierId);
    }
  };

  const addFeatureToTier = (tier: MembershipTier, feature: string) => {
    if (feature.trim() && !tier.features.includes(feature.trim())) {
      const updatedTier = {
        ...tier,
        features: [...tier.features, feature.trim()]
      };
      if (editingTier) {
        setEditingTier(updatedTier);
      } else {
        handleUpdateTier(updatedTier);
      }
    }
  };

  const removeFeatureFromTier = (tier: MembershipTier, featureIndex: number) => {
    const updatedTier = {
      ...tier,
      features: tier.features.filter((_, index) => index !== featureIndex)
    };
    if (editingTier) {
      setEditingTier(updatedTier);
    } else {
      handleUpdateTier(updatedTier);
    }
  };

  const addBulkFeatures = (tier: MembershipTier, featuresText: string) => {
    const newFeatures = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f && !tier.features.includes(f));
    
    if (newFeatures.length > 0) {
      const updatedTier = {
        ...tier,
        features: [...tier.features, ...newFeatures]
      };
      if (editingTier) {
        setEditingTier(updatedTier);
      } else {
        handleUpdateTier(updatedTier);
      }
    }
  };

  const copyFeaturesFromTier = (sourceTierId: string, targetTier: MembershipTier) => {
    const sourceTier = membershipTiers?.find(t => t.id === sourceTierId);
    if (sourceTier) {
      const uniqueFeatures = sourceTier.features.filter(f => !targetTier.features.includes(f));
      if (uniqueFeatures.length > 0) {
        const updatedTier = {
          ...targetTier,
          features: [...targetTier.features, ...uniqueFeatures]
        };
        if (editingTier) {
          setEditingTier(updatedTier);
        } else {
          handleUpdateTier(updatedTier);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Membership Pricing Management</h1>
          <p className="text-gray-600">Manage membership tiers, pricing, and benefits.</p>
        </div>
        <Button onClick={() => setEditingTier('new')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Tier
        </Button>
      </div>

      {/* Membership Tiers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {membershipTiers?.map((tier) => {
          const IconComponent = tierIcons[tier.icon as keyof typeof tierIcons] || Crown;
          const isEditing = editingTier === tier.id;

          return (
            <Card key={tier.id} className={`relative ${tier.isPopular ? 'ring-2 ring-blue-500' : ''}`}>
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4`} 
                     style={{ backgroundColor: tier.color + '20' }}>
                  <IconComponent className="h-8 w-8" style={{ color: tier.color }} />
                </div>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={tier.displayName}
                      onChange={(e) => setEditingTier({ ...tier, displayName: e.target.value })}
                      placeholder="Display Name"
                    />
                    <Textarea
                      value={tier.description}
                      onChange={(e) => setEditingTier({ ...tier, description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-xl">{tier.displayName}</CardTitle>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="text-center">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-500">Monthly Price (£)</Label>
                        <Input
                          type="number"
                          value={tier.monthlyPrice}
                          onChange={(e) => setEditingTier({ ...tier, monthlyPrice: Number(e.target.value) })}
                          className="text-center"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Yearly Price (£)</Label>
                        <Input
                          type="number"
                          value={tier.yearlyPrice}
                          onChange={(e) => setEditingTier({ ...tier, yearlyPrice: Number(e.target.value) })}
                          className="text-center"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-gray-900">
                        £{tier.monthlyPrice}<span className="text-lg font-normal text-gray-500">/mo</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        or £{tier.yearlyPrice}/year
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-3">Features & Benefits</h4>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => {
                              const updatedFeatures = [...tier.features];
                              updatedFeatures[index] = e.target.value;
                              setEditingTier({ ...tier, features: updatedFeatures });
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeatureFromTier(tier, index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add new feature..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addFeatureToTier(tier, newFeature);
                                setNewFeature("");
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              addFeatureToTier(tier, newFeature);
                              setNewFeature("");
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <details className="cursor-pointer">
                            <summary className="hover:text-gray-700">Advanced Options</summary>
                            <div className="mt-2 space-y-2">
                              <div>
                                <Label className="text-xs">Add Multiple Features (one per line)</Label>
                                <Textarea
                                  value={bulkFeatures}
                                  onChange={(e) => setBulkFeatures(e.target.value)}
                                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                  rows={3}
                                  className="text-xs"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-1 text-xs"
                                  onClick={() => {
                                    addBulkFeatures(tier, bulkFeatures);
                                    setBulkFeatures("");
                                  }}
                                >
                                  Add Bulk Features
                                </Button>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Copy Features From Another Tier</Label>
                                <select 
                                  className="w-full text-xs border rounded p-1"
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      copyFeaturesFromTier(e.target.value, tier);
                                      e.target.value = "";
                                    }
                                  }}
                                >
                                  <option value="">Select tier to copy from...</option>
                                  {membershipTiers?.filter(t => t.id !== tier.id).map(t => (
                                    <option key={t.id} value={t.id}>{t.displayName}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <ul className="space-y-2 text-sm">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center justify-between group">
                            <div className="flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                              {feature}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFeatureFromTier(tier, index)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Input
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add new benefit..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addFeatureToTier(tier, newFeature);
                                setNewFeature("");
                              }
                            }}
                            className="text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              addFeatureToTier(tier, newFeature);
                              setNewFeature("");
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Limits & Settings */}
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">AI Credits</Label>
                        <Input
                          type="number"
                          value={tier.aiCredits}
                          onChange={(e) => setEditingTier({ ...tier, aiCredits: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Max Events</Label>
                        <Input
                          type="number"
                          value={tier.maxEvents}
                          onChange={(e) => setEditingTier({ ...tier, maxEvents: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Priority Level</Label>
                      <Input
                        type="number"
                        value={tier.priority}
                        onChange={(e) => setEditingTier({ ...tier, priority: Number(e.target.value) })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Active</Label>
                      <Switch
                        checked={tier.isActive}
                        onCheckedChange={(checked) => setEditingTier({ ...tier, isActive: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Popular</Label>
                      <Switch
                        checked={tier.isPopular}
                        onCheckedChange={(checked) => setEditingTier({ ...tier, isPopular: checked })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>AI Credits: <span className="font-medium">{tier.aiCredits}</span></div>
                    <div>Max Events: <span className="font-medium">{tier.maxEvents}</span></div>
                    <div>Priority: <span className="font-medium">{tier.priority}</span></div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={() => handleUpdateTier(editingTier)}
                        disabled={updateTierMutation.isPending}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingTier(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setEditingTier(tier.id)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteTier(tier.id)}
                        disabled={deleteTierMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Statistics */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Membership Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {membershipTiers?.map((tier) => (
                <div key={tier.id} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">{tier.displayName} Members</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}