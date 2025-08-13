import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  MapPin,
  Phone, 
  Mail
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 font-accent">Croydon Business Association</h3>
            <p className="text-neutral-400 mb-4">Supporting local businesses and fostering community growth since 1985.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-white transition">
                <Facebook size={16} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition">
                <Linkedin size={16} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition">
                <Instagram size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-neutral-400 hover:text-white transition">Home</a></Link></li>
              <li><Link href="/about"><a className="text-neutral-400 hover:text-white transition">About Us</a></Link></li>
              <li><Link href="/directory"><a className="text-neutral-400 hover:text-white transition">Member Directory</a></Link></li>
              <li><Link href="/marketplace"><a className="text-neutral-400 hover:text-white transition">Marketplace</a></Link></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Events</a></li>
              <li><Link href="/contact"><a className="text-neutral-400 hover:text-white transition">Contact</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Member Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/login"><a className="text-neutral-400 hover:text-white transition">Login / Register</a></Link></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Member Benefits</a></li>
              <li><Link href="/dashboard/business-profile"><a className="text-neutral-400 hover:text-white transition">Update Your Profile</a></Link></li>
              <li><Link href="/dashboard/special-offers"><a className="text-neutral-400 hover:text-white transition">Create Special Offers</a></Link></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Business Resources</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Contact Us</h4>
            <ul className="space-y-3 text-neutral-400">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-3 text-neutral-300" size={16} />
                <span>50 George Street, Croydon<br />CR0 1PD, UK</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 text-neutral-300" size={16} />
                <span>+44 7832 417784</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-3 text-neutral-300" size={16} />
                <span>info@croydonba.org.uk</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-neutral-400 text-sm mb-4">
            <p>&copy; {new Date().getFullYear()} Croydon Business Association. All rights reserved.</p>
            <div className="mt-4 md:mt-0 space-x-4">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
          
          {/* Developer Attribution */}
          <div className="border-t border-neutral-700 pt-4">
            <div className="text-center text-neutral-500 text-xs">
              <p className="mb-1">
                This app was built by{" "}
                <span className="text-blue-400 font-medium">Steve Ball - The Process Guru</span>
                {" "}Founder of{" "}
                <a 
                  href="https://mytai.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition underline font-medium"
                >
                  MyT AI
                </a>
                {" "}and{" "}
                <a 
                  href="https://mytautomation.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition underline font-medium"
                >
                  MyT Automation
                </a>
              </p>
              <p className="text-neutral-600">
                Using nothing more than English and Amazing AI called Dave
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
