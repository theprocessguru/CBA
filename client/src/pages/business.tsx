import { useEffect } from "react";
import { Helmet } from "react-helmet";
import BusinessDetails from "@/components/public/BusinessDetails";
import { useQuery } from "@tanstack/react-query";
import { Business as BusinessType } from "@shared/schema";
import { META_DESCRIPTIONS } from "@/lib/constants";

interface BusinessPageProps {
  id: string;
}

const Business = ({ id }: BusinessPageProps) => {
  const { data: business, isLoading } = useQuery<BusinessType>({
    queryKey: [`/api/businesses/${id}`],
    enabled: !!id,
  });

  // Scroll to top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <>
      <Helmet>
        <title>
          {isLoading
            ? "Loading Business Details - Croydon Business Association"
            : business
            ? `${business.name} - Croydon Business Association`
            : "Business Details - Croydon Business Association"}
        </title>
        <meta
          name="description"
          content={
            business && business.description
              ? business.description.substring(0, 160)
              : META_DESCRIPTIONS.businessProfile
          }
        />
      </Helmet>
      
      <BusinessDetails businessId={id} />
    </>
  );
};

export default Business;
