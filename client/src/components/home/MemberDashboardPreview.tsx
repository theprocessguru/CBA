import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  User, 
  Building, 
  Package, 
  Tag, 
  Users, 
  Settings,
  Eye,
  Box,
  PackageOpen,
  ChevronUp,
  Plus,
} from "lucide-react";

const MemberDashboardPreview = () => {
  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 font-accent mb-2">Member Dashboard Preview</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">A glimpse at the powerful tools available to our association members for managing their profiles and offerings.</p>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-neutral-200">
          <div className="border-b border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-error rounded-full mr-2"></div>
              <div className="w-3 h-3 bg-warning rounded-full mr-2"></div>
              <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
              <div className="mx-auto text-center text-neutral-500 text-sm">Member Dashboard</div>
            </div>
          </div>
          
          <div className="md:flex">
            <div className="md:w-1/4 bg-neutral-100 p-4 border-r border-neutral-200">
              <div className="flex items-center mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80" 
                  alt="Member profile" 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <div className="ml-3">
                  <p className="font-medium text-neutral-900">James Wilson</p>
                  <p className="text-neutral-500 text-sm">Wilson Legal Services</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <a href="#" className="bg-primary text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <LayoutDashboard className="mr-3 text-white h-4 w-4" />
                  Dashboard
                </a>
                <a href="#" className="text-neutral-700 hover:bg-neutral-200 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <User className="mr-3 text-neutral-500 h-4 w-4" />
                  My Profile
                </a>
                <a href="#" className="text-neutral-700 hover:bg-neutral-200 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <Building className="mr-3 text-neutral-500 h-4 w-4" />
                  Business Profile
                </a>
                <a href="#" className="text-neutral-700 hover:bg-neutral-200 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <Package className="mr-3 text-neutral-500 h-4 w-4" />
                  Products & Services
                </a>
                <a href="#" className="text-neutral-700 hover:bg-neutral-200 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <Tag className="mr-3 text-neutral-500 h-4 w-4" />
                  Special Offers
                </a>
                <a href="#" className="text-neutral-700 hover:bg-neutral-200 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <Users className="mr-3 text-neutral-500 h-4 w-4" />
                  Member Directory
                </a>
                <a href="#" className="text-neutral-700 hover:bg-neutral-200 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <Settings className="mr-3 text-neutral-500 h-4 w-4" />
                  Settings
                </a>
              </nav>
            </div>
            
            <div className="md:w-3/4 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Dashboard Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-500">Profile Views</p>
                        <p className="text-2xl font-bold text-neutral-900">247</p>
                      </div>
                      <div className="h-10 w-10 bg-primary-light rounded-full flex items-center justify-center text-white">
                        <Eye className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-success mt-2 flex items-center">
                      <ChevronUp className="mr-1 h-3 w-3" /> 12% increase this month
                    </p>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-500">Active Offers</p>
                        <p className="text-2xl font-bold text-neutral-900">3</p>
                      </div>
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-white">
                        <Tag className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      2 offers expiring soon
                    </p>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-500">Listed Products</p>
                        <p className="text-2xl font-bold text-neutral-900">12</p>
                      </div>
                      <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center text-white">
                        <PackageOpen className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-info mt-2 flex items-center">
                      <Plus className="mr-1 h-3 w-3" /> 2 added this week
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 mb-6">
                <h4 className="font-medium text-neutral-900 mb-2">Business Profile Completion</h4>
                <div className="w-full bg-neutral-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{width: '85%'}}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-neutral-500">
                  <span>85% complete</span>
                  <a href="#" className="text-primary hover:text-primary-dark">Complete now</a>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-neutral-900 mb-4">Recent Activity</h4>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4 py-1">
                    <p className="text-neutral-900">You created a new special offer</p>
                    <p className="text-neutral-500 text-sm">Legal consultation service - 20% off</p>
                    <p className="text-neutral-400 text-xs mt-1">Today, 10:24 AM</p>
                  </div>
                  
                  <div className="border-l-4 border-secondary pl-4 py-1">
                    <p className="text-neutral-900">You updated your business profile</p>
                    <p className="text-neutral-500 text-sm">Added new services and team members</p>
                    <p className="text-neutral-400 text-xs mt-1">Yesterday, 4:12 PM</p>
                  </div>
                  
                  <div className="border-l-4 border-neutral-400 pl-4 py-1">
                    <p className="text-neutral-900">Profile viewed by "Croydon Tech Solutions"</p>
                    <p className="text-neutral-400 text-xs mt-1">Jun 12, 2023, 2:45 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-neutral-600 mb-4">Ready to access these features and connect with other local businesses?</p>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            size="lg"
          >
            <User className="mr-2 h-5 w-5" />
            Sign Up Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MemberDashboardPreview;
