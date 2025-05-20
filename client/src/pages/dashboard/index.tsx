import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { META_DESCRIPTIONS } from "@/lib/constants";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard - Croydon Business Association</title>
        <meta name="description" content={META_DESCRIPTIONS.dashboard} />
      </Helmet>
      
      <DashboardLayout>
        <DashboardOverview />
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
