import { Helmet } from "react-helmet";
import AISummitSponsorship from "@/components/events/AISummitSponsorship";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const AISummitSponsorPage = () => {
  return (
    <>
      <Helmet>
        <title>AI Summit Sponsorship - Croydon Business Association</title>
        <meta 
          name="description" 
          content="Become a sponsor of the CBA AI Summit. Support local businesses and community education while showcasing your brand to 500+ business leaders."
        />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/ai-summit">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to AI Summit
              </Button>
            </Link>
          </div>
          
          <PageHeader 
            title="AI Summit Sponsorship"
            subtitle="Partner with CBA to empower businesses and educate our community"
          />
          
          <AISummitSponsorship />
        </div>
      </div>
    </>
  );
};

export default AISummitSponsorPage;