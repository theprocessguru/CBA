import { ArrowLeft, Clock, Users, Target, DollarSign, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

const AffiliateProgrammeComingSoon = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Affiliate Programme
            </CardTitle>
            <CardDescription className="text-xl text-gray-600">
              Coming Soon
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                We're developing an exciting affiliate programme that will allow you to earn commissions by referring new members to the Croydon Business Association.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Refer Members</h3>
                <p className="text-sm text-gray-600">Share CBA with your network and help grow our community</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Earn Commission</h3>
                <p className="text-sm text-gray-600">Get rewarded for successful referrals with competitive rates</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600">Monitor your referrals and earnings with detailed analytics</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Stay Updated
              </h4>
              <p className="text-gray-600 mb-4">
                Want to be notified when the affiliate programme launches? Contact us and we'll keep you informed about the latest developments.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setLocation('/contact')}
                  className="flex-1"
                >
                  Contact Us
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/about')}
                  className="flex-1"
                >
                  Learn About CBA
                </Button>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateProgrammeComingSoon;