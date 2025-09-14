import { Helmet } from "react-helmet";
import DynamicDashboardLayout from "@/components/dashboard/DynamicDashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import AdminDashboard from "@/pages/admin-dashboard";
import { META_DESCRIPTIONS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Check if admin is impersonating - if so, show user dashboard
  const isImpersonating = (user as any)?.isImpersonating;
  const shouldShowUserDashboard = !user?.isAdmin || isImpersonating;
  
  return (
    <>
      <Helmet>
        <title>Dashboard - Croydon Business Association</title>
        <meta name="description" content={META_DESCRIPTIONS.dashboard} />
      </Helmet>
      
      {shouldShowUserDashboard ? (
        <DynamicDashboardLayout>
          <DashboardOverview />
        </DynamicDashboardLayout>
      ) : (
        <AdminDashboard />
      )}
    </>
  );
};

export default Dashboard;
