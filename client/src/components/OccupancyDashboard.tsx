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