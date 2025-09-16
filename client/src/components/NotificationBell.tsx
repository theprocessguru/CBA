import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "./NotificationCenter";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const hasUnread = (unreadCount?.count || 0) > 0;
  const count = unreadCount?.count || 0;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`relative ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${hasUnread ? ` (${count} unread)` : ''}`}
        aria-expanded={isOpen}
        data-testid="button-notification-bell"
      >
        <Bell className={`h-5 w-5 ${hasUnread ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`} />
        {hasUnread && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            data-testid="notification-badge-count"
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
      </Button>

      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}