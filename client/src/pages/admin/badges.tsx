import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Badge as BadgeIcon, 
  Download, 
  Search,
  Filter,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Building,
  ArrowLeft,
  Eye,
  QrCode,
  Printer
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface AISummitBadge {
  id: string;
  name: string;
  email: string;
  participantType: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  specialRequirements?: string;
  dietaryRequirements?: string;
  checkInStatus: 'not_checked_in' | 'checked_in' | 'checked_out';
  checkedInAt?: string;
  badgeGenerated: boolean;
  badgePrinted: boolean;
  qrCode?: string;
  registeredAt: string;
}

const participantTypeColors = {
  attendee: 'bg-blue-100 text-blue-800',
  speaker: 'bg-purple-100 text-purple-800',
  sponsor: 'bg-green-100 text-green-800',
  exhibitor: 'bg-orange-100 text-orange-800',
  volunteer: 'bg-yellow-100 text-yellow-800',
  vip: 'bg-red-100 text-red-800',
  staff: 'bg-gray-100 text-gray-800',
  media: 'bg-pink-100 text-pink-800',
  team_member: 'bg-indigo-100 text-indigo-800',
};

const checkInStatusColors = {
  not_checked_in: 'bg-gray-100 text-gray-800',
  checked_in: 'bg-green-100 text-green-800',
  checked_out: 'bg-blue-100 text-blue-800',
};

export default function AdminBadgesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch all badges
  const { data: badges = [], isLoading } = useQuery<AISummitBadge[]>({
    queryKey: ['/api/ai-summit/badges'],
  });

  // Filter badges based on search and filters
  const filteredBadges = badges.filter(badge => {
    const matchesSearch = !searchTerm || 
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || badge.participantType === selectedType;
    const matchesStatus = selectedStatus === 'all' || badge.checkInStatus === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDownloadBadge = async (badgeId: string) => {
    try {
      const response = await fetch(`/api/ai-summit/badge/${badgeId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `badge-${badgeId}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading badge:', error);
    }
  };

  const handleViewBadge = (badgeId: string) => {
    window.open(`/ai-summit/badge/${badgeId}`, '_blank');
  };

  // Statistics
  const stats = {
    total: badges.length,
    checkedIn: badges.filter(b => b.checkInStatus === 'checked_in').length,
    printed: badges.filter(b => b.badgePrinted).length,
    notCheckedIn: badges.filter(b => b.checkInStatus === 'not_checked_in').length,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Badge Management</h1>
            <p className="text-gray-600">Manage AI Summit participant badges</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BadgeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Badges</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Checked In</p>
                <p className="text-2xl font-bold text-gray-900">{stats.checkedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Printer className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Printed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.printed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Not Checked In</p>
                <p className="text-2xl font-bold text-gray-900">{stats.notCheckedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="attendee">Attendee</SelectItem>
                <SelectItem value="speaker">Speaker</SelectItem>
                <SelectItem value="sponsor">Sponsor</SelectItem>
                <SelectItem value="exhibitor">Exhibitor</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="team_member">Team Member</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Badges List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Participant Badges ({filteredBadges.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBadges.length === 0 ? (
            <div className="text-center py-8">
              <BadgeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No badges found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Participant</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBadges.map((badge) => (
                    <tr key={badge.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{badge.name}</div>
                          <div className="text-sm text-gray-600">{badge.jobTitle}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={cn("capitalize", participantTypeColors[badge.participantType as keyof typeof participantTypeColors] || 'bg-gray-100 text-gray-800')}>
                          {badge.participantType.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={cn("capitalize", checkInStatusColors[badge.checkInStatus])}>
                          {badge.checkInStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {badge.company && (
                            <div className="flex items-center text-gray-900">
                              <Building className="h-4 w-4 mr-1" />
                              {badge.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-1" />
                            {badge.email}
                          </div>
                          {badge.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-1" />
                              {badge.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBadge(badge.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadBadge(badge.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}