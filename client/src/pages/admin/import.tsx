import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle, AlertCircle, Download, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface FilePreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  totalProcessed: number;
}

const DataImport = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (user && !(user as any).isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can access this page.',
        variant: 'destructive',
      });
      window.location.href = '/';
      return;
    }
  }, [user, isAuthenticated, toast]);

  // Available database fields for mapping
  const availableFields = [
    { value: 'name', label: 'Business Name' },
    { value: 'description', label: 'Description' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'website', label: 'Website' },
    { value: 'address', label: 'Address' },
    { value: 'city', label: 'City' },
    { value: 'postcode', label: 'Postcode' },
    { value: 'employeeCount', label: 'Employee Count' },
    { value: 'foundedYear', label: 'Founded Year' },
    { value: 'services', label: 'Services' },
    { value: 'specialties', label: 'Specialties' },
    { value: 'socialMedia.facebook', label: 'Facebook URL' },
    { value: 'socialMedia.twitter', label: 'Twitter URL' },
    { value: 'socialMedia.linkedin', label: 'LinkedIn URL' },
    { value: 'socialMedia.instagram', label: 'Instagram URL' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    previewFile(file);
  };

  const previewFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/data-import/preview', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const preview = await response.json();
      setFilePreview(preview);
      
      // Auto-map common fields
      const autoMappings: Record<string, string> = {};
      preview.headers.forEach((header: string) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name') || lowerHeader.includes('business')) {
          autoMappings[header] = 'name';
        } else if (lowerHeader.includes('email')) {
          autoMappings[header] = 'email';
        } else if (lowerHeader.includes('phone')) {
          autoMappings[header] = 'phone';
        } else if (lowerHeader.includes('website')) {
          autoMappings[header] = 'website';
        } else if (lowerHeader.includes('description')) {
          autoMappings[header] = 'description';
        } else if (lowerHeader.includes('address')) {
          autoMappings[header] = 'address';
        } else if (lowerHeader.includes('city')) {
          autoMappings[header] = 'city';
        } else if (lowerHeader.includes('postcode') || lowerHeader.includes('postal')) {
          autoMappings[header] = 'postcode';
        }
      });
      setFieldMappings(autoMappings);

      toast({
        title: 'File Loaded',
        description: `Preview loaded with ${preview.totalRows} rows`,
      });
    } catch (error) {
      console.error('Error previewing file:', error);
      toast({
        title: 'Preview Failed',
        description: error instanceof Error ? error.message : 'Failed to preview file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !filePreview) {
      toast({
        title: 'No File Selected',
        description: 'Please select and preview a file first',
        variant: 'destructive',
      });
      return;
    }

    // Validate that at least name field is mapped
    const hasNameMapping = Object.values(fieldMappings).includes('name');
    if (!hasNameMapping) {
      toast({
        title: 'Mapping Required',
        description: 'Please map at least the Business Name field',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mappings', JSON.stringify(fieldMappings));

      const response = await fetch('/api/data-import/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      setImportResult(result);

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${result.imported} records. ${result.skipped} skipped.`,
      });
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import data',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFieldMappings({});
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!(user as any)?.isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Data Import</h1>
            <p className="text-muted-foreground">Import business data from CSV or Excel files</p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="mapping" disabled={!filePreview}>Field Mapping</TabsTrigger>
            <TabsTrigger value="results" disabled={!importResult}>Results</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Data File
                </CardTitle>
                <CardDescription>
                  Select a CSV or Excel file containing business data. The file should include headers in the first row.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        {selectedFile.name.endsWith('.csv') ? (
                          <FileText className="h-8 w-8 text-green-500" />
                        ) : (
                          <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                        )}
                        <span className="font-medium">{selectedFile.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Size: {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Select Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-lg font-medium">Choose a file to upload</p>
                        <p className="text-sm text-muted-foreground">CSV, Excel (.xlsx, .xls) files supported</p>
                      </div>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Select File
                      </Button>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Loading file preview...</p>
                    <Progress className="w-full" />
                  </div>
                )}

                {filePreview && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      File loaded successfully! Found {filePreview.totalRows} data rows with {filePreview.headers.length} columns.
                      Proceed to the Field Mapping tab to configure how the data should be imported.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Field Mapping</CardTitle>
                <CardDescription>
                  Map your file columns to database fields. Required fields are marked with *.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filePreview && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {filePreview.headers.map((header) => (
                        <div key={header} className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium">{header}</label>
                          </div>
                          <div className="flex-1">
                            <Select
                              value={fieldMappings[header] || ''}
                              onValueChange={(value) => {
                                setFieldMappings(prev => ({
                                  ...prev,
                                  [header]: value
                                }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select database field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">-- Skip this field --</SelectItem>
                                {availableFields.map((field) => (
                                  <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                    {field.value === 'name' && ' *'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-medium mb-2">Data Preview</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {filePreview.headers.map((header) => (
                              <TableHead key={header} className="text-xs">
                                <div>{header}</div>
                                {fieldMappings[header] && (
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    {availableFields.find(f => f.value === fieldMappings[header])?.label}
                                  </Badge>
                                )}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filePreview.rows.slice(0, 3).map((row, index) => (
                            <TableRow key={index}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex} className="text-xs max-w-32 truncate">
                                  {cell}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={handleImport} disabled={isImporting}>
                        {isImporting ? 'Importing...' : 'Start Import'}
                      </Button>
                      <Button variant="outline" onClick={resetImport}>
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {importResult && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                        <div className="text-sm text-green-700">Imported</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                        <div className="text-sm text-yellow-700">Skipped</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                        <div className="text-sm text-red-700">Errors</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{importResult.totalProcessed}</div>
                        <div className="text-sm text-blue-700">Total Processed</div>
                      </div>
                    </div>

                    {importResult.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Import Errors
                        </h4>
                        <div className="space-y-2">
                          {importResult.errors.map((error, index) => (
                            <Alert key={index} variant="destructive">
                              <AlertDescription className="text-sm">{error}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button onClick={resetImport}>
                        Import Another File
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = '/admin/ghl'}>
                        View GHL Admin
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataImport;