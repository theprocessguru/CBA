import { Helmet } from "react-helmet";
import DynamicDashboardLayout from "@/components/dashboard/DynamicDashboardLayout";
import SpecialOffers from "@/components/dashboard/SpecialOffers";
import { PageHeader } from "@/components/ui/page-header";

const SpecialOffersPage = () => {
  return (
    <>
      <Helmet>
        <title>Special Offers - Dashboard - Croydon Business Association</title>
        <meta name="description" content="Create and manage special offers and discounts for other Croydon Business Association members." />
      </Helmet>
      
      <div className="md:hidden">
        <PageHeader 
          title="Special Offers"
          subtitle="Manage your member deals"
        />
      </div>
      
      <DynamicDashboardLayout>
        <SpecialOffers />
      </DynamicDashboardLayout>
    </>
  );
};

export default SpecialOffersPage;
