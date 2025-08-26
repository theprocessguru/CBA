import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    // Call the API verification endpoint
    fetch(`/api/verify-email?token=${token}`)
      .then(response => {
        if (response.ok) {
          // API will redirect, but we handle it here for better UX
          setStatus('success');
          setMessage('Email verified successfully! You can now access all features.');
          
          toast({
            title: "Email Verified",
            description: "Your email has been successfully verified!",
          });

          // Redirect to login page after 3 seconds
          setTimeout(() => {
            setLocation('/login');
          }, 3000);
        } else {
          return response.json();
        }
      })
      .then(data => {
        if (data && data.message) {
          setStatus('error');
          setMessage(data.message);
          
          toast({
            title: "Verification Failed",
            description: data.message,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
        
        toast({
          title: "Verification Error",
          description: "An error occurred. Please try again or contact support.",
          variant: "destructive",
        });
      });
  }, [toast, setLocation]);

  const handleReturnToLogin = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
            {status === 'loading' && <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
            {status === 'error' && <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address.'}
            {status === 'success' && 'Redirecting you to login...'}
            {status === 'error' && 'There was a problem verifying your email.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-green-600">
                You will be redirected to login in a few seconds...
              </p>
              <Button onClick={handleReturnToLogin} className="w-full">
                Go to Login Now
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <Button onClick={handleReturnToLogin} className="w-full">
                Return to Login
              </Button>
              <p className="text-sm text-gray-500">
                Need help? Contact support at admin@croydonba.org.uk
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}