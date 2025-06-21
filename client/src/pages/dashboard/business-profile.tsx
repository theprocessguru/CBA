import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BusinessProfile from "@/components/dashboard/BusinessProfile";
import { PageHeader } from "@/components/ui/page-header";

const BusinessProfilePage = () => {
  return (
    <>
      <Helmet>
        <title>Business Profile - Dashboard - Croydon Business Association</title>
        <meta name="description" content="Update your business profile information including contact details, description, and more." />
      </Helmet>
      
      <DashboardLayout>
        <BusinessProfile />
      </DashboardLayout>
    </>
  );
};

export default BusinessProfilePage;
