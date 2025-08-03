import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Store, 
  Mic, 
  Settings, 
  Heart, 
  Shield, 
  Crown
} from "lucide-react";

const roleIcons = {
  attendee: Users,
  exhibitor: Store,
  speaker: Mic,
  organizer: Settings,
  volunteer: Heart,
  team: Shield,
  special_guest: Crown,
};

const roleColors = {
  attendee: "bg-blue-100 text-blue-800",
  exhibitor: "bg-green-100 text-green-800", 
  speaker: "bg-purple-100 text-purple-800",
  organizer: "bg-orange-100 text-orange-800",
  volunteer: "bg-pink-100 text-pink-800",
  team: "bg-gray-100 text-gray-800",
  special_guest: "bg-yellow-100 text-yellow-800",
};

const roleLabels = {
  attendee: "Attendee",
  exhibitor: "Exhibitor",
  speaker: "Speaker", 
  organizer: "Organizer",
  volunteer: "Volunteer",
  team: "Team",
  special_guest: "Special Guest",
};

interface AttendeeRoleDisplayProps {
  participantRoles: string[] | string;
  primaryRole?: string;
  customRole?: string;
  size?: "sm" | "md" | "lg";
  showIcons?: boolean;
  maxDisplay?: number;
}

const AttendeeRoleDisplay = ({
  participantRoles,
  primaryRole,
  customRole,
  size = "md",
  showIcons = true,
  maxDisplay = 3
}: AttendeeRoleDisplayProps) => {
  // Handle both JSON string and array formats
  let roles: string[];
  if (typeof participantRoles === 'string') {
    try {
      roles = JSON.parse(participantRoles);
    } catch {
      roles = [participantRoles];
    }
  } else {
    roles = Array.isArray(participantRoles) ? participantRoles : [participantRoles || 'attendee'];
  }

  // Ensure primaryRole is first if specified
  if (primaryRole && roles.includes(primaryRole)) {
    roles = [primaryRole, ...roles.filter(r => r !== primaryRole)];
  }

  // Limit displayed roles
  const displayRoles = roles.slice(0, maxDisplay);
  const hasMore = roles.length > maxDisplay;

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "text-xs px-2 py-1";
      case "lg": return "text-sm px-3 py-1.5";
      default: return "text-xs px-2.5 py-1";
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {displayRoles.map((role, index) => {
        const Icon = roleIcons[role as keyof typeof roleIcons] || Users;
        const color = roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800";
        const label = roleLabels[role as keyof typeof roleLabels] || role;
        const isPrimary = role === primaryRole;

        return (
          <Badge
            key={role}
            variant={isPrimary ? "default" : "secondary"}
            className={`${getSizeClasses()} ${isPrimary ? '' : color} flex items-center gap-1`}
          >
            {showIcons && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
            {label}
            {isPrimary && roles.length > 1 && (
              <span className="text-xs opacity-75">(Primary)</span>
            )}
          </Badge>
        );
      })}
      
      {hasMore && (
        <Badge variant="outline" className={`${getSizeClasses()} text-muted-foreground`}>
          +{roles.length - maxDisplay} more
        </Badge>
      )}
      
      {customRole && (
        <Badge variant="outline" className={`${getSizeClasses()} border-dashed`}>
          {customRole}
        </Badge>
      )}
    </div>
  );
};

export default AttendeeRoleDisplay;