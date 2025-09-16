import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Users, UserCheck, Crown, Building } from 'lucide-react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';

export default function TestQRCodesPage() {
  const testUsers = [
    {
      name: "Admin User",
      email: "admin@croydonba.org.uk",
      qrHandle: "ADMIN-CBA-2025",
      participantType: "team",
      company: "CBA"
    },
    {
      name: "Ben Admin", 
      email: "ben@croydonba.org.uk",
      qrHandle: "BEN-CBA-2025",
      participantType: "attendee",
      company: "CBA"
    },
    {
      name: "Steven Ball - The Process Guru",
      email: "steve@croydonba.org.uk", 
      qrHandle: "theprocessguru",
      participantType: "speaker",
      company: "The Process Guru"
    },
    {
      name: "Ayesha Rehmat",
      email: "ayesha@croydonba.org.uk",
      qrHandle: "AYESHA -CBA-2025", 
      participantType: "team",
      company: "CBA"
    },
    {
      name: "Oumesh Sauba",
      email: "oumesh@croydonba.org.uk",
      qrHandle: "OUMESH-CBA-2025",
      participantType: "team",
      company: "CBA"
    },
    {
      name: "Antonio Lewis",
      email: "info@tvox.uk",
      qrHandle: "TVOX-CREATIVE-AGENCY",
      participantType: "attendee",
      company: "TVOX Creative Agency"
    },
    {
      name: "Oumesh Sauba",
      email: "oumesh.sauba@gmail.com",
      qrHandle: "mytsoftware",
      participantType: "attendee",
      company: "MYT Software"
    }
  ];

  const getParticipantIcon = (type: string) => {
    switch (type) {
      case 'speaker': return <Crown className="h-4 w-4" />;
      case 'exhibitor': return <Building className="h-4 w-4" />;
      case 'volunteer': return <UserCheck className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'special_guest': return <Crown className="h-4 w-4 text-yellow-600" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getParticipantColor = (type: string) => {
    switch (type) {
      case 'speaker': return 'bg-green-100 text-green-800';
      case 'exhibitor': return 'bg-purple-100 text-purple-800';
      case 'volunteer': return 'bg-amber-100 text-amber-800';
      case 'team': return 'bg-red-100 text-red-800';
      case 'special_guest': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Test QR Codes - Event Scanner Testing</title>
        <meta name="description" content="Test QR codes for scanner functionality" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <QrCode className="h-8 w-8 text-blue-600" />
              Test QR Codes for Scanner
            </h1>
            <p className="text-gray-600 mt-2">Scan these QR codes to test the organizer scanner functionality</p>
          </div>
          <Link href="/organizer-scanner">
            <Button size="lg">
              Open Organizer Scanner
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testUsers.map((user, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-lg">
                  {getParticipantIcon(user.participantType)}
                  {user.name}
                </CardTitle>
                <Badge className={getParticipantColor(user.participantType)}>
                  {user.participantType.replace('_', ' ')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(user.qrHandle)}&format=png&margin=1`}
                      alt={`QR Code for ${user.name}`}
                      className="w-32 h-32"
                    />
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">QR Handle:</span>
                    <span className="font-mono text-xs">{user.qrHandle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-xs">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="text-xs">{user.company}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Scan this QR code with the organizer scanner to test event assignment
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Test the Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Create a volunteer profile using the <Link href="/create-volunteer" className="text-blue-600 hover:underline">Create Volunteer</Link> form</li>
              <li>Open the <Link href="/organizer-scanner" className="text-blue-600 hover:underline">Organizer Scanner</Link> in a new tab</li>
              <li>Click "Start QR Code Scanner" to activate the camera</li>
              <li>Hold your phone/device camera up to one of the QR codes above</li>
              <li>The scanner should automatically detect and look up the attendee information</li>
              <li>Select an event from the dropdown to assign the attendee</li>
              <li>Add optional notes and click "Assign to Event"</li>
              <li>You should see a success message and the assignment in recent activity</li>
            </ol>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-medium text-blue-900 mb-2">Alternative Testing Method:</h3>
              <p className="text-blue-800 text-sm">
                If camera scanning doesn't work, you can manually enter any of the QR handles (like "ADMIN-CBA-2025" or "theprocessguru") 
                into the manual entry field to test the lookup functionality.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}