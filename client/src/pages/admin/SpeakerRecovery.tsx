import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, UserCheck, Calendar, AlertCircle } from "lucide-react";
import { Link } from "wouter";

interface PotentialSpeaker {
  id: number;
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  phoneNumber: string;
  aiInterest: string;
  businessType: string;
  comments: string;
  registeredAt: string;
  userId: string;
}

export default function SpeakerRecovery() {
  const [selectedAttendee, setSelectedAttendee] = useState<PotentialSpeaker | null>(null);
  const [convertForm, setConvertForm] = useState({
    talkTitle: '',
    talkDescription: '',
    talkDuration: '30',
    audienceLevel: 'intermediate',
    sessionType: 'talk',
    bio: '',
    website: '',
    linkedIn: '',
    speakingExperience: '',
    techRequirements: '',
    keyTakeaways: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get potential speakers (recent attendees)
  const { data: potentialSpeakers, isLoading } = useQuery({
    queryKey: ['/api/admin/potential-speakers'],
  });

  const convertToSpeakerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/convert-to-speaker", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Conversion failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendee converted to speaker successfully!",
      });
      setSelectedAttendee(null);
      setConvertForm({
        talkTitle: '',
        talkDescription: '',
        talkDuration: '30',
        audienceLevel: 'intermediate',
        sessionType: 'talk',
        bio: '',
        website: '',
        linkedIn: '',
        speakingExperience: '',
        techRequirements: '',
        keyTakeaways: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/speakers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/potential-speakers'] });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConvertToSpeaker = () => {
    if (!selectedAttendee || !convertForm.talkTitle || !convertForm.talkDescription || !convertForm.keyTakeaways) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    convertToSpeakerMutation.mutate({
      attendeeId: selectedAttendee.id,
      ...convertForm
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Speaker Recovery Tool</h1>
            <p className="text-gray-600">Convert attendees who should have been speakers</p>
          </div>
        </div>

        {/* Alert */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Recovery Tool for Missing Speakers</p>
                <p className="text-sm text-amber-700">
                  This shows recent attendees (since Aug 11) who might have filled speaker forms but were saved as general attendees.
                  Includes registrations from Ben's radio appearance week and weekend form assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Potential Speakers List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Attendees ({potentialSpeakers?.length || 0})
              </CardTitle>
              <CardDescription>
                Recent registrations (since Aug 11) that might be speakers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {potentialSpeakers?.map((attendee: PotentialSpeaker) => (
                  <div
                    key={attendee.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAttendee?.id === attendee.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAttendee(attendee)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{attendee.name}</h4>
                      <Badge variant="outline">{formatDate(attendee.registeredAt)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{attendee.email}</p>
                    {attendee.company && (
                      <p className="text-sm text-gray-500">{attendee.company}</p>
                    )}
                    {attendee.jobTitle && (
                      <p className="text-sm text-gray-500">{attendee.jobTitle}</p>
                    )}
                    {attendee.aiInterest && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Interest: {attendee.aiInterest}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
                
                {!potentialSpeakers?.length && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent attendees found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Convert to Speaker Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Convert to Speaker
              </CardTitle>
              <CardDescription>
                {selectedAttendee 
                  ? `Converting: ${selectedAttendee.name}` 
                  : "Select an attendee to convert to speaker"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAttendee ? (
                <div className="space-y-4">
                  {/* Basic Info Display */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{selectedAttendee.name}</p>
                    <p className="text-sm text-gray-600">{selectedAttendee.email}</p>
                    {selectedAttendee.company && (
                      <p className="text-sm text-gray-600">{selectedAttendee.company}</p>
                    )}
                  </div>

                  {/* Speaker Details Form */}
                  <div>
                    <Label htmlFor="talkTitle">Talk Title *</Label>
                    <Input
                      id="talkTitle"
                      value={convertForm.talkTitle}
                      onChange={(e) => setConvertForm(prev => ({ ...prev, talkTitle: e.target.value }))}
                      placeholder="Enter the talk title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="talkDescription">Talk Description *</Label>
                    <Textarea
                      id="talkDescription"
                      value={convertForm.talkDescription}
                      onChange={(e) => setConvertForm(prev => ({ ...prev, talkDescription: e.target.value }))}
                      placeholder="Describe what the talk will cover"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionType">Session Type</Label>
                      <Select
                        value={convertForm.sessionType}
                        onValueChange={(value) => setConvertForm(prev => ({ ...prev, sessionType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="keynote">Keynote</SelectItem>
                          <SelectItem value="talk">Talk</SelectItem>
                          <SelectItem value="panel">Panel</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="demo">Demo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="talkDuration">Duration (minutes)</Label>
                      <Select
                        value={convertForm.talkDuration}
                        onValueChange={(value) => setConvertForm(prev => ({ ...prev, talkDuration: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="keyTakeaways">Key Takeaways *</Label>
                    <Textarea
                      id="keyTakeaways"
                      value={convertForm.keyTakeaways}
                      onChange={(e) => setConvertForm(prev => ({ ...prev, keyTakeaways: e.target.value }))}
                      placeholder="What will attendees learn from this talk?"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Speaker Bio</Label>
                    <Textarea
                      id="bio"
                      value={convertForm.bio}
                      onChange={(e) => setConvertForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Professional bio for the speaker"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={convertForm.website}
                        onChange={(e) => setConvertForm(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedIn">LinkedIn</Label>
                      <Input
                        id="linkedIn"
                        value={convertForm.linkedIn}
                        onChange={(e) => setConvertForm(prev => ({ ...prev, linkedIn: e.target.value }))}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleConvertToSpeaker}
                    className="w-full"
                    disabled={convertToSpeakerMutation.isPending}
                  >
                    {convertToSpeakerMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Converting...
                      </div>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Convert to Speaker
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select an attendee from the list to convert them to a speaker</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}