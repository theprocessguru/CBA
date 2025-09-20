import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertNotificationSchema, type InsertNotification, type Notification } from "@shared/schema";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Send, Clock, Users, Calendar as CalendarIcon, Settings,
  Bell, MessageSquare, AlertTriangle, Info, CheckCircle, X
} from "lucide-react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Single notification schema - extends the base schema to require userId
const singleNotificationSchema = insertNotificationSchema.extend({
  userId: z.string().min(1, "Please select a user")
});

// Bulk notification schema
const bulkNotificationSchema = z.object({
  notification: insertNotificationSchema,
  targetType: z.enum(["all", "admins", "business_members", "volunteers", "students", "specific_users"]),
  userIds: z.array(z.string()).optional(),
});

type SingleNotificationFormData = z.infer<typeof singleNotificationSchema>;
type BulkNotificationFormData = z.infer<typeof bulkNotificationSchema>;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipTier: string;
  isAdmin?: boolean;
  accountStatus?: string;
}

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: X,
  reminder: Bell,
  announcement: MessageSquare,
};

const typeColors = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  reminder: "bg-purple-100 text-purple-800",
  announcement: "bg-indigo-100 text-indigo-800",
};

export function AdminNotificationManager() {
  const [activeTab, setActiveTab] = useState("single");
  const [showScheduling, setShowScheduling] = useState(false);
  const { toast } = useToast();

  // Single notification form
  const singleForm = useForm<SingleNotificationFormData>({
    resolver: zodResolver(singleNotificationSchema),
    defaultValues: {
      type: "info",
      category: "admin_message",
      priority: "normal",
      userId: "",
    },
  });

  // Bulk notification form
  const bulkForm = useForm<BulkNotificationFormData>({
    resolver: zodResolver(bulkNotificationSchema),
    defaultValues: {
      notification: {
        type: "info",
        category: "admin_message",
        priority: "normal",
      },
      targetType: "all",
    },
  });

  // Get all users for targeting
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Get scheduled notifications
  const { data: scheduledNotifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/admin/scheduled-notifications'],
    enabled: activeTab === 'scheduled'
  });

  // Send single notification
  const sendSingleMutation = useMutation({
    mutationFn: (data: SingleNotificationFormData) => 
      apiRequest('POST', '/api/admin/notifications', data),
    onSuccess: () => {
      toast({ title: "Success", description: "Notification sent successfully" });
      singleForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to send notification",
        variant: "destructive"
      });
    },
  });

  // Send bulk notification
  const sendBulkMutation = useMutation({
    mutationFn: (data: { notification: InsertNotification; userIds: string[] }) => 
      apiRequest('POST', '/api/admin/notifications/bulk', data),
    onSuccess: (response: any) => {
      toast({ 
        title: "Success", 
        description: `Sent ${response.notifications?.length || 0} notifications successfully` 
      });
      bulkForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to send bulk notification",
        variant: "destructive"
      });
    },
  });

  // Schedule notification
  const scheduleMutation = useMutation({
    mutationFn: (data: SingleNotificationFormData) => 
      apiRequest('POST', '/api/admin/notifications/schedule', data),
    onSuccess: () => {
      toast({ title: "Success", description: "Notification scheduled successfully" });
      singleForm.reset();
      setShowScheduling(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/scheduled-notifications'] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to schedule notification",
        variant: "destructive"
      });
    },
  });

  const handleSingleSubmit = (data: SingleNotificationFormData) => {
    if (showScheduling && data.scheduledFor) {
      scheduleMutation.mutate(data);
    } else {
      sendSingleMutation.mutate(data);
    }
  };

  const handleBulkSubmit = (data: BulkNotificationFormData) => {
    let targetUserIds: string[] = [];

    switch (data.targetType) {
      case "all":
        targetUserIds = users.map(u => u.id);
        break;
      case "admins":
        // Would need admin flag in user data
        targetUserIds = users.filter(u => (u as any).isAdmin).map(u => u.id);
        break;
      case "business_members":
        targetUserIds = users.filter(u => 
          ["Growth Tier", "Strategic Tier", "Patron Tier", "Partner"].includes(u.membershipTier)
        ).map(u => u.id);
        break;
      case "volunteers":
        // Would need volunteer flag in user data
        targetUserIds = users.filter(u => (u as any).isVolunteer).map(u => u.id);
        break;
      case "students":
        targetUserIds = users.filter(u => u.membershipTier === "Starter Tier").map(u => u.id);
        break;
      case "specific_users":
        targetUserIds = data.userIds || [];
        break;
    }

    sendBulkMutation.mutate({
      notification: data.notification,
      userIds: targetUserIds,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Send notifications to users and manage automated reminders
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          Admin Tools
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Single Notification
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Notifications
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Single Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...singleForm}>
                <form onSubmit={singleForm.handleSubmit(handleSingleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={singleForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Notification title" {...field} data-testid="input-notification-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select User</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-user">
                                <SelectValue placeholder="Choose a user" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{user.firstName} {user.lastName}</span>
                                    <span className="text-xs text-gray-500">({user.email})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-notification-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(typeIcons).map(([type, Icon]) => (
                                <SelectItem key={type} value={type}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="capitalize">{type}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={singleForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your notification message..." 
                            className="min-h-[100px]"
                            {...field} 
                            data-testid="textarea-notification-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={singleForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-notification-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="event_reminder">Event Reminder</SelectItem>
                              <SelectItem value="meeting_reminder">Meeting Reminder</SelectItem>
                              <SelectItem value="admin_message">Admin Message</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-notification-priority">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={singleForm.control}
                      name="actionText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Button Text (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., View Event" {...field} data-testid="input-action-text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={singleForm.control}
                    name="actionUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/action" {...field} data-testid="input-action-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="scheduling"
                      checked={showScheduling}
                      onCheckedChange={setShowScheduling}
                      data-testid="switch-scheduling"
                    />
                    <label htmlFor="scheduling" className="text-sm font-medium">
                      Schedule for later
                    </label>
                  </div>

                  {showScheduling && (
                    <FormField
                      control={singleForm.control}
                      name="scheduledFor"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Schedule Date & Time</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-[280px] pl-3 text-left font-normal"
                                  data-testid="button-schedule-date"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => singleForm.reset()}
                      data-testid="button-reset-form"
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={sendSingleMutation.isPending || scheduleMutation.isPending}
                      data-testid="button-send-notification"
                    >
                      {showScheduling ? (
                        <>
                          <Clock className="mr-2 h-4 w-4" />
                          Schedule Notification
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Notification
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Send Bulk Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...bulkForm}>
                <form onSubmit={bulkForm.handleSubmit(handleBulkSubmit)} className="space-y-4">
                  {/* Notification content fields - similar to single form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={bulkForm.control}
                      name="notification.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Notification title" {...field} data-testid="input-bulk-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="targetType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-target-audience">
                                <SelectValue placeholder="Select audience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="admins">Admins Only</SelectItem>
                              <SelectItem value="business_members">Business Members</SelectItem>
                              <SelectItem value="volunteers">Volunteers</SelectItem>
                              <SelectItem value="students">Students</SelectItem>
                              <SelectItem value="specific_users">Specific Users</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={bulkForm.control}
                    name="notification.message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your bulk notification message..." 
                            className="min-h-[100px]"
                            {...field} 
                            data-testid="textarea-bulk-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={bulkForm.control}
                      name="notification.type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-bulk-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(typeIcons).map(([type, Icon]) => (
                                <SelectItem key={type} value={type}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="capitalize">{type}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="notification.category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-bulk-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="event_reminder">Event Reminder</SelectItem>
                              <SelectItem value="meeting_reminder">Meeting Reminder</SelectItem>
                              <SelectItem value="admin_message">Admin Message</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bulkForm.control}
                      name="notification.priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-bulk-priority">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => bulkForm.reset()}
                      data-testid="button-reset-bulk-form"
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={sendBulkMutation.isPending}
                      data-testid="button-send-bulk-notification"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Send to {bulkForm.watch("targetType")} ({
                        bulkForm.watch("targetType") === "all" ? users.length :
                        bulkForm.watch("targetType") === "business_members" ? users.filter(u => 
                          ["Growth Tier", "Strategic Tier", "Patron Tier", "Partner"].includes(u.membershipTier)
                        ).length :
                        "N/A"
                      } users)
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduled Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No scheduled notifications</p>
                  <p className="text-sm">Scheduled notifications will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledNotifications.map((notification) => {
                    const TypeIcon = typeIcons[notification.type as keyof typeof typeIcons] || Bell;
                    return (
                      <div key={notification.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${typeColors[notification.type as keyof typeof typeColors]}`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {notification.scheduledFor ? format(new Date(notification.scheduledFor), "PPp") : "Not scheduled"}
                                </span>
                                <Badge variant="outline" className="capitalize">
                                  {notification.priority}
                                </Badge>
                                <Badge variant="secondary" className="capitalize">
                                  {notification.category.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // TODO: Implement reschedule functionality
                                toast({ title: "Feature coming soon", description: "Reschedule functionality will be added" });
                              }}
                              data-testid={`button-reschedule-${notification.id}`}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Reschedule
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                // TODO: Implement cancel functionality
                                toast({ title: "Feature coming soon", description: "Cancel functionality will be added" });
                              }}
                              data-testid={`button-cancel-${notification.id}`}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}