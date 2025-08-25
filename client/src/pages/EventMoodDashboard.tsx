import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Smile, Frown, Meh, AlertTriangle, TrendingUp, TrendingDown, Activity, Clock, Users, BarChart3, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface MoodEntry {
  id: number;
  eventId: number;
  userId?: string;
  sessionName?: string;
  moodType: string;
  intensity: number;
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface MoodAggregation {
  moodType: string;
  count: number;
  avgIntensity: number;
  sessionName?: string;
}

interface MoodData {
  entries: MoodEntry[];
  aggregated: MoodAggregation[];
  timeSeries: Array<{
    timeSlot: string;
    moodType: string;
    count: number;
    avgIntensity: number;
  }>;
  totalEntries: number;
  timeRange: string;
  sessionName: string;
}

const MOOD_TYPES = {
  excited: { icon: Heart, color: "#ef4444", label: "Excited" },
  engaged: { icon: Smile, color: "#22c55e", label: "Engaged" },
  neutral: { icon: Meh, color: "#6b7280", label: "Neutral" },
  confused: { icon: Frown, color: "#f59e0b", label: "Confused" },
  bored: { icon: AlertTriangle, color: "#8b5cf6", label: "Bored" }
};

const TIME_RANGES = [
  { value: "15m", label: "Last 15 minutes" },
  { value: "30m", label: "Last 30 minutes" },
  { value: "1h", label: "Last hour" },
  { value: "3h", label: "Last 3 hours" },
  { value: "6h", label: "Last 6 hours" }
];

export default function EventMoodDashboard() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("1h");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  
  const queryClient = useQueryClient();

  // Get all events for dropdown
  const { data: events = [] } = useQuery({
    queryKey: ['/api/cba-events'],
    enabled: true
  });

  // Get sessions for selected event
  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/mood/sessions', selectedEvent],
    enabled: !!selectedEvent
  });

  // Get mood data for selected event
  const { data: moodData, isLoading: isMoodLoading, refetch: refetchMoodData } = useQuery<MoodData>({
    queryKey: ['/api/mood', selectedEvent, selectedSession, timeRange],
    enabled: !!selectedEvent,
    refetchInterval: autoRefresh ? 30000 : false // Auto-refresh every 30 seconds
  });

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh && selectedEvent) {
      const interval = setInterval(() => {
        refetchMoodData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedEvent, refetchMoodData]);

  // Prepare chart data
  const prepareTimeSeriesData = () => {
    if (!moodData?.timeSeries) return [];
    
    const grouped = moodData.timeSeries.reduce((acc, item) => {
      const timeSlot = item.timeSlot;
      if (!acc[timeSlot]) {
        acc[timeSlot] = { timeSlot };
      }
      acc[timeSlot][item.moodType] = item.count;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  };

  const preparePieData = () => {
    if (!moodData?.aggregated) return [];
    
    return moodData.aggregated.map(item => ({
      name: MOOD_TYPES[item.moodType as keyof typeof MOOD_TYPES]?.label || item.moodType,
      value: item.count,
      color: MOOD_TYPES[item.moodType as keyof typeof MOOD_TYPES]?.color || "#6b7280"
    }));
  };

  const getMoodTrend = () => {
    if (!moodData?.timeSeries || moodData.timeSeries.length < 2) return null;
    
    const recent = moodData.timeSeries.slice(-3);
    const earlier = moodData.timeSeries.slice(-6, -3);
    
    const recentPositive = recent.filter(item => ['excited', 'engaged'].includes(item.moodType)).reduce((sum, item) => sum + item.count, 0);
    const earlierPositive = earlier.filter(item => ['excited', 'engaged'].includes(item.moodType)).reduce((sum, item) => sum + item.count, 0);
    
    return recentPositive > earlierPositive ? 'up' : recentPositive < earlierPositive ? 'down' : 'stable';
  };

  const getOverallMood = () => {
    if (!moodData?.aggregated || moodData.aggregated.length === 0) return null;
    
    const totalEntries = moodData.aggregated.reduce((sum, item) => sum + item.count, 0);
    const weightedScore = moodData.aggregated.reduce((sum, item) => {
      const weight = item.moodType === 'excited' ? 5 : 
                   item.moodType === 'engaged' ? 4 :
                   item.moodType === 'neutral' ? 3 :
                   item.moodType === 'confused' ? 2 : 1;
      return sum + (item.count * weight);
    }, 0);
    
    const averageScore = weightedScore / totalEntries;
    
    if (averageScore >= 4.5) return { mood: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (averageScore >= 3.5) return { mood: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (averageScore >= 2.5) return { mood: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (averageScore >= 1.5) return { mood: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { mood: 'Very Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const timeSeriesData = prepareTimeSeriesData();
  const pieData = preparePieData();
  const moodTrend = getMoodTrend();
  const overallMood = getOverallMood();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Mood Dashboard</h1>
          <p className="text-muted-foreground">Real-time sentiment tracking for live events</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchMoodData()}
            disabled={isMoodLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isMoodLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant={autoRefresh ? "default" : "secondary"}>
            <Activity className="h-3 w-3 mr-1" />
            {autoRefresh ? "Live" : "Paused"}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Event</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {(events as any[]).map((event: any) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.eventName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger>
                <SelectValue placeholder="All sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {(sessions as string[]).map((session: string) => (
                  <SelectItem key={session} value={session}>
                    {session}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Auto Refresh</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="w-full"
            >
              {autoRefresh ? "On" : "Off"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedEvent && moodData ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moodData.totalEntries}</div>
                <p className="text-xs text-muted-foreground">
                  In {timeRange.replace('m', ' minutes').replace('h', ' hour(s)')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Mood</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {overallMood ? (
                  <>
                    <div className={`text-2xl font-bold ${overallMood.color}`}>
                      {overallMood.mood}
                    </div>
                    <Badge className={overallMood.bg + " " + overallMood.color}>
                      Average sentiment
                    </Badge>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-muted-foreground">No Data</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trend</CardTitle>
                {moodTrend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : moodTrend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Activity className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  moodTrend === 'up' ? 'text-green-600' : 
                  moodTrend === 'down' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {moodTrend === 'up' ? 'Improving' : 
                   moodTrend === 'down' ? 'Declining' : 
                   'Stable'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Compared to earlier period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Session</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedSession === 'all' ? 'All' : selectedSession || 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently tracking
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Mood Over Time</CardTitle>
                <CardDescription>
                  Real-time mood tracking in 5-minute intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeSlot" />
                    <YAxis />
                    <Tooltip />
                    {Object.entries(MOOD_TYPES).map(([key, type]) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={type.color}
                        strokeWidth={2}
                        dot={{ fill: type.color, r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mood Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>
                  Overall sentiment breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Mood Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Mood Breakdown</CardTitle>
              <CardDescription>
                Current mood statistics with intensity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(MOOD_TYPES).map(([key, type]) => {
                  const data = moodData.aggregated.find(item => item.moodType === key);
                  const count = data?.count || 0;
                  const avgIntensity = data?.avgIntensity || 0;
                  const percentage = moodData.totalEntries > 0 ? (count / moodData.totalEntries) * 100 : 0;
                  const Icon = type.icon;

                  return (
                    <div key={key} className="text-center space-y-2">
                      <div className="flex items-center justify-center">
                        <Icon className="h-8 w-8" style={{ color: type.color }} />
                      </div>
                      <h3 className="font-semibold">{type.label}</h3>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Avg Intensity: {avgIntensity.toFixed(1)}/10
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Comments */}
          {moodData.entries.filter(entry => entry.comment).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Comments</CardTitle>
                <CardDescription>
                  Latest participant feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodData.entries
                    .filter(entry => entry.comment)
                    .slice(0, 5)
                    .map((entry) => {
                      const moodType = MOOD_TYPES[entry.moodType as keyof typeof MOOD_TYPES];
                      const Icon = moodType?.icon || Meh;
                      return (
                        <div key={entry.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Icon className="h-5 w-5 mt-1" style={{ color: moodType?.color }} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" style={{ borderColor: moodType?.color }}>
                                {moodType?.label} (Intensity: {entry.intensity}/10)
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleTimeString('en-GB')}
                              </span>
                            </div>
                            <p className="mt-1 text-sm">{entry.comment}</p>
                            {entry.sessionName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Session: {entry.sessionName}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : selectedEvent ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
              <h3 className="mt-4 text-lg font-semibold">Loading mood data...</h3>
              <p className="text-muted-foreground">Fetching real-time sentiment information</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Select an Event</h3>
              <p className="text-muted-foreground">Choose an event to view real-time mood sentiment data</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}