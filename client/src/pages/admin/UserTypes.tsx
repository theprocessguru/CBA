import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserCheck, 
  Mic, 
  Store, 
  Star, 
  Home,
  UsersRound,
  Shield,
  Search,
  Filter
} from "lucide-react";

// Define participant types with their characteristics
const PARTICIPANT_TYPES = {
  attendee: {
    label: "Regular Attendee",
    icon: Users,
    color: "bg-blue-500",
    badgeColor: "bg-blue-100 text-blue-800",
    description: "Standard event attendees and members",
    features: ["Full event access", "Can register for workshops", "Business features enabled"]
  },
  volunteer: {
    label: "Volunteer",
    icon: UserCheck,
    color: "bg-green-500",
    badgeColor: "bg-green-100 text-green-800",
    description: "Event volunteers helping with organization",
    features: ["Special volunteer badge", "Limited business features", "Access to volunteer areas"]
  },
  speaker: {
    label: "Speaker",
    icon: Mic,
    color: "bg-purple-500",
    badgeColor: "bg-purple-100 text-purple-800",
    description: "Event speakers and presenters",
    features: ["Speaker badge", "Green room access", "Limited business features"]
  },
  exhibitor: {
    label: "Exhibitor",
    icon: Store,
    color: "bg-orange-500",
    badgeColor: "bg-orange-100 text-orange-800",
    description: "Companies and organizations with exhibition booths",
    features: ["Exhibitor badge", "Booth access", "Limited business features"]
  },
  vip_guest: {
    label: "VIP Guest",
    icon: Star,
    color: "bg-yellow-500",
    badgeColor: "bg-yellow-100 text-yellow-800",
    description: "Special guests and VIP attendees",
    features: ["VIP badge", "Priority access", "VIP lounge access"]
  },
  resident: {
    label: "Local Resident",
    icon: Home,
    color: "bg-teal-500",
    badgeColor: "bg-teal-100 text-teal-800",
    description: "Local community members",
    features: ["Community access", "Limited business features", "Resident discounts"]
  },
  team: {
    label: "Team Member",
    icon: UsersRound,
    color: "bg-indigo-500",
    badgeColor: "bg-indigo-100 text-indigo-800",
    description: "CBA team members and staff",
    features: ["Full access", "Admin capabilities", "Team coordination tools"]
  }
};

export default function UserTypes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch users with their types
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Group users by participant type
  const usersByType = users?.reduce((acc: any, user: any) => {
    const type = user.participantType || 'attendee';
    if (!acc[type]) acc[type] = [];
    acc[type].push(user);
    return acc;
  }, {}) || {};

  // Filter users based on search and type
  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = searchTerm === "" || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || user.participantType === filterType;
    
    return matchesSearch && matchesType;
  }) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Types & Categories</h1>
        <p className="text-muted-foreground">
          Distinguish between different participant types and their access levels
        </p>
      </div>

      {/* Type Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(PARTICIPANT_TYPES).map(([key, type]) => {
          const Icon = type.icon;
          const count = usersByType[key]?.length || 0;
          
          return (
            <Card key={key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${type.color} rounded-full flex items-center justify-center text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{type.label}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {count} users
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {type.description}
                </p>
                <div className="space-y-1">
                  {type.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="text-green-500">✓</span> {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User List with Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Users by Type</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(PARTICIPANT_TYPES).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user: any) => {
                  const type = PARTICIPANT_TYPES[user.participantType as keyof typeof PARTICIPANT_TYPES] || PARTICIPANT_TYPES.attendee;
                  const Icon = type.icon;
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${type.color} rounded-full flex items-center justify-center text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {user.firstName} {user.lastName}
                            {user.isAdmin && (
                              <Badge variant="default" className="bg-rose-500">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={type.badgeColor}>
                          {type.label}
                        </Badge>
                        {user.membershipTier && user.membershipTier !== "Starter Tier" && (
                          <Badge variant="outline">
                            {user.membershipTier}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No users found matching your criteria
                </div>
              )}
            </div>
          )}

          {/* Summary Statistics */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-medium mb-4">User Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(usersByType).map(([type, typeUsers]: [string, any]) => {
                const typeConfig = PARTICIPANT_TYPES[type as keyof typeof PARTICIPANT_TYPES] || PARTICIPANT_TYPES.attendee;
                return (
                  <div key={type} className="text-center">
                    <div className="text-2xl font-bold">{typeUsers.length}</div>
                    <div className="text-xs text-muted-foreground">{typeConfig.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Control Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Access Control & Restrictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Regular Users (Attendees)</h4>
              <p className="text-sm text-blue-800">
                Full access to all business features, membership benefits, event registration, and profile management.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Restricted Access Types</h4>
              <p className="text-sm text-orange-800 mb-2">
                The following participant types have limited access to business features:
              </p>
              <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
                <li><strong>Volunteers:</strong> Cannot manage business profiles or products</li>
                <li><strong>Speakers:</strong> Limited to speaker-specific features</li>
                <li><strong>Exhibitors:</strong> Access to exhibition management only</li>
                <li><strong>VIP Guests:</strong> Event access without business features</li>
                <li><strong>Residents:</strong> Community features only</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Administrators & Team</h4>
              <p className="text-sm text-green-800">
                Team members and administrators have full unrestricted access to all platform features including admin panels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}