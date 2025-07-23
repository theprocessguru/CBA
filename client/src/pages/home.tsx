import { Helmet } from "react-helmet";
import HeroSection from "@/components/home/HeroSection";
import FeaturedMembers from "@/components/home/FeaturedMembers";
import SpecialOffers from "@/components/home/SpecialOffers";
import MarketplacePreview from "@/components/home/MarketplacePreview";
import MemberDashboardPreview from "@/components/home/MemberDashboardPreview";
import { PageHeader } from "@/components/ui/page-header";
import { META_DESCRIPTIONS } from "@/lib/constants";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Business Automation Platform - Streamline Your Operations</title>
        <meta name="description" content="Automate your business processes, manage workflows, and boost productivity with our comprehensive business automation platform." />
      </Helmet>
      
      <div className="md:hidden">
        <PageHeader 
          title="Automation Hub"
          subtitle="Streamline Your Business"
          showBackButton={false}
          showHomeButton={false}
        />
      </div>
      
      <HeroSection />
      <FeaturedMembers />
      <SpecialOffers />
      <MarketplacePreview />
      <MemberDashboardPreview />
    </>
  );
};

export default Home;
