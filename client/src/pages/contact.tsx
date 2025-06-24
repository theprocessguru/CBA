import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import BottomNavigation from "@/components/ui/bottom-navigation";
import ContactSupportDialog from "@/components/ui/contact-support-dialog";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import { useState } from "react";
import { CONTACT_INFO } from "@/lib/constants";

const ContactPage = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const openMaps = () => {
    const address = encodeURIComponent(`${CONTACT_INFO.address}, ${CONTACT_INFO.postcode}, UK`);
    window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader title="Contact CBA" showBack={true} />
      
      <div className="p-4 pb-24 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Get in Touch with Croydon Business Association
          </h2>
          <p className="text-neutral-600">
            We're here to help your business grow and connect with the community
          </p>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Our Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-neutral-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Croydon Business Association</p>
                <p className="text-neutral-600">{CONTACT_INFO.address}</p>
                <p className="text-neutral-600">{CONTACT_INFO.postcode}, UK</p>
              </div>
            </div>
            
            <Button 
              onClick={openMaps} 
              variant="outline" 
              className="w-full gap-2"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </Button>
          </CardContent>
        </Card>

        {/* Contact Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-neutral-500 flex-shrink-0" />
              <div>
                <p className="font-medium">Phone</p>
                <a 
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="text-primary hover:underline"
                >
                  {CONTACT_INFO.phone}
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-neutral-500 flex-shrink-0" />
              <div>
                <p className="font-medium">Email</p>
                <a 
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-primary hover:underline"
                >
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span>9:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span>10:00 AM - 2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send Message */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 mb-4">
              Have a question or need assistance? Send us a message through our support system.
            </p>
            <Button 
              onClick={() => setIsContactDialogOpen(true)}
              className="w-full"
            >
              Send Message
            </Button>
          </CardContent>
        </Card>

        {/* About CBA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-primary mb-2">
              About Croydon Business Association
            </h3>
            <p className="text-neutral-600 text-sm">
              Supporting local businesses and fostering community growth since 1985. 
              We provide networking opportunities, business resources, and advocacy for 
              the Croydon business community.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <ContactSupportDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        initialSubject="General Inquiry"
      />
      
      <BottomNavigation />
    </div>
  );
};

export default ContactPage;