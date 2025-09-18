import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Workshop {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentRegistrations: number;
  isActive: boolean;
}

interface WorkshopStats {
  totalWorkshops: number;
  totalRegistrations: number;
  activeAttendance: number;
}

export default function WorkshopManagement() {
  const { data: workshops, isLoading: workshopsLoading } = useQuery<Workshop[]>({
    queryKey: ['/api/ai-summit/workshops']
  });

  const { data: stats, isLoading: statsLoading } = useQuery<WorkshopStats>({
    queryKey: ['/api/admin/workshop-stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (workshopsLoading || statsLoading) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Workshop Management</h1>
            <p className="text-muted-foreground">Manage AI Summit workshops and track attendance</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            Workshop Management
          </h1>
          <p className="text-muted-foreground">Manage AI Summit workshops and track real-time attendance</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-workshops">
                {stats?.totalWorkshops || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-registrations">
                {stats?.totalRegistrations || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Attending</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="active-attendance">
                {stats?.activeAttendance || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Live attendance via QR scans
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workshop List */}
        <Card>
          <CardHeader>
            <CardTitle>All Workshops</CardTitle>
          </CardHeader>
          <CardContent>
            {!workshops || workshops.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No workshops found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workshops.map((workshop) => (
                  <div
                    key={workshop.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`workshop-${workshop.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{workshop.title}</h3>
                        <Badge variant={workshop.isActive ? "default" : "secondary"}>
                          {workshop.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {workshop.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(workshop.startTime).toLocaleTimeString()} - {new Date(workshop.endTime).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {workshop.currentRegistrations}/{workshop.maxCapacity} registered
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Capacity: {Math.round((workshop.currentRegistrations / workshop.maxCapacity) * 100)}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((workshop.currentRegistrations / workshop.maxCapacity) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}