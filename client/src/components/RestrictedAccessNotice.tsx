import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, LockIcon } from "lucide-react";
import { hasRestrictedAccess, getRestrictedAccessMessage, getRestrictedFeatures } from "@/lib/accessControl";

interface RestrictedAccessNoticeProps {
  participantType?: string | null;
  feature?: string;
  showDetails?: boolean;
}

export function RestrictedAccessNotice({ 
  participantType, 
  feature,
  showDetails = true 
}: RestrictedAccessNoticeProps) {
  if (!participantType || !hasRestrictedAccess(participantType)) {
    return null;
  }

  const message = getRestrictedAccessMessage(participantType);
  const restrictedFeatures = getRestrictedFeatures(participantType);

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <InfoIcon className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Limited Access Account</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-orange-700">{message}</p>
        
        {showDetails && restrictedFeatures.length > 0 && (
          <div className="mt-3">
            <p className="font-medium text-orange-800 mb-2">Restricted Features:</p>
            <ul className="list-disc list-inside text-sm text-orange-600 space-y-1">
              {restrictedFeatures.map((feat) => (
                <li key={feat}>{feat}</li>
              ))}
            </ul>
          </div>
        )}
        
        {feature && (
          <div className="mt-3 p-3 bg-orange-100 rounded-md">
            <div className="flex items-center gap-2">
              <LockIcon className="h-4 w-4 text-orange-700" />
              <span className="text-sm font-medium text-orange-800">
                You cannot access: {feature}
              </span>
            </div>
          </div>
        )}
        
        <p className="mt-3 text-sm text-orange-600">
          Need full access? Please contact support at support@croydonba.org.uk
        </p>
      </AlertDescription>
    </Alert>
  );
}