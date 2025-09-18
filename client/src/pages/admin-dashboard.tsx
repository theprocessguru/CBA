import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Users, 
  MapPin,
  Briefcase,
  Calendar,
  TrendingUp,
  Award,
  Building,
  GraduationCap,
  PieChart,
  Target,
  Activity,
  UserCheck,
  Clock,
  AlertCircle,
  DollarSign,
  BarChart3,
  Settings,
  FileText,
  Heart,
  Upload,
  Send,
  Mail,
  Sparkles,
  QrCode,
  ScanLine
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WorkshopAttendanceCount } from "@/components/admin/WorkshopAttendanceCount";
import { SpeakingSessionAttendanceCount } from "@/components/admin/SpeakingSessionAttendanceCount";

interface ImpactMetrics {
  // Member metrics
  totalMembers: number;
  membersByTier: {
    free: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  newMembersThisMonth: number;
  memberGrowthRate: number;
  
  // Event metrics
  totalEventsHeld: number;
  totalAttendees: number;
  attendeesByLocation: {
    location: string;
    count: number;
  }[];
  upcomingEvents: number;
  averageAttendanceRate: number;
  
  // Building occupancy
  currentOccupancy?: number;
  maxBuildingCapacity?: number;
  
  // Training metrics
  totalWorkshopsDelivered: number;
  totalPeopleTrained: number;
  trainingHoursDelivered: number;
  certificatesIssued: number;
  
  // Jobs metrics
  totalJobsPosted: number;
  activeJobs: number;
  jobApplications: number;
  jobsFilled: number;
  averageSalary: number;
  
  // Stakeholder breakdown
  stakeholderPercentages: {
    businesses: number;
    students: number;
    volunteers: number;
    jobSeekers: number;
    speakers: number;
    exhibitors: number;
    sponsors: number;
  };
  
  // Impact metrics
  businessesSupported: number;
  economicImpact: number;
  partnershipsFormed: number;
  fundingSecured: number;
  
  // Economic Growth Tracking
  economicGrowth?: {
    // MYT Automation Pipeline Data
    activeInvestmentMatches: number;
    completedInvestmentMatches: number;
    totalInvestmentValue: number;
    procurementRequests: number;
    localProcurementMatches: number;
    skillsExchangeConnections: number;
    activeSkillsProjects: number;
    
    // Business-to-Business Tracking
    localSupplierTransactions: number;
    externalSupplierReductions: number;
    businessNetworkingConnections: number;
    crossReferralGenerated: number;
    
    // Member Engagement
    economicGrowthParticipation: number;
    memberBusinessMatches: number;
    localSpendIncrease: number;
    
    // Performance Metrics
    monthlyEconomicGrowth: number;
    quarterlyGrowthTarget: number;
    mytAutomationSyncStatus: 'active' | 'inactive' | 'error';
    lastSyncTimestamp: string;
  };
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

  // Fetch impact metrics
  const { data: metrics, isLoading } = useQuery<ImpactMetrics>({
    queryKey: ['/api/admin/impact-metrics'],
    enabled: isAuthenticated && (user as any)?.isAdmin
  });
  
  // Fetch building occupancy
  const { data: occupancy } = useQuery<{ totalInBuilding: number }>({
    queryKey: ['/api/ai-summit/occupancy'],
    enabled: isAuthenticated && (user as any)?.isAdmin,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminContent metrics={metrics} occupancy={occupancy} />
      </div>
    </div>
  );
}

function AdminSidebar() {
  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
      </div>
      <nav className="p-4 space-y-2">
        <Link href="/admin">
          <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </div>
        </Link>
        
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">User Management</p>
          <Link href="/admin/user-management">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Users size={18} />
              <span>Team Users</span>
            </div>
          </Link>
          <Link href="/admin/administrators">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <UserCheck size={18} />
              <span>Administrators</span>
            </div>
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Events & Content</p>
          <Link href="/admin/events">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Calendar size={18} />
              <span>Events</span>
            </div>
          </Link>
          <Link href="/admin/speakers">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Users size={18} />
              <span>Speakers</span>
            </div>
          </Link>
          <Link href="/admin/speaker-recovery">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <UserCheck size={18} />
              <span>Speaker Recovery</span>
            </div>
          </Link>
          <Link href="/ai-summit">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Sparkles size={18} />
              <span>AI Summit</span>
            </div>
          </Link>
          <Link href="/admin/onboarding">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Send size={18} />
              <span>Onboarding</span>
            </div>
          </Link>
          <Link href="/organizer-scanner">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-700">
              <ScanLine size={18} />
              <span>Event Scanner</span>
            </div>
          </Link>
          <Link href="/test-qr-codes">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-700">
              <QrCode size={18} />
              <span>Test QR Codes</span>
            </div>
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Session Management</p>
          <Link href="/admin/workshops">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700">
              <div className="flex items-center space-x-2">
                <GraduationCap size={18} />
                <span>Workshops</span>
              </div>
              <WorkshopAttendanceCount />
            </div>
          </Link>
          <Link href="/admin/speaking-sessions">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-700">
              <div className="flex items-center space-x-2">
                <Users size={18} />
                <span>Speaking Sessions</span>
              </div>
              <SpeakingSessionAttendanceCount />
            </div>
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">System</p>
          <Link href="/admin/analytics">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Activity size={18} />
              <span>Analytics</span>
            </div>
          </Link>
          <Link href="/admin/email-templates">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Mail size={18} />
              <span>Email Templates</span>
            </div>
          </Link>
          <Link href="/admin/notification-management">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Send size={18} />
              <span>Notifications</span>
            </div>
          </Link>
          <Link href="/admin/contact-import">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Upload size={18} />
              <span>Contact Import</span>
            </div>
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Economic Growth</p>
          <Link href="/economic-growth">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-700">
              <TrendingUp size={18} />
              <span>🚀 Growth Engine</span>
            </div>
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Membership</p>
          <Link href="/dashboard/membership-management">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Heart size={18} />
              <span>Membership</span>
            </div>
          </Link>
          <Link href="/admin/affiliates">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700">
              <Target size={18} />
              <span>Affiliates</span>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}

function AdminContent({ metrics, occupancy }: { metrics?: ImpactMetrics; occupancy?: { totalInBuilding: number } }) {
  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading impact metrics...</p>
        </div>
      </div>
    );
  }

