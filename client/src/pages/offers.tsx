import { Helmet } from "react-helmet";
import SpecialOffers from "@/components/offers/SpecialOffers";
import { PageHeader } from "@/components/ui/page-header";
import { META_DESCRIPTIONS } from "@/lib/constants";

const OffersPage = () => {
  return (
    <>
      <Helmet>
        <title>Special Offers - Croydon Business Association</title>
        <meta name="description" content={META_DESCRIPTIONS.offers || "Discover exclusive deals and special offers from Croydon Business Association members. Save money while supporting local businesses."} />
      </Helmet>
      
      <div className="md:hidden">
        <PageHeader 
          title="Special Offers"
          subtitle="Exclusive member deals"
        />
      </div>
      
      <SpecialOffers />
    </>
  );
};

export default OffersPage;