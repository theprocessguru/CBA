import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users, Download, UserPlus, Building2 } from "lucide-react";
import { Helmet } from "react-helmet";

interface ImportPreview {
  headers: string[];
  rows: any[][];
  totalRows: number;
}

interface FieldMapping {
  [key: string]: string;
}

interface PersonType {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
}

export default function DataImport() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping>({});
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'complete'>('upload');
  const [importType, setImportType] = useState<'business' | 'people'>('people'); // Default to people for AI Summit
  const [selectedPersonTypes, setSelectedPersonTypes] = useState<number[]>([]);

  // Fetch person types for both people and business imports
  const { data: personTypes = [] } = useQuery<PersonType[]>({
    queryKey: ["/api/person-types"]
  });

  // Available database fields for mapping
  const businessFields = [
    { value: 'skip', label: 'Skip this column' },
    // Contact Information
    { value: 'name', label: 'Business Name' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'website', label: 'Website' },
    { value: 'contactFirstName', label: 'Contact First Name' },
    { value: 'contactLastName', label: 'Contact Last Name' },
    { value: 'contactJobTitle', label: 'Contact Job Title' },
    
    // Address Information
    { value: 'address', label: 'Address' },
    { value: 'city', label: 'City' },
    { value: 'postcode', label: 'Postcode' },
    { value: 'country', label: 'Country' },
    
    // Business Information
    { value: 'industry', label: 'Industry/Sector' },
    { value: 'description', label: 'Business Description' },
    { value: 'employeeCount', label: 'Number of Employees' },
    { value: 'foundedYear', label: 'Year Founded' },
    { value: 'turnover', label: 'Annual Turnover' },
    { value: 'businessType', label: 'Business Type (Ltd, LLP, Sole Trader, etc)' },
    
    // Companies House Data (exact field names)
    { value: 'company_number', label: 'Company Number' },
    { value: 'sic_codes', label: 'SIC Codes' },
    { value: 'registered_office_address', label: 'Registered Office Address' },
    { value: 'date_of_creation', label: 'Date of Creation' },
    { value: 'accounting_reference_date', label: 'Accounting Reference Date' },
    { value: 'confirmation_statement_last_made_up_to', label: 'Confirmation Statement Date' },
    { value: 'company_status', label: 'Company Status' },
    { value: 'company_type', label: 'Company Type' },
    { value: 'jurisdiction', label: 'Jurisdiction' },
    { value: 'has_been_liquidated', label: 'Has Been Liquidated' },
    { value: 'has_insolvency_history', label: 'Has Insolvency History' },
    
    // Tax/HMRC Data
    { value: 'vat_number', label: 'VAT Number (HMRC)' },
    
    // Membership Information
    { value: 'membershipTier', label: 'Membership Tier' },
    { value: 'membershipStatus', label: 'Membership Status' },
    { value: 'joinDate', label: 'Join Date' },
    { value: 'renewalDate', label: 'Renewal Date' },
    
    // Social Media
    { value: 'socialMedia.facebook', label: 'Facebook URL' },
    { value: 'socialMedia.twitter', label: 'Twitter/X URL' },
    { value: 'socialMedia.linkedin', label: 'LinkedIn URL' },
    { value: 'socialMedia.instagram', label: 'Instagram URL' },
    { value: 'socialMedia.youtube', label: 'YouTube URL' },
    
    // Additional Fields
    { value: 'tags', label: 'Tags (comma-separated)' },
    { value: 'notes', label: 'Notes' },
    { value: 'source', label: 'Data Source' },
  ];

  const peopleFields = [
    { value: 'skip', label: 'Skip this column' },
    // Personal Information
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'postcode', label: 'Postcode' },
    
    // Professional Information
    { value: 'title', label: 'Title (Mr, Mrs, Dr, Mayor, etc)' },
    { value: 'company', label: 'Company/Organization' },
    { value: 'jobTitle', label: 'Job Title' },
    { value: 'bio', label: 'Biography/Description' },
    
    // Contact & QR System
    { value: 'qrHandle', label: 'QR Handle (unique identifier)' },
    
    // Membership Information
    { value: 'membershipTier', label: 'Membership Tier' },
    { value: 'membershipStatus', label: 'Membership Status' },
    
    // Person Type & Classification
    { value: 'participantType', label: 'Primary Participant Type (uses database person types)' },
    
    // Interest Areas (from CSV: AI Basics, Education & Learning, AI in Healthcare, Career Opportunities, AI for Seniors, Family Activities)
    { value: 'interestAreas', label: 'Interest Areas (AI Basics, Education & Learning, AI in Healthcare, Career Opportunities, AI for Seniors, Family Activities)' },
    
    // Volunteer/Student Fields
    { value: 'university', label: 'University' },
    { value: 'studentId', label: 'Student ID' },
    { value: 'course', label: 'Course/Program' },
    { value: 'yearOfStudy', label: 'Year of Study' },
    { value: 'communityRole', label: 'Community Role' },
    { value: 'volunteerExperience', label: 'Volunteer Experience' },
    { value: 'isVolunteer', label: 'Is Volunteer (TRUE/FALSE)' },
    
    // Accessibility & Special Needs
    { value: 'accessibilityNeeds', label: 'Accessibility Needs' },
    
    // Additional Fields
    { value: 'notes', label: 'Notes' },
  ];

  const dbFields = importType === 'business' ? businessFields : peopleFields;

  // Upload and preview CSV/Excel file
  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiRequest('POST', '/api/data-import/preview', formData);
      return response.json();
    },
    onSuccess: (data: ImportPreview) => {
      setImportPreview(data);
      setImportStep('mapping');
      // Initialize field mappings with smart defaults
      const mappings: FieldMapping = {};
      if (Array.isArray(data.headers)) {
        data.headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        
        // Smart mapping for business imports
        if (importType === 'business') {
          if (lowerHeader.includes('business') || lowerHeader.includes('company') || lowerHeader.includes('name')) {
            mappings[header] = 'name';
          } else if (lowerHeader.includes('email')) {
            mappings[header] = 'email';
          } else if (lowerHeader.includes('phone')) {
            mappings[header] = 'phone';
          } else if (lowerHeader.includes('website')) {
            mappings[header] = 'website';
          } else if (lowerHeader.includes('address')) {
            mappings[header] = 'address';
          } else if (lowerHeader.includes('city')) {
            mappings[header] = 'city';
          } else if (lowerHeader.includes('postcode') || lowerHeader.includes('zip')) {
            mappings[header] = 'postcode';
          }
        } else {
          // Smart mapping for people imports
          if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
            mappings[header] = 'firstName';
          } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
            mappings[header] = 'lastName';
          } else if (lowerHeader.includes('email')) {
            mappings[header] = 'email';
          } else if (lowerHeader.includes('phone')) {
            mappings[header] = 'phone';
          } else if (lowerHeader.includes('postcode') || lowerHeader.includes('zip')) {
            mappings[header] = 'postcode';
          } else if (lowerHeader.includes('notes') || lowerHeader.includes('note')) {
            mappings[header] = 'notes';
          } else if (lowerHeader.includes('person') && lowerHeader.includes('type')) {
            mappings[header] = 'participantType';
          } else if (lowerHeader.includes('interest') && lowerHeader.includes('area')) {
            mappings[header] = 'interestAreas';
          } else if (lowerHeader.includes('accessibility') && lowerHeader.includes('need')) {
            mappings[header] = 'accessibilityNeeds';
          } else if (lowerHeader.includes('is') && lowerHeader.includes('volunteer')) {
            mappings[header] = 'isVolunteer';
          } else if (lowerHeader.includes('company') || lowerHeader.includes('organisation')) {
            mappings[header] = 'company';
          } else if (lowerHeader.includes('title') && !lowerHeader.includes('job')) {
            mappings[header] = 'title';
          } else if (lowerHeader.includes('job') || lowerHeader.includes('position')) {
            mappings[header] = 'jobTitle';
          } else if (lowerHeader.includes('university')) {
            mappings[header] = 'university';
          } else if (lowerHeader.includes('student') && lowerHeader.includes('id')) {
            mappings[header] = 'studentId';
          } else if (lowerHeader.includes('course')) {
            mappings[header] = 'course';
          } else if (lowerHeader.includes('year')) {
            mappings[header] = 'yearOfStudy';
          } else if (lowerHeader.includes('participant') && lowerHeader.includes('type')) {
            mappings[header] = 'participantType';
          }
        }
        });
      }
      setFieldMappings(mappings);
    },
  });

  // Import mutation - updated to support both business and people imports
  const importMutation = useMutation({
    mutationFn: async ({ file, mappings }: { file: File, mappings: FieldMapping }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mappings', JSON.stringify(mappings));
      
      // Add person type IDs for both business and people imports
      formData.append('personTypeIds', JSON.stringify(selectedPersonTypes));
      
      const endpoint = importType === 'business' ? '/api/data-import/import' : '/api/data-import/import-people';
      const response = await apiRequest('POST', endpoint, formData);
      return response.json();
    },
    onSuccess: (data) => {
      setImportStep('complete');
      toast({
        title: "Import Successful",
        description: `Imported ${data.imported} records. ${data.skipped} records were skipped.`,
      });
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "There was an error importing your data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    if (selectedFile) {
      // Validate person types for people imports
      if (importType === 'people' && selectedPersonTypes.length === 0) {
        toast({
          title: "Person Types Required",
          description: "Please select at least one person type for people imports.",
          variant: "destructive",
        });
        return;
      }
      importMutation.mutate({ file: selectedFile, mappings: fieldMappings });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV or Excel file",
          variant: "destructive",
        });
      }
    }
  };

  const handlePreview = () => {
    if (selectedFile) {
      previewMutation.mutate(selectedFile);
    }
  };

  const handleMappingChange = (header: string, dbField: string) => {
    setFieldMappings(prev => ({
      ...prev,
      [header]: dbField
    }));
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportPreview(null);
    setFieldMappings({});
    setImportStep('upload');
  };

  // Generate CSV template with all fields
  const downloadTemplate = () => {
    const headers = [
      'Business Name',
      'Email Address',
      'Phone Number',
      'Website',
      'Contact First Name',
      'Contact Last Name',
      'Contact Job Title',
      'Address',
      'City',
      'Postcode',
      'Country',
      'Industry/Sector',
      'Business Description',
      'Number of Employees',
      'Year Founded',
      'Annual Turnover',
      // Companies House exact field names
      'company_number',
      'sic_codes',
      'registered_office_address',
      'date_of_creation',
      'accounting_reference_date',
      'confirmation_statement_last_made_up_to',
      'company_status',
      'company_type',
      'jurisdiction',
      'has_been_liquidated',
      'has_insolvency_history',
      'vat_number',
      // Membership fields
      'Membership Tier',
      'Membership Status',
      'Join Date',
      'Renewal Date',
      // Social media
      'Facebook URL',
      'Twitter URL',
      'LinkedIn URL',
      'Instagram URL',
      'YouTube URL',
      // Metadata
      'Tags',
      'Notes',
      'Data Source'
    ];
    
    const sampleData = [
      [
        'Example Business Ltd',
        'contact@example.com',
        '020 1234 5678',
        'https://example.com',
        'John',
        'Smith',
        'Managing Director',
        '123 Business Street',
        'Croydon',
        'CR0 1AA',
        'UK',
        'Technology',
        'Leading provider of innovative solutions',
        '10-50',
        '2015',
        '£1,000,000',
        // Companies House data with exact field names
        '12345678',  // company_number
        '62012,62020',  // sic_codes (can be multiple)
        '123 Registered Street, London, SW1A 1AA',  // registered_office_address
        '2015-01-01',  // date_of_creation
        '31-12',  // accounting_reference_date (day-month format)
        '2025-01-01',  // confirmation_statement_last_made_up_to
        'active',  // company_status (lowercase)
        'ltd',  // company_type (lowercase)
        'england-wales',  // jurisdiction
        'false',  // has_been_liquidated
        'false',  // has_insolvency_history
        'GB123456789',  // vat_number
        // Membership data
        'Gold',
        'Active',
        '01/01/2024',
        '01/01/2025',
        // Social media
        'https://facebook.com/example',
        'https://twitter.com/example',
        'https://linkedin.com/company/example',
        'https://instagram.com/example',
        'https://youtube.com/example',
        // Metadata
        'technology,croydon,member',
        'Key account',
        'Companies House'
      ]
    ];
    
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "Use this template to prepare your business data for import",
    });
  };

  return (
    <>
      <Helmet>
        <title>Data Import - CBA</title>
        <meta name="description" content="Import existing business lists and member data into the Croydon Business Association database." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {importType === 'business' ? 'Business Data Import' : 'People Data Import'}
            </h1>
            <p className="text-lg text-gray-600">
              {importType === 'business' 
                ? 'Import business data with Companies House information' 
                : 'Import contact lists, volunteers, students, and member profiles'
              }
            </p>
            <p className="text-sm text-blue-600 mt-2">All imported data automatically syncs to MYT Automation with 150+ custom fields</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${importStep === 'upload' ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  importStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {importStep === 'upload' ? '1' : <CheckCircle className="w-5 h-5" />}
                </div>
                <span className="ml-2 font-medium">Upload File</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center ${
                importStep === 'mapping' ? 'text-blue-600' : 
                importStep === 'complete' ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  importStep === 'mapping' ? 'bg-blue-600 text-white' : 
                  importStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {importStep === 'complete' ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span className="ml-2 font-medium">Map Fields</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center ${importStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  importStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {importStep === 'complete' ? <CheckCircle className="w-5 h-5" /> : '3'}
                </div>
                <span className="ml-2 font-medium">Import Complete</span>
              </div>
            </div>
          </div>

          {importStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {importType === 'business' ? 'Upload Business List' : 'Upload People List'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Import Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className={`cursor-pointer border-2 transition-colors ${
                    importType === 'business' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`} onClick={() => setImportType('business')}>
                    <CardContent className="p-4 text-center">
                      <Building2 className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-semibold text-gray-900">Business Import</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Import business directories with Companies House data, notes, and 30+ fields
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className={`cursor-pointer border-2 transition-colors ${
                    importType === 'people' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`} onClick={() => setImportType('people')}>
                    <CardContent className="p-4 text-center">
                      <Users className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-semibold text-gray-900">People Import</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Import contact lists, volunteers, students, and member profiles
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-lg font-medium text-gray-900">
                        Choose a CSV or Excel file
                      </span>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-sm text-gray-500">
                      Supports CSV, XLS, and XLSX files up to 10MB
                    </p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">{selectedFile.name}</span>
                        <Badge variant="secondary">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                      <Button 
                        onClick={handlePreview}
                        disabled={previewMutation.isPending}
                      >
                        {previewMutation.isPending ? "Processing..." : "Preview & Map Fields"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">Need a Template?</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download CSV Template
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Download our comprehensive CSV template with all fields including Companies House data.
                    The template includes:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <span>• Business Details</span>
                    <span>• Contact Information</span>
                    <span>• Companies House Data</span>
                    <span>• Address & Location</span>
                    <span>• Financial Information</span>
                    <span>• Membership Status</span>
                    <span>• Social Media Links</span>
                    <span>• VAT & Tax Numbers</span>
                    <span>• And much more...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {importStep === 'mapping' && importPreview && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Select Person Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      {importType === 'people' 
                        ? 'Select which person types to assign to the imported people. You can assign multiple types.'
                        : 'Select which person types to assign to the business contacts/owners. You can assign multiple types.'
                      }
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {personTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type.id}`}
                          checked={selectedPersonTypes.includes(type.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPersonTypes([...selectedPersonTypes, type.id]);
                            } else {
                              setSelectedPersonTypes(selectedPersonTypes.filter(id => id !== type.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`type-${type.id}`}
                          className="text-sm font-medium cursor-pointer flex items-center gap-1"
                        >
                          {type.displayName}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedPersonTypes.length > 0 && (
                    <div className="text-sm text-green-600 mt-2">
                      ✓ Selected {selectedPersonTypes.length} person type{selectedPersonTypes.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Field Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Found {importPreview.totalRows} rows in your file. Map each column to the corresponding database field.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Array.isArray(importPreview.headers) ? importPreview.headers.map((header, index) => (
                      <div key={header} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border border-gray-200 rounded-lg">
                        <div>
                          <Label className="font-medium">{header}</Label>
                          <p className="text-sm text-gray-500 mt-1">
                            Sample: {importPreview.rows[0]?.[index] || 'No data'}
                          </p>
                        </div>
                        <div>
                          <Select 
                            value={fieldMappings[header] || 'skip'} 
                            onValueChange={(value) => handleMappingChange(header, value === 'skip' ? '' : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select database field" />
                            </SelectTrigger>
                            <SelectContent>
                              {dbFields.map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          {fieldMappings[header] ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Mapped
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Skipped
                            </Badge>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-gray-500">
                        No headers found in the uploaded file.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={resetImport}>
                      Start Over
                    </Button>
                    <Button 
                      onClick={handleImport}
                      disabled={importMutation.isPending || Object.values(fieldMappings).filter(v => v).length === 0}
                    >
                      {importMutation.isPending ? "Importing..." : "Import Data"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {importStep === 'complete' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Import Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="py-8">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Data imported successfully!
                  </h3>
                  <p className="text-gray-600">
                    Your business list has been added to the database. You can now view and manage these businesses in the directory.
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button onClick={resetImport} variant="outline">
                    Import Another File
                  </Button>
                  <Button onClick={() => window.location.href = '/directory'}>
                    View Directory
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Information */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Import Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">File Requirements</h4>
                  <ul className="space-y-1">
                    <li>• CSV, XLS, or XLSX format</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• First row should contain headers</li>
                    <li>• Duplicate emails will be skipped</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Data Quality Tips</h4>
                  <ul className="space-y-1">
                    <li>• Include business name and email at minimum</li>
                    <li>• Use consistent formatting for phone numbers</li>
                    <li>• Include full URLs for websites and social media</li>
                    <li>• Check for spelling errors before importing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}