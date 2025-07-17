import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TrackInteractionParams {
  contentType: string;
  contentId: number;
  interactionType: string;
  metadata?: string;
}

export function useInteractionTracking() {
  const trackInteractionMutation = useMutation({
    mutationFn: (params: TrackInteractionParams) => {
      return apiRequest("POST", "/api/interactions", params);
    },
    onError: (error) => {
      // Silently fail for analytics - don't disrupt user experience
      console.warn("Failed to track interaction:", error);
    },
    retry: false, // Don't retry failed tracking requests
  });

  const trackInteraction = (params: TrackInteractionParams) => {
    trackInteractionMutation.mutate(params);
  };

  const trackView = (contentType: string, contentId: number, metadata?: any) => {
    // Add debounce to prevent excessive calls
    const key = `${contentType}-${contentId}-view`;
    const lastCall = sessionStorage.getItem(key);
    const now = Date.now();
    
    if (lastCall && now - parseInt(lastCall) < 60000) { // 1 minute cooldown
      return;
    }
    
    sessionStorage.setItem(key, now.toString());
    trackInteraction({
      contentType,
      contentId,
      interactionType: 'view',
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
  };

  const trackClick = (contentType: string, contentId: number, metadata?: any) => {
    trackInteraction({
      contentType,
      contentId,
      interactionType: 'click',
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });
  };

  const trackContact = (contentType: string, contentId: number, contactMethod: string) => {
    // Add debounce to prevent excessive calls
    const key = `${contentType}-${contentId}-contact-${contactMethod}`;
    const lastCall = sessionStorage.getItem(key);
    const now = Date.now();
    
    if (lastCall && now - parseInt(lastCall) < 5000) { // 5 second cooldown
      return;
    }
    
    sessionStorage.setItem(key, now.toString());
    trackInteraction({
      contentType,
      contentId,
      interactionType: 'contact',
      metadata: JSON.stringify({ method: contactMethod }),
    });
  };

  return {
    trackView,
    trackClick,
    trackContact,
    trackInteraction,
  };
}