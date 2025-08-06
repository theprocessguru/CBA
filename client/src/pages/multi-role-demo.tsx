import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { ArrowLeft, Users, Store, Mic, Settings } from "lucide-react";
import MultiRoleSelector from "../components/events/MultiRoleSelector";
import AttendeeRoleDisplay from "../components/events/AttendeeRoleDisplay";

const MultiRoleDemo = () => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["attendee"]);
  const [customRole, setCustomRole] = useState<string>("");
  const [primaryRole, setPrimaryRole] = useState<string>("attendee");

  // Demo data showing different attendees with multiple roles
  const demoAttendees = [
    {
      name: "Sarah Johnson",
      email: "sarah@techcorp.com", 
      company: "TechCorp Solutions",
      participantRoles: '["attendee", "speaker", "exhibitor"]',
      primaryRole: "speaker",
      customRole: "AI Innovation Lead"
    },
    {
      name: "Mike Chen",
      email: "mike@startupxyz.com",
      company: "StartupXYZ",
      participantRoles: '["exhibitor", "organizer"]',
      primaryRole: "exhibitor",
      customRole: null
    },
    {
      name: "Emily Rodriguez", 
      email: "emily@volunteers.org",
      company: "Community Volunteers",
      participantRoles: '["volunteer", "attendee", "organizer"]',
      primaryRole: "volunteer",
      customRole: "Community Outreach Coordinator"
    },
    {
      name: "James Wilson",
      email: "james@croydonba.org.uk",
      company: "Croydon Business Association",
      participantRoles: '["team", "organizer", "speaker"]',
      primaryRole: "team",
      customRole: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Multiple Role System Demo - CBA</title>
        <meta name="description" content="Demonstration of the new multiple participant role system for events" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              Multiple Role System Demo
            </h1>
            <p className="text-gray-600 mt-2">
              New system allows participants to have multiple roles: exhibitor, speaker, AND organizer!
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Selection Interface */}
          <div className="space-y-6">
            <MultiRoleSelector
              selectedRoles={selectedRoles}
              onRolesChange={setSelectedRoles}
              customRole={customRole}
              onCustomRoleChange={setCustomRole}
              primaryRole={primaryRole}
              onPrimaryRoleChange={setPrimaryRole}
              title="Try the Role Selector"
              description="Select multiple roles to see how it works!"
            />

            {/* Current Selection Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Selection Preview:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Selected Roles:</p>
                    <AttendeeRoleDisplay 
                      participantRoles={selectedRoles}
                      primaryRole={primaryRole}
                      customRole={customRole}
                      size="md"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                    <strong>JSON Data:</strong> {JSON.stringify({
                      participantRoles: selectedRoles,
                      primaryRole: primaryRole,
                      customRole: customRole || null
                    }, null, 2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Attendee List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Event Attendees - Multiple Roles
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Examples of how attendees appear with multiple roles in the system
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoAttendees.map((attendee, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{attendee.name}</h3>
                          <p className="text-sm text-gray-600">{attendee.company}</p>
                          <p className="text-xs text-gray-500">{attendee.email}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Participant Roles:</p>
                        <AttendeeRoleDisplay 
                          participantRoles={attendee.participantRoles}
                          primaryRole={attendee.primaryRole}
                          customRole={attendee.customRole}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Flexible Participation:</strong> One person can be exhibitor, speaker, AND organizer
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Primary Role Display:</strong> Badge shows main role but scanner reveals all roles
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Custom Roles:</strong> Add specific titles like "AI Research Coordinator"
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Scanner Integration:</strong> Organizers see all roles when scanning QR codes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scanner Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Organizer Scanner View - Multiple Roles
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              When organizers scan QR codes, they now see all participant roles
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="bg-white p-4 rounded-lg border shadow-sm max-w-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sarah Johnson</h3>
                    <p className="text-sm text-gray-600">TechCorp Solutions</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">Participant Roles:</p>
                  <AttendeeRoleDisplay 
                    participantRoles='["attendee", "speaker", "exhibitor"]'
                    primaryRole="speaker"
                    customRole="AI Innovation Lead"
                    size="sm"
                  />
                </div>
                
                <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                  <strong>Primary Role:</strong> Speaker<br />
                  <strong>Also:</strong> Attendee, Exhibitor<br />
                  <strong>Custom Title:</strong> AI Innovation Lead
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultiRoleDemo;