import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProfileCompletionWidget } from "@/components/ui/ProfileCompletionWidget";
import { 
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Home,
  User,
  Settings
} from "lucide-react";
import { getSidebarItemsForUser, getDashboardTitle } from "@/lib/roleConfig";

interface DynamicDashboardLayoutProps {
  children: ReactNode;
}

const DynamicDashboardLayout = ({ children }: DynamicDashboardLayoutProps) => {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch complete user profile with personTypes
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!user && !isLoading,
  });

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Use profile data if available, fallback to user data
  const userData = profile || user;
  const sidebarItems = getSidebarItemsForUser(userData);
  const dashboardTitle = getDashboardTitle(userData);

  // Enhanced profile completion now handled by ProfileCompletionWidget

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
            data-testid="button-back"
          >
            <ArrowLeft size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.location.href = '/'}
            className="text-white hover:bg-primary/20 p-1"
            title="Home"
            data-testid="button-home"
          >
            <Home size={18} />
          </Button>
          <Link href="/dashboard">
            <a className="font-bold text-lg">
              {dashboardTitle}
            </a>
          </Link>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileSidebar}
          className="text-white hover:bg-primary/20"
          data-testid="button-menu-toggle"
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
              <h1 className="text-lg font-bold">
                {dashboardTitle}
              </h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.history.back()}
                className="text-white hover:bg-primary-dark"
                data-testid="button-back-desktop"
              >
                <ArrowLeft size={18} />
              </Button>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto h-full">
            {/* User Profile Section */}
            {isLoading || profileLoading ? (
              <div className="flex items-center mb-6">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-center mb-3 min-w-0">
                  <img 
                    src={userData?.profileImageUrl || "https://secure.gravatar.com/avatar/?s=50&d=mp"} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="font-medium text-neutral-900 truncate" data-testid="text-username">
                      {userData?.firstName} {userData?.lastName}
                    </p>
                    <p className="text-neutral-500 text-sm truncate" title={userData?.email} data-testid="text-email">
                      {userData?.email}
                    </p>
                  </div>
                </div>
                
                {/* Member Segment Badge */}
                {userData?.memberSegment && (
                  <div className="mb-3">
                    <Badge variant="secondary" className="text-xs" data-testid="badge-member-segment">
                      {userData.memberSegment === 'business_owner' ? 'Business Owner' : 'Resident'}
                    </Badge>
                  </div>
                )}
                
                {/* Person Types */}
                {userData?.personTypes && userData.personTypes.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {userData.personTypes.map((type: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs" data-testid={`badge-role-${type.name}`}>
                          {type.displayName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Enhanced Profile Completion */}
                <ProfileCompletionWidget 
                  userData={userData}
                  variant="sidebar"
                  showNextSteps={false}
                  showSections={false}
                />
              </div>
            )}
            
            <Separator className="my-4" />
            
            {/* Dynamic Navigation */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.id} href={item.href}>
                    <a 
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary text-white' 
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      title={item.description}
                      data-testid={`link-${item.id}`}
                    >
                      <Icon className={`mr-3 h-4 w-4 ${
                        isActive ? 'text-white' : 'text-neutral-500'
                      }`} />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </nav>
            
            {/* Profile Settings Link */}
            <Separator className="my-4" />
            
            <Link href="/profile">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                location === '/profile' 
                  ? 'bg-primary text-white' 
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`} data-testid="link-profile-settings">
                <User className={`mr-3 h-4 w-4 ${
                  location === '/profile' ? 'text-white' : 'text-neutral-500'
                }`} />
                Profile Settings
              </a>
            </Link>
            
            <Separator className="my-4" />
            
            {/* Sign Out */}
            <div className="pt-2">
              <button 
                onClick={() => {
                  // Clear auth token
                  localStorage.removeItem('authToken');
                  
                  // Make logout request with auth header
                  const authToken = localStorage.getItem('authToken');
                  const headers: HeadersInit = {
                    'Content-Type': 'application/json'
                  };
                  if (authToken) {
                    headers['Authorization'] = `Bearer ${authToken}`;
                  }
                  
                  fetch('/api/auth/logout', { 
                    method: 'POST',
                    credentials: 'include',
                    headers
                  })
                    .then(() => {
                      localStorage.removeItem('authToken');
                      window.location.href = '/';
                    })
                    .catch(() => {
                      localStorage.removeItem('authToken');
                      window.location.href = '/';
                    });
                }}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100 w-full text-left"
                data-testid="button-sign-out"
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

export default DynamicDashboardLayout;