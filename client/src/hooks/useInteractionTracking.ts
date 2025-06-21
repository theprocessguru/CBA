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
  });

  const trackInteraction = (params: TrackInteractionParams) => {
    trackInteractionMutation.mutate(params);
  };

  const trackView = (contentType: string, contentId: number, metadata?: any) => {
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