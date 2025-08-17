import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AuthTest() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('authToken');
    
    // Make logout request
    fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(() => window.location.href = '/')
      .catch(() => window.location.href = '/');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-lg">Checking authentication...</span>
            </div>
          )}

          {/* Authentication Status */}
          {!isLoading && (
            <>
              <div className="flex items-center justify-center space-x-3 py-4">
                {isAuthenticated ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <span className="text-xl font-semibold text-green-700">
                      Authentication Working!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    <span className="text-xl font-semibold text-red-700">
                      Not Authenticated
                    </span>
                  </>
                )}
              </div>

              {/* User Details */}
              {isAuthenticated && user && (
                <div className="bg-neutral-100 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-lg mb-3">User Details:</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-neutral-600">{user.email}</p>
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-neutral-600">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span>
                      <p className="text-neutral-600">{user.id}</p>
                    </div>
                    <div>
                      <span className="font-medium">Admin Status:</span>
                      <p className={user.isAdmin ? "text-green-600 font-semibold" : "text-neutral-600"}>
                        {user.isAdmin ? "✓ Admin User" : "Regular User"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Auth Token Status */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Auth Token Status:</h3>
                <p className="text-sm text-neutral-600">
                  {localStorage.getItem('authToken') 
                    ? `✓ Token stored (${localStorage.getItem('authToken')?.substring(0, 20)}...)`
                    : "✗ No token in localStorage"
                  }
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4 pt-4">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard">
                      <Button>Go to Dashboard</Button>
                    </Link>
                    <Button onClick={handleLogout} variant="outline">
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button>Go to Login</Button>
                  </Link>
                )}
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-neutral-500 pt-4 border-t">
                <p>This page verifies that authentication is working correctly.</p>
                {isAuthenticated && (
                  <p className="mt-2 text-green-600 font-medium">
                    ✓ Your session is active and authentication is functioning properly!
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}