import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"
import ErrorBoundary from "@/components/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationWelcome } from "@/components/LocationWelcome";
import { ScrollToTop } from "@/components/ScrollToTop";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CouncillorRegister from "@/pages/CouncillorRegister";
import SpeakerRegister from "@/pages/SpeakerRegister";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AuthTest from "@/pages/auth-test";
import Directory from "@/pages/directory";
import Business from "@/pages/business";
import Marketplace from "@/pages/marketplace";
import TrialMembership from "@/pages/trial-membership";
import MembershipPage from "@/pages/membership";
import Dashboard from "@/pages/dashboard";
import BusinessProfile from "@/pages/dashboard/business-profile";
import ProductsServices from "@/pages/dashboard/products-services";
import AddProductService from "@/pages/dashboard/AddProductService";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useLocation } from "wouter";
import SpecialOffers from "@/pages/dashboard/special-offers";
import MemberDirectory from "@/pages/dashboard/member-directory";
import ContentReports from "@/pages/admin/ContentReports";
import UserManagement from "@/pages/admin/UserManagement";
import Analytics from "@/pages/admin/Analytics";
import EmailSettings from "@/pages/admin/EmailSettings";
import AdminWorkshopManagement from "@/pages/admin/WorkshopManagement";
import AdminSpeakingSessionManagement from "@/pages/admin/SpeakingSessionManagement";
import EmailLogs from "@/pages/admin/EmailLogs";
import AdminNotificationManagement from "@/pages/admin/notification-management";
import UploadMembers from "@/pages/admin/upload-members";
import AdminInterestContacts from "@/pages/admin/AdminInterestContacts";
import MembershipManagement from "@/pages/admin/MembershipManagement";
import MembershipBenefits from "@/pages/membership-benefits";
import AIServices from "@/pages/ai-services";
import AITools from "@/pages/ai-tools";
import AIAutomation from "@/pages/ai-automation";
import AIStrategy from "@/pages/ai-strategy";
import AIEnterprise from "@/pages/ai-enterprise";
import AIAnalytics from "@/pages/ai-analytics";
import AISummit from "@/pages/ai-summit";
import AISummitSponsorPage from "@/pages/ai-summit/sponsor";
import MyTAutomationAdmin from "@/pages/myt-automation-admin";
import DataImport from "@/pages/data-import";
import AdminDataImport from "@/pages/admin/import";
import OffersPage from "@/pages/offers";
import ContactPage from "@/pages/contact";
import About from "@/pages/About";
import MyTAccounting from "@/pages/myt-accounting";
import NetworkBadgeScanner from "@/pages/BadgeScanner";
import WorkshopManagement from "@/pages/workshop-management";
import WorkshopRegistration from "@/pages/workshop-registration";
import WorkshopScanner from "@/pages/workshop-scanner";
import OccupancyDashboardPage from "@/pages/occupancy-dashboard";
import EventManagement from "@/pages/admin/EventManagement";
import AISummitSchedule from "@/pages/admin/AISummitSchedule";
import AdminEventsPage from "@/pages/admin-events";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminMembershipPricing from "@/pages/admin-membership-pricing";
import AdminAnalytics from "@/pages/admin-analytics";
import ContactImport from "@/pages/admin/contact-import";
import CouncillorImport from "@/pages/admin/CouncillorImport";
import EventsPage from "@/pages/events";
import MyBenefitsPage from "@/pages/my-benefits";
import MyRegistrations from "@/pages/my-registrations";
import FullyBooked from "@/pages/fully-booked";
import MyQRCodeSimple from "@/pages/my-qr-code-simple";
import MyPersonalBadge from "@/pages/my-personal-badge";
import EnhancedPersonalBadge from "@/pages/enhanced-personal-badge";
import EventScanner from "@/pages/event-scanner";
import OrganizerScanner from "@/pages/organizer-scanner";
import TestQRCodes from "@/pages/test-qr-codes";
import CreateVolunteer from "@/pages/create-volunteer";
import ScannerManagement from "@/pages/admin/scanner-management";
import AdminBadges from "@/pages/admin/badges";
import AttendanceDashboard from "@/pages/admin/attendance-dashboard";
import VerifyEmail from "@/pages/verify-email";
import AttendanceReport from "@/pages/admin/attendance-report";
import MultiRoleDemo from "@/pages/multi-role-demo";
import MobileBadgePage from "@/pages/mobile-badge";
import BenefitsManagement from "@/pages/admin/BenefitsManagement";
import MembershipBenefitsMatrix from "@/pages/admin/MembershipBenefitsMatrix";
import MembershipBenefitsManager from "@/pages/admin/MembershipBenefitsManager";
import AIToolsDemo from "@/pages/ai-tools-demo";
import AdminManagement from "@/pages/admin/AdminManagement";
import UserTypes from "@/pages/admin/UserTypes";
import { ExhibitorVisitors } from "@/pages/ExhibitorVisitors";
import { ExhibitorScanner } from "@/pages/ExhibitorScanner";
import EventTimeSlots from "@/pages/admin/EventTimeSlots";
import TimeSlotManager from "@/pages/admin/TimeSlotManager";
import EventDataExports from "@/pages/admin/EventDataExports";
import AttendeeBooking from "@/pages/AttendeeBooking";
import EventMoodDashboard from "@/pages/EventMoodDashboard";
import MoodSubmission from "@/pages/MoodSubmission";
import AffiliateProgrammeComingSoon from "@/pages/AffiliateProgrammeComingSoon";
import PersonTypes from "@/pages/admin/person-types";
import PersonTypeImport from "@/pages/admin/PersonTypeImport";
import Connections from "@/pages/Connections";
import Profile from "@/pages/Profile";
import ResidentProfile from "@/pages/ResidentProfile";
import SpeakerManagement from "@/pages/admin/SpeakerManagement";
import SpeakerRecovery from "@/pages/admin/SpeakerRecovery";
import ExhibitorManagement from "@/pages/admin/ExhibitorManagement";
import OnboardingManagement from "@/pages/admin/OnboardingManagement";
import EmailTemplates from "@/pages/admin/EmailTemplates";
import BulkSync from "@/pages/admin/BulkSync";
import SpeakerSlotSelection from "@/pages/SpeakerSlotSelection";
import Jobs from "@/pages/jobs";
import JobDetails from "@/pages/job-details";
import PostJob from "@/pages/post-job";
import EditJob from "@/pages/edit-job";
import MyJobs from "@/pages/my-jobs";
import MyApplications from "@/pages/my-applications";
import { EventMoodDemo } from "@/pages/EventMoodDemo";
import BusinessEventManagement from "@/pages/BusinessEventManagement";
import BusinessEvents from "@/pages/BusinessEvents";
import EconomicGrowth from "@/pages/EconomicGrowth";
import EventBooking from "@/pages/EventBooking";
import VolunteerEvents from "@/pages/VolunteerEvents";
import PhoneRecovery from "@/pages/PhoneRecovery";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/ui/bottom-navigation";
import MyTAutomationChatbot from "@/components/MyTAutomationChatbot";
import PWAInstaller from "@/components/PWAInstaller";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { useAuth } from "@/hooks/useAuth";


