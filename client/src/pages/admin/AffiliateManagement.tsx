import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Users, 
  MousePointer, 
  TrendingUp,
  Check,
  UserPlus,
  RefreshCw
} from "lucide-react";

interface Affiliate {
  affiliate: {
    id: number;
    userId: string;
    affiliateCode: string;
    commissionRate: string;
    totalEarnings: string;
    pendingEarnings: string;
    paidEarnings: string;
    lastPayoutDate: string | null;
    isActive: boolean;
    createdAt: string;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    membershipTier: string | null;
  } | null;
}

export default function AffiliateManagement() {
  const { toast } = useToast();

  const { data: affiliates, isLoading } = useQuery<Affiliate[]>({
    queryKey: ['/api/admin/affiliates'],
  });

  const enrollAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/affiliates/enroll-all');
    },
    onSuccess: (data: any) => {
      toast({
        title: "Enrollment Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll users",
        variant: "destructive",
      });
    },
  });

  const approveCommissionsMutation = useMutation({
    mutationFn: async (commissionIds: number[]) => {
      return apiRequest('POST', '/api/admin/commissions/approve', { commissionIds });
    },
    onSuccess: () => {
      toast({
        title: "Commissions Approved",
        description: "Selected commissions have been approved for payout",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve commissions",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const totalAffiliates = affiliates?.length || 0;
  const activeAffiliates = affiliates?.filter(a => a.affiliate.isActive)?.length || 0;
  const totalEarnings = affiliates?.reduce((sum, a) => sum + parseFloat(a.affiliate.totalEarnings), 0) || 0;
  const totalPending = affiliates?.reduce((sum, a) => sum + parseFloat(a.affiliate.pendingEarnings), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Affiliate Management</h1>
            <p className="text-gray-600 mt-2">Manage affiliate programme and commissions</p>
          </div>
          <Button onClick={() => enrollAllMutation.mutate()} disabled={enrollAllMutation.isPending}>
            {enrollAllMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll All Users
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAffiliates}</div>
              <p className="text-xs text-muted-foreground">
                {activeAffiliates} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalEarnings.toString())}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPending.toString())}</div>
              <p className="text-xs text-muted-foreground">Awaiting payout</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5%</div>
              <p className="text-xs text-muted-foreground">Standard rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Affiliates Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Affiliates</CardTitle>
            <CardDescription>
              Manage affiliate accounts and track performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Paid Out</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates?.map(({ affiliate, user }) => (
                    <TableRow key={affiliate.id}>
                      <TableCell>
                        {user ? (
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unknown User</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {affiliate.affiliateCode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={affiliate.isActive ? "default" : "secondary"}>
                          {affiliate.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(affiliate.totalEarnings)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(affiliate.pendingEarnings)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(affiliate.paidEarnings)}
                      </TableCell>
                      <TableCell>
                        {new Date(affiliate.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={parseFloat(affiliate.pendingEarnings) === 0}
                        >
                          Process Payout
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}