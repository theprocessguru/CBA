import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Upload, Users, Download, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PersonType {
  id: number;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  priority: number;
  isActive: boolean;
}

interface ImportData {
  users: Array<{
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    company?: string;
    personTypes: number[];
    isPrimaryType?: number;
  }>;
}

export default function PersonTypeImport() {
  const [csvData, setCsvData] = useState("");
  const [selectedPersonTypes, setSelectedPersonTypes] = useState<number[]>([]);
  const [importResults, setImportResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available person types
  const { data: personTypes = [], isLoading: typesLoading } = useQuery<PersonType[]>({
    queryKey: ['/api/person-types'],
  });

  const importMutation = useMutation({
    mutationFn: async (importData: ImportData) => {
      const response = await fetch('/api/admin/import-users-with-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData),
      });
      if (!response.ok) throw new Error('Import failed');
      return response.json();
    },
    onSuccess: (data) => {
      setImportResults(data);
      toast({
        title: "Import Successful",
        description: `Imported ${data.successCount} users with person types`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePersonTypeToggle = (typeId: number) => {
    setSelectedPersonTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const parseCSVAndImport = () => {
    if (!csvData.trim()) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file or paste data",
        variant: "destructive",
      });
      return;
    }

    if (selectedPersonTypes.length === 0) {
      toast({
        title: "No Person Types Selected",
        description: "Please select at least one person type to assign",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const emailIndex = headers.findIndex(h => h.includes('email'));
      const firstNameIndex = headers.findIndex(h => h.includes('first') || h.includes('fname'));
      const lastNameIndex = headers.findIndex(h => h.includes('last') || h.includes('lname'));
      const phoneIndex = headers.findIndex(h => h.includes('phone'));
      const companyIndex = headers.findIndex(h => h.includes('company') || h.includes('business'));

      if (emailIndex === -1) {
        throw new Error('Email column not found in CSV');
      }

      const users = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          email: values[emailIndex],
          firstName: firstNameIndex >= 0 ? values[firstNameIndex] : '',
          lastName: lastNameIndex >= 0 ? values[lastNameIndex] : '',
          phone: phoneIndex >= 0 ? values[phoneIndex] : undefined,
          company: companyIndex >= 0 ? values[companyIndex] : undefined,
          personTypes: selectedPersonTypes,
          isPrimaryType: selectedPersonTypes[0], // First selected becomes primary
        };
      }).filter(user => user.email); // Filter out rows without email

      importMutation.mutate({ users });
    } catch (error) {
      toast({
        title: "Parse Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-800",
      indigo: "bg-indigo-100 text-indigo-800",
      green: "bg-green-100 text-green-800",
      teal: "bg-teal-100 text-teal-800",
      purple: "bg-purple-100 text-purple-800",
      yellow: "bg-yellow-100 text-yellow-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Upload className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Import Users with Person Types</h1>
          <p className="text-gray-600">Import users from CSV and assign specific person types</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="csv-data">Or Paste CSV Data</Label>
              <Textarea
                id="csv-data"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="email,firstName,lastName,phone,company
john@example.com,John,Doe,+44123456789,Acme Ltd
jane@example.com,Jane,Smith,+44987654321,Tech Corp"
                rows={8}
                className="mt-1 font-mono text-sm"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                CSV should include: <strong>email</strong> (required), firstName, lastName, phone, company
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Person Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Person Types to Assign
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typesLoading ? (
              <div className="text-center py-4">Loading person types...</div>
            ) : personTypes.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No person types found. Please create person types first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {personTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={selectedPersonTypes.includes(type.id)}
                      onCheckedChange={() => handlePersonTypeToggle(type.id)}
                    />
                    <label
                      htmlFor={`type-${type.id}`}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      <Badge className={getTypeColor(type.color)}>
                        {type.displayName}
                      </Badge>
                      <span className="text-sm text-gray-600">{type.description}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ready to Import</h3>
              <p className="text-sm text-gray-600">
                Selected types: {selectedPersonTypes.length} | 
                Data ready: {csvData ? 'Yes' : 'No'}
              </p>
            </div>
            <Button
              onClick={parseCSVAndImport}
              disabled={!csvData || selectedPersonTypes.length === 0 || importMutation.isPending}
              className="flex items-center gap-2"
            >
              {importMutation.isPending ? (
                <>Loading...</>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Users
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResults.successCount}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResults.errorCount}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{importResults.newUsers}</div>
                <div className="text-sm text-gray-600">New Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{importResults.updatedUsers}</div>
                <div className="text-sm text-gray-600">Updated</div>
              </div>
            </div>
            
            {importResults.errors && importResults.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Errors:</h4>
                <div className="bg-red-50 p-3 rounded-md">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-800">{error}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}