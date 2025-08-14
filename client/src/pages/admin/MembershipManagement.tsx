import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MEMBERSHIP_TIER_CONFIGS } from "@shared/membershipTiers";
import BenefitsGrid from "@/components/membership/BenefitsGrid";
import { Users, Crown, TrendingUp, Settings, Search, Gift, Star, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

interface MembershipStats {
  totalMembers: number;
  activeMembers: number;
  trialMembers: number;
  tierDistribution: Record<string, number>;
  revenueThisMonth: number;
  revenueThisYear: number;
}

interface MemberData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  membershipTier: string;
  membershipStatus: string;
  membershipStartDate: string;
  membershipEndDate: string | null;
  isTrialMember: boolean;
}

const MembershipManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery<MembershipStats>({
    queryKey: ['/api/admin/membership-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/membership-stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      return response.json();
    }
  });

  const { data: members, isLoading: isLoadingMembers, error: membersError } = useQuery<MemberData[]>({
    queryKey: ['/api/admin/members', searchTerm, statusFilter, tierFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (tierFilter !== 'all') params.append('tier', tierFilter);
      
      const response = await fetch(`/api/admin/members?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const updateMembershipMutation = useMutation({
    mutationFn: async ({ userId, tier, status }: { userId: string; tier?: string; status?: string }) => {
      const response = await apiRequest("PUT", `/api/admin/members/${userId}/membership`, {
        membershipTier: tier,
        membershipStatus: status
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Membership Updated",
        description: "Member's subscription has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/membership-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update membership",
        variant: "destructive",
      });
    },
  });

  const getTierBadgeColor = (tier: string) => {
    const config = MEMBERSHIP_TIER_CONFIGS[tier];
    return config?.color.replace('bg-', 'text-') + ' ' + config?.color.replace('-500', '-100');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary'; 
      case 'suspended': return 'destructive';
      case 'expired': return 'outline';
      default: return 'outline';
    }
  };

  const filteredMembers = (Array.isArray(members) ? members : []).filter(member => {
    const matchesSearch = !searchTerm || 
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.membershipStatus === statusFilter;
    const matchesTier = tierFilter === 'all' || member.membershipTier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  // Add error boundary for debugging
  if (statsError) {
    console.error('Stats error:', statsError);
  }
  if (membersError) {
    console.error('Members error:', membersError);
  }

  return (
    <div className="space-y-6 px-4 md:px-6">
      <PageHeader 
        title="Membership Management"
        subtitle="Manage member tiers, subscriptions, and benefits"
      >
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tiers">Tier Configuration</TabsTrigger>
          <TabsTrigger value="benefits">Benefits Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoadingStats ? (
            <div className="text-center py-8">Loading statistics...</div>
          ) : statsError ? (
            <div className="text-center py-8 text-red-600">
              Error loading statistics: {statsError.message}
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Members</p>
                    <p className="text-2xl font-bold">{stats?.activeMembers || 0}</p>
                  </div>
                  <Crown className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Trial Members</p>
                    <p className="text-2xl font-bold">{stats?.trialMembers || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">£{stats?.revenueThisMonth || 0}</p>
                  </div>
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tier Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Membership Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(MEMBERSHIP_TIER_CONFIGS).map(([tierKey, tier]) => {
                  const count = stats?.tierDistribution[tierKey] || 0;
                  const percentage = stats?.totalMembers ? Math.round((count / stats.totalMembers) * 100) : 0;
                  
                  return (
                    <div key={tierKey} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getTierBadgeColor(tierKey)}>
                          {tier.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          £{tier.monthlyPrice}/month
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count} members</span>
                        <span className="text-xs text-muted-foreground">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Members</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tier-filter">Tier</Label>
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      {Object.keys(MEMBERSHIP_TIER_CONFIGS).map(tier => (
                        <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingMembers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading members...
                      </TableCell>
                    </TableRow>
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTierBadgeColor(member.membershipTier)}>
                            {member.membershipTier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.membershipStatus)}>
                            {member.membershipStatus}
                            {member.isTrialMember && " (Trial)"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.membershipStartDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {member.membershipEndDate 
                            ? new Date(member.membershipEndDate).toLocaleDateString()
                            : "No end date"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(tier) => updateMembershipMutation.mutate({ 
                                userId: member.id, 
                                tier 
                              })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Change tier" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(MEMBERSHIP_TIER_CONFIGS).map(tier => (
                                  <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              onValueChange={(status) => updateMembershipMutation.mutate({ 
                                userId: member.id, 
                                status 
                              })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Change status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="trial">Trial</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(MEMBERSHIP_TIER_CONFIGS).map(([tierKey, tier]) => (
              <Card key={tierKey}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tier.color}`}></div>
                      {tier.name}
                    </CardTitle>
                    <div className="text-right">
                      {tier.id === "patron" || tier.id === "partner" ? (
                        <div>
                          <div className="text-lg font-bold">Call for price</div>
                          <div className="text-sm text-muted-foreground">Custom pricing</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-lg font-bold">£{tier.monthlyPrice}/month</div>
                          <div className="text-sm text-muted-foreground">£{tier.annualPrice}/year</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="text-sm space-y-1">
                      {tier.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Limits</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Business Listings: {tier.limits.businessListings}</div>
                      <div>Product Listings: {tier.limits.productListings}</div>
                      <div>Offer Listings: {tier.limits.offerListings}</div>
                      <div>Image Uploads: {tier.limits.imageUploads}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Complete Benefits Comparison
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Comprehensive breakdown of all benefits across membership tiers
              </p>
            </CardHeader>
            <CardContent>
              <BenefitsGrid showComparison={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MembershipManagement;