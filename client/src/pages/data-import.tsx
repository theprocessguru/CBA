import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users, Download } from "lucide-react";
import { Helmet } from "react-helmet";

interface ImportPreview {
  headers: string[];
  rows: any[][];
  totalRows: number;
}

interface FieldMapping {
  [key: string]: string;
}

export default function DataImport() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping>({});
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'complete'>('upload');

  // Available database fields for mapping
  const dbFields = [
    { value: '', label: 'Skip this column' },
    { value: 'name', label: 'Business Name' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'website', label: 'Website' },
    { value: 'address', label: 'Address' },
    { value: 'city', label: 'City' },
    { value: 'postcode', label: 'Postcode' },
    { value: 'industry', label: 'Industry' },
    { value: 'description', label: 'Description' },
    { value: 'employeeCount', label: 'Employee Count' },
    { value: 'foundedYear', label: 'Founded Year' },
    { value: 'socialMedia.facebook', label: 'Facebook URL' },
    { value: 'socialMedia.twitter', label: 'Twitter URL' },
    { value: 'socialMedia.linkedin', label: 'LinkedIn URL' },
    { value: 'socialMedia.instagram', label: 'Instagram URL' },
  ];

  // Upload and preview CSV/Excel file
  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/data-import/preview', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to preview file');
      }
      return response.json();
    },
    onSuccess: (data: ImportPreview) => {
      setImportPreview(data);
      setImportStep('mapping');
      // Initialize field mappings with smart defaults
      const mappings: FieldMapping = {};
      data.headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
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
        } else if (lowerHeader.includes('industry') || lowerHeader.includes('sector')) {
          mappings[header] = 'industry';
        } else {
          mappings[header] = '';
        }
      });
      setFieldMappings(mappings);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    },
  });

  // Import data with field mappings
  const importMutation = useMutation({
    mutationFn: async (data: { file: File; mappings: FieldMapping }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('mappings', JSON.stringify(data.mappings));
      const response = await fetch('/api/data-import/import', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to import data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.imported} businesses. ${data.skipped} duplicates skipped.`,
      });
      setImportStep('complete');
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
    },
  });

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

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate({ file: selectedFile, mappings: fieldMappings });
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

  return (
    <>
      <Helmet>
        <title>Data Import - CBA</title>
        <meta name="description" content="Import existing business lists and member data into the Croydon Business Association database." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Import</h1>
            <p className="text-lg text-gray-600">Upload and import existing business lists into the database</p>
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
                  Upload Business List
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <h4 className="font-semibold text-gray-900 mb-2">Supported Columns</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <span>• Business Name</span>
                    <span>• Email Address</span>
                    <span>• Phone Number</span>
                    <span>• Website</span>
                    <span>• Address</span>
                    <span>• City</span>
                    <span>• Postcode</span>
                    <span>• Industry</span>
                    <span>• Description</span>
                    <span>• Employee Count</span>
                    <span>• Founded Year</span>
                    <span>• Social Media URLs</span>
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
                    {importPreview.headers.map((header, index) => (
                      <div key={header} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border border-gray-200 rounded-lg">
                        <div>
                          <Label className="font-medium">{header}</Label>
                          <p className="text-sm text-gray-500 mt-1">
                            Sample: {importPreview.rows[0]?.[index] || 'No data'}
                          </p>
                        </div>
                        <div>
                          <Select 
                            value={fieldMappings[header] || ''} 
                            onValueChange={(value) => handleMappingChange(header, value)}
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
                    ))}
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