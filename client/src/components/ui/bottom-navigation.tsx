import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Users, Store, Tag, User, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BottomNavigation = () => {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/directory", icon: Users, label: "Directory" },
    { href: "/marketplace", icon: Store, label: "Marketplace" },
    { href: "/offers", icon: Tag, label: "Offers" },
  ];

  const dashboardItem = { href: "/dashboard", icon: Building, label: "Dashboard" };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center h-auto py-2 px-3 ${
                isActive(item.href) 
                  ? "text-primary bg-primary/5" 
                  : "text-gray-600"
              }`}
            >
              <item.icon size={20} className="mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          </Link>
        ))}
        
        {isAuthenticated && (
          <Link href={dashboardItem.href}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center h-auto py-2 px-3 ${
                isActive(dashboardItem.href) 
                  ? "text-primary bg-primary/5" 
                  : "text-gray-600"
              }`}
            >
              <dashboardItem.icon size={20} className="mb-1" />
              <span className="text-xs">{dashboardItem.label}</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BottomNavigation;