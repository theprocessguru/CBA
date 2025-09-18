import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export function WorkshopAttendanceCount() {
  const { data: workshopStats, isLoading } = useQuery<{
    totalWorkshops: number;
    totalRegistrations: number;
    activeAttendance: number;
  }>({
    queryKey: ['/api/admin/workshop-stats'],
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

  if (!workshopStats) {
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
        variant={workshopStats.activeAttendance > 0 ? "default" : "secondary"} 
        className="text-xs"
        data-testid="workshop-live-count"
      >
        {workshopStats.activeAttendance} Live
      </Badge>
      <Badge variant="outline" className="text-xs" data-testid="workshop-total-count">
        {workshopStats.totalRegistrations} Total
      </Badge>
    </div>
  );
}