  // Calculate some derived metrics
  const totalStakeholders = Object.values(metrics.stakeholderPercentages).reduce((a, b) => a + b, 0);
  
  const membershipFillRate = ((metrics.membersByTier.bronze + metrics.membersByTier.silver + 
    metrics.membersByTier.gold + metrics.membersByTier.platinum) / 
   metrics.totalMembers * 100);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Running Totals Banner - Highly Visible */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Activity className="mr-2 h-6 w-6" />
          Live Running Totals
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{metrics?.totalMembers || 0}</div>
            <div className="text-sm opacity-90">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{metrics?.totalPeopleTrained || 0}</div>
            <div className="text-sm opacity-90">People Trained</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{metrics?.totalEventsHeld || 0}</div>
            <div className="text-sm opacity-90">Events Held</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">£{metrics?.economicImpact?.toLocaleString() || 0}</div>
            <div className="text-sm opacity-90">Economic Impact</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${
            occupancy && occupancy.totalInBuilding >= 450 ? 'bg-red-500' :
            occupancy && occupancy.totalInBuilding >= 400 ? 'bg-orange-500' :
            'bg-white/10'
          }`}>
            <div className="text-3xl font-bold">{occupancy?.totalInBuilding || 0}/500</div>
            <div className="text-sm opacity-90">Current Occupancy</div>
            <div className="text-xs opacity-75 mt-1">Daily target: 1,000</div>
            {occupancy && occupancy.totalInBuilding >= 450 && (
              <div className="text-xs font-bold mt-1 animate-pulse">CRITICAL</div>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="opacity-75">Active Jobs:</span>
              <span className="ml-2 font-semibold">{metrics?.activeJobs || 0}</span>
            </div>
            <div>
              <span className="opacity-75">Businesses:</span>
              <span className="ml-2 font-semibold">{metrics?.businessesSupported || 0}</span>
            </div>
            <div>
              <span className="opacity-75">Applications:</span>
              <span className="ml-2 font-semibold">{metrics?.jobApplications || 0}</span>
            </div>
            <div>
              <span className="opacity-75">Partnerships:</span>
              <span className="ml-2 font-semibold">{metrics?.partnershipsFormed || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impact Dashboard</h1>
          <p className="text-gray-600 mt-1">Key metrics for funding applications and impact reporting</p>
        </div>
        <div className="flex gap-2">
          <Link href="/data-import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </Link>
          <Link href="/admin/export-report">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/data-import">
            <Button variant="default" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import Contacts & Companies
            </Button>
          </Link>
          <Link href="/dashboard/user-management">
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/dashboard/event-management">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Manage Events
            </Button>
          </Link>
          <Link href="/dashboard/membership-management">
            <Button variant="outline" size="sm">
              <Award className="mr-2 h-4 w-4" />
              Manage Memberships
            </Button>
          </Link>
          <Link href="/admin/speakers">
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              View Speakers
            </Button>
          </Link>
          <Link href="/ai-summit">
            <Button variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Summit Registration
            </Button>
          </Link>
          <Link href="/admin/onboarding">
            <Button variant="outline" size="sm">
              <Send className="mr-2 h-4 w-4" />
              Onboarding
            </Button>
          </Link>
          <Link href="/admin/email-templates">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email Templates
            </Button>
          </Link>
          <Link href="/admin/notification-management">
            <Button variant="outline" size="sm">
              <Send className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Impact Metrics - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalMembers || 0}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{metrics?.memberGrowthRate || 0}% this month
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics?.newMembersThisMonth || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People Trained</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalPeopleTrained || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics?.totalWorkshopsDelivered || 0} workshops delivered
            </p>
            <p className="text-xs text-gray-500">
              {metrics?.trainingHoursDelivered || 0} training hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Held</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalEventsHeld || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics?.totalAttendees || 0} total attendees
            </p>
            <p className="text-xs text-gray-500">
              {metrics?.upcomingEvents || 0} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs on Offer</CardTitle>
            <Briefcase className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeJobs || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics?.jobsFilled || 0} positions filled
            </p>
            <p className="text-xs text-gray-500">
              £{metrics?.averageSalary?.toLocaleString() || 0} avg salary
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stakeholder Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Stakeholder Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.stakeholderPercentages && Object.entries(metrics.stakeholderPercentages).map(([type, percentage]) => (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Stakeholders</span>
              <span>{totalStakeholders}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Attendees by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics?.attendeesByLocation?.map((loc) => (
              <div key={loc.location} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{loc.count}</div>
                <div className="text-sm text-gray-600">{loc.location}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Attendance Rate</span>
              <span className="text-lg font-semibold text-green-600">
                {metrics?.averageAttendanceRate || 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Membership Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {metrics?.membersByTier && Object.entries(metrics.membersByTier).map(([tier, count]) => (
              <div key={tier} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-xl font-bold ${
                  tier === 'platinum' ? 'text-purple-600' :
                  tier === 'gold' ? 'text-yellow-600' :
                  tier === 'silver' ? 'text-gray-600' :
                  tier === 'bronze' ? 'text-orange-600' :
                  'text-gray-400'
                }`}>
                  {count}
                </div>
                <div className="text-xs text-gray-600 capitalize">{tier}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Paid Membership Rate</span>
              <div className="flex items-center">
                <Progress value={membershipFillRate} className="w-24 h-2 mr-2" />
                <span className="text-sm font-medium">{membershipFillRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Economic Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses Supported</CardTitle>
            <Building className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.businessesSupported || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active business members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economic Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{metrics?.economicImpact?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Generated for local economy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partnerships</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.partnershipsFormed || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Strategic partnerships formed</p>
          </CardContent>
        </Card>
      </div>

      {/* Economic Growth Engine Dashboard */}
      {metrics?.economicGrowth && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <TrendingUp className="mr-2 h-6 w-6" />
              🚀 Economic Growth Engine - Live Tracking
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">£{metrics.economicGrowth.totalInvestmentValue?.toLocaleString() || 0}</div>
                <div className="text-sm opacity-90">Investment Matched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.economicGrowth.localProcurementMatches || 0}</div>
                <div className="text-sm opacity-90">Local Procurement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.economicGrowth.skillsExchangeConnections || 0}</div>
                <div className="text-sm opacity-90">Skills Exchange</div>
              </div>
              <div className="text-center">
                <div className={`p-2 rounded-lg ${
                  metrics.economicGrowth.mytAutomationSyncStatus === 'active' ? 'bg-green-500' :
                  metrics.economicGrowth.mytAutomationSyncStatus === 'error' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}>
                  <div className="text-2xl font-bold">
                    {metrics.economicGrowth.mytAutomationSyncStatus === 'active' ? '✅' : 
                     metrics.economicGrowth.mytAutomationSyncStatus === 'error' ? '❌' : '⚠️'}
                  </div>
                  <div className="text-sm opacity-90">MYT Automation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Matching Hub */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investment Matches</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.economicGrowth.activeInvestmentMatches || 0}</div>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Matches</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.economicGrowth.completedInvestmentMatches || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Successfully funded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{metrics.economicGrowth.totalInvestmentValue?.toLocaleString() || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Capital secured</p>
              </CardContent>
            </Card>
          </div>

          {/* Local Procurement & Skills Exchange */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Local Procurement Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Procurement Requests</span>
                    <span className="font-semibold">{metrics.economicGrowth.procurementRequests || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Local Matches</span>
                    <span className="font-semibold">{metrics.economicGrowth.localProcurementMatches || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">External Reductions</span>
                    <span className="font-semibold text-green-600">-{metrics.economicGrowth.externalSupplierReductions || 0}</span>
                  </div>
                  <Progress 
                    value={metrics.economicGrowth.procurementRequests > 0 ? 
                      (metrics.economicGrowth.localProcurementMatches / metrics.economicGrowth.procurementRequests) * 100 : 0} 
                    className="w-full" 
                  />
                  <p className="text-xs text-gray-500">
                    {metrics.economicGrowth.procurementRequests > 0 ? 
                      Math.round((metrics.economicGrowth.localProcurementMatches / metrics.economicGrowth.procurementRequests) * 100) : 0}% local sourcing rate
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Skills Exchange Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Skills Connections</span>
                    <span className="font-semibold">{metrics.economicGrowth.skillsExchangeConnections || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Projects</span>
                    <span className="font-semibold">{metrics.economicGrowth.activeSkillsProjects || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member Participation</span>
                    <span className="font-semibold">{metrics.economicGrowth.economicGrowthParticipation || 0}</span>
                  </div>
                  <Progress 
                    value={metrics.economicGrowth.skillsExchangeConnections > 0 ? 
                      (metrics.economicGrowth.activeSkillsProjects / metrics.economicGrowth.skillsExchangeConnections) * 100 : 0} 
                    className="w-full" 
                  />
                  <p className="text-xs text-gray-500">
                    {metrics.economicGrowth.skillsExchangeConnections > 0 ? 
                      Math.round((metrics.economicGrowth.activeSkillsProjects / metrics.economicGrowth.skillsExchangeConnections) * 100) : 0}% project completion rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Economic Growth Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.economicGrowth.businessNetworkingConnections || 0}
                  </div>
                  <div className="text-sm text-gray-600">B2B Connections</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.economicGrowth.crossReferralGenerated || 0}
                  </div>
                  <div className="text-sm text-gray-600">Cross Referrals</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    £{metrics.economicGrowth.monthlyEconomicGrowth?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Growth</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    £{metrics.economicGrowth.quarterlyGrowthTarget?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Q3 Target</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">MYT Automation Sync Status</span>
                  <div className="flex items-center">
                    <Badge variant={
                      metrics.economicGrowth.mytAutomationSyncStatus === 'active' ? 'default' :
                      metrics.economicGrowth.mytAutomationSyncStatus === 'error' ? 'destructive' : 'secondary'
                    }>
                      {metrics.economicGrowth.mytAutomationSyncStatus?.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">
                      Last sync: {new Date(metrics.economicGrowth.lastSyncTimestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link href="/dashboard/user-management">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Button>
            </Link>
            <Link href="/dashboard/event-management">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Event Management
              </Button>
            </Link>
            <Link href="/dashboard/membership-management">
              <Button variant="outline" className="w-full justify-start">
                <Award className="mr-2 h-4 w-4" />
                Membership Tiers
              </Button>
            </Link>
            <Link href="/dashboard/content-reports">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Content Reports
              </Button>
            </Link>
            <Link href="/mood-dashboard">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="mr-2 h-4 w-4" />
                Event Mood
              </Button>
            </Link>
            <Link href="/admin/affiliates">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Affiliates
              </Button>
            </Link>
            <Link href="/admin/attendance-report">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Attendance Reports
              </Button>
            </Link>
            <Link href="/admin/time-slot-manager">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Time Slot Manager
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators for Funding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Key Performance Indicators (KPIs) for Funding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3">Reach & Engagement</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Member Retention Rate</span>
                  <Badge variant="outline" className="bg-green-50">92%</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Event Satisfaction Score</span>
                  <Badge variant="outline" className="bg-green-50">4.8/5</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Training Completion Rate</span>
                  <Badge variant="outline" className="bg-green-50">87%</Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3">Impact & Outcomes</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Job Placement Rate</span>
                  <Badge variant="outline" className="bg-blue-50">73%</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Business Growth (Members)</span>
                  <Badge variant="outline" className="bg-blue-50">+34%</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Funding Secured</span>
                  <Badge variant="outline" className="bg-blue-50">£{metrics?.fundingSecured?.toLocaleString() || 0}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}