import { Helmet } from "react-helmet";
import Marketplace from "@/components/public/Marketplace";
import { PageHeader } from "@/components/ui/page-header";
import { META_DESCRIPTIONS } from "@/lib/constants";

const MarketplacePage = () => {
  return (
    <>
      <Helmet>
        <title>Marketplace - Croydon Business Association</title>
        <meta name="description" content={META_DESCRIPTIONS.marketplace} />
      </Helmet>
      
      <div className="md:hidden">
        <PageHeader 
          title="Marketplace"
          subtitle="Shop local products & services"
        />
      </div>
      
      <Marketplace />
    </>
  );
};

export default MarketplacePage;
