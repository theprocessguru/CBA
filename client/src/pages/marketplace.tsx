import { Helmet } from "react-helmet";
import Marketplace from "@/components/public/Marketplace";
import { META_DESCRIPTIONS } from "@/lib/constants";

const MarketplacePage = () => {
  return (
    <>
      <Helmet>
        <title>Marketplace - Croydon Business Association</title>
        <meta name="description" content={META_DESCRIPTIONS.marketplace} />
      </Helmet>
      
      <Marketplace />
    </>
  );
};

export default MarketplacePage;