function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <ImpersonationBanner />
      <Navbar />
      <LocationWelcome />
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNavigation />
      <PWAInstaller />
      <div className="fixed right-4 bottom-20 md:bottom-4 z-40">
        <MyTAutomationChatbot 
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
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!user || !(user as any).isAdmin) {
    // For admin routes, redirect to login if not authenticated/admin
    setLocation("/login");
    
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center space-y-4">
          <p className="text-red-600">Admin access required</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
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
      <Route path="/councillor-register">
        <CouncillorRegister />
      </Route>
      <Route path="/speaker-register">
        <FullyBooked />
      </Route>
      <Route path="/fully-booked">
        <FullyBooked />
      </Route>
      <Route path="/forgot-password">
        <ForgotPassword />
      </Route>
      <Route path="/reset-password">
        <ResetPassword />
      </Route>
      <Route path="/verify-email">
        <VerifyEmail />
      </Route>
      <Route path="/phone-recovery">
        <PhoneRecovery />
      </Route>
      <Route path="/auth-test">
        <AuthTest />
      </Route>
      
      {/* Home Route - Shows dashboard for authenticated users, landing page for others */}
      <Route path="/">
        <MainLayout>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
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
      <Route path="/economic-growth">
        <MainLayout>
          <EconomicGrowth />
        </MainLayout>
      </Route>
      <Route path="/events">
        <MainLayout>
          <EventsPage />
        </MainLayout>
      </Route>
      <Route path="/volunteer-events">
        <MainLayout>
          <VolunteerEvents />
        </MainLayout>
      </Route>
      <Route path="/attendee-booking">
        <ProtectedRoute>
          <MainLayout>
            <AttendeeBooking />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/event-booking">
        <ProtectedRoute>
          <MainLayout>
            <EventBooking />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/badge-scanner">
        <ProtectedRoute>
          <MainLayout>
            <NetworkBadgeScanner />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/jobs">
        <MainLayout>
          <Jobs />
        </MainLayout>
      </Route>
      <Route path="/jobs/post">
        <ProtectedRoute>
          <MainLayout>
            <PostJob />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/jobs/my-jobs">
        <ProtectedRoute>
          <MainLayout>
            <MyJobs />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/my-applications">
        <ProtectedRoute>
          <MainLayout>
            <MyApplications />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/jobs/:id/edit">
        <ProtectedRoute>
          <MainLayout>
            <EditJob />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/jobs/:id">
        <MainLayout>
          <JobDetails />
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
      <Route path="/ai-summit/sponsor">
        <MainLayout>
          <AISummitSponsorPage />
        </MainLayout>
      </Route>
      <Route path="/speaker-slot-selection">
        <ProtectedRoute>
          <MainLayout>
            <SpeakerSlotSelection />
          </MainLayout>
        </ProtectedRoute>
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
      <Route path="/exhibitor-visitors">
        <ProtectedRoute>
          <MainLayout>
            <ExhibitorVisitors />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/exhibitor-scanner">
        <ProtectedRoute>
          <MainLayout>
            <ExhibitorScanner />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/mood-dashboard">
        <ProtectedRoute>
          <MainLayout>
            <EventMoodDashboard />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/mood-submission">
        <MainLayout>
          <MoodSubmission />
        </MainLayout>
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
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <MainLayout>
            <ResidentProfile />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/ghl">
        <MainLayout>
          <MyTAutomationAdmin />
        </MainLayout>
      </Route>
      <Route path="/admin/import">
        <MainLayout>
          <AdminDataImport />
        </MainLayout>
      </Route>
      <Route path="/data-import">
        <MainLayout>
          <DataImport />
        </MainLayout>
      </Route>
      <Route path="/admin/badge-scanner">
        <MainLayout>
          <NetworkBadgeScanner />
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
      <Route path="/admin">
        <AdminRoute>
          <MainLayout>
            <AdminDashboard />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/user-management">
        <AdminRoute>
          <MainLayout>
            <UserManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/scanner-management">
        <AdminRoute>
          <MainLayout>
            <ScannerManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/badges">
        <AdminRoute>
          <MainLayout>
            <AdminBadges />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/attendance">
        <AdminRoute>
          <MainLayout>
            <AttendanceDashboard />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/attendance-report">
        <AdminRoute>
          <MainLayout>
            <AttendanceReport />
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
      <Route path="/dashboard/add-product-service">
        <ProtectedRoute>
          <AddProductServiceWrapper />
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
      <Route path="/dashboard/affiliate">
        <ProtectedRoute>
          <AffiliateProgrammeComingSoon />
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
      <Route path="/dashboard/email-logs">
        <AdminRoute>
          <EmailLogs />
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
      <Route path="/admin/dashboard">
        <AdminRoute>
          <MainLayout>
            <AdminDashboard />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/events">
        <AdminRoute>
          <MainLayout>
            <AdminEventsPage />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/membership-pricing">
        <AdminRoute>
          <MainLayout>
            <AdminMembershipPricing />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/benefits-management">
        <AdminRoute>
          <MainLayout>
            <BenefitsManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/benefits-matrix">
        <AdminRoute>
          <MainLayout>
            <MembershipBenefitsMatrix />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/membership-benefits">
        <AdminRoute>
          <MainLayout>
            <MembershipBenefitsManager />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/analytics">
        <AdminRoute>
          <MainLayout>
            <AdminAnalytics />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/contact-import">
        <AdminRoute>
          <MainLayout>
            <ContactImport />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/councillor-import">
        <AdminRoute>
          <MainLayout>
            <CouncillorImport />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/workshops">
        <AdminRoute>
          <MainLayout>
            <AdminWorkshopManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/speaking-sessions">
        <AdminRoute>
          <MainLayout>
            <AdminSpeakingSessionManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/administrators">
        <AdminRoute>
          <MainLayout>
            <AdminManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/user-types">
        <AdminRoute>
          <MainLayout>
            <UserTypes />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/event-time-slots">
        <AdminRoute>
          <MainLayout>
            <EventTimeSlots />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/event-data-exports">
        <AdminRoute>
          <MainLayout>
            <EventDataExports />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/time-slot-manager">
        <AdminRoute>
          <MainLayout>
            <TimeSlotManager />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/book-sessions">
        <ProtectedRoute>
          <MainLayout>
            <AttendeeBooking />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/affiliates">
        <AdminRoute>
          <MainLayout>
            <AffiliateProgrammeComingSoon />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/interest-contacts">
        <AdminRoute>
          <MainLayout>
            <AdminInterestContacts />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/speakers">
        <AdminRoute>
          <MainLayout>
            <SpeakerManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/speaker-recovery">
        <AdminRoute>
          <MainLayout>
            <SpeakerRecovery />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/exhibitor-management">
        <AdminRoute>
          <MainLayout>
            <ExhibitorManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/onboarding">
        <AdminRoute>
          <MainLayout>
            <OnboardingManagement />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/email-templates">
        <AdminRoute>
          <MainLayout>
            <EmailTemplates />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/notification-management">
        <AdminRoute>
          <AdminNotificationManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/bulk-sync">
        <AdminRoute>
          <MainLayout>
            <BulkSync />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/person-types">
        <AdminRoute>
          <MainLayout>
            <PersonTypes />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/person-type-import">
        <AdminRoute>
          <MainLayout>
            <PersonTypeImport />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route path="/connections">
        <ProtectedRoute>
          <MainLayout>
            <Connections />
          </MainLayout>
        </ProtectedRoute>
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
      <Route path="/ai-tools-demo">
        <MainLayout>
          <AIToolsDemo />
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
        <ErrorBoundary>
          <ScrollToTop />
          <Toaster />
          <Router />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Wrapper component to handle product editing
function AddProductServiceWrapper() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const editId = urlParams.get('edit');
  
  const { data: editingProduct, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${editId}`],
    enabled: !!editId,
  });

  if (isLoading && editId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return <AddProductService editingProduct={editingProduct || null} />;
}

export default App;
