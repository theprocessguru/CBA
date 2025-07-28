import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, 
  Building, 
  Package, 
  Tag, 
  Users, 
  LogOut,
  Menu,
  X,
  Flag,
  BarChart3,
  ArrowLeft,
  Home,
  Crown
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-primary text-white py-3 px-4 flex justify-between items-center md:hidden shadow-md">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.history.back()}
            className="text-white hover:bg-primary/20 p-1"
            title="Go back"
          >
            <ArrowLeft size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.location.href = '/'}
            className="text-white hover:bg-primary/20 p-1"
            title="Home"
          >
            <Home size={18} />
          </Button>
          <Link href="/dashboard">
            <a className="font-bold text-lg">My Business</a>
          </Link>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileSidebar}
          className="text-white hover:bg-primary/20"
        >
          {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar - Desktop always visible, mobile conditionally */}
        <div 
          className={`bg-white shadow-md border-r border-neutral-200 w-64 flex-shrink-0 
                     ${isMobileSidebarOpen ? 'block' : 'hidden'} md:block 
                     fixed md:static top-0 left-0 h-full md:h-auto z-40 overflow-hidden`}
        >
          <div className="p-4 bg-primary text-white hidden md:block">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold">My Business Dashboard</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.history.back()}
                className="text-white hover:bg-primary-dark"
              >
                <ArrowLeft size={18} />
              </Button>
            </div>
          </div>
          
          <div className="p-4 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center mb-6">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center mb-6 min-w-0">
                <img 
                  src={user?.profileImageUrl || "https://secure.gravatar.com/avatar/?s=50&d=mp"} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="ml-3 min-w-0 flex-1">
                  <p className="font-medium text-neutral-900 truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-neutral-500 text-sm truncate" title={user?.email}>{user?.email}</p>
                </div>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <nav className="space-y-1">
              <Link href="/dashboard">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === '/dashboard' 
                    ? 'bg-primary text-white' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}>
                  <LayoutDashboard className={`mr-3 h-4 w-4 ${
                    location === '/dashboard' ? 'text-white' : 'text-neutral-500'
                  }`} />
                  Dashboard
                </a>
              </Link>
              
              <Link href="/dashboard/business-profile">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === '/dashboard/business-profile' 
                    ? 'bg-primary text-white' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}>
                  <Building className={`mr-3 h-4 w-4 ${
                    location === '/dashboard/business-profile' ? 'text-white' : 'text-neutral-500'
                  }`} />
                  Business Profile
                </a>
              </Link>
              
              <Link href="/dashboard/products-services">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === '/dashboard/products-services' 
                    ? 'bg-primary text-white' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}>
                  <Package className={`mr-3 h-4 w-4 ${
                    location === '/dashboard/products-services' ? 'text-white' : 'text-neutral-500'
                  }`} />
                  Products & Services
                </a>
              </Link>
              
              <Link href="/dashboard/special-offers">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === '/dashboard/special-offers' 
                    ? 'bg-primary text-white' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}>
                  <Tag className={`mr-3 h-4 w-4 ${
                    location === '/dashboard/special-offers' ? 'text-white' : 'text-neutral-500'
                  }`} />
                  Special Offers
                </a>
              </Link>
              
              <Link href="/dashboard/member-directory">
                <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === '/dashboard/member-directory' 
                    ? 'bg-primary text-white' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}>
                  <Users className={`mr-3 h-4 w-4 ${
                    location === '/dashboard/member-directory' ? 'text-white' : 'text-neutral-500'
                  }`} />
                  Member Directory
                </a>
              </Link>
              
              {user?.isAdmin && (
                <>
                  <Link href="/dashboard/analytics">
                    <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/dashboard/analytics' 
                        ? 'bg-primary text-white' 
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}>
                      <BarChart3 className={`mr-3 h-4 w-4 ${
                        location === '/dashboard/analytics' ? 'text-white' : 'text-neutral-500'
                      }`} />
                      Analytics
                    </a>
                  </Link>
                  
                  <Link href="/dashboard/membership-management">
                    <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/dashboard/membership-management' 
                        ? 'bg-primary text-white' 
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}>
                      <Crown className={`mr-3 h-4 w-4 ${
                        location === '/dashboard/membership-management' ? 'text-white' : 'text-neutral-500'
                      }`} />
                      Membership Tiers
                    </a>
                  </Link>

                  <Link href="/dashboard/user-management">
                    <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/dashboard/user-management' 
                        ? 'bg-primary text-white' 
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}>
                      <Users className={`mr-3 h-4 w-4 ${
                        location === '/dashboard/user-management' ? 'text-white' : 'text-neutral-500'
                      }`} />
                      User Management
                    </a>
                  </Link>
                  
                  <Link href="/dashboard/content-reports">
                    <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      location === '/dashboard/content-reports' 
                        ? 'bg-primary text-white' 
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}>
                      <Flag className={`mr-3 h-4 w-4 ${
                        location === '/dashboard/content-reports' ? 'text-white' : 'text-neutral-500'
                      }`} />
                      Content Reports
                    </a>
                  </Link>
                </>
              )}
            </nav>
            
            <Separator className="my-4" />
            
            <div className="pt-2">
              <button 
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' })
                    .then(() => window.location.href = '/')
                    .catch(() => window.location.href = '/');
                }}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100 w-full text-left"
              >
                <LogOut className="mr-3 h-4 w-4 text-neutral-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
