import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Menu } from "lucide-react";
import { Link } from "wouter";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onMenuClick?: () => void;
  children?: React.ReactNode;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = true, 
  showHomeButton = true,
  onMenuClick,
  children 
}: PageHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => window.history.back()}
                className="flex-shrink-0"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            {showHomeButton && (
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Home size={20} />
                </Button>
              </Link>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {children}
          {onMenuClick && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onMenuClick}
            >
              <Menu size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};