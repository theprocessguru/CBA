import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader } from 'lucide-react';
import { Helmet } from 'react-helmet';

export default function QuickLoginPage() {
  useEffect(() => {
    // Automatically perform login when page loads
    const performLogin = async () => {
      try {
        const response = await fetch('/api/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Important for cookies
        });

        if (response.ok) {
          // Redirect immediately after successful login
          window.location.href = '/create-volunteer';
        } else {
          console.error('Login failed');
          // Show error message or redirect to login page
          setTimeout(() => {
            window.location.href = '/admin-login';
          }, 2000);
        }
      } catch (error) {
        console.error('Login error:', error);
        setTimeout(() => {
          window.location.href = '/admin-login';
        }, 2000);
      }
    };

    performLogin();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <Helmet>
        <title>Logging In - CBA</title>
        <meta name="description" content="Logging in as admin..." />
      </Helmet>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-600" />
            Logging In...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">
            Setting up admin access for volunteer testing...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}