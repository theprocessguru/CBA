import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Check, X, Archive, Trash2, MoreVertical } from "lucide-react";
import { type Notification } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeColors = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  reminder: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  announcement: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
};

const priorityColors = {
  low: "border-l-gray-400",
  normal: "border-l-blue-400",
  high: "border-l-orange-400",
  urgent: "border-l-red-500",
};

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [filter, setFilter] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', { category: category === 'all' ? undefined : category }],
    enabled: isOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('PATCH', '/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({ title: "Success", description: "All notifications marked as read" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => apiRequest('PATCH', `/api/notifications/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({ title: "Success", description: "Notification archived" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to archive notification",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({ title: "Success", description: "Notification deleted" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete notification",
        variant: "destructive"
      });
    },
  });

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === "unread" && notification.isRead) return false;
    if (filter === "read" && !notification.isRead) return false;
    if (filter === "archived" && !notification.isArchived) return false;
    if (filter === "active" && notification.isArchived) return false;
    return true;
  });

  const handleMarkAsRead = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleArchive = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    archiveMutation.mutate(id);
  };

  const handleDelete = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteMutation.mutate(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed right-4 top-16 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                data-testid="button-mark-all-read"
              >
                <Check className="h-4 w-4 mr-1" />
                Mark All Read
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-notifications">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32" data-testid="select-notification-filter">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40" data-testid="select-notification-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="event_reminder">Event Reminders</SelectItem>
                <SelectItem value="meeting_reminder">Meeting Reminders</SelectItem>
                <SelectItem value="admin_message">Admin Messages</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <Separator />

        <ScrollArea className="flex-1 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {filteredNotifications.map((notification: Notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${priorityColors[notification.priority as keyof typeof priorityColors]} ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-${notification.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${typeColors[notification.type as keyof typeof typeColors]}`}>
                            {notification.type}
                          </Badge>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" data-testid={`unread-indicator-${notification.id}`}></div>
                          )}
                          {notification.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                          {notification.priority === 'high' && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-sm mb-1 line-clamp-2" data-testid={`notification-title-${notification.id}`}>
                          {notification.title}
                        </h4>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-2" data-testid={`notification-message-${notification.id}`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span data-testid={`notification-time-${notification.id}`}>
                            {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Unknown time'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {notification.category.replace('_', ' ')}
                          </Badge>
                        </div>

                        {notification.actionText && notification.actionUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = notification.actionUrl!;
                            }}
                            data-testid={`notification-action-${notification.id}`}
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`notification-menu-${notification.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.isRead && (
                            <DropdownMenuItem onClick={(e) => handleMarkAsRead(notification.id, e)}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          {!notification.isArchived && (
                            <DropdownMenuItem onClick={(e) => handleArchive(notification.id, e)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}