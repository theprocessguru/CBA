import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Globe,
  Linkedin,
  Clock,
  MessageSquare,
  Search,
  Download
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface SpeakerRegistration {
  id: string;
  speakerName: string;
  speakerEmail: string;
  speakerPhone: string;
  speakerCompany: string;
  speakerJobTitle: string;
  speakerWebsite?: string;
  speakerLinkedIn?: string;
  speakerBio: string;
  sessionType: string;
  talkTitle: string;
  talkDescription: string;
  talkDuration: string;
  audienceLevel: string;
  speakingExperience?: string;
  previousSpeaking: boolean;
  techRequirements?: string;
  availableSlots?: string;
  motivationToSpeak?: string;
  keyTakeaways?: string;
  interactiveElements: boolean;
  handoutsProvided: boolean;
  createdAt: string;
  status?: string;
}

export default function SpeakerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: speakers, isLoading, error } = useQuery<SpeakerRegistration[]>({
    queryKey: ["/api/admin/speakers"],
  });

  const filteredSpeakers = speakers?.filter(speaker => {
    const matchesSearch = 
      speaker.speakerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.speakerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.speakerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.talkTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || speaker.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (!speakers) return;
    
    const csv = [
      ["Name", "Email", "Phone", "Company", "Job Title", "Session Type", "Talk Title", "Duration", "Audience Level", "Status", "Registered Date"],
      ...speakers.map(s => [
        s.speakerName,
        s.speakerEmail,
        s.speakerPhone,
        s.speakerCompany,
        s.speakerJobTitle,
        s.sessionType,
        s.talkTitle,
        s.talkDuration + " mins",
        s.audienceLevel,
        s.status || "pending",
        format(new Date(s.createdAt), "yyyy-MM-dd")
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `speakers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const getSessionTypeColor = (type: string) => {
    switch(type) {
      case 'keynote': return 'bg-purple-100 text-purple-800';
      case 'talk': return 'bg-blue-100 text-blue-800';
      case 'panel': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-orange-100 text-orange-800';
      case 'demo': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceLevelColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'all': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">Failed to load speaker registrations. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speaker Management</h1>
          <p className="text-gray-600 mt-1">Manage AI Summit speaker registrations and proposals</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Speakers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{speakers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registered speakers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keynotes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {speakers?.filter(s => s.sessionType === 'keynote').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Keynote speakers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workshops</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {speakers?.filter(s => s.sessionType === 'workshop').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Workshop leaders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panels</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {speakers?.filter(s => s.sessionType === 'panel').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Panel participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, company, or talk title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All ({speakers?.length || 0})
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
                size="sm"
              >
                Pending Review
              </Button>
              <Button
                variant={filterStatus === "approved" ? "default" : "outline"}
                onClick={() => setFilterStatus("approved")}
                size="sm"
              >
                Approved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speaker List */}
      <div className="space-y-4">
        {filteredSpeakers && filteredSpeakers.length > 0 ? (
          filteredSpeakers.map((speaker) => (
            <Card key={speaker.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Speaker Info Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{speaker.speakerName}</h3>
                      <p className="text-gray-600">{speaker.speakerJobTitle} at {speaker.speakerCompany}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSessionTypeColor(speaker.sessionType)}>
                        {speaker.sessionType}
                      </Badge>
                      <Badge className={getAudienceLevelColor(speaker.audienceLevel)}>
                        {speaker.audienceLevel}
                      </Badge>
                      {speaker.talkDuration && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {speaker.talkDuration} mins
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Talk Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{speaker.talkTitle}</h4>
                    <p className="text-gray-600 text-sm">{speaker.talkDescription}</p>
                  </div>

                  {/* Contact & Links */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${speaker.speakerEmail}`} className="hover:text-blue-600">
                        {speaker.speakerEmail}
                      </a>
                    </div>
                    {speaker.speakerPhone && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="h-4 w-4" />
                        {speaker.speakerPhone}
                      </div>
                    )}
                    {speaker.speakerWebsite && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a href={speaker.speakerWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          Website
                        </a>
                      </div>
                    )}
                    {speaker.speakerLinkedIn && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Linkedin className="h-4 w-4" />
                        <a href={speaker.speakerLinkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  {speaker.speakerBio && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600">{speaker.speakerBio}</p>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Registered: {format(new Date(speaker.createdAt), "dd MMM yyyy, HH:mm")}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {speaker.previousSpeaking ? "Experienced Speaker" : "New Speaker"}
                      </Badge>
                      {speaker.interactiveElements && (
                        <Badge variant="outline">Interactive Session</Badge>
                      )}
                      {speaker.handoutsProvided && (
                        <Badge variant="outline">Handouts Provided</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filterStatus !== "all" 
                  ? "No speakers found matching your criteria." 
                  : "No speaker registrations yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}