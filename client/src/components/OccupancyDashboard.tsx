import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  Building2,
  Activity,
  RefreshCw
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface OccupancyData {
  totalInBuilding: number;
  totalCheckedIn: number;
  totalCheckedOut: number;
  lastUpdated: Date;
}

interface DetailedOccupancy {
  byParticipantType: Record<string, { checkedIn: number; checkedOut: number }>;
  totalInBuilding: number;
  recentActivity: Array<{
    badgeId: string;
    name: string;
    participantType: string;
    checkInType: string;
    timestamp: Date;
    staffMember?: string;
  }>;
}

export default function OccupancyDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Building capacity limits
  const BUILDING_MAX_CAPACITY = 500; // Maximum capacity at any time
  const DAILY_THROUGHPUT = 1000; // Total people throughout the day
  const WARNING_THRESHOLD = 0.8; // 80% capacity warning (400 people)
  const CRITICAL_THRESHOLD = 0.9; // 90% capacity critical (450 people)

  // Fetch current occupancy
  const { data: occupancy, isLoading: occupancyLoading } = useQuery<OccupancyData>({
    queryKey: ['/api/ai-summit/occupancy'],
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
  });

  // Fetch detailed occupancy
  const { data: detailed, isLoading: detailedLoading } = useQuery<DetailedOccupancy>({
    queryKey: ['/api/ai-summit/occupancy/detailed'],
    refetchInterval: autoRefresh ? 15000 : false, // Refresh every 15 seconds
  });

  // Update last refresh when data changes
  useEffect(() => {
    if (occupancy) {
      setLastRefresh(new Date());
    }
  }, [occupancy]);

  const manualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/ai-summit/occupancy'] });
    queryClient.invalidateQueries({ queryKey: ['/api/ai-summit/occupancy/detailed'] });
    setLastRefresh(new Date());
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const getParticipantTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'attendee':
        return 'bg-blue-100 text-blue-800';
      case 'speaker':
        return 'bg-purple-100 text-purple-800';
      case 'exhibitor':
        return 'bg-green-100 text-green-800';
      case 'sponsor':
        return 'bg-yellow-100 text-yellow-800';
      case 'staff':
        return 'bg-gray-100 text-gray-800';
      case 'vip':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (checkInType: string) => {
    return checkInType === 'check_in' ? (
      <UserCheck className="h-4 w-4 text-green-600" />
    ) : (
      <UserX className="h-4 w-4 text-red-600" />
    );
  };

  if (occupancyLoading || detailedLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Real-Time Occupancy
          </h2>
          <p className="text-sm text-gray-600">
            Last updated: {formatTime(lastRefresh)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={manualRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Building Capacity Alert */}
      {occupancy && (
        <Card className={`${
          occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * CRITICAL_THRESHOLD ? 'border-2 border-red-500 bg-red-50' :
          occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * WARNING_THRESHOLD ? 'border-2 border-orange-500 bg-orange-50' :
          'border-2 border-green-500 bg-green-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Building Capacity Status</h3>
                <p className="text-sm text-gray-600">
                  Maximum at any time: {BUILDING_MAX_CAPACITY} people
                </p>
                <p className="text-xs text-gray-500">
                  Daily throughput capacity: {DAILY_THROUGHPUT} people
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * CRITICAL_THRESHOLD ? 'text-red-700' :
                  occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * WARNING_THRESHOLD ? 'text-orange-700' :
                  'text-green-700'
                }`}>
                  {occupancy.totalInBuilding} / {BUILDING_MAX_CAPACITY}
                </div>
                <p className={`text-sm font-medium ${
                  occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * CRITICAL_THRESHOLD ? 'text-red-600' :
                  occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * WARNING_THRESHOLD ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {((occupancy.totalInBuilding / BUILDING_MAX_CAPACITY) * 100).toFixed(1)}% occupied
                </p>
              </div>
            </div>
            
            {/* Capacity Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * CRITICAL_THRESHOLD ? 'bg-red-500' :
                  occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * WARNING_THRESHOLD ? 'bg-orange-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min((occupancy.totalInBuilding / BUILDING_MAX_CAPACITY) * 100, 100)}%` }}
              />
              {/* Warning threshold marker at 80% */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-orange-700" style={{ left: '80%' }} />
              {/* Critical threshold marker at 90% */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-red-700" style={{ left: '90%' }} />
            </div>
            
            {/* Capacity Messages */}
            <div className="mt-3 space-y-2">
              <div>
                {occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY && (
                  <Badge className="bg-red-600 text-white">
                    AT MAXIMUM CAPACITY - NO MORE ENTRIES
                  </Badge>
                )}
                {occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * CRITICAL_THRESHOLD && 
                 occupancy.totalInBuilding < BUILDING_MAX_CAPACITY && (
                  <Badge className="bg-red-500 text-white">
                    CRITICAL: Approaching maximum capacity (450+ people)
                  </Badge>
                )}
                {occupancy.totalInBuilding >= BUILDING_MAX_CAPACITY * WARNING_THRESHOLD && 
                 occupancy.totalInBuilding < BUILDING_MAX_CAPACITY * CRITICAL_THRESHOLD && (
                  <Badge className="bg-orange-500 text-white">
                    WARNING: Building at high capacity (400+ people)
                  </Badge>
                )}
                {occupancy.totalInBuilding < BUILDING_MAX_CAPACITY * WARNING_THRESHOLD && (
                  <Badge className="bg-green-500 text-white">
                    Normal capacity - Safe to enter
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 italic">
                Encourage flow: Attendees should visit their session, explore the exhibition, then exit to allow others in.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Occupancy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total In Building
            </CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {occupancy?.totalInBuilding || 0}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Current occupancy
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Total Check-Ins
            </CardTitle>
            <UserCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {occupancy?.totalCheckedIn || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">
              People who entered
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Total Check-Outs
            </CardTitle>
            <UserX className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              {occupancy?.totalCheckedOut || 0}
            </div>
            <p className="text-xs text-red-600 mt-1">
              People who left
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Participant Type */}
      {detailed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Breakdown by Participant Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(detailed.byParticipantType).map(([type, counts]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getParticipantTypeColor(type)}>
                      {type}
                    </Badge>
                    <span className="text-sm font-medium">
                      {counts.checkedIn} in building
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {counts.checkedOut} left
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {detailed && detailed.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detailed.recentActivity.slice(0, 20).map((activity, index) => (
                <div
                  key={`${activity.badgeId}-${activity.timestamp}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.checkInType)}
                    <div>
                      <div className="font-medium text-sm">
                        {activity.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge className={getParticipantTypeColor(activity.participantType)}>
                          {activity.participantType}
                        </Badge>
                        <span>Badge: {activity.badgeId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      activity.checkInType === 'check_in' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {activity.checkInType === 'check_in' ? 'Checked In' : 'Checked Out'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(new Date(activity.timestamp))}
                    </div>
                    {activity.staffMember && (
                      <div className="text-xs text-gray-400">
                        by {activity.staffMember}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}