import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Directory from "@/pages/directory";
import Business from "@/pages/business";
import Marketplace from "@/pages/marketplace";
import TrialMembership from "@/pages/trial-membership";
import MembershipPage from "@/pages/membership";
import Dashboard from "@/pages/dashboard";
import BusinessProfile from "@/pages/dashboard/business-profile";
import ProductsServices from "@/pages/dashboard/products-services";
import SpecialOffers from "@/pages/dashboard/special-offers";
import MemberDirectory from "@/pages/dashboard/member-directory";
import ContentReports from "@/pages/admin/ContentReports";
import UserManagement from "@/pages/admin/UserManagement";
import Analytics from "@/pages/admin/Analytics";
import EmailSettings from "@/pages/admin/EmailSettings";
import UploadMembers from "@/pages/admin/upload-members";
import MembershipManagement from "@/pages/admin/MembershipManagement";
import MembershipBenefits from "@/pages/membership-benefits";
import AIServices from "@/pages/ai-services";
import AITools from "@/pages/ai-tools";
import AIAutomation from "@/pages/ai-automation";
import AIStrategy from "@/pages/ai-strategy";
import AIEnterprise from "@/pages/ai-enterprise";
import AIAnalytics from "@/pages/ai-analytics";
import AISummit from "@/pages/ai-summit";
import GHLAdmin from "@/pages/ghl-admin";
import DataImport from "@/pages/data-import";
import AdminDataImport from "@/pages/admin/import";
import OffersPage from "@/pages/offers";
import ContactPage from "@/pages/contact";
import About from "@/pages/About";
import MyTAccounting from "@/pages/myt-accounting";
import BadgeScanner from "@/pages/badge-scanner";
import WorkshopManagement from "@/pages/workshop-management";
import WorkshopRegistration from "@/pages/workshop-registration";
import WorkshopScanner from "@/pages/workshop-scanner";
import MyProfile from "@/pages/my-profile";
import OccupancyDashboardPage from "@/pages/occupancy-dashboard";
import EventManagement from "@/pages/admin/EventManagement";
import AISummitSchedule from "@/pages/admin/AISummitSchedule";
import EventsPage from "@/pages/events";
import MyBenefitsPage from "@/pages/my-benefits";
import MyRegistrations from "@/pages/my-registrations";
import MyQRCodeSimple from "@/pages/my-qr-code-simple";
import MyPersonalBadge from "@/pages/my-personal-badge";
import EnhancedPersonalBadge from "@/pages/enhanced-personal-badge";
import EventScanner from "@/pages/event-scanner";
import OrganizerScanner from "@/pages/organizer-scanner";
import TestQRCodes from "@/pages/test-qr-codes";
import CreateVolunteer from "@/pages/create-volunteer";
import AdminLogin from "@/pages/admin-login";
import QuickLogin from "@/pages/quick-login";
import ScannerManagement from "@/pages/admin/scanner-management";
import MultiRoleDemo from "@/pages/multi-role-demo";
import MobileBadgePage from "@/pages/mobile-badge";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/ui/bottom-navigation";
import GHLChatbot from "@/components/GHLChatbot";
import PWAInstaller from "@/components/PWAInstaller";
import { useAuth } from "@/hooks/useAuth";


