import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Users, Store, Tag, User, Building, Crown, QrCode } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BottomNavigation = () => {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/directory", icon: Users, label: "Directory" },
    { href: "/marketplace", icon: Store, label: "Marketplace" },
    { href: "/offers", icon: Tag, label: "Offers" },
    { href: "/membership", icon: Crown, label: "Join" },
  ];

  const dashboardItem = { href: "/dashboard", icon: Building, label: "Dashboard" };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex justify-around py-1 px-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} asChild>
            <button
              className={`flex flex-col items-center h-auto py-2 px-2 min-w-0 rounded-md transition-colors ${
                isActive(item.href) 
                  ? "text-primary bg-primary/10" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <item.icon size={18} className="mb-1" />
              <span className="text-xs leading-tight">{item.label}</span>
            </button>
          </Link>
        ))}
        
        {isAuthenticated && (
          <>
            <Link href="/my-qr-code" asChild>
              <button
                className={`flex flex-col items-center h-auto py-2 px-2 min-w-0 rounded-md transition-colors ${
                  isActive("/my-qr-code") 
                    ? "text-primary bg-primary/10" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <QrCode size={18} className="mb-1" />
                <span className="text-xs leading-tight">QR Code</span>
              </button>
            </Link>
            <Link href="/my-profile" asChild>
              <button
                className={`flex flex-col items-center h-auto py-2 px-2 min-w-0 rounded-md transition-colors ${
                  isActive("/my-profile") 
                    ? "text-primary bg-primary/10" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <User size={18} className="mb-1" />
                <span className="text-xs leading-tight">Profile</span>
              </button>
            </Link>
            <Link href={dashboardItem.href} asChild>
              <button
                className={`flex flex-col items-center h-auto py-2 px-2 min-w-0 rounded-md transition-colors ${
                  isActive(dashboardItem.href) 
                    ? "text-primary bg-primary/10" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <dashboardItem.icon size={18} className="mb-1" />
                <span className="text-xs leading-tight">{dashboardItem.label}</span>
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default BottomNavigation;