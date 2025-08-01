import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Supporting Local Businesses in Croydon</h1>
            <p className="text-xl mb-8 text-gray-700">Connecting businesses, promoting local commerce, and building a stronger community.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                  size="lg"
                >
                  <span>Join the Association</span>
                </Button>
              </Link>
              <Link href="/directory">
                <Button 
                  variant="outline" 
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-md text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                  size="lg"
                >
                  <span>Browse Directory</span>
                </Button>
              </Link>
            </div>
            
            {/* Personal Message from CBA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-sm">
              <div className="text-center">
                <p className="text-gray-700 mb-3 leading-relaxed">
                  <span className="font-semibold text-gray-900">The CBA proudly thanks our Executive Board Member</span>
                  {" "}<span className="font-bold text-blue-600">Steve Ball - The Process Guru</span>{" "}
                  for creating this incredible platform that transforms how we connect and serve our business community.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <p className="text-sm text-gray-600">
                    Discover the future of business automation
                  </p>
                  <a 
                    href="https://mytai.co.uk" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Visit MyT AI →
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-80">
            <img 
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Croydon business owners" 
              className="rounded-lg shadow-xl object-cover h-full w-full" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
