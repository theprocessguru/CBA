import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Store, 
  Mic, 
  Settings, 
  Heart, 
  Shield, 
  Crown,
  Plus
} from "lucide-react";

export interface ParticipantRole {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isPrimary?: boolean;
}

// Helper function to get icon for role type
const getIconForRole = (roleType: string) => {
  switch (roleType.toLowerCase()) {
    case 'attendee': return Users;
    case 'exhibitor': return Store;
    case 'speaker': return Mic;
    case 'organizer': return Settings;
    case 'volunteer': return Heart;
    case 'team': case 'team_member': return Shield;
    case 'special_guest': case 'vip': return Crown;
    default: return Users;
  }
};

// Helper function to get color for role type
const getColorForRole = (roleType: string) => {
  switch (roleType.toLowerCase()) {
    case 'attendee': return "bg-blue-100 text-blue-800";
    case 'exhibitor': return "bg-green-100 text-green-800";
    case 'speaker': return "bg-purple-100 text-purple-800";
    case 'organizer': return "bg-orange-100 text-orange-800";
    case 'volunteer': return "bg-pink-100 text-pink-800";
    case 'team': case 'team_member': return "bg-gray-100 text-gray-800";
    case 'special_guest': case 'vip': return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// Fallback static roles (used when API is unavailable)
const fallbackRoles: ParticipantRole[] = [
  {
    value: "attendee",
    label: "Attendee",
    description: "General event participant",
    icon: Users,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "exhibitor", 
    label: "Exhibitor",
    description: "Showcase products/services at booth",
    icon: Store,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "speaker",
    label: "Speaker",
    description: "Present talks or lead workshops",
    icon: Mic,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "organizer",
    label: "Organizer", 
    description: "Help coordinate and manage event",
    icon: Settings,
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "volunteer",
    label: "Volunteer",
    description: "Support event operations",
    icon: Heart,
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "team",
    label: "Team Member",
    description: "CBA staff or core team",
    icon: Shield,
    color: "bg-gray-100 text-gray-800",
  },
  {
    value: "special_guest",
    label: "Special Guest", 
    description: "VIP attendee or industry leader",
    icon: Crown,
    color: "bg-yellow-100 text-yellow-800",
  }
];

interface MultiRoleSelectorProps {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  customRole?: string;
  onCustomRoleChange?: (customRole: string) => void;
  primaryRole?: string;
  onPrimaryRoleChange?: (primaryRole: string) => void;
  maxRoles?: number;
  showPrimarySelection?: boolean;
  title?: string;
  description?: string;
}

const MultiRoleSelector = ({
  selectedRoles,
  onRolesChange,
  customRole = "",
  onCustomRoleChange,
  primaryRole = "attendee",
  onPrimaryRoleChange,
  maxRoles = 4,
  showPrimarySelection = true,
  title = "Select Your Event Roles",
  description = "Choose all roles that apply to you at this event. You can have multiple roles!"
}: MultiRoleSelectorProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    // Auto-set primary role if only one role is selected
    if (selectedRoles.length === 1 && onPrimaryRoleChange) {
      onPrimaryRoleChange(selectedRoles[0]);
    }
  }, [selectedRoles, onPrimaryRoleChange]);

  const handleRoleToggle = (roleValue: string, checked: boolean) => {
    if (checked) {
      if (selectedRoles.length < maxRoles) {
        const newRoles = [...selectedRoles, roleValue];
        onRolesChange(newRoles);
        
        // Set as primary if it's the first role
        if (newRoles.length === 1 && onPrimaryRoleChange) {
          onPrimaryRoleChange(roleValue);
        }
      }
    } else {
      const newRoles = selectedRoles.filter(role => role !== roleValue);
      onRolesChange(newRoles);
      
      // Update primary role if removed role was primary
      if (primaryRole === roleValue && newRoles.length > 0 && onPrimaryRoleChange) {
        onPrimaryRoleChange(newRoles[0]);
      }
    }
  };

  const handlePrimaryRoleChange = (roleValue: string) => {
    if (onPrimaryRoleChange) {
      onPrimaryRoleChange(roleValue);
    }
  };

  const getRoleInfo = (roleValue: string) => {
    return availableRoles.find(role => role.value === roleValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRoles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRoles.includes(role.value);
            const isPrimary = primaryRole === role.value;
            const canSelect = isSelected || selectedRoles.length < maxRoles;
            
            return (
              <div
                key={role.value}
                className={`relative border rounded-lg p-4 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : canSelect 
                      ? 'border-gray-200 hover:border-gray-300' 
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => canSelect && handleRoleToggle(role.value, !isSelected)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onChange={(checked) => canSelect && handleRoleToggle(role.value, checked)}
                    disabled={!canSelect}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-sm">{role.label}</span>
                      {isPrimary && (
                        <Badge variant="default" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{role.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Role Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Custom Role
            </Button>
          </div>
          
          {showCustomInput && (
            <div className="space-y-2">
              <Label htmlFor="customRole" className="text-sm">
                Custom Role Description
              </Label>
              <Input
                id="customRole"
                placeholder="e.g., AI Research Coordinator, Workshop Facilitator..."
                value={customRole}
                onChange={(e) => onCustomRoleChange?.(e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Selected Roles Summary */}
        {selectedRoles.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Selected Roles:</Label>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((roleValue) => {
                const role = getRoleInfo(roleValue);
                const isPrimary = primaryRole === roleValue;
                
                return (
                  <Badge
                    key={roleValue}
                    variant={isPrimary ? "default" : "secondary"}
                    className={`text-xs ${role?.color || 'bg-gray-100 text-gray-800'}`}
                  >
                    {role?.label || roleValue}
                    {isPrimary && " (Primary)"}
                  </Badge>
                );
              })}
              {customRole && (
                <Badge variant="outline" className="text-xs">
                  {customRole}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Primary Role Selection */}
        {showPrimarySelection && selectedRoles.length > 1 && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">
              Primary Role (for badge display):
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {selectedRoles.map((roleValue) => {
                const role = getRoleInfo(roleValue);
                const isPrimary = primaryRole === roleValue;
                
                return (
                  <Button
                    key={roleValue}
                    type="button"
                    variant={isPrimary ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePrimaryRoleChange(roleValue)}
                    className="text-xs justify-start"
                  >
                    {role?.icon && <role.icon className="h-3 w-3 mr-1" />}
                    {role?.label || roleValue}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {selectedRoles.length >= maxRoles && (
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            Maximum of {maxRoles} roles allowed. Remove a role to add another.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiRoleSelector;