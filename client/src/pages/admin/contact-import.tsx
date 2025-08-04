import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Users, AlertCircle, CheckCircle, Download, X, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as Papa from "papaparse";

interface ImportPreview {
  headers: string[];
  data: any[];
  rowCount: number;
  contactType: string;
  mappings: Record<string, string>;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  duplicates: number;
}

const CONTACT_TYPES = [
  { value: "volunteer", label: "Volunteers" },
  { value: "exhibitor", label: "Exhibitors" },
  { value: "speaker", label: "Speakers" },
  { value: "sponsor", label: "Sponsors" },
  { value: "attendee", label: "General Attendees" },
  { value: "vip", label: "VIP Guests" },
  { value: "staff", label: "Staff Members" },
  { value: "media", label: "Media/Press" }
];

const FIELD_MAPPINGS = {
  "email": ["email", "email_address", "e_mail", "contact_email"],
  "firstName": ["first_name", "firstname", "given_name", "forename"],
  "lastName": ["last_name", "lastname", "surname", "family_name"],
  "company": ["company", "organization", "business", "employer"],
  "jobTitle": ["job_title", "position", "role", "title"],
  "phone": ["phone", "telephone", "mobile", "contact_number"],
  "participantType": ["type", "participant_type", "contact_type", "category"],
  "bio": ["bio", "biography", "description", "about"],
  "university": ["university", "college", "institution", "school"],
  "course": ["course", "degree", "program", "major"],
  "yearOfStudy": ["year", "year_of_study", "academic_year", "level"],
  "volunteerExperience": ["experience", "volunteer_experience", "background", "skills"]
};

export default function ContactImport() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [contactType, setContactType] = useState<string>("");
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get existing contacts for duplicate checking
  const { data: existingContacts } = useQuery({
    queryKey: ["/api/admin/contacts"],
    enabled: false
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or Excel file",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = Object.keys(results.data[0] || {});
          setPreview({
            headers,
            data: results.data.slice(0, 5), // Preview first 5 rows
            rowCount: results.data.length,
            contactType: contactType,
            mappings: {}
          });
          autoMapFields(headers);
        },
        error: (error) => {
          toast({
            title: "Parse Error",
            description: `Failed to parse CSV: ${error.message}`,
            variant: "destructive"
          });
        }
      });
    } else {
      // Handle Excel files (would need additional library like xlsx)
      toast({
        title: "Excel Support",
        description: "Excel file support coming soon. Please use CSV format.",
        variant: "destructive"
      });
    }
  };

  const autoMapFields = (headers: string[]) => {
    const newMappings: Record<string, string> = {};
    
    Object.entries(FIELD_MAPPINGS).forEach(([field, variations]) => {
      const matchedHeader = headers.find(header => 
        variations.some(variation => 
          header.toLowerCase().includes(variation.toLowerCase())
        )
      );
      if (matchedHeader) {
        newMappings[field] = matchedHeader;
      }
    });

    setMappings(newMappings);
  };

  const updateMapping = (field: string, header: string) => {
    setMappings(prev => ({
      ...prev,
      [field]: header
    }));
  };

  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/admin/contacts/import", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: (result) => {
      setImportResult(result);
      setImporting(false);
      setProgress(100);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.success} contacts`
      });
    },
    onError: (error: any) => {
      setImporting(false);
      setProgress(0);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import contacts",
        variant: "destructive"
      });
    }
  });

  const handleImport = async () => {
    if (!file || !preview || !contactType) {
      toast({
        title: "Missing Information",
        description: "Please select a file, contact type, and configure field mappings",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    // Parse the entire file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importData = {
          contacts: results.data,
          contactType,
          mappings,
          options: {
            skipDuplicates: true,
            updateExisting: false
          }
        };

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 500);

        setTimeout(() => {
          clearInterval(progressInterval);
          importMutation.mutate(importData);
        }, 3000);
      }
    });
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        email: "volunteer@example.com",
        first_name: "John",
        last_name: "Doe",
        company: "Example Corp",
        job_title: "Manager",
        phone: "+44 7123 456789",
        participant_type: "volunteer",
        bio: "Experienced volunteer",
        university: "University of London",
        course: "Computer Science",
        year_of_study: "3",
        volunteer_experience: "5 years community work"
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    setContactType("");
    setMappings({});
    setImportResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Import</h1>
        <p className="text-gray-600 mt-2">
          Import volunteers, exhibitors, speakers, and other contacts in bulk
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">Import Contacts</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* Step 1: File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 1: Upload File
              </CardTitle>
              <CardDescription>
                Upload a CSV or Excel file containing contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">{file.name}</span>
                  <Button size="sm" variant="ghost" onClick={resetImport}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Contact Type Selection */}
          {file && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Step 2: Select Contact Type
                </CardTitle>
                <CardDescription>
                  Choose what type of contacts you're importing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={contactType} onValueChange={setContactType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Field Mapping */}
          {preview && contactType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Step 3: Configure Field Mapping
                </CardTitle>
                <CardDescription>
                  Map your file columns to contact fields. Found {preview.rowCount} rows.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(FIELD_MAPPINGS).map(([field, variations]) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field}>
                        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        {field === 'email' && <span className="text-red-500">*</span>}
                      </Label>
                      <Select 
                        value={mappings[field] || ""} 
                        onValueChange={(value) => updateMapping(field, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No mapping</SelectItem>
                          {preview.headers.map(header => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Data Preview</h4>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {preview.headers.slice(0, 6).map(header => (
                            <th key={header} className="p-2 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.data.slice(0, 3).map((row, index) => (
                          <tr key={index} className="border-t">
                            {preview.headers.slice(0, 6).map(header => (
                              <td key={header} className="p-2">
                                {row[header] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first 3 rows of {preview.rowCount} total rows
                  </p>
                </div>

                {!mappings.email && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Email mapping is required. Please select a column that contains email addresses.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Import */}
          {preview && contactType && mappings.email && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Step 4: Import Contacts
                </CardTitle>
                <CardDescription>
                  Ready to import {preview.rowCount} {contactType} contacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {importing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing contacts...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {importResult && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-green-800 font-medium">Success</div>
                        <div className="text-2xl font-bold text-green-600">
                          {importResult.success}
                        </div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-red-800 font-medium">Failed</div>
                        <div className="text-2xl font-bold text-red-600">
                          {importResult.failed}
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-yellow-800 font-medium">Duplicates</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {importResult.duplicates}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-blue-800 font-medium">Total</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {preview.rowCount}
                        </div>
                      </div>
                    </div>

                    {importResult.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Import Errors:</h4>
                        <div className="space-y-1">
                          {importResult.errors.slice(0, 5).map((error, index) => (
                            <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              {error}
                            </div>
                          ))}
                          {importResult.errors.length > 5 && (
                            <div className="text-sm text-gray-500">
                              ...and {importResult.errors.length - 5} more errors
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button onClick={resetImport} className="w-full">
                      Import Another File
                    </Button>
                  </div>
                )}

                {!importing && !importResult && (
                  <Button 
                    onClick={handleImport} 
                    className="w-full"
                    disabled={!mappings.email}
                  >
                    Start Import
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View previous contact imports and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Import history feature coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}