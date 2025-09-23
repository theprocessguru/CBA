import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import HeroSection from "@/components/home/HeroSection";
import FeaturedMembers from "@/components/home/FeaturedMembers";
import SpecialOffers from "@/components/home/SpecialOffers";
import MarketplacePreview from "@/components/home/MarketplacePreview";
import MemberDashboardPreview from "@/components/home/MemberDashboardPreview";
import AISummitBanner from "@/components/events/AISummitBanner";
import CountdownPopup from "@/components/CountdownPopup";
import { PageHeader } from "@/components/ui/page-header";
import { META_DESCRIPTIONS } from "@/lib/constants";

const Home = () => {
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    // Show countdown popup until October 2nd
    const cutoffDate = new Date('2025-10-02T23:59:59');
    const currentDate = new Date();
    
    if (currentDate <= cutoffDate) {
      setShowCountdown(true);
    }
  }, []);

  const handleCloseCountdown = () => {
    setShowCountdown(false);
  };

  return (
    <>
      <Helmet>
        <title>Croydon Business Association - Supporting Local Commerce</title>
        <meta name="description" content={META_DESCRIPTIONS.home} />
      </Helmet>
      
      {showCountdown && (
        <CountdownPopup 
          targetDate="2025-10-01T10:00:00"
          onClose={handleCloseCountdown}
        />
      )}
      
      <AISummitBanner />
      
      <div className="md:hidden">
        <PageHeader 
          title="CBA Home"
          subtitle="Connecting Local Businesses"
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
