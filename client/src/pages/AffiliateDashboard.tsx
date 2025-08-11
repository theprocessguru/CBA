import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  Users, 
  MousePointer, 
  TrendingUp, 
  Copy, 
  CheckCircle,
  ExternalLink,
  Download,
  Share2,
  CreditCard
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AffiliateStats {
  affiliate: {
    id: number;
    affiliateCode: string;
    commissionRate: string;
    totalEarnings: string;
    pendingEarnings: string;
    paidEarnings: string;
    lastPayoutDate: string | null;
  };
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    totalClicks: number;
    convertedClicks: number;
    conversionRate: string;
  };
  recentCommissions: Array<{
    id: number;
    amount: string;
    commissionAmount: string;
    paymentDate: string;
    status: string;
  }>;
  referrals: Array<{
    referral: {
      id: number;
      referralDate: string;
      membershipStatus: string;
      totalCommissionEarned: string;
      lifetimeValue: string;
    };
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      membershipTier: string | null;
    } | null;
  }>;
}

export default function AffiliateDashboard() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);

  const { data: stats, isLoading, error } = useQuery<AffiliateStats>({
    queryKey: ['/api/affiliate/dashboard'],
  });

  const payoutMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiRequest('POST', '/api/affiliate/payout', { amount });
    },
    onSuccess: () => {
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted successfully.",
      });
      setShowPayoutDialog(false);
      setPayoutAmount("");
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: "Payout Failed",
        description: error.message || "Failed to process payout request",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load affiliate dashboard</p>
        </div>
      </DashboardLayout>
    );
  }

  const affiliateLink = `${window.location.origin}/api/affiliate/track/${stats.affiliate.affiliateCode}?redirect=/register`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link Copied!",
      description: "Your affiliate link has been copied to clipboard.",
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      active: "default",
      approved: "default",
      paid: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Programme</h1>
          <p className="text-gray-600 mt-2">
            Earn 5% commission for every business you refer that becomes a paying member
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.affiliate.totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.affiliate.pendingEarnings)}</div>
              <p className="text-xs text-muted-foreground">Available for payout</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.activeReferrals}</div>
              <p className="text-xs text-muted-foreground">Out of {stats.stats.totalReferrals} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.stats.convertedClicks} of {stats.stats.totalClicks} clicks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Link Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link to earn commission on referred members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                value={affiliateLink} 
                readOnly 
                className="flex-1"
              />
              <Button 
                onClick={copyToClipboard}
                variant={copied ? "secondary" : "default"}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <p className="text-sm text-gray-600">Your affiliate code: </p>
              <Badge variant="outline" className="font-mono">
                {stats.affiliate.affiliateCode}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Details */}
        <Tabs defaultValue="referrals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>
                  Members who signed up using your referral link
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.referrals.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No referrals yet. Start sharing your link to earn commissions!
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Lifetime Value</TableHead>
                        <TableHead>Commission Earned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.referrals.map(({ referral, user }) => (
                        <TableRow key={referral.id}>
                          <TableCell>
                            {user ? (
                              <div>
                                <p className="font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user?.membershipTier || "None"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(referral.membershipStatus)}
                          </TableCell>
                          <TableCell>
                            {new Date(referral.referralDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{formatCurrency(referral.lifetimeValue)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(referral.totalCommissionEarned)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Commissions</CardTitle>
                <CardDescription>
                  Your commission history from referral payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentCommissions.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No commissions earned yet. Commissions are earned when your referrals make payments.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment Amount</TableHead>
                        <TableHead>Commission (5%)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentCommissions.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell>
                            {new Date(commission.paymentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{formatCurrency(commission.amount)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(commission.commissionAmount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(commission.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout Management</CardTitle>
                <CardDescription>
                  Request payouts for your pending earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Available Balance</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.affiliate.pendingEarnings)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Total Paid Out</span>
                      <span>{formatCurrency(stats.affiliate.paidEarnings)}</span>
                    </div>
                    {stats.affiliate.lastPayoutDate && (
                      <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                        <span>Last Payout</span>
                        <span>
                          {new Date(stats.affiliate.lastPayoutDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full"
                        disabled={parseFloat(stats.affiliate.pendingEarnings) < 10}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Request Payout
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Payout</DialogTitle>
                        <DialogDescription>
                          Enter the amount you'd like to withdraw. Minimum payout is £10.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (GBP)</Label>
                          <Input
                            id="amount"
                            type="number"
                            min="10"
                            max={stats.affiliate.pendingEarnings}
                            step="0.01"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                            placeholder="Enter amount"
                          />
                          <p className="text-sm text-gray-500">
                            Available: {formatCurrency(stats.affiliate.pendingEarnings)}
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowPayoutDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => payoutMutation.mutate(parseFloat(payoutAmount))}
                          disabled={
                            !payoutAmount || 
                            parseFloat(payoutAmount) < 10 || 
                            parseFloat(payoutAmount) > parseFloat(stats.affiliate.pendingEarnings) ||
                            payoutMutation.isPending
                          }
                        >
                          {payoutMutation.isPending ? "Processing..." : "Request Payout"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {parseFloat(stats.affiliate.pendingEarnings) < 10 && (
                    <p className="text-sm text-gray-500 text-center">
                      Minimum payout amount is £10. Keep referring to reach the threshold!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}