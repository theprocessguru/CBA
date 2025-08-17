import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Store auth token if provided (for Replit environment)
      if (data?.authToken) {
        localStorage.setItem('authToken', data.authToken);
        console.log("Auth token stored:", data.authToken);
      }
      
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      
      // Invalidate and refetch auth queries to ensure state updates
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Small delay to let the token be stored, then redirect
      setTimeout(() => {
        if (data?.user?.isAdmin) {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      loginMutation.mutate({ email, password });
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - Croydon Business Association</title>
        <meta name="description" content="Sign in to your Croydon Business Association account to access member benefits and business networking." />
      </Helmet>
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Croydon Business Association account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-neutral-600">
              <Link href="/forgot-password" className="text-primary hover:text-primary-dark font-medium">
                Forgot your password?
              </Link>
            </p>
            <p className="text-sm text-neutral-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary-dark font-medium">
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}