import { Helmet } from "react-helmet";
import DynamicDashboardLayout from "@/components/dashboard/DynamicDashboardLayout";
import MemberDirectory from "@/components/dashboard/MemberDirectory";

const MemberDirectoryPage = () => {
  return (
    <>
      <Helmet>
        <title>Member Directory - Dashboard - Croydon Business Association</title>
        <meta name="description" content="Browse and connect with other Croydon Business Association members in this exclusive directory." />
      </Helmet>
      
      <DynamicDashboardLayout>
        <MemberDirectory />
      </DynamicDashboardLayout>
    </>
  );
};

export default MemberDirectoryPage;
