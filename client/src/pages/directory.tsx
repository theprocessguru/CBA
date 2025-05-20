import { Helmet } from "react-helmet";
import BusinessDirectory from "@/components/public/BusinessDirectory";
import { META_DESCRIPTIONS } from "@/lib/constants";

const Directory = () => {
  return (
    <>
      <Helmet>
        <title>Business Directory - Croydon Business Association</title>
        <meta name="description" content={META_DESCRIPTIONS.directory} />
      </Helmet>
      
      <BusinessDirectory />
    </>
  );
};

export default Directory;
