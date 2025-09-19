import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Mail, 
  Filter, 
  Users, 
  Send, 
  Eye, 
  Plus, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FilterOptions {
  personTypes: string[];
  membershipTiers: string[];
  participantRoles: string[];
  aiInterests: string[];
  businessTypes: string[];
  districts: string[];
}

interface EmailTargetFilters {
  personTypes?: {
    mode: 'any' | 'all';
    values: string[];
  };
  membershipTiers?: {
    mode: 'any' | 'all';
    values: string[];
  };
  participantRoles?: {
    mode: 'any' | 'all';
    values: string[];
  };
  aiInterests?: {
    mode: 'any' | 'all';
    values: string[];
  };
  businessTypes?: {
    mode: 'any' | 'all';
    values: string[];
  };
  districts?: {
    mode: 'any' | 'all';
    values: string[];
  };
  globalOperator?: 'AND' | 'OR';
  limit?: number;
  offset?: number;
}

interface UnifiedContact {
  email: string;
  name: string;
  userId?: string;
  source: 'users' | 'ai_summit_registrations';
  personTypes: string[];
  membershipTier?: string;
  participantRoles: string[];
  aiInterests: string[];
  businessType?: string;
  districts: string[];
  registrationDate?: Date;
  isEmailVerified?: boolean;
}

interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  targetFilters: EmailTargetFilters;
  createdBy: string;
  createdAt: string; // ISO date string from API
  sentAt?: string; // ISO date string from API
}

interface PreviewResult {
  count: number;
  sample: UnifiedContact[];
}

// FilterGroup Component
interface FilterGroupProps {
  title: string;
  options: string[];
  onChange: (mode: 'any' | 'all', values: string[]) => void;
  testId: string;
  mode?: 'any' | 'all';
  selectedValues?: string[];
}

function FilterGroup({ title, options, onChange, testId, mode = 'any', selectedValues = [] }: FilterGroupProps) {
  const [localMode, setLocalMode] = useState<'any' | 'all'>(mode);
  const [localValues, setLocalValues] = useState<string[]>(selectedValues);

  const handleModeChange = (newMode: 'any' | 'all') => {
    setLocalMode(newMode);
    onChange(newMode, localValues);
  };

  const handleValueToggle = (value: string) => {
    const newValues = localValues.includes(value)
      ? localValues.filter(v => v !== value)
      : [...localValues, value];
    
    setLocalValues(newValues);
    onChange(localMode, newValues);
  };

  const handleSelectAll = () => {
    setLocalValues(options);
    onChange(localMode, options);
  };

  const handleClearAll = () => {
    setLocalValues([]);
    onChange(localMode, []);
  };

  return (
    <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{title}</Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs h-6 px-2"
            data-testid={`${testId}-select-all`}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs h-6 px-2"
            data-testid={`${testId}-clear-all`}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">Match Mode</Label>
        <Select value={localMode} onValueChange={handleModeChange}>
          <SelectTrigger className="h-8" data-testid={`${testId}-mode-select`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any of selected (OR)</SelectItem>
            <SelectItem value="all">All of selected (AND)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">
          Options ({localValues.length} of {options.length} selected)
        </Label>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto" data-testid={`${testId}-options`}>
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`${testId}-${option}`}
                checked={localValues.includes(option)}
                onChange={() => handleValueToggle(option)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                data-testid={`${testId}-option-${option}`}
              />
              <Label
                htmlFor={`${testId}-${option}`}
                className="text-sm cursor-pointer flex-1"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Summary */}
      {localValues.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {localValues.map((value) => (
              <Badge
                key={value}
                variant="secondary"
                className="text-xs px-2 py-1"
                data-testid={`${testId}-selected-${value}`}
              >
                {value}
                <button
                  onClick={() => handleValueToggle(value)}
                  className="ml-1 hover:text-red-500"
                  data-testid={`${testId}-remove-${value}`}
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailTargeting() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for filters
  const [filters, setFilters] = useState<EmailTargetFilters>({
    globalOperator: 'AND',
    limit: 100,
    offset: 0
  });

  // State for campaign creation/editing
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    htmlContent: ''
  });

  // Check admin access
  if (!user || !(user as any).isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need administrator privileges to access email targeting.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch filter options
  const { data: filterOptions, isLoading: loadingOptions, error: filterOptionsError } = useQuery<FilterOptions>({
    queryKey: ['/api/admin/email-targets/filter-options'],
    enabled: isAuthenticated && (user as any)?.isAdmin,
    retry: 2
  });

  // Preview email targets
  const previewMutation = useMutation<PreviewResult, Error, EmailTargetFilters>({
    mutationFn: async (filters: EmailTargetFilters) => {
      const response = await apiRequest('POST', '/api/admin/email-targets/preview', filters);
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Preview Error",
        description: "Failed to preview email targets",
        variant: "destructive"
      });
    }
  });

  // Fetch campaigns
  const { data: campaigns, isLoading: loadingCampaigns, error: campaignsError } = useQuery<EmailCampaign[]>({
    queryKey: ['/api/admin/email-campaigns'],
    enabled: isAuthenticated && (user as any)?.isAdmin,
    retry: 2
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation<EmailCampaign, Error, any>({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest('POST', '/api/admin/email-campaigns', campaignData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-campaigns'] });
      handleCloseModal();
      toast({
        title: "Success",
        description: "Email campaign created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive"
      });
    }
  });

  // Update campaign mutation  
  const updateCampaignMutation = useMutation<EmailCampaign, Error, { id: number; data: any }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest('PUT', `/api/admin/email-campaigns/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-campaigns'] });
      handleCloseModal();
      toast({
        title: "Success",
        description: "Campaign updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive"
      });
    }
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation<any, Error, number>({
    mutationFn: async (campaignId: number) => {
      const response = await apiRequest('POST', `/api/admin/email-campaigns/${campaignId}/send`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-campaigns'] });
      toast({
        title: "Success",
        description: "Campaign queued for sending"
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to send campaign",
        variant: "destructive"
      });
    }
  });

  const handleFilterChange = (filterType: keyof EmailTargetFilters, mode: 'any' | 'all', values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: { mode, values }
    }));
  };

  const handlePreview = () => {
    previewMutation.mutate(filters);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    // Set the campaign for editing
    setEditingCampaignId(campaign.id);
    setNewCampaign({
      name: campaign.name,
      subject: campaign.subject,
      htmlContent: campaign.htmlContent
    });
    setFilters(campaign.targetFilters || { globalOperator: 'AND', limit: 100, offset: 0 });
    setIsCreatingCampaign(true);
  };

  const handleSendCampaign = (campaignId: number) => {
    if (confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      sendCampaignMutation.mutate(campaignId);
    }
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.htmlContent) {
      toast({
        title: "Validation Error",
        description: "Please fill in all campaign fields",
        variant: "destructive"
      });
      return;
    }

    if (editingCampaignId) {
      // Update existing campaign
      updateCampaignMutation.mutate({
        id: editingCampaignId,
        data: {
          ...newCampaign,
          targetFilters: filters
        }
      });
    } else {
      // Create new campaign
      createCampaignMutation.mutate({
        ...newCampaign,
        targetFilters: filters
      });
    }
  };

  const handleCloseModal = () => {
    setIsCreatingCampaign(false);
    setEditingCampaignId(null);
    setNewCampaign({ name: '', subject: '', htmlContent: '' });
    setFilters({ globalOperator: 'AND', limit: 100, offset: 0 });
  };

  if (loadingOptions) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (filterOptionsError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Failed to Load</h2>
            <p className="text-gray-600">Unable to load filter options. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Targeting</h1>
            <p className="text-gray-600">Create targeted email campaigns for specific member groups</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsCreatingCampaign(true)}
          className="flex items-center space-x-2"
          data-testid="button-create-campaign"
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </Button>
      </div>

      <Tabs defaultValue="targeting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="targeting" data-testid="tab-targeting">Targeting & Preview</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="targeting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Filters Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter size={20} />
                  <span>Target Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Global Operator */}
                <div className="space-y-2">
                  <Label>Filter Logic</Label>
                  <Select 
                    value={filters.globalOperator} 
                    onValueChange={(value: 'AND' | 'OR') => setFilters(prev => ({ ...prev, globalOperator: value }))}
                  >
                    <SelectTrigger data-testid="select-global-operator">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND (Match all conditions)</SelectItem>
                      <SelectItem value="OR">OR (Match any condition)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Person Types Filter */}
                {filterOptions?.personTypes && filterOptions.personTypes.length > 0 && (
                  <FilterGroup
                    title="Person Types"
                    options={filterOptions.personTypes}
                    onChange={(mode, values) => handleFilterChange('personTypes', mode, values)}
                    testId="filter-person-types"
                    mode={filters.personTypes?.mode}
                    selectedValues={filters.personTypes?.values}
                  />
                )}

                {/* Membership Tiers Filter */}
                {filterOptions?.membershipTiers && filterOptions.membershipTiers.length > 0 && (
                  <FilterGroup
                    title="Membership Tiers"
                    options={filterOptions.membershipTiers}
                    onChange={(mode, values) => handleFilterChange('membershipTiers', mode, values)}
                    testId="filter-membership-tiers"
                    mode={filters.membershipTiers?.mode}
                    selectedValues={filters.membershipTiers?.values}
                  />
                )}

                {/* Participant Roles Filter */}
                {filterOptions?.participantRoles && filterOptions.participantRoles.length > 0 && (
                  <FilterGroup
                    title="Participant Roles"
                    options={filterOptions.participantRoles}
                    onChange={(mode, values) => handleFilterChange('participantRoles', mode, values)}
                    testId="filter-participant-roles"
                    mode={filters.participantRoles?.mode}
                    selectedValues={filters.participantRoles?.values}
                  />
                )}

                {/* AI Interests Filter */}
                {filterOptions?.aiInterests && filterOptions.aiInterests.length > 0 && (
                  <FilterGroup
                    title="AI Interests"
                    options={filterOptions.aiInterests}
                    onChange={(mode, values) => handleFilterChange('aiInterests', mode, values)}
                    testId="filter-ai-interests"
                    mode={filters.aiInterests?.mode}
                    selectedValues={filters.aiInterests?.values}
                  />
                )}

                {/* Business Types Filter */}
                {filterOptions?.businessTypes && filterOptions.businessTypes.length > 0 && (
                  <FilterGroup
                    title="Business Types"
                    options={filterOptions.businessTypes}
                    onChange={(mode, values) => handleFilterChange('businessTypes', mode, values)}
                    testId="filter-business-types"
                    mode={filters.businessTypes?.mode}
                    selectedValues={filters.businessTypes?.values}
                  />
                )}

                {/* Districts Filter */}
                {filterOptions?.districts && filterOptions.districts.length > 0 && (
                  <FilterGroup
                    title="Districts"
                    options={filterOptions.districts}
                    onChange={(mode, values) => handleFilterChange('districts', mode, values)}
                    testId="filter-districts"
                    mode={filters.districts?.mode}
                    selectedValues={filters.districts?.values}
                  />
                )}

                <Button 
                  onClick={handlePreview} 
                  className="w-full"
                  disabled={previewMutation.isPending}
                  data-testid="button-preview-targets"
                >
                  {previewMutation.isPending ? (
                    <>
                      <RefreshCw size={16} className="animate-spin mr-2" />
                      Previewing...
                    </>
                  ) : (
                    <>
                      <Eye size={16} className="mr-2" />
                      Preview Targets
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users size={20} />
                  <span>Target Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewMutation.data ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users size={20} className="text-blue-600" />
                        <span className="font-semibold text-blue-900">Total Recipients</span>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1" data-testid="text-recipient-count">
                        {previewMutation.data.count}
                      </Badge>
                    </div>

                    {previewMutation.data.sample && previewMutation.data.sample.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Sample Recipients:</h4>
                        <div className="space-y-1 max-h-64 overflow-y-auto" data-testid="list-sample-recipients">
                          {previewMutation.data.sample.map((contact, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <div>
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-gray-600">{contact.email}</div>
                              </div>
                              <div className="flex space-x-1">
                                {contact.personTypes.map((type, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Click "Preview Targets" to see recipient count and sample contacts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCampaigns ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : campaignsError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-semibold mb-2">Failed to Load Campaigns</h3>
                  <p className="text-gray-600 mb-4">Unable to load email campaigns. Please try again.</p>
                  <Button 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/email-campaigns'] })}
                    data-testid="button-retry-campaigns"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Retry
                  </Button>
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-4" data-testid="list-campaigns">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                            data-testid={`badge-campaign-status-${campaign.id}`}
                          >
                            {campaign.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Created {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditCampaign(campaign)}
                            data-testid={`button-edit-${campaign.id}`}
                          >
                            <Settings size={14} className="mr-1" />
                            Edit
                          </Button>
                        )}
                        {campaign.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleSendCampaign(campaign.id)}
                            disabled={sendCampaignMutation.isPending}
                            data-testid={`button-send-${campaign.id}`}
                          >
                            {sendCampaignMutation.isPending ? (
                              <RefreshCw size={14} className="animate-spin mr-1" />
                            ) : (
                              <Send size={14} className="mr-1" />
                            )}
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Mail size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No email campaigns yet. Create your first campaign!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign Creation Modal */}
      {isCreatingCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingCampaignId ? 'Edit Email Campaign' : 'Create Email Campaign'}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCloseModal}
                data-testid="button-close-modal"
              >
                <X size={16} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                    data-testid="input-campaign-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="campaign-subject">Email Subject</Label>
                  <Input
                    id="campaign-subject"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject"
                    data-testid="input-campaign-subject"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="campaign-content">Email Content (HTML)</Label>
                  <Textarea
                    id="campaign-content"
                    value={newCampaign.htmlContent}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, htmlContent: e.target.value }))}
                    placeholder="Enter HTML email content"
                    rows={10}
                    className="font-mono text-sm"
                    data-testid="textarea-campaign-content"
                  />
                  <p className="text-xs text-gray-500">
                    You can use HTML tags for formatting. Variables like {`{{firstName}}`} will be replaced automatically.
                  </p>
                </div>
              </div>

              {/* Target Summary */}
              {previewMutation.data && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Target Summary</h4>
                  <p className="text-sm text-blue-700">
                    This campaign will be sent to <strong>{previewMutation.data.count}</strong> recipients based on your selected filters.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleCloseModal}
                  data-testid="button-cancel-campaign"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                  data-testid="button-save-campaign"
                >
                  {createCampaignMutation.isPending || updateCampaignMutation.isPending ? (
                    <>
                      <RefreshCw size={16} className="animate-spin mr-2" />
                      {editingCampaignId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      {editingCampaignId ? 'Update Campaign' : 'Create Campaign'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}