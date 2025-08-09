import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  Mail, 
  Upload,
  Award,
  Scan,
  FileText,
  Activity,
  TrendingUp,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Crown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  activeEvents: number;
  recentRegistrations: number;
  pendingApprovals: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();

  // Check if user is admin
  if (!user || !(user as any).isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need administrator privileges to access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
    enabled: isAuthenticated && (user as any)?.isAdmin
  });

  const quickActions = [
    {
      title: "Event Management",
      description: "Create and manage CBA events",
      icon: Calendar,
      href: "/admin/events",
      color: "bg-blue-500",
      badge: stats?.activeEvents || 0
    },
    {
      title: "User Management", 
      description: "Manage user accounts and permissions",
      icon: Users,
      href: "/dashboard/user-management",
      color: "bg-green-500",
      badge: stats?.totalUsers || 0
    },
    {
      title: "Membership Pricing",
      description: "Manage membership tiers and pricing",
      icon: Crown,
      href: "/admin/membership-pricing",
      color: "bg-yellow-500"
    },
    {
      title: "Benefits Management",
      description: "Create and manage membership benefits",
      icon: Award,
      href: "/admin/benefits-management",
      color: "bg-indigo-500"
    },
    {
      title: "Membership Benefits",
      description: "Assign benefits to membership tiers",
      icon: Shield,
      href: "/admin/membership-benefits",
      color: "bg-orange-500"
    },
    {
      title: "Business Analytics",
      description: "View comprehensive business insights",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-purple-500"
    },
    {
      title: "Badge Management",
      description: "Manage digital badges and QR codes",
      icon: Award,
      href: "/admin/badges",
      color: "bg-purple-500"
    },
    {
      title: "Scanner Management",
      description: "Manage event scanners and access",
      icon: Scan,
      href: "/admin/scanner-management",
      color: "bg-orange-500"
    },
    {
      title: "Live Attendance",
      description: "Real-time event entry and exit tracking",
      icon: Activity,
      href: "/admin/attendance",
      color: "bg-emerald-500"
    },
    {
      title: "Final Report",
      description: "Complete attendance breakdown by sessions",
      icon: FileText,
      href: "/admin/attendance-report",
      color: "bg-indigo-500"
    },
    {
      title: "Analytics",
      description: "View detailed analytics and reports",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "bg-indigo-500"
    },
    {
      title: "Content Reports",
      description: "Review and moderate content",
      icon: FileText,
      href: "/dashboard/content-reports",
      color: "bg-red-500",
      badge: stats?.pendingApprovals || 0
    },
    {
      title: "Email Settings",
      description: "Configure email templates and settings",
      icon: Mail,
      href: "/dashboard/email-settings",
      color: "bg-teal-500"
    },
    {
      title: "Data Import",
      description: "Import members and bulk data",
      icon: Upload,
      href: "/admin/import",
      color: "bg-gray-500"
    },
    {
      title: "Contact Import",
      description: "Import volunteers, exhibitors, speakers and other contacts in bulk",
      icon: Upload,
      href: "/admin/contact-import",
      color: "bg-cyan-500"
    },
    {
      title: "Administrator Management",
      description: "Manage administrator accounts and permissions",
      icon: Shield,
      href: "/admin/administrators",
      color: "bg-rose-500"
    }
  ];

  const recentActivity = [
    {
      action: "New event created",
      details: "AI Workshop 2025",
      time: "2 hours ago",
      icon: Calendar,
      status: "success"
    },
    {
      action: "User registered",
      details: "john.doe@example.com",
      time: "3 hours ago", 
      icon: Users,
      status: "info"
    },
    {
      action: "Badge generated",
      details: "Event #AI-2025",
      time: "5 hours ago",
      icon: Award,
      status: "success"
    },
    {
      action: "Content flagged",
      details: "Review required",
      time: "1 day ago",
      icon: AlertCircle,
      status: "warning"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {(user as any).firstName || 'Admin'}. Here's what's happening with your CBA platform.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.totalUsers || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.activeEvents || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <Activity className="h-3 w-3 inline mr-1" />
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Registrations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.recentRegistrations || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <Clock className="h-3 w-3 inline mr-1" />
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.pendingApprovals || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <Shield className="h-3 w-3 inline mr-1" />
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="group p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                          <action.icon className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
                        </div>
                        {action.badge !== undefined && action.badge > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'warning' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.status === 'success' ? 'text-green-600' :
                        activity.status === 'warning' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Database</h4>
                <p className="text-sm text-green-600">Online</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Email Service</h4>
                <p className="text-sm text-green-600">Operational</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">API Services</h4>
                <p className="text-sm text-green-600">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}