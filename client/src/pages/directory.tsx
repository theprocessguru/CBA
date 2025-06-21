import { Helmet } from "react-helmet";
import BusinessDirectory from "@/components/public/BusinessDirectory";
import { PageHeader } from "@/components/ui/page-header";
import { META_DESCRIPTIONS } from "@/lib/constants";

const Directory = () => {
  return (
    <>
      <Helmet>
        <title>Business Directory - Croydon Business Association</title>
        <meta name="description" content={META_DESCRIPTIONS.directory} />
      </Helmet>
      
      <div className="md:hidden">
        <PageHeader 
          title="Business Directory"
          subtitle="Find local businesses"
        />
      </div>
      
      <BusinessDirectory />
    </>
  );
};

export default Directory;
