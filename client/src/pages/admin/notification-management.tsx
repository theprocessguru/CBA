import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { AdminNotificationManager } from "@/components/admin/AdminNotificationManager";
import { Helmet } from "react-helmet";

export default function AdminNotificationManagement() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !(user as any).isAdmin)) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render content if not admin (redirect will happen)
  if (!user || !(user as any).isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Notification Management - Admin - Croydon Business Association</title>
        <meta 
          name="description" 
          content="Send notifications to users and manage automated reminders for events and meetings." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <AdminNotificationManager />
        </div>
      </div>
    </>
  );
}