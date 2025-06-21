import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
      
      <DashboardLayout>
        <SpecialOffers />
      </DashboardLayout>
    </>
  );
};

export default SpecialOffersPage;
