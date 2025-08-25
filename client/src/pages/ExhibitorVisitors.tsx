import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Download, 
  Search, 
  Filter, 
  UserCheck,
  UserX,
  Calendar,
  Building,
  Phone,
  Mail,
  GraduationCap,
  Star,
  MessageSquare,
  Tag
} from "lucide-react";

interface ExhibitorVisitor {
  id: number;
  exhibitorId: string;
  visitorId: string;
  eventId: number | null;
  standNumber: string | null;
  scanTime: string;
  visitorType: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  visitorCompany: string | null;
  visitorTitle: string | null;
  visitorUniversity: string | null;
  visitorCourse: string | null;
  notes: string | null;
  followUpStatus: string;
  followUpNotes: string | null;
  lastContactedAt: string | null;
  tags: string | null;
  interestedIn: string | null;
  leadScore: number;
  createdAt: string;
  updatedAt: string;
}

export function ExhibitorVisitors() {
  const { toast } = useToast();
  const [selectedVisitor, setSelectedVisitor] = useState<ExhibitorVisitor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Fetch exhibitor's visitors
  const { data: visitors = [], isLoading, refetch } = useQuery<ExhibitorVisitor[]>({
    queryKey: ["/api/exhibitor/visitors"],
  });

  // Update visitor mutation
  const updateVisitorMutation = useMutation({
    mutationFn: ({ visitorId, updates }: { visitorId: number; updates: any }) =>
      apiRequest(`/api/exhibitor/visitors/${visitorId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Visitor information updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exhibitor/visitors"] });
      setSelectedVisitor(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update visitor information",
        variant: "destructive",
      });
    },
  });

  // Export visitors as CSV
  const handleExport = () => {
    window.location.href = "/api/exhibitor/visitors/export";
  };

  // Filter visitors based on search and filters
  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch = 
      !searchTerm ||
      visitor.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.visitorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.visitorCompany?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === "all" || visitor.followUpStatus === filterStatus;

    const matchesType = 
      filterType === "all" || visitor.visitorType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get visitor type badge color
  const getTypeBadgeColor = (type: string | null) => {
    switch (type) {
      case "student":
        return "bg-blue-100 text-blue-800";
      case "resident":
        return "bg-green-100 text-green-800";
      case "volunteer":
        return "bg-purple-100 text-purple-800";
      case "vip":
        return "bg-yellow-100 text-yellow-800";
      case "speaker":
        return "bg-red-100 text-red-800";
      case "exhibitor":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get follow-up status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "contacted":
        return "bg-green-100 text-green-800";
      case "not_interested":
        return "bg-red-100 text-red-800";
      case "converted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Calculate lead score color
  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Exhibition Stand Visitors</h1>
        <p className="text-gray-600">
          Manage and follow up with visitors who visited your exhibition stand
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="attendee">Attendee</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="speaker">Speaker</SelectItem>
                <SelectItem value="exhibitor">Exhibitor</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold">{visitors.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold">
                  {visitors.filter(v => v.followUpStatus === "contacted").length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold">
                  {visitors.filter(v => v.followUpStatus === "converted").length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Lead Score</p>
                <p className="text-2xl font-bold">
                  {visitors.length > 0 
                    ? Math.round(visitors.reduce((acc, v) => acc + v.leadScore, 0) / visitors.length)
                    : 0}
                </p>
              </div>
              <Tag className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitors List */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor List</CardTitle>
          <CardDescription>
            Click on a visitor to view and update their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading visitors...</div>
          ) : filteredVisitors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {visitors.length === 0 
                ? "No visitors scanned yet. Start scanning badges at your exhibition stand!"
                : "No visitors match your search criteria"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVisitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedVisitor(visitor)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {visitor.visitorName || "Unknown Visitor"}
                        </h3>
                        <Badge className={getTypeBadgeColor(visitor.visitorType)}>
                          {visitor.visitorType || "Attendee"}
                        </Badge>
                        <Badge className={getStatusBadgeColor(visitor.followUpStatus)}>
                          {visitor.followUpStatus.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        {visitor.visitorEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {visitor.visitorEmail}
                          </div>
                        )}
                        {visitor.visitorPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {visitor.visitorPhone}
                          </div>
                        )}
                        {visitor.visitorCompany && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {visitor.visitorCompany}
                          </div>
                        )}
                        {visitor.visitorUniversity && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {visitor.visitorUniversity}
                          </div>
                        )}
                      </div>

                      {visitor.notes && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {visitor.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${getLeadScoreColor(visitor.leadScore)}`}>
                        {visitor.leadScore}
                      </div>
                      <p className="text-xs text-gray-500">Lead Score</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(visitor.scanTime).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Visitor Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Visitor Details</CardTitle>
              <CardDescription>
                Update visitor information and follow-up status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedVisitor.visitorName || "Unknown"}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <Badge className={getTypeBadgeColor(selectedVisitor.visitorType)}>
                    {selectedVisitor.visitorType || "Attendee"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedVisitor.visitorEmail || "Not provided"}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{selectedVisitor.visitorPhone || "Not provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company</Label>
                  <p className="text-sm">{selectedVisitor.visitorCompany || "Not provided"}</p>
                </div>
                <div>
                  <Label>Title</Label>
                  <p className="text-sm">{selectedVisitor.visitorTitle || "Not provided"}</p>
                </div>
              </div>

              {(selectedVisitor.visitorUniversity || selectedVisitor.visitorCourse) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>University</Label>
                    <p className="text-sm">{selectedVisitor.visitorUniversity || "Not provided"}</p>
                  </div>
                  <div>
                    <Label>Course</Label>
                    <p className="text-sm">{selectedVisitor.visitorCourse || "Not provided"}</p>
                  </div>
                </div>
              )}

              <div>
                <Label>Scan Time</Label>
                <p className="text-sm">{new Date(selectedVisitor.scanTime).toLocaleString('en-GB')}</p>
              </div>

              <div>
                <Label htmlFor="followUpStatus">Follow-up Status</Label>
                <Select
                  value={selectedVisitor.followUpStatus}
                  onValueChange={(value) => 
                    setSelectedVisitor({ ...selectedVisitor, followUpStatus: value })
                  }
                >
                  <SelectTrigger id="followUpStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="leadScore">Lead Score (0-100)</Label>
                <Input
                  id="leadScore"
                  type="number"
                  min="0"
                  max="100"
                  value={selectedVisitor.leadScore}
                  onChange={(e) => 
                    setSelectedVisitor({ 
                      ...selectedVisitor, 
                      leadScore: parseInt(e.target.value) || 0 
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="interestedIn">Interested In</Label>
                <Input
                  id="interestedIn"
                  value={selectedVisitor.interestedIn || ""}
                  onChange={(e) => 
                    setSelectedVisitor({ ...selectedVisitor, interestedIn: e.target.value })
                  }
                  placeholder="Products or services they showed interest in..."
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={selectedVisitor.notes || ""}
                  onChange={(e) => 
                    setSelectedVisitor({ ...selectedVisitor, notes: e.target.value })
                  }
                  placeholder="Add any notes about this visitor..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="followUpNotes">Follow-up Notes</Label>
                <Textarea
                  id="followUpNotes"
                  value={selectedVisitor.followUpNotes || ""}
                  onChange={(e) => 
                    setSelectedVisitor({ ...selectedVisitor, followUpNotes: e.target.value })
                  }
                  placeholder="Notes about follow-up actions taken..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedVisitor(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateVisitorMutation.mutate({
                      visitorId: selectedVisitor.id,
                      updates: {
                        followUpStatus: selectedVisitor.followUpStatus,
                        followUpNotes: selectedVisitor.followUpNotes,
                        notes: selectedVisitor.notes,
                        interestedIn: selectedVisitor.interestedIn,
                        leadScore: selectedVisitor.leadScore,
                      },
                    });
                  }}
                  disabled={updateVisitorMutation.isPending}
                >
                  {updateVisitorMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}