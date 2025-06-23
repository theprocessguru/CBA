import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import OffersPage from "@/pages/offers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNavigation />
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
              <Skeleton className="h-24 w-24 rounded-full" />
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
      <Route path="/about">
        <MainLayout>
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-4">About Croydon Business Association</h1>
            <p>Page under construction.</p>
          </div>
        </MainLayout>
      </Route>
      <Route path="/contact">
        <MainLayout>
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
            <p>Page under construction.</p>
          </div>
        </MainLayout>
      </Route>
      <Route path="/trial-membership">
        <MainLayout>
          <TrialMembership />
        </MainLayout>
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
      
      {/* Admin Routes */}
      <Route path="/admin/upload-members">
        <ProtectedRoute>
          <AdminRoute>
            <UploadMembers />
          </AdminRoute>
        </ProtectedRoute>
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