function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNavigation />
      <PWAInstaller />
      <div className="fixed right-4 bottom-20 md:bottom-4 z-40">
        <GHLChatbot 
          position="bottom-right"
          primaryColor="#2563eb"
          welcomeMessage="👋 Hi! I'm the CBA AI Assistant. How can I help you today?"
          businessName="Croydon Business Association"
        />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    );
  }

  if (!user || !(user as any).isAdmin) {
    return <NotFound />;
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Authentication Routes */}
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/register">
        <Register />
      </Route>
      <Route path="/forgot-password">
        <ForgotPassword />
      </Route>
      <Route path="/reset-password">
        <ResetPassword />
      </Route>
      
      {/* Home Route - Shows dashboard for authenticated users, landing page for others */}
      <Route path="/">
        <MainLayout>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : isAuthenticated ? (
            <Dashboard />
          ) : (
            <Home />
          )}
        </MainLayout>
      </Route>
      <Route path="/directory">
        <MainLayout>
          <Directory />
        </MainLayout>
      </Route>
      <Route path="/business/:id">
        {params => (
          <MainLayout>
            <Business id={params.id} />
          </MainLayout>
        )}
      </Route>
      <Route path="/marketplace">
        <MainLayout>
          <Marketplace />
        </MainLayout>
      </Route>
      <Route path="/offers">
        <MainLayout>
          <OffersPage />
        </MainLayout>
      </Route>
      <Route path="/events">
        <MainLayout>
          <EventsPage />
        </MainLayout>
      </Route>
      <Route path="/my-benefits">
        <MainLayout>
          <MyBenefitsPage />
        </MainLayout>
      </Route>
      <Route path="/about">
        <MainLayout>
          <About />
        </MainLayout>
      </Route>
      <Route path="/contact">
        <MainLayout>
          <ContactPage />
        </MainLayout>
      </Route>
      <Route path="/myt-accounting">
        <MainLayout>
          <MyTAccounting />
        </MainLayout>
      </Route>
      <Route path="/trial-membership">
        <MainLayout>
          <TrialMembership />
        </MainLayout>
      </Route>
      <Route path="/membership">
        <MainLayout>
          <MembershipPage />
        </MainLayout>
      </Route>
      <Route path="/membership-benefits">
        <MainLayout>
          <MembershipBenefits />
        </MainLayout>
      </Route>
      <Route path="/ai-services">
        <MainLayout>
          <AIServices />
        </MainLayout>
      </Route>
      <Route path="/ai-tools">
        <MainLayout>
          <AITools />
        </MainLayout>
      </Route>
      <Route path="/ai-automation">
        <MainLayout>
          <AIAutomation />
        </MainLayout>
      </Route>
      <Route path="/ai-strategy">
        <MainLayout>
          <AIStrategy />
        </MainLayout>
      </Route>
      <Route path="/ai-enterprise">
        <MainLayout>
          <AIEnterprise />
        </MainLayout>
      </Route>
      <Route path="/ai-analytics">
        <MainLayout>
          <AIAnalytics />
        </MainLayout>
      </Route>
      <Route path="/ai-summit">
        <MainLayout>
          <AISummit />
        </MainLayout>
      </Route>
      <Route path="/workshop-registration">
        <MainLayout>
          <WorkshopRegistration />
        </MainLayout>
      </Route>
      <Route path="/my-registrations">
        <MainLayout>
          <MyRegistrations />
        </MainLayout>
      </Route>
      <Route path="/event-scanner">
        <ProtectedRoute>
          <MainLayout>
            <EventScanner />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/organizer-scanner">
        <ProtectedRoute>
          <MainLayout>
            <OrganizerScanner />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/test-qr-codes">
        <MainLayout>
          <TestQRCodes />
        </MainLayout>
      </Route>
      <Route path="/create-volunteer">
        <MainLayout>
          <CreateVolunteer />
        </MainLayout>
      </Route>
      <Route path="/admin-login">
        <AdminLogin />
      </Route>
      <Route path="/quick-login">
        <QuickLogin />
      </Route>
      <Route path="/my-qr-code">
        <MainLayout>
          <MyQRCodeSimple />
        </MainLayout>
      </Route>
      <Route path="/my-personal-badge">
        <MainLayout>
          <MyPersonalBadge />
        </MainLayout>
      </Route>
      <Route path="/enhanced-personal-badge">
        <MainLayout>
          <EnhancedPersonalBadge />
        </MainLayout>
      </Route>
      <Route path="/my-profile">
        <MainLayout>
          <MyProfile />
        </MainLayout>
      </Route>
      <Route path="/admin/ghl">
        <MainLayout>
          <GHLAdmin />
        </MainLayout>
      </Route>
      <Route path="/admin/import">
        <MainLayout>
          <AdminDataImport />
        </MainLayout>
      </Route>
      <Route path="/admin/badge-scanner">
        <MainLayout>
          <BadgeScanner />
        </MainLayout>
      </Route>
      <Route path="/admin/workshop-scanner">
        <MainLayout>
          <WorkshopScanner />
        </MainLayout>
      </Route>
      <Route path="/admin/occupancy">
        <MainLayout>
          <OccupancyDashboardPage />
        </MainLayout>
      </Route>
      <Route path="/admin/scanner-management">
        <AdminRoute>
          <MainLayout>
            <ScannerManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      
      {/* Member Dashboard (Protected) */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/business-profile">
        <ProtectedRoute>
          <BusinessProfile />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/products-services">
        <ProtectedRoute>
          <ProductsServices />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/special-offers">
        <ProtectedRoute>
          <SpecialOffers />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/member-directory">
        <ProtectedRoute>
          <MemberDirectory />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/content-reports">
        <AdminRoute>
          <ContentReports />
        </AdminRoute>
      </Route>
      <Route path="/dashboard/membership-management">
        <AdminRoute>
          <MembershipManagement />
        </AdminRoute>
      </Route>
      <Route path="/dashboard/user-management">
        <AdminRoute>
          <UserManagement />
        </AdminRoute>
      </Route>
      <Route path="/dashboard/analytics">
        <AdminRoute>
          <Analytics />
        </AdminRoute>
      </Route>
      <Route path="/dashboard/email-settings">
        <AdminRoute>
          <EmailSettings />
        </AdminRoute>
      </Route>
      <Route path="/dashboard/event-management">
        <AdminRoute>
          <EventManagement />
        </AdminRoute>
      </Route>
      <Route path="/dashboard/ai-summit-schedule">
        <AdminRoute>
          <AISummitSchedule />
        </AdminRoute>
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin/upload-members">
        <ProtectedRoute>
          <AdminRoute>
            <UploadMembers />
          </AdminRoute>
        </ProtectedRoute>
      </Route>
      
      {/* Demo and Testing Routes */}
      <Route path="/multi-role-demo">
        <MainLayout>
          <MultiRoleDemo />
        </MainLayout>
      </Route>
      <Route path="/mobile-badge">
        <MobileBadgePage />
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        <MainLayout>
          <NotFound />
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
