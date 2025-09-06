import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserX, AlertTriangle } from "lucide-react";

export function ImpersonationBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const exitImpersonationMutation = useMutation({
    mutationFn: () => {
      return apiRequest("POST", `/api/admin/exit-impersonation`, {});
    },
    onSuccess: () => {
      toast({
        title: "Impersonation Ended",
        description: "You have returned to your admin account.",
      });
      // Force a full page reload to clear all cached user data
      setTimeout(() => {
        window.location.href = '/admin/user-management';
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to exit impersonation",
        variant: "destructive",
      });
    },
  });

  // Only show banner if we have session data indicating impersonation
  // This would be set by the backend when impersonating
  const isImpersonating = (user as any)?.isImpersonating;
  const originalAdmin = (user as any)?.originalAdmin;

  if (!isImpersonating || !originalAdmin) {
    return null;
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200 shadow-lg sticky top-0 z-50">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Admin Impersonation Active
              </p>
              <p className="text-xs text-yellow-700">
                You are viewing this account as: <span className="font-medium">{user?.firstName || user?.email}</span>
                {originalAdmin && (
                  <span className="ml-2">
                    | Original admin: <span className="font-medium">{originalAdmin.email}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => exitImpersonationMutation.mutate()}
            disabled={exitImpersonationMutation.isPending}
            className="bg-white hover:bg-yellow-50 text-yellow-700 border-yellow-300"
          >
            <UserX className="h-4 w-4 mr-2" />
            {exitImpersonationMutation.isPending ? "Exiting..." : "Exit Impersonation"}
          </Button>
        </div>
      </div>
    </Card>
  );
}