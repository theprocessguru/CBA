import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProductsServices from "@/components/dashboard/ProductsServices";

const ProductsServicesPage = () => {
  return (
    <>
      <Helmet>
        <title>Products & Services - Dashboard - Croydon Business Association</title>
        <meta name="description" content="Manage your products and services to showcase in the Croydon Business Association marketplace." />
      </Helmet>
      
      <DashboardLayout>
        <ProductsServices />
      </DashboardLayout>
    </>
  );
};

export default ProductsServicesPage;
