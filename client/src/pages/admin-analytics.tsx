import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Building2, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Target,
  Mail,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  Crown,
  Zap
} from "lucide-react";
import { format } from "date-fns";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalBusinesses: number;
    totalEvents: number;
    totalRevenue: number;
    membershipDistribution: Record<string, number>;
    growthRate: number;
    activeUsers: number;
    conversionRate: number;
  };
  membership: {
    tierDistribution: Array<{
      tier: string;
      count: number;
      revenue: number;
      percentage: number;
    }>;
    recentSignups: Array<{
      date: string;
      count: number;
      tier: string;
    }>;
    churnRate: number;
    averageLifetime: number;
  };
  events: {
    totalAttendees: number;
    averageAttendance: number;
    popularEvents: Array<{
      name: string;
      attendees: number;
      date: string;
    }>;
    eventPerformance: Array<{
      month: string;
      events: number;
      attendees: number;
    }>;
  };
  engagement: {
    dailyActiveUsers: Array<{
      date: string;
      count: number;
    }>;
    featureUsage: Array<{
      feature: string;
      usage: number;
      percentage: number;
    }>;
    supportTickets: number;
    satisfaction: number;
  };
}

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need administrator privileges to access analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch analytics data
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['/api/admin/analytics', selectedPeriod],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', selectedPeriod);
      
      const response = await fetch(`/api/admin/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load analytics data. Please try again.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into your business performance</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview?.totalUsers?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics?.overview?.growthRate || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview?.totalBusinesses?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.overview?.activeUsers || 0} active this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics?.overview?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(analytics?.overview?.conversionRate || 0)} conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Hosted</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview?.totalEvents || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.events?.totalAttendees || 0} total attendees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="membership" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          {/* Membership Analytics */}
          <TabsContent value="membership" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Membership Tier Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.membership?.tierDistribution?.map((tier: any) => (
                    <div key={tier.tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-medium capitalize">{tier.tier}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{tier.count}</div>
                        <div className="text-sm text-gray-500">{formatPercentage(tier.percentage)}</div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No membership data available</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Signups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics?.membership?.recentSignups?.slice(0, 5).map((signup: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{format(new Date(signup.date), 'MMM dd, yyyy')}</div>
                        <Badge variant="outline" className="text-xs capitalize">{signup.tier}</Badge>
                      </div>
                      <div className="font-bold">{signup.count} users</div>
                    </div>
                  )) || <p className="text-gray-500">No recent signups</p>}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {formatPercentage(analytics?.membership?.churnRate || 0)}
                  </div>
                  <p className="text-sm text-gray-500">Monthly churn rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg. Lifetime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(analytics?.membership?.averageLifetime || 0)} days
                  </div>
                  <p className="text-sm text-gray-500">Average member lifetime</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(
                      analytics?.membership?.tierDistribution?.reduce((sum: number, tier: any) => sum + tier.revenue, 0) || 0
                    )}
                  </div>
                  <p className="text-sm text-gray-500">From memberships</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Analytics */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Popular Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics?.events?.popularEvents?.map((event: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-gray-500">{format(new Date(event.date), 'MMM dd, yyyy')}</div>
                      </div>
                      <Badge variant="secondary">{event.attendees} attendees</Badge>
                    </div>
                  )) || <p className="text-gray-500">No event data available</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Event Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics?.events?.eventPerformance?.map((performance: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-medium">{performance.month}</div>
                      <div className="text-right">
                        <div className="font-bold">{performance.events} events</div>
                        <div className="text-sm text-gray-500">{performance.attendees} attendees</div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No performance data available</p>}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Attendees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {analytics?.events?.totalAttendees?.toLocaleString() || 0}
                  </div>
                  <p className="text-sm text-gray-500">Across all events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.round(analytics?.events?.averageAttendance || 0)}
                  </div>
                  <p className="text-sm text-gray-500">Per event</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Analytics */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Feature Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics?.engagement?.featureUsage?.map((feature: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-medium">{feature.feature}</div>
                      <div className="text-right">
                        <div className="font-bold">{feature.usage}</div>
                        <div className="text-sm text-gray-500">{formatPercentage(feature.percentage)}</div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No usage data available</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Support & Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Support Tickets</span>
                    <Badge variant="outline">{analytics?.engagement?.supportTickets || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Satisfaction Score</span>
                    <div className="text-2xl font-bold text-green-600">
                      {(analytics?.engagement?.satisfaction || 0).toFixed(1)}/5.0
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Analytics */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Recurring Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(analytics?.overview?.totalRevenue || 0)}
                  </div>
                  <p className="text-sm text-gray-500">Current MRR</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Revenue Per User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(
                      (analytics?.overview?.totalRevenue || 0) / (analytics?.overview?.totalUsers || 1)
                    )}
                  </div>
                  <p className="text-sm text-gray-500">ARPU</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Lifetime Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {formatCurrency(
                      ((analytics?.overview?.totalRevenue || 0) / (analytics?.overview?.totalUsers || 1)) * 
                      ((analytics?.membership?.averageLifetime || 0) / 30)
                    )}
                  </div>
                  <p className="text-sm text-gray-500">CLV</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}