import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Smile,
  Frown,
  Heart,
  Zap,
  Brain,
  Target,
  HelpCircle,
  Coffee,
  AlertTriangle,
  Meh,
  TrendingUp,
  Users,
  Clock,
  RefreshCw,
} from "lucide-react";

interface MoodVisualizationProps {
  eventId: number;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const moodConfig = {
  happy: { icon: Smile, color: '#EAB308', label: 'Happy' },
  excited: { icon: Zap, color: '#F97316', label: 'Excited' },
  inspired: { icon: Heart, color: '#EC4899', label: 'Inspired' },
  focused: { icon: Target, color: '#3B82F6', label: 'Focused' },
  confused: { icon: HelpCircle, color: '#8B5CF6', label: 'Confused' },
  bored: { icon: Coffee, color: '#6B7280', label: 'Bored' },
  frustrated: { icon: AlertTriangle, color: '#EF4444', label: 'Frustrated' },
  neutral: { icon: Meh, color: '#64748B', label: 'Neutral' },
};

export function MoodVisualization({ 
  eventId, 
  className = "", 
  autoRefresh = true, 
  refreshInterval = 30000 
}: MoodVisualizationProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const { data: moodData, isLoading, refetch } = useQuery({
    queryKey: [`/api/events/${eventId}/mood`],
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchIntervalInBackground: true,
  });

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
        refetch();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refetch]);

  const handleManualRefresh = () => {
    setLastRefresh(new Date());
    refetch();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!moodData || (!moodData.entries.length && !moodData.aggregations.length)) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Event Mood Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No mood data yet</p>
            <p className="text-sm">Attendees' moods will appear here as they share their feelings.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { entries, aggregations } = moodData;
  
  // Prepare chart data
  const moodChartData = aggregations.map(agg => ({
    mood: moodConfig[agg.moodType as keyof typeof moodConfig]?.label || agg.moodType,
    count: agg.totalCount,
    avgIntensity: parseFloat(agg.averageIntensity),
    fill: moodConfig[agg.moodType as keyof typeof moodConfig]?.color || '#64748B',
  }));

  const totalEntries = entries.length;
  const averageIntensity = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + (entry.intensity || 0), 0) / entries.length 
    : 0;

  // Get recent entries for timeline
  const recentEntries = entries.slice(0, 10);

  // Calculate session breakdown
  const sessionBreakdown = entries.reduce((acc, entry) => {
    if (entry.sessionName) {
      if (!acc[entry.sessionName]) {
        acc[entry.sessionName] = { total: 0, moods: {} };
      }
      acc[entry.sessionName].total += 1;
      acc[entry.sessionName].moods[entry.moodType] = 
        (acc[entry.sessionName].moods[entry.moodType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, { total: number; moods: Record<string, number> }>);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Real-time Event Mood
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-blue-600">{totalEntries}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Average Intensity</p>
              <p className="text-2xl font-bold text-green-600">
                {averageIntensity.toFixed(1)}/10
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Heart className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Mood Types</p>
              <p className="text-2xl font-bold text-purple-600">{aggregations.length}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Mood Grid */}
            <div>
              <h3 className="font-semibold mb-4">Current Mood Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(moodConfig).map(([moodType, config]) => {
                  const aggregation = aggregations.find(agg => agg.moodType === moodType);
                  const count = aggregation?.totalCount || 0;
                  const percentage = totalEntries > 0 ? (count / totalEntries) * 100 : 0;
                  const IconComponent = config.icon;
                  
                  return (
                    <div
                      key={moodType}
                      className="p-4 border rounded-xl text-center"
                      style={{ borderColor: config.color + '40' }}
                    >
                      <IconComponent
                        className="h-8 w-8 mx-auto mb-2"
                        style={{ color: config.color }}
                      />
                      <p className="font-medium text-sm">{config.label}</p>
                      <p className="text-2xl font-bold" style={{ color: config.color }}>
                        {count}
                      </p>
                      <Progress
                        value={percentage}
                        className="mt-2 h-2"
                        style={{ '--progress-background': config.color } as any}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div>
                <h3 className="font-semibold mb-4">Mood Count</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moodChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mood" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Pie Chart */}
              <div>
                <h3 className="font-semibold mb-4">Mood Percentage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ mood, count }) => `${mood}: ${count}`}
                    >
                      {moodChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-6">
            {Object.keys(sessionBreakdown).length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Mood by Session</h3>
                {Object.entries(sessionBreakdown).map(([sessionName, data]) => (
                  <div key={sessionName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{sessionName}</h4>
                      <Badge variant="secondary">{data.total} responses</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(data.moods).map(([moodType, count]) => {
                        const config = moodConfig[moodType as keyof typeof moodConfig];
                        const percentage = (count / data.total) * 100;
                        return (
                          <div
                            key={moodType}
                            className="text-center p-2 border rounded"
                            style={{ borderColor: config?.color + '40' }}
                          >
                            <p className="text-xs font-medium">{config?.label}</p>
                            <p className="font-bold" style={{ color: config?.color }}>
                              {count}
                            </p>
                            <p className="text-xs text-gray-500">
                              {percentage.toFixed(0)}%
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No session-specific data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Recent Mood Updates</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentEntries.map((entry, index) => {
                  const config = moodConfig[entry.moodType as keyof typeof moodConfig];
                  const IconComponent = config?.icon || Meh;
                  const time = new Date(entry.createdAt).toLocaleTimeString();
                  
                  return (
                    <div key={entry.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <IconComponent
                        className="h-5 w-5"
                        style={{ color: config?.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{config?.label}</span>
                          <Badge variant="outline" className="text-xs">
                            Intensity: {entry.intensity}/10
                          </Badge>
                          {entry.sessionName && (
                            <Badge variant="secondary" className="text-xs">
                              {entry.sessionName}
                            </Badge>
                          )}
                        </div>
                        {entry.comment && (
                          <p className="text-sm text-gray-600 mt-1">"{entry.comment}"</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}