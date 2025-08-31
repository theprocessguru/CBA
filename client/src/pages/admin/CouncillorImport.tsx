import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Crown, Upload, FileText, Users, Download } from "lucide-react";
import Papa from "papaparse";

interface CouncillorRow {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  council: string;
  ward: string;
  constituency: string;
  party?: string;
  homeAddress: string;
  homeCity: string;
  homePostcode: string;
  officeAddress?: string;
  officeCity?: string;
  officePostcode?: string;
  bio?: string;
}

export default function CouncillorImport() {
  const [csvData, setCsvData] = useState<CouncillorRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<CouncillorRow[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (councillors: CouncillorRow[]) => {
      const response = await apiRequest("POST", "/api/admin/import-councillors", { councillors });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import successful!",
        description: `Successfully imported ${data.imported} councillors. ${data.skipped} duplicates skipped.`,
      });
      setCsvData([]);
      setPreview([]);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const councillors = results.data as CouncillorRow[];
        
        // Validate required fields
        const validCouncillors = councillors.filter(councillor => 
          councillor.firstName && 
          councillor.lastName && 
          councillor.email &&
          councillor.council &&
          councillor.ward
        );

        if (validCouncillors.length === 0) {
          toast({
            title: "Invalid CSV",
            description: "No valid councillor records found. Please check required fields: firstName, lastName, email, council, ward.",
            variant: "destructive",
          });
          return;
        }

        setCsvData(validCouncillors);
        setPreview(validCouncillors.slice(0, 5)); // Show first 5 for preview
        
        toast({
          title: "CSV loaded",
          description: `Found ${validCouncillors.length} valid councillor records.`,
        });
      },
      error: (error) => {
        toast({
          title: "CSV parsing failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleImport = () => {
    if (csvData.length === 0) {
      toast({
        title: "No data to import",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    importMutation.mutate(csvData);
    setImporting(false);
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: "Councillor",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@croydon.gov.uk",
        phone: "+44 20 8726 6000",
        council: "Croydon Council",
        ward: "Broad Green",
        constituency: "Croydon Central",
        party: "Labour",
        homeAddress: "123 Main Street",
        homeCity: "Croydon",
        homePostcode: "CR0 2RG",
        officeAddress: "Bernard Weatherill House",
        officeCity: "Croydon",
        officePostcode: "CR0 2RG",
        bio: "Councillor for Broad Green ward, focused on community development and local business support."
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'councillor_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Crown className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Councillor Import</h1>
            <p className="text-gray-600">Bulk import councillors from CSV with ward details</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Councillor Data</span>
              </CardTitle>
              <CardDescription>
                Upload a CSV file containing councillor information with ward details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template</span>
                </Button>
                <span className="text-sm text-gray-500">
                  Download CSV template with required columns
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvFile">CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500">
                  Required columns: title, firstName, lastName, email, council, ward
                </p>
              </div>

              {csvData.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">
                      {csvData.length} councillors ready to import
                    </span>
                  </div>
                  <Button
                    onClick={handleImport}
                    disabled={importing || importMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {importing || importMutation.isPending ? "Importing..." : "Import Councillors"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CSV Format Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>CSV Format Requirements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Required Columns:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                    <li><code>title</code> - e.g., "Councillor", "Cllr"</li>
                    <li><code>firstName</code> - Councillor's first name</li>
                    <li><code>lastName</code> - Councillor's last name</li>
                    <li><code>email</code> - Official council email address</li>
                    <li><code>council</code> - e.g., "Croydon Council"</li>
                    <li><code>ward</code> - e.g., "Broad Green", "Purley Oaks"</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Important Optional Columns:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                    <li><code>party</code> - <strong>Political party</strong> (Labour, Conservative, Liberal Democrat, Green, Independent, etc.)</li>
                    <li><code>phone</code> - Contact phone number</li>
                    <li><code>constituency</code> - Parliamentary constituency</li>
                    <li><code>homeAddress, homeCity, homePostcode</code> - Home address</li>
                    <li><code>officeAddress, officeCity, officePostcode</code> - Office address</li>
                    <li><code>bio</code> - Biography and role description</li>
                  </ul>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Councillors will be automatically assigned QR codes for event access.
                    Duplicate emails will be skipped during import.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {preview.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Preview ({preview.length} of {csvData.length} records)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Council</th>
                        <th className="text-left p-2">Ward</th>
                        <th className="text-left p-2">Constituency</th>
                        <th className="text-left p-2">Party</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((councillor, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            {councillor.title} {councillor.firstName} {councillor.lastName}
                          </td>
                          <td className="p-2">{councillor.email}</td>
                          <td className="p-2">{councillor.council}</td>
                          <td className="p-2">{councillor.ward}</td>
                          <td className="p-2">{councillor.constituency || "—"}</td>
                          <td className="p-2">{councillor.party || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}