import { Helmet } from "react-helmet";
import DynamicDashboardLayout from "@/components/dashboard/DynamicDashboardLayout";
import BusinessProfile from "@/components/dashboard/BusinessProfile";
import { PageHeader } from "@/components/ui/page-header";

const BusinessProfilePage = () => {
  return (
    <>
      <Helmet>
        <title>Business Profile - Dashboard - Croydon Business Association</title>
        <meta name="description" content="Update your business profile information including contact details, description, and more." />
      </Helmet>
      
      <DynamicDashboardLayout>
        <BusinessProfile />
      </DynamicDashboardLayout>
    </>
  );
};

export default BusinessProfilePage;
