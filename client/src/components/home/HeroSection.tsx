import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="bg-primary-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-accent mb-4">Supporting Local Businesses in Croydon</h1>
            <p className="text-xl mb-8 text-neutral-200">Connecting businesses, promoting local commerce, and building a stronger community.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/api/login">
                <Button 
                  className="bg-accent hover:bg-accent-dark text-white font-medium py-3 px-6 rounded-md text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-light w-full sm:w-auto"
                  size="lg"
                >
                  Join the Association
                </Button>
              </a>
              <Link href="/directory">
                <Button 
                  variant="outline" 
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-dark text-white font-medium py-3 px-6 rounded-md text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white w-full sm:w-auto"
                  size="lg"
                >
                  Browse Directory
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative h-80">
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
