// Password reset help page
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { KeyRound, Mail, UserPlus, Phone } from "lucide-react";

const TestPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <KeyRound className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <CardTitle className="text-2xl">Password Help</CardTitle>
          <p className="text-gray-600">Having trouble logging in? Here are your options:</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <Link href="/forgot-password">
              <Button className="w-full justify-start gap-3 h-auto py-4 px-6">
                <Mail className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Reset Password via Email</div>
                  <div className="text-sm text-gray-500">Get a reset link sent to your email</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/register">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4 px-6">
                <UserPlus className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Create New Account</div>
                  <div className="text-sm text-gray-500">Register as a new member</div>
                </div>
              </Button>
            </Link>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="font-medium mb-3">Need Personal Help?</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>Call us: +44 7832 417784</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Email: info@croydonba.org.uk</span>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <Link href="/login">
              <Button variant="ghost">Back to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;