import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import AdminDashboard from "@/pages/admin-dashboard";
import { META_DESCRIPTIONS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>Dashboard - Croydon Business Association</title>
        <meta name="description" content={META_DESCRIPTIONS.dashboard} />
      </Helmet>
      
      {user?.isAdmin ? (
        <AdminDashboard />
      ) : (
        <DashboardLayout>
          <DashboardOverview />
        </DashboardLayout>
      )}
    </>
  );
};

export default Dashboard;
