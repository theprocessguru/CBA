import { Helmet } from "react-helmet";
import HeroSection from "@/components/home/HeroSection";
import FeaturedMembers from "@/components/home/FeaturedMembers";
import SpecialOffers from "@/components/home/SpecialOffers";
import MarketplacePreview from "@/components/home/MarketplacePreview";
import MemberDashboardPreview from "@/components/home/MemberDashboardPreview";
import AISummitBanner from "@/components/events/AISummitBanner";
import { PageHeader } from "@/components/ui/page-header";
import { META_DESCRIPTIONS } from "@/lib/constants";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Croydon Business Association - Supporting Local Commerce</title>
        <meta name="description" content={META_DESCRIPTIONS.home} />
      </Helmet>
      
      <div className="md:hidden">
        <PageHeader 
          title="CBA Home"
          subtitle="Connecting Local Businesses"
        />
      </div>
      
      <AISummitBanner />
      <HeroSection />
      <FeaturedMembers />
      <SpecialOffers />
      <MarketplacePreview />
      <MemberDashboardPreview />
    </>
  );
};

export default Home;
