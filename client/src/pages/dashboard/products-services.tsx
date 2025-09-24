import { Helmet } from "react-helmet";
import DynamicDashboardLayout from "@/components/dashboard/DynamicDashboardLayout";
import ProductsServices from "@/components/dashboard/ProductsServices";
import { PageHeader } from "@/components/ui/page-header";

const ProductsServicesPage = () => {
  return (
    <>
      <Helmet>
        <title>Products & Services - Dashboard - Croydon Business Association</title>
        <meta name="description" content="Manage your products and services to showcase in the Croydon Business Association marketplace." />
      </Helmet>
      
      <div className="md:hidden">
        <PageHeader 
          title="Products & Services"
          subtitle="Manage your offerings"
        />
      </div>
      
      <DynamicDashboardLayout>
        <ProductsServices />
      </DynamicDashboardLayout>
    </>
  );
};

export default ProductsServicesPage;
