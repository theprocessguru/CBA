import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <img 
                    src="/attached_assets/CBA LOGO.png" 
                    alt="CBA Logo" 
                    className="h-10 w-10"
                  />
                  <span className="text-primary font-accent font-bold text-xl">
                    Croydon Business Association
                  </span>
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 sm:items-center sm:h-16">
              <Link href="/">
                <a className={`border-b-2 ${
                  isActive('/') 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                  } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200`}>
                  Home
                </a>
              </Link>
              <Link href="/directory">
                <a className={`border-b-2 ${
                  isActive('/directory') 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                  } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200`}>
                  Directory
                </a>
              </Link>
              <Link href="/marketplace">
                <a className={`border-b-2 ${
                  isActive('/marketplace') 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                  } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200`}>
                  Marketplace
                </a>
              </Link>
              <Link href="/about">
                <a className={`border-b-2 ${
                  isActive('/about') 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                  } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200`}>
                  About
                </a>
              </Link>
              <Link href="/contact">
                <a className={`border-b-2 ${
                  isActive('/contact') 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                  } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200`}>
                  Contact
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button 
              type="button" 
              className="bg-white p-1 rounded-full text-neutral-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label="Search directory"
            >
              <Search className="h-5 w-5" />
            </button>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="ml-4">
                  Member Dashboard
                </Button>
              </Link>
            ) : (
              <a href="/api/login">
                <Button className="ml-4">
                  Member Login
                </Button>
              </a>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              type="button"
              className="bg-white p-2 rounded-md text-neutral-500 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Open main menu"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <a className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium`}>
              Home
            </a>
          </Link>
          <Link href="/directory">
            <a className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/directory') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium`}>
              Directory
            </a>
          </Link>
          <Link href="/marketplace">
            <a className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/marketplace') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium`}>
              Marketplace
            </a>
          </Link>
          <Link href="/about">
            <a className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/about') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium`}>
              About
            </a>
          </Link>
          <Link href="/contact">
            <a className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/contact') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium`}>
              Contact
            </a>
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-neutral-200">
          <div className="flex items-center px-4">
            <div>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="w-full flex justify-center">
                    Member Dashboard
                  </Button>
                </Link>
              ) : (
                <a href="/api/login">
                  <Button className="w-full flex justify-center">
                    Member Login
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
