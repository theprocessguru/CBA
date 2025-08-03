import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { User, Crown, Users, Mic, Hand, Shield, Star } from "lucide-react";

interface ParticipantTypeSelectorProps {
  value: string;
  customRole?: string;
  onValueChange: (type: string, customRole?: string) => void;
  label?: string;
  required?: boolean;
}

const participantTypes = [
  { value: 'attendee', label: 'General Attendee', icon: User, description: 'Regular event participant' },
  { value: 'exhibitor', label: 'Exhibitor', icon: Users, description: 'Company/organization exhibiting' },
  { value: 'speaker', label: 'Speaker/Presenter', icon: Mic, description: 'Presenting or speaking at event' },
  { value: 'volunteer', label: 'Volunteer', icon: Hand, description: 'Helping with event operations' },
  { value: 'team', label: 'Event Team', icon: Shield, description: 'Official event staff/organizer' },
  { value: 'special_guest', label: 'Special Guest', icon: Crown, description: 'VIP guest or honored attendee' },
  { value: 'other', label: 'Other', icon: Star, description: 'Custom role - specify below' }
];

export function ParticipantTypeSelector({ 
  value, 
  customRole = "", 
  onValueChange, 
  label = "Participant Type",
  required = false 
}: ParticipantTypeSelectorProps) {
  const [showCustomRole, setShowCustomRole] = useState(value === 'other');

  const handleTypeChange = (newType: string) => {
    setShowCustomRole(newType === 'other');
    if (newType === 'other') {
      onValueChange(newType, customRole);
    } else {
      onValueChange(newType, undefined);
    }
  };

  const handleCustomRoleChange = (newCustomRole: string) => {
    onValueChange('other', newCustomRole);
  };

  const selectedType = participantTypes.find(type => type.value === value);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Select value={value} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your role at the event" />
        </SelectTrigger>
        <SelectContent>
          {participantTypes.map((type) => {
            const Icon = type.icon;
            return (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {showCustomRole && (
        <div className="space-y-2">
          <Label htmlFor="custom-role" className="text-sm font-medium">
            Specify Your Role <span className="text-red-500">*</span>
          </Label>
          <Input
            id="custom-role"
            value={customRole}
            onChange={(e) => handleCustomRoleChange(e.target.value)}
            placeholder="e.g., Media Representative, Investor, Industry Expert, Government Official..."
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Please specify your role or title for proper badge identification
          </p>
        </div>
      )}

      {selectedType && value !== 'other' && (
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>{selectedType.label}:</strong> {selectedType.description}
          </p>
        </div>
      )}
    </div>
  );
}