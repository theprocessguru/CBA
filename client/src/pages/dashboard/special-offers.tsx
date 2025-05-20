import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SpecialOffers from "@/components/dashboard/SpecialOffers";

const SpecialOffersPage = () => {
  return (
    <>
      <Helmet>
        <title>Special Offers - Dashboard - Croydon Business Association</title>
        <meta name="description" content="Create and manage special offers and discounts for other Croydon Business Association members." />
      </Helmet>
      
      <DashboardLayout>
        <SpecialOffers />
      </DashboardLayout>
    </>
  );
};

export default SpecialOffersPage;
