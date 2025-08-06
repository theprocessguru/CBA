import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Helmet } from 'react-helmet';
import { apiRequest } from '@/lib/queryClient';

export default function AdminLoginPage() {
  const { toast } = useToast();
  // Remove unused refetch

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin-login', {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Admin Login Successful",
        description: `Logged in as ${data.user.firstName} ${data.user.lastName}`,
      });
      
      // Clear auth cache and redirect
      queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
      
      // Redirect to volunteer creation page
      setTimeout(() => {
        window.location.href = '/create-volunteer';
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Could not log in as admin",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <Helmet>
        <title>Admin Login - CBA</title>
        <meta name="description" content="Admin login for testing scanner functionality" />
      </Helmet>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-600" />
            Admin Test Login
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Quick admin login for testing volunteer scanner functionality
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Test Admin Account</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Name:</strong> Admin User</p>
              <p><strong>Email:</strong> admin@croydonba.org.uk</p>
              <p><strong>Role:</strong> Administrator</p>
              <p><strong>QR Handle:</strong> ADMIN-CBA-2025</p>
            </div>
          </div>

          <Button 
            onClick={() => adminLoginMutation.mutate()}
            disabled={adminLoginMutation.isPending}
            className="w-full"
            size="lg"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {adminLoginMutation.isPending ? 'Logging in...' : 'Login as Admin'}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              This will log you in as an admin to test the volunteer creation and scanner functionality
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}