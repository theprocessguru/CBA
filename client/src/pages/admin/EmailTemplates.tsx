import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Save, Eye, Mail, MessageSquare, Tag, Workflow, AlertCircle, Plus, Trash2, Copy } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailTemplate {
  id?: number;
  personType: string;
  templateName: string;
  subject: string;
  htmlContent: string;
  smsContent?: string;
  mytTags?: string[];
  mytWorkflow?: string;
  variables?: string[];
  isActive: boolean;
}

const personTypes = [
  { value: "system", label: "System" },
  { value: "volunteer", label: "Volunteer" },
  { value: "vip", label: "VIP" },
  { value: "speaker", label: "Speaker" },
  { value: "exhibitor", label: "Exhibitor" },
  { value: "sponsor", label: "Sponsor" },
  { value: "team", label: "Team Member" },
  { value: "student", label: "Student" },
  { value: "councillor", label: "Councillor" },
  { value: "media", label: "Media" },
  { value: "attendee", label: "Attendee" },
  { value: "resident", label: "Resident" }
];

const availableVariables = [
  "{{firstName}}", "{{lastName}}", "{{fullName}}", "{{email}}", 
  "{{company}}", "{{jobTitle}}", "{{membershipTier}}", "{{phone}}",
  "{{eventName}}", "{{eventDate}}", "{{venue}}"
];

export default function EmailTemplates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedPersonType, setSelectedPersonType] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [testEmail, setTestEmail] = useState("admin@croydonba.org.uk");

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
  });

  // Save template mutation
  const saveMutation = useMutation({
    mutationFn: async (template: EmailTemplate) => {
      const endpoint = template.id 
        ? `/api/admin/email-templates/${template.id}`
        : "/api/admin/email-templates";
      const method = template.id ? "PUT" : "POST";
      
      return apiRequest(method, endpoint, template);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email template saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      setSelectedTemplate(null);
      setIsCreatingNew(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return apiRequest("DELETE", `/api/admin/email-templates/${templateId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async (template: EmailTemplate) => {
      if (!testEmail) {
        throw new Error("Please enter a test email address");
      }
      return apiRequest("POST", "/api/admin/email-templates/test", {
        subject: template.subject,
        htmlContent: template.htmlContent,
        testEmail: testEmail
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${testEmail}. Check your inbox!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const handleCreateNew = () => {
    setSelectedTemplate({
      personType: "attendee",
      templateName: "",
      subject: "",
      htmlContent: "",
      smsContent: "",
      mytTags: [],
      mytWorkflow: "",
      variables: availableVariables,
      isActive: true
    });
    setIsCreatingNew(true);
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    
    if (!selectedTemplate.templateName || !selectedTemplate.subject || !selectedTemplate.htmlContent) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    saveMutation.mutate(selectedTemplate);
  };

  const handleDelete = (templateId: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim() || !selectedTemplate) return;
    
    setSelectedTemplate({
      ...selectedTemplate,
      mytTags: [...(selectedTemplate.mytTags || []), newTag.trim()]
    });
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedTemplate) return;
    
    setSelectedTemplate({
      ...selectedTemplate,
      mytTags: selectedTemplate.mytTags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const handleInsertVariable = (variable: string) => {
    if (!selectedTemplate) return;
    
    const textarea = document.querySelector('textarea[name="htmlContent"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = selectedTemplate.htmlContent;
      const newContent = content.substring(0, start) + variable + content.substring(end);
      
      setSelectedTemplate({
        ...selectedTemplate,
        htmlContent: newContent
      });
    }
  };

  const renderPreview = (content: string) => {
    // Replace variables with sample data for preview
    const sampleData = {
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      email: "john@example.com",
      company: "Example Corp",
      jobTitle: "Manager",
      membershipTier: "Growth Tier",
      phone: "020 1234 5678",
      eventName: "AI Summit 2025",
      eventDate: "March 28, 2025",
      venue: "Croydon Conference Centre"
    };

    let preview = content;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return preview;
  };

  const filteredTemplates = selectedPersonType && selectedPersonType !== "all"
    ? templates.filter(t => t.personType === selectedPersonType)
    : templates;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Link href="/admin-dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Email Templates</h1>
            <p className="text-gray-600 mt-1">Manage and customize email messages for different user types</p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>
      </div>

      {/* Quick Test Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Email Test</CardTitle>
          <CardDescription>
            You have {templates.length} email templates in the system. Test any template by selecting it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex gap-2">
              <Select
                value={selectedTemplate?.id?.toString() || ""}
                onValueChange={(value) => {
                  const template = templates.find(t => t.id?.toString() === value);
                  if (template) {
                    setSelectedTemplate(template);
                    setIsCreatingNew(false);
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a template to test" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id?.toString() || ""}>
                      {template.templateName} ({template.personType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="email"
                placeholder="Enter test email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="max-w-xs"
              />
              <Button
                onClick={() => selectedTemplate && testEmailMutation.mutate(selectedTemplate)}
                disabled={!selectedTemplate || !testEmail || testEmailMutation.isPending}
              >
                <Mail className="mr-2 h-4 w-4" />
                {testEmailMutation.isPending ? "Sending..." : "Send Test"}
              </Button>
            </div>
            {testEmailMutation.isSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Test email sent successfully to {testEmail}! Check your inbox.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <div className="mt-2 space-y-2">
                <Select value={selectedPersonType} onValueChange={setSelectedPersonType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by person type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {personTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPersonType && selectedPersonType !== "all" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedPersonType("")}
                    className="w-full"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredTemplates.length === 0 ? (
                <p className="text-gray-500 text-sm">No templates found</p>
              ) : (
                filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedTemplate?.id === template.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsCreatingNew(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{template.templateName}</h3>
                        <p className="text-sm text-gray-600">{template.personType}</p>
                      </div>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {isCreatingNew ? "Create New Template" : "Edit Template"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {previewMode ? "Edit" : "Preview"}
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saveMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    {selectedTemplate.id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(selectedTemplate.id!)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {selectedTemplate.id && (
                  <div className="flex gap-2 mt-4">
                    <Input
                      type="email"
                      placeholder="Test email address"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button
                      variant="outline"
                      onClick={() => testEmailMutation.mutate(selectedTemplate)}
                      disabled={testEmailMutation.isPending || !testEmail}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {testEmailMutation.isPending ? "Sending..." : "Send Test Email"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {previewMode ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Email Preview</h3>
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <p className="font-medium mb-2">Subject: {renderPreview(selectedTemplate.subject)}</p>
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderPreview(selectedTemplate.htmlContent) }}
                        />
                      </div>
                    </div>
                    {selectedTemplate.smsContent && (
                      <div>
                        <h3 className="font-medium mb-2">SMS Preview</h3>
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <p>{renderPreview(selectedTemplate.smsContent)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Tabs defaultValue="content" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="automation">Automation</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="space-y-4">
                      <div>
                        <Label htmlFor="templateName">Template Name *</Label>
                        <Input
                          id="templateName"
                          value={selectedTemplate.templateName}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            templateName: e.target.value
                          })}
                          placeholder="e.g., Welcome Email for Volunteers"
                        />
                      </div>

                      <div>
                        <Label htmlFor="subject">Email Subject *</Label>
                        <Input
                          id="subject"
                          value={selectedTemplate.subject}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            subject: e.target.value
                          })}
                          placeholder="e.g., Welcome to CBA {{firstName}}!"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="htmlContent">Email Content (HTML) *</Label>
                          <div className="flex gap-1">
                            {availableVariables.slice(0, 4).map(variable => (
                              <Button
                                key={variable}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleInsertVariable(variable)}
                                className="text-xs"
                              >
                                {variable}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <Textarea
                          id="htmlContent"
                          name="htmlContent"
                          value={selectedTemplate.htmlContent}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            htmlContent: e.target.value
                          })}
                          placeholder="Enter HTML content..."
                          className="min-h-[300px] font-mono text-sm"
                        />
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Available variables: {availableVariables.join(", ")}
                          </AlertDescription>
                        </Alert>
                      </div>

                      <div>
                        <Label htmlFor="smsContent">SMS Content (Optional)</Label>
                        <Textarea
                          id="smsContent"
                          value={selectedTemplate.smsContent || ""}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            smsContent: e.target.value
                          })}
                          placeholder="Enter SMS message..."
                          className="min-h-[100px]"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Character count: {selectedTemplate.smsContent?.length || 0} / 160
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="automation" className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          MyT Automation Tags
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag..."
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          />
                          <Button onClick={handleAddTag} size="sm">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedTemplate.mytTags?.map(tag => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 text-xs hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="mytWorkflow" className="flex items-center gap-2">
                          <Workflow className="h-4 w-4" />
                          MyT Automation Workflow ID
                        </Label>
                        <Input
                          id="mytWorkflow"
                          value={selectedTemplate.mytWorkflow || ""}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            mytWorkflow: e.target.value
                          })}
                          placeholder="e.g., volunteer-onboarding-sequence"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-4">
                      <div>
                        <Label htmlFor="personType">Person Type *</Label>
                        <Select 
                          value={selectedTemplate.personType}
                          onValueChange={(value) => setSelectedTemplate({
                            ...selectedTemplate,
                            personType: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {personTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={selectedTemplate.isActive}
                          onCheckedChange={(checked) => setSelectedTemplate({
                            ...selectedTemplate,
                            isActive: checked
                          })}
                        />
                        <Label htmlFor="isActive">Template is active</Label>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Select a template to edit or create a new one
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}