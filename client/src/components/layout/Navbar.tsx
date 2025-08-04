import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Home, ChevronDown } from "lucide-react";
import cbaLogo from "@assets/CBA LOGO.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const aiMenuRef = useRef<HTMLDivElement>(null);
  const homeMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location === path;
  const isAiPathActive = () => location.startsWith('/ai-');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAiMenu = () => {
    setIsAiMenuOpen(!isAiMenuOpen);
    setIsHomeMenuOpen(false); // Close home menu when opening AI menu
  };

  const toggleHomeMenu = () => {
    setIsHomeMenuOpen(!isHomeMenuOpen);
    setIsAiMenuOpen(false); // Close AI menu when opening home menu
  };

  // Close menus when clicking outside (but not on menu items)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking on a submenu link or home button
      if (target.closest('a[href^="/ai-"]') || target.closest('a[href="/about"]') || target.closest('a[href="/"]')) {
        return;
      }
      
      if (aiMenuRef.current && !aiMenuRef.current.contains(target)) {
        setIsAiMenuOpen(false);
      }
      
      if (homeMenuRef.current && !homeMenuRef.current.contains(target)) {
        setIsHomeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus when location changes
  useEffect(() => {
    // Close mobile main menu on navigation
    setIsMenuOpen(false);
    
    // Close AI menu when navigating away from AI pages
    if (!location.startsWith('/ai-')) {
      setIsAiMenuOpen(false);
    }
    
    // Close home menu when navigating away from home/about pages
    if (location !== '/' && location !== '/about') {
      setIsHomeMenuOpen(false);
    }
  }, [location]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0 flex items-center space-x-2">
              {location !== '/' && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => window.history.back()}
                  className="text-neutral-600 hover:text-neutral-800 lg:hidden"
                  title="Go back"
                >
                  <ArrowLeft size={20} />
                </Button>
              )}
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-neutral-600 hover:text-neutral-800 lg:hidden"
                  title="Home"
                >
                  <Home size={20} />
                </Button>
              </Link>
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <img 
                    src={cbaLogo} 
                    alt="CBA Logo" 
                    className="h-8 w-8 object-contain"
                  />
                  <div className="flex flex-col">
                    <span className="text-primary font-accent font-bold text-lg lg:text-xl truncate">
                      Croydon Business Association
                    </span>
                    <span className="text-xs text-blue-600 font-medium -mt-1 hidden sm:block">
                      UK's Leading AI-Powered Business Association
                    </span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="hidden lg:ml-6 lg:flex lg:space-x-6 lg:items-center lg:h-16">
              {/* Home Dropdown Menu */}
              <div className="relative" ref={homeMenuRef}>
                <button 
                  className={`border-b-2 ${
                    isActive('/') || isActive('/about') 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                    } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200 flex items-center space-x-1`}
                  onClick={toggleHomeMenu}
                >
                  <span>Home</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHomeMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <Link href="/membership-benefits">
                <a className={`border-b-2 ${
                  isActive('/membership-benefits') 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                  } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200`}>
                  Membership
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

              <Link href="/organizer-scanner">
                <a className={`border-b-2 ${
                  isActive('/organizer-scanner') 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                  } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200`}>
                  Badge Scanner
                </a>
              </Link>

              <Link href="/events">
                <a className={`border-b-2 ${
                  isActive('/events') 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                  } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200`}>
                  Events
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
              
              {/* AI Top-tier Menu - Non-clickable */}
              <div className="relative" ref={aiMenuRef}>
                <button 
                  className={`border-b-2 ${
                    isAiPathActive() 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'
                    } font-medium text-sm leading-5 px-1 py-4 transition-colors duration-200 flex items-center space-x-1`}
                  onClick={toggleAiMenu}
                >
                  <span>AI</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAiMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              

            </div>
          </div>
          <div className="hidden sm:ml-4 sm:flex sm:items-center sm:space-x-3 flex-shrink-0 relative z-50">
            <button 
              type="button" 
              className="bg-white p-1 rounded-full text-neutral-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label="Search directory"
            >
              <Search className="h-5 w-5" />
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/mobile-badge">
                  <Button size="sm" variant="outline" className="text-sm px-3 py-2 whitespace-nowrap">
                    Mobile Badge
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="sm" className="text-sm px-3 py-2 whitespace-nowrap">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="text-sm px-3 py-2 whitespace-nowrap ml-2">
                  Login
                </Button>
              </Link>
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

      {/* Home Horizontal Submenu */}
      {isHomeMenuOpen && (
        <div className="bg-gray-50 border-t border-gray-200 block relative z-40" onClick={(e) => e.stopPropagation()}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap space-x-4 lg:space-x-8 py-3">
              <Link href="/">
                <a className={`text-sm font-medium ${
                  isActive('/') 
                    ? 'text-primary' 
                    : 'text-neutral-600 hover:text-primary'
                  } transition-colors duration-200`}
                  onClick={() => setIsHomeMenuOpen(false)}>
                  Home
                </a>
              </Link>
              <Link href="/about">
                <a className={`text-sm font-medium ${
                  isActive('/about') 
                    ? 'text-primary' 
                    : 'text-neutral-600 hover:text-primary'
                  } transition-colors duration-200`}
                  onClick={() => setIsHomeMenuOpen(false)}>
                  About CBA
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* AI Horizontal Submenu */}
      {isAiMenuOpen && (
        <div className="bg-gray-50 border-t border-gray-200 block relative z-40" onClick={(e) => e.stopPropagation()}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap space-x-4 lg:space-x-8 py-3">
              <Link href="/ai-summit">
                <a className={`text-sm font-medium ${
                  isActive('/ai-summit') 
                    ? 'text-primary' 
                    : 'text-red-600 hover:text-red-700 font-semibold'
                  } transition-colors duration-200`}
                  onClick={() => setIsAiMenuOpen(false)}>
                  🚀 AI Summit Oct 1st
                </a>
              </Link>
              <Link href="/ai-services">
                <a className={`text-sm font-medium ${
                  isActive('/ai-services') 
                    ? 'text-primary' 
                    : 'text-neutral-600 hover:text-primary'
                  } transition-colors duration-200`}
                  onClick={() => setIsAiMenuOpen(false)}>
                  AI Services
                </a>
              </Link>
              <Link href="/ai-tools">
                <a className={`text-sm font-medium ${
                  isActive('/ai-tools') 
                    ? 'text-primary' 
                    : 'text-neutral-600 hover:text-primary'
                  } transition-colors duration-200`}
                  onClick={() => setIsAiMenuOpen(false)}>
                  AI Tools
                </a>
              </Link>
              <Link href="/ai-automation">
                <a className={`text-sm font-medium ${
                  isActive('/ai-automation') 
                    ? 'text-primary' 
                    : 'text-neutral-600 hover:text-primary'
                  } transition-colors duration-200`}
                  onClick={() => setIsAiMenuOpen(false)}>
                  AI Automation
                </a>
              </Link>
              <Link href="/ai-analytics">
                <a className={`text-sm font-medium ${
                  isActive('/ai-analytics') 
                    ? 'text-primary' 
                    : 'text-neutral-600 hover:text-primary'
                  } transition-colors duration-200`}
                  onClick={() => setIsAiMenuOpen(false)}>
                  AI Analytics
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/ai-summit">
            <a className="block pl-3 pr-4 py-2 border-l-4 border-red-500 text-red-600 bg-red-50 font-bold text-sm">
              🚀 First AI Summit - Oct 1st FREE
            </a>
          </Link>
          
          {/* Home Section */}
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Home
          </div>
          <Link href="/">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              Home
            </a>
          </Link>
          <Link href="/about">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/about') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              About CBA
            </a>
          </Link>
          
          {/* Membership Section */}
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Membership
          </div>
          <Link href="/membership-benefits">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/membership-benefits') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              Benefits
            </a>
          </Link>

          {/* Business Section */}
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Business
          </div>
          <Link href="/directory">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/directory') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              Directory
            </a>
          </Link>
          <Link href="/events">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/events') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              Events
            </a>
          </Link>
          <Link href="/marketplace">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/marketplace') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              Marketplace
            </a>
          </Link>
          
          {/* QR Scanner - Prominent for all users */}
          <Link href="/organizer-scanner">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/organizer-scanner') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              📱 QR Code Scanner
            </a>
          </Link>
          
          {/* AI Section Header */}
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            AI Services
          </div>
          <Link href="/ai-summit">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/ai-summit') 
                ? 'border-red-500 text-red-600 bg-red-100' 
                : 'border-red-300 text-red-600 hover:text-red-800 hover:bg-red-50 hover:border-red-500'
              } font-bold text-sm`}>
              🚀 AI Summit Oct 1st
            </a>
          </Link>
          <Link href="/ai-services">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/ai-services') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              AI Services
            </a>
          </Link>
          <Link href="/ai-tools">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/ai-tools') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              AI Tools
            </a>
          </Link>
          <Link href="/ai-automation">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/ai-automation') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              AI Automation
            </a>
          </Link>
          <Link href="/ai-analytics">
            <a className={`block pl-6 pr-4 py-2 border-l-4 ${
              isActive('/ai-analytics') 
                ? 'border-primary text-primary bg-neutral-100' 
                : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
              } font-medium text-sm`}>
              AI Analytics
            </a>
          </Link>
          
          {/* Admin Section */}
          {user?.isAdmin && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-t border-neutral-200 mt-2 pt-4">
                Admin Tools
              </div>
              <Link href="/admin/import">
                <a className={`block pl-6 pr-4 py-2 border-l-4 ${
                  isActive('/admin/import') 
                    ? 'border-primary text-primary bg-neutral-100' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
                  } font-medium text-sm`}>
                  📁 Data Import
                </a>
              </Link>
              <Link href="/admin/ghl">
                <a className={`block pl-6 pr-4 py-2 border-l-4 ${
                  isActive('/admin/ghl') 
                    ? 'border-primary text-primary bg-neutral-100' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
                  } font-medium text-sm`}>
                  ⚙️ GHL Admin
                </a>
              </Link>
              <Link href="/dashboard/ai-summit-schedule">
                <a className={`block pl-6 pr-4 py-2 border-l-4 ${
                  isActive('/dashboard/ai-summit-schedule') 
                    ? 'border-primary text-primary bg-neutral-100' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
                  } font-medium text-sm`}>
                  📅 AI Summit Schedule
                </a>
              </Link>
              <Link href="/admin/badge-scanner">
                <a className={`block pl-6 pr-4 py-2 border-l-4 ${
                  isActive('/admin/badge-scanner') 
                    ? 'border-primary text-primary bg-neutral-100' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
                  } font-medium text-sm`}>
                  🎫 Badge Scanner
                </a>
              </Link>
              <Link href="/admin/workshop-scanner">
                <a className={`block pl-6 pr-4 py-2 border-l-4 ${
                  isActive('/admin/workshop-scanner') 
                    ? 'border-primary text-primary bg-neutral-100' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
                  } font-medium text-sm`}>
                  📝 Workshop Scanner
                </a>
              </Link>
              <Link href="/admin/dashboard">
                <a className={`block pl-6 pr-4 py-2 border-l-4 ${
                  isActive('/admin/dashboard') 
                    ? 'border-primary text-primary bg-neutral-100' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
                  } font-medium text-sm`}>
                  🏠 Admin Dashboard
                </a>
              </Link>
              <Link href="/admin/events">
                <a className={`block pl-6 pr-4 py-2 border-l-4 ${
                  isActive('/admin/events') 
                    ? 'border-primary text-primary bg-neutral-100' 
                    : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300'
                  } font-medium text-sm`}>
                  🎯 Event Management
                </a>
              </Link>
            </>
          )}

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
                <Link href="/login">
                  <Button className="w-full flex justify-center">
                    Member Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
