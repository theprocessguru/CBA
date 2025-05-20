import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MemberImport } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Upload, FileText, AlertCircle, CheckCircle, FileX, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";

const MemberUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  // Get import history
  const { data: importHistory, isLoading, refetch } = useQuery<MemberImport[]>({
    queryKey: ['/api/admin/member-imports'],
    enabled: !!user?.isAdmin,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/admin/upload-members", formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: `Imported ${data.importedCount} members${data.failures.length > 0 ? ` with ${data.failures.length} failures` : ''}`,
      });
      setFile(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Member List</CardTitle>
          <CardDescription>
            Upload a CSV file containing member information to add or update member business profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>CSV Format Requirements</AlertTitle>
              <AlertDescription>
                <p>The CSV file should include the following columns:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><span className="font-medium">email*</span> - Member email address (required)</li>
                  <li><span className="font-medium">businessName*</span> - Business name (required)</li>
                  <li><span className="font-medium">description</span> - Business description</li>
                  <li><span className="font-medium">address</span> - Business address</li>
                  <li><span className="font-medium">city</span> - City (defaults to Croydon)</li>
                  <li><span className="font-medium">postcode</span> - Postal code</li>
                  <li><span className="font-medium">phone</span> - Business phone number</li>
                  <li><span className="font-medium">website</span> - Business website</li>
                  <li><span className="font-medium">established</span> - Year established</li>
                  <li><span className="font-medium">employeeCount</span> - Number of employees</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={uploadMutation.isPending}
                />
                <p className="text-sm text-neutral-500 mt-2">
                  {file ? `Selected file: ${file.name}` : "No file selected"}
                </p>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploadMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Members
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>
            Recent member list imports and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-neutral-500">Loading import history...</p>
            </div>
          ) : importHistory && importHistory.length > 0 ? (
            <div className="space-y-4">
              {importHistory.map((importItem) => (
                <div key={importItem.id} className="p-4 border rounded-lg bg-neutral-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">{importItem.filename}</span>
                      </div>
                      <div className="text-sm text-neutral-500 mt-1">
                        {formatDate(importItem.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {importItem.status === 'completed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </span>
                      ) : importItem.status === 'failed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FileX className="h-3 w-3 mr-1" />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Processing
                        </span>
                      )}
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Imported:</span> {importItem.importedCount} members
                    </div>
                    <div>
                      <span className="font-medium">Failures:</span> {importItem.failures ? JSON.parse(importItem.failures as any).length : 0}
                    </div>
                  </div>
                  {importItem.failures && JSON.parse(importItem.failures as any).length > 0 && (
                    <div className="mt-3">
                      <details className="text-sm">
                        <summary className="font-medium text-primary cursor-pointer">
                          Show Errors ({JSON.parse(importItem.failures as any).length})
                        </summary>
                        <div className="mt-2 p-2 bg-neutral-100 rounded-md max-h-32 overflow-y-auto">
                          <ul className="list-disc pl-5 space-y-1">
                            {JSON.parse(importItem.failures as any).map((failure: any, index: number) => (
                              <li key={index} className="text-red-600">
                                {failure.error}
                                {failure.row && (
                                  <span className="text-neutral-600"> (Row with email: {failure.row.email || 'unknown'})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">No import history found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberUpload;
