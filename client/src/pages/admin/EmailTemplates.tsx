import { useState, useEffect, useRef } from "react";
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
import { ArrowLeft, Save, Eye, Mail, MessageSquare, Tag, Workflow, AlertCircle, Plus, Trash2, Copy, Image, Video, Link2, Code, Type } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

// Custom toolbar for the rich text editor
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ]
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link', 'image'
];

export default function EmailTemplates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedPersonType, setSelectedPersonType] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [testEmail, setTestEmail] = useState("admin@croydonba.org.uk");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorMode, setEditorMode] = useState<"visual" | "code">("visual");

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
        testEmail: testEmail,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Test email sent to ${testEmail}`,
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
      variables: [],
      isActive: true,
    });
    setIsCreatingNew(true);
    setEditorMode("visual"); // Default to visual mode for new templates
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsCreatingNew(false);
    setEditorMode("visual"); // Default to visual mode when opening
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    if (!selectedTemplate.templateName || !selectedTemplate.subject) {
      toast({
        title: "Error",
        description: "Template name and subject are required",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(selectedTemplate);
  };

  const handleAddTag = () => {
    if (newTag && selectedTemplate) {
      const updatedTags = [...(selectedTemplate.mytTags || []), newTag];
      setSelectedTemplate({ ...selectedTemplate, mytTags: updatedTags });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (selectedTemplate) {
      const updatedTags = (selectedTemplate.mytTags || []).filter(tag => tag !== tagToRemove);
      setSelectedTemplate({ ...selectedTemplate, mytTags: updatedTags });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {};
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      if (selectedTemplate) {
        const imgHtml = `<img src="${data.imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;">`;
        setSelectedTemplate({
          ...selectedTemplate,
          htmlContent: selectedTemplate.htmlContent + imgHtml
        });
      }
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const insertMediaElement = (type: 'image' | 'video' | 'link' | 'logo') => {
    if (!selectedTemplate) return;

    let htmlToInsert = '';
    switch (type) {
      case 'image':
        if (imageUrl) {
          htmlToInsert = `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; display: block; margin: 20px auto;">`;
          setImageUrl('');
        }
        break;
      case 'video':
        if (videoUrl) {
          htmlToInsert = `
            <div style="text-align: center; margin: 20px 0;">
              <a href="${videoUrl}" style="display: inline-block; background: #f3f4f6; padding: 20px; border-radius: 8px; text-decoration: none;">
                <img src="https://img.icons8.com/color/96/000000/youtube-play.png" alt="Video" style="width: 60px; height: 60px;">
                <p style="color: #1f2937; margin-top: 10px; font-weight: 600;">Click to Watch Video</p>
              </a>
            </div>`;
          setVideoUrl('');
        }
        break;
      case 'link':
        if (linkUrl && linkText) {
          htmlToInsert = `<a href="${linkUrl}" style="color: #3B82F6; text-decoration: underline;">${linkText}</a>`;
          setLinkUrl('');
          setLinkText('');
        }
        break;
      case 'logo':
        htmlToInsert = `
          <div style="text-align: center; margin: 20px 0;">
            <img src="https://www.croydonba.org.uk/logo.png" alt="CBA Logo" style="max-width: 200px; height: auto;">
          </div>`;
        break;
    }

    if (htmlToInsert) {
      setSelectedTemplate({
        ...selectedTemplate,
        htmlContent: selectedTemplate.htmlContent + htmlToInsert
      });
    }
  };

  const renderPreview = (htmlContent: string) => {
    // Replace variables with sample data for preview
    let preview = htmlContent;
    preview = preview.replace(/{{firstName}}/g, 'John');
    preview = preview.replace(/{{lastName}}/g, 'Doe');
    preview = preview.replace(/{{fullName}}/g, 'John Doe');
    preview = preview.replace(/{{email}}/g, 'john.doe@example.com');
    preview = preview.replace(/{{company}}/g, 'Example Company');
    preview = preview.replace(/{{jobTitle}}/g, 'Manager');
    preview = preview.replace(/{{membershipTier}}/g, 'Gold');
    preview = preview.replace(/{{phone}}/g, '+44 20 1234 5678');
    preview = preview.replace(/{{eventName}}/g, 'AI Summit 2025');
    preview = preview.replace(/{{eventDate}}/g, 'October 1st, 2025');
    preview = preview.replace(/{{venue}}/g, 'LSBU Croydon');
    
    return preview;
  };

  // Filter templates by person type
  const filteredTemplates = selectedPersonType
    ? templates.filter(t => t.personType === selectedPersonType)
    : templates;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Email Templates</h1>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Manage email and SMS templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter by person type */}
            <Select value={selectedPersonType || "all"} onValueChange={(value) => setSelectedPersonType(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
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

            {/* Template List */}
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading templates...</p>
              ) : filteredTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No templates found</p>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{template.templateName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {personTypes.find(t => t.value === template.personType)?.label}
                          </Badge>
                          {template.isActive ? (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Template Editor */}
        {(selectedTemplate || isCreatingNew) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isCreatingNew ? 'Create Template' : 'Edit Template'}</CardTitle>
                <div className="flex gap-2">
                  {selectedTemplate?.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(selectedTemplate.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {previewMode ? (
                <div className="space-y-4">
                  <div>
                    <Label>Subject Preview</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      {renderPreview(selectedTemplate?.subject || '')}
                    </div>
                  </div>
                  <div>
                    <Label>Email Preview</Label>
                    <div className="border rounded-lg p-4 bg-white">
                      <div dangerouslySetInnerHTML={{ 
                        __html: renderPreview(selectedTemplate?.htmlContent || '') 
                      }} />
                    </div>
                  </div>
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
                        value={selectedTemplate?.templateName || ''}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate!,
                          templateName: e.target.value
                        })}
                        placeholder="e.g., Welcome Email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Email Subject *</Label>
                      <Input
                        id="subject"
                        value={selectedTemplate?.subject || ''}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate!,
                          subject: e.target.value
                        })}
                        placeholder="e.g., Welcome to {{eventName}}!"
                      />
                    </div>

                    <div>
                      <Label htmlFor="htmlContent">
                        Email Content (HTML) *
                      </Label>
                      
                      {/* Editor Mode Toggle */}
                      <div className="flex gap-2 mb-2">
                        <Button
                          variant={editorMode === "visual" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEditorMode("visual")}
                        >
                          <Type className="h-4 w-4 mr-2" />
                          Visual Editor
                        </Button>
                        <Button
                          variant={editorMode === "code" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEditorMode("code")}
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Code Editor
                        </Button>
                      </div>

                      {/* Media insertion buttons */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {/* Add Image Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Image className="h-4 w-4 mr-2" />
                              Add Image
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Image</DialogTitle>
                              <DialogDescription>
                                Enter an image URL or upload a file
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Image URL</Label>
                                <Input
                                  value={imageUrl}
                                  onChange={(e) => setImageUrl(e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                              <div className="text-center text-sm text-muted-foreground">OR</div>
                              <div>
                                <Label>Upload Image</Label>
                                <Input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                              </div>
                              <Button
                                onClick={() => insertMediaElement('image')}
                                disabled={!imageUrl}
                              >
                                Insert Image
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Add Video Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Add Video Link
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Video Link</DialogTitle>
                              <DialogDescription>
                                Enter a YouTube or Vimeo URL
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Video URL</Label>
                                <Input
                                  value={videoUrl}
                                  onChange={(e) => setVideoUrl(e.target.value)}
                                  placeholder="https://youtube.com/watch?v=..."
                                />
                              </div>
                              <Button
                                onClick={() => insertMediaElement('video')}
                                disabled={!videoUrl}
                              >
                                Insert Video Link
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Add Link Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Link2 className="h-4 w-4 mr-2" />
                              Add Link
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Link</DialogTitle>
                              <DialogDescription>
                                Enter a URL and link text
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Link URL</Label>
                                <Input
                                  value={linkUrl}
                                  onChange={(e) => setLinkUrl(e.target.value)}
                                  placeholder="https://example.com"
                                />
                              </div>
                              <div>
                                <Label>Link Text</Label>
                                <Input
                                  value={linkText}
                                  onChange={(e) => setLinkText(e.target.value)}
                                  placeholder="Click here"
                                />
                              </div>
                              <Button
                                onClick={() => insertMediaElement('link')}
                                disabled={!linkUrl || !linkText}
                              >
                                Insert Link
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Add CBA Logo */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => insertMediaElement('logo')}
                        >
                          Add CBA Logo
                        </Button>
                      </div>

                      {/* Editor based on mode */}
                      {editorMode === "visual" ? (
                        <div className="border rounded-lg">
                          <ReactQuill
                            theme="snow"
                            value={selectedTemplate?.htmlContent || ''}
                            onChange={(content) => setSelectedTemplate({
                              ...selectedTemplate!,
                              htmlContent: content
                            })}
                            modules={modules}
                            formats={formats}
                            style={{ minHeight: '300px' }}
                          />
                        </div>
                      ) : (
                        <Textarea
                          id="htmlContent"
                          value={selectedTemplate?.htmlContent || ''}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate!,
                            htmlContent: e.target.value
                          })}
                          placeholder="Enter HTML content..."
                          className="min-h-[300px] font-mono text-sm"
                        />
                      )}
                      
                      {/* Available Variables */}
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-medium">Available variables:</p>
                            <div className="flex flex-wrap gap-1">
                              {availableVariables.map((variable) => (
                                <Button
                                  key={variable}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    if (selectedTemplate) {
                                      setSelectedTemplate({
                                        ...selectedTemplate,
                                        htmlContent: selectedTemplate.htmlContent + ' ' + variable
                                      });
                                    }
                                  }}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  {variable}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>

                    <div>
                      <Label htmlFor="smsContent">SMS Content (Optional)</Label>
                      <Textarea
                        id="smsContent"
                        value={selectedTemplate?.smsContent || ''}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate!,
                          smsContent: e.target.value
                        })}
                        placeholder="Enter SMS content..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="automation" className="space-y-4">
                    <div>
                      <Label htmlFor="mytWorkflow">MyT Workflow ID</Label>
                      <Input
                        id="mytWorkflow"
                        value={selectedTemplate?.mytWorkflow || ''}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate!,
                          mytWorkflow: e.target.value
                        })}
                        placeholder="e.g., workflow_123"
                      />
                    </div>

                    <div>
                      <Label>MyT Tags</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Enter tag"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          />
                          <Button onClick={handleAddTag} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate?.mytTags?.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 text-xs hover:text-destructive"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div>
                      <Label htmlFor="personType">Person Type *</Label>
                      <Select
                        value={selectedTemplate?.personType || ''}
                        onValueChange={(value) => setSelectedTemplate({
                          ...selectedTemplate!,
                          personType: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                        checked={selectedTemplate?.isActive || false}
                        onCheckedChange={(checked) => setSelectedTemplate({
                          ...selectedTemplate!,
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
        )}
      </div>

      {/* Quick Test Section */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Test Template</CardTitle>
            <CardDescription>Send a test email to verify the template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                className="max-w-sm"
              />
              <Button
                onClick={() => testEmailMutation.mutate(selectedTemplate)}
                disabled={testEmailMutation.isPending || !testEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                {testEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}