import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export function SpeakingSessionAttendanceCount() {
  const { data: sessionStats, isLoading } = useQuery<{
    totalSessions: number;
    totalRegistrations: number;
    activeAttendance: number;
  }>({
    queryKey: ['/api/admin/speaking-session-stats'],
    refetchInterval: 30000 // Refresh every 30 seconds for live data
  });

  if (isLoading) {
    return (
      <div className="flex space-x-1">
        <Badge variant="secondary" className="text-xs">
          Loading...
        </Badge>
      </div>
    );
  }

  if (!sessionStats) {
    return (
      <div className="flex space-x-1">
        <Badge variant="secondary" className="text-xs">
          0 Live
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex space-x-1">
      <Badge 
        variant={sessionStats.activeAttendance > 0 ? "default" : "secondary"} 
        className="text-xs"
        data-testid="session-live-count"
      >
        {sessionStats.activeAttendance} Live
      </Badge>
      <Badge variant="outline" className="text-xs" data-testid="session-total-count">
        {sessionStats.totalSessions} Sessions
      </Badge>
    </div>
  );
}