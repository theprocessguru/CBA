import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Users, 
  Phone,
  Star
} from "lucide-react";

const Analytics = () => {
  const [timeframe, setTimeframe] = useState("week");
  const [contentType, setContentType] = useState("all");

  const { data: interactionStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/analytics/interactions', contentType === "all" ? undefined : contentType, timeframe],
    queryFn: () => {
      const params = new URLSearchParams();
      if (contentType !== "all") params.append('contentType', contentType);
      params.append('timeframe', timeframe);
      return fetch(`/api/admin/analytics/interactions?${params}`).then(res => res.json());
    },
  });

  const { data: offerStats, isLoading: isLoadingOffers } = useQuery({
    queryKey: ['/api/admin/analytics/offers'],
  });

  const { data: topBusinesses, isLoading: isLoadingTopBusinesses } = useQuery({
    queryKey: ['/api/admin/analytics/top-content/business'],
    queryFn: () => fetch('/api/admin/analytics/top-content/business?limit=5').then(res => res.json()),
  });

  const { data: topOffers, isLoading: isLoadingTopOffers } = useQuery({
    queryKey: ['/api/admin/analytics/top-content/offer'],
    queryFn: () => fetch('/api/admin/analytics/top-content/offer?limit=5').then(res => res.json()),
  });

  // Calculate summary stats
  const summaryStats = interactionStats?.reduce((acc: any, stat: any) => {
    acc.totalInteractions = (acc.totalInteractions || 0) + stat.count;
    
    if (stat.interactionType === 'view') {
      acc.totalViews = (acc.totalViews || 0) + stat.count;
    } else if (stat.interactionType === 'click') {
      acc.totalClicks = (acc.totalClicks || 0) + stat.count;
    } else if (stat.interactionType === 'contact') {
      acc.totalContacts = (acc.totalContacts || 0) + stat.count;
    }
    
    return acc;
  }, {}) || {};

  // Calculate offer engagement summary
  const offerSummary = offerStats?.reduce((acc: any, offer: any) => {
    acc.totalOfferViews = (acc.totalOfferViews || 0) + offer.views;
    acc.totalOfferClicks = (acc.totalOfferClicks || 0) + offer.clicks;
    acc.totalOfferContacts = (acc.totalOfferContacts || 0) + offer.contacts;
    acc.uniqueUsers = (acc.uniqueUsers || 0) + offer.uniqueUsers;
    return acc;
  }, {}) || {};

  if (isLoadingStats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard - Admin - Croydon Business Association</title>
        <meta name="description" content="View member engagement analytics, offer performance, and interaction statistics." />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Analytics Dashboard</h1>
            <p className="text-neutral-600">Track member engagement and platform usage.</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="business">Businesses</SelectItem>
                <SelectItem value="offer">Offers</SelectItem>
                <SelectItem value="product">Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalViews || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalClicks || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalContacts || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalInteractions || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="offers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="offers">Offer Performance</TabsTrigger>
            <TabsTrigger value="popular">Popular Content</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Offer Engagement Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{offerSummary.totalOfferViews || 0}</div>
                    <div className="text-sm text-neutral-600">Total Offer Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{offerSummary.totalOfferClicks || 0}</div>
                    <div className="text-sm text-neutral-600">Total Offer Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{offerSummary.totalOfferContacts || 0}</div>
                    <div className="text-sm text-neutral-600">Total Contacts from Offers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {offerStats && offerStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Individual Offer Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {offerStats.slice(0, 10).map((offer: any, index: number) => (
                      <div key={offer.offerId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline"># {index + 1}</Badge>
                          <div>
                            <div className="font-medium">Offer ID: {offer.offerId}</div>
                            <div className="text-sm text-neutral-600">
                              {offer.uniqueUsers} unique users engaged
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-blue-600">{offer.views}</div>
                            <div className="text-neutral-600">Views</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600">{offer.clicks}</div>
                            <div className="text-neutral-600">Clicks</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-purple-600">{offer.contacts}</div>
                            <div className="text-neutral-600">Contacts</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Top Viewed Businesses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topBusinesses && topBusinesses.length > 0 ? (
                    <div className="space-y-3">
                      {topBusinesses.map((business: any, index: number) => (
                        <div key={business.contentId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">Business ID: {business.contentId}</span>
                          </div>
                          <div className="text-sm text-neutral-600">
                            {business.views} views ({business.uniqueViews} unique)
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral-500">
                      No business views recorded yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Top Viewed Offers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topOffers && topOffers.length > 0 ? (
                    <div className="space-y-3">
                      {topOffers.map((offer: any, index: number) => (
                        <div key={offer.contentId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">Offer ID: {offer.contentId}</span>
                          </div>
                          <div className="text-sm text-neutral-600">
                            {offer.views} views ({offer.uniqueViews} unique)
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral-500">
                      No offer views recorded yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Interaction Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {interactionStats && interactionStats.length > 0 ? (
                  <div className="space-y-2">
                    {interactionStats.map((stat: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">{stat.contentType}</Badge>
                          <span className="text-sm">ID: {stat.contentId}</span>
                          <Badge variant="outline">{stat.interactionType}</Badge>
                        </div>
                        <div className="font-medium">{stat.count} interactions</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    No interactions recorded for the selected timeframe and content type
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Analytics;