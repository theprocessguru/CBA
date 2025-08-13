import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Heart, TrendingUp, MapPin, Calendar, Phone, Mail } from "lucide-react";
import cbaLogo from "@assets/CBA LOGO.png";

const About = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <img 
              src={cbaLogo} 
              alt="CBA Logo" 
              className="h-20 w-20 object-contain mx-auto"
            />
            <h1 className="text-4xl font-bold text-neutral-900">
              About Croydon Business Association
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              The Shining Light for Businesses and People of Croydon
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              A vibrant and diverse business community
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Chairman's Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-red-500" />
              A Message from Our Chairman
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-neutral-100 p-6 rounded-lg border-l-4 border-primary">
              <p className="text-lg mb-4 italic">
                "Welcome to the Croydon Business Association, where community, commerce, and collaboration come together to shape the future of our borough."
              </p>
              <p className="mb-4">
                I'm Jose and I am owner of a trader on Surrey Street Market, proud Croydon resident, and passionate advocate for the incredible talent, diversity, and potential that exists right here in our town.
              </p>
              <p className="mb-4">
                At CBA, we believe that <strong>Croydon's business community is the engine of local prosperity</strong>. From high street retailers and tech innovators to logistics hubs and creative entrepreneurs, our members form the heartbeat of a borough on the rise.
              </p>
              <p className="mb-4 font-semibold">Our mission is simple:</p>
              <p className="mb-4">
                To <strong>connect, champion, and empower</strong> businesses and stakeholders across Croydon, building a stronger local economy that benefits everyone.
              </p>
              <p className="mb-4">
                Whether you're a long-established enterprise or just starting out, this is your association, and your opportunity to help shape the future of Croydon.
              </p>
              <p className="font-semibold">
                Let's grow together for a better, bolder Croydon.
              </p>
              <p className="text-primary font-bold mt-4">
                #CroydonMeansBusiness | #TogetherForGrowth
              </p>
              <div className="mt-4 pt-4 border-t">
                <p className="font-semibold">Jose Josheph</p>
                <p className="text-sm text-muted-foreground">Chairman, Croydon Business Association</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About the Organization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building className="h-6 w-6 text-blue-500" />
                Our Foundation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Established May 2024</p>
                    <p className="text-sm text-muted-foreground">Community Interest Company</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold">50 George Street, Croydon</p>
                    <p className="text-sm text-muted-foreground">Company No. 15701870</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-semibold">07832 417784</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-semibold">info@croydonba.org.uk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-500" />
                Our Mission & Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="font-semibold text-primary mb-2">Mission Statement</p>
                <p className="text-sm">
                  "To connect, champion, and empower businesses and stakeholders across Croydon, building a stronger local economy that benefits everyone."
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p><strong>Connecting</strong> businesses with networks, opportunities, and local knowledge</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p><strong>Supporting</strong> enterprises from startups to established organizations</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <p><strong>Building</strong> a vibrant business community through events and partnerships</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p><strong>Empowering</strong> collaboration and trade within Croydon's diverse landscape</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-500" />
              Services and Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold">Membership</h3>
                <p className="text-sm text-muted-foreground">Join our vibrant community of local businesses</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Events & Workshops</h3>
                <p className="text-sm text-muted-foreground">Regular networking and skills development sessions</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Business Training</h3>
                <p className="text-sm text-muted-foreground">AI training, automation clinics, and growth support</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Community Engagement</h3>
                <p className="text-sm text-muted-foreground">Building connections across Croydon's diverse community</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                  <Building className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Licenses & Permits</h3>
                <p className="text-sm text-muted-foreground">Guidance on regulations and council requirements</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-semibold">Social Impact</h3>
                <p className="text-sm text-muted-foreground">Community initiatives and charitable programs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Croydon */}
        <Card>
          <CardHeader>
            <CardTitle>About the Borough of Croydon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Croydon: South London's Economic Engine</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="font-semibold">Dynamic Investment Destination</p>
                  <p className="text-sm text-muted-foreground">
                    Home to one of the UK's youngest, most diverse populations, vibrant, ambitious, and future-ready.
                  </p>
                  <p className="font-semibold">Cultural Heart</p>
                  <p className="text-sm text-muted-foreground">
                    From creative clusters to logistics corridors, Croydon connects people, business, and opportunity.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold">Growth & Innovation</p>
                  <p className="text-sm text-muted-foreground">
                    With exceptional connectivity, a thriving SME base and a young skilled workforce, the borough is built for growth.
                  </p>
                  <p className="font-semibold">Future Vision</p>
                  <p className="text-sm text-muted-foreground">
                    Major regeneration schemes and public-private partnerships are unlocking long-term value across the town centre.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <Building className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-bold mb-2">Business Support</h3>
              <p className="text-sm text-muted-foreground">
                Registration, permits, growth challenges, and digital empowerment
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-bold mb-2">Partnerships & Networks</h3>
              <p className="text-sm text-muted-foreground">
                Directory, networking events, and peer-led insight sharing
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-bold mb-2">Skills & Innovation</h3>
              <p className="text-sm text-muted-foreground">
                AI training, automation clinics, and partnership with LSBU
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Heart className="h-8 w-8 mx-auto mb-3 text-red-500" />
              <h3 className="font-bold mb-2">Your Croydon</h3>
              <p className="text-sm text-muted-foreground">
                Community building, youth entrepreneurship, and social impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Developer Attribution */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Powered by Innovation</h2>
              <p className="text-lg mb-4 text-gray-700">
                This app was built by{" "}
                <a 
                  href="https://theprocess.guru" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-blue-600 hover:text-blue-800 transition underline"
                >
                  Steve Ball - The Process Guru
                </a>
                {" "}Founder of{" "}
                <a 
                  href="https://mytai.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-blue-600 hover:text-blue-800 transition underline"
                >
                  MyT AI
                </a>
                {" "}and{" "}
                <a 
                  href="https://mytautomation.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-blue-600 hover:text-blue-800 transition underline"
                >
                  MyT Automation
                </a>
              </p>
              <p className="text-gray-600 mb-6">
                Using nothing more than English and Amazing AI called Dave
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <p className="text-sm text-gray-500 mb-2">
                  Discover how AI can transform your business processes
                </p>
                <a 
                  href="https://mytai.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Visit MyT AI →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-primary text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="mb-6 text-lg">
              Whether you're a startup, family business, nonprofit, or large employer - if you're doing business in or for Croydon, you belong here.
            </p>
            <div className="space-y-4">
              <p className="font-semibold">Ready to get involved?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-white text-primary px-4 py-2 rounded font-medium">
                  Call: 07832 417784
                </div>
                <div className="bg-white text-primary px-4 py-2 rounded font-medium">
                  Email: info@croydonba.org.uk
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;