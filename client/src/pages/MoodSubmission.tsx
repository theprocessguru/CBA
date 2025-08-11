import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Smile, Frown, Meh, AlertTriangle, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOOD_TYPES = {
  excited: { 
    icon: Heart, 
    color: "#ef4444", 
    label: "Excited", 
    description: "I'm really enjoying this and feeling energized!" 
  },
  engaged: { 
    icon: Smile, 
    color: "#22c55e", 
    label: "Engaged", 
    description: "I'm focused and interested in what's happening" 
  },
  neutral: { 
    icon: Meh, 
    color: "#6b7280", 
    label: "Neutral", 
    description: "I'm following along but not particularly moved" 
  },
  confused: { 
    icon: Frown, 
    color: "#f59e0b", 
    label: "Confused", 
    description: "I'm having trouble understanding or following" 
  },
  bored: { 
    icon: AlertTriangle, 
    color: "#8b5cf6", 
    label: "Bored", 
    description: "I'm not interested and feeling disengaged" 
  }
};

export default function MoodSubmission() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [intensity, setIntensity] = useState<number[]>([5]);
  const [comment, setComment] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all events for dropdown
  const { data: events = [] } = useQuery({
    queryKey: ['/api/cba-events'],
    enabled: true
  });

  // Get sessions for selected event
  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/mood/sessions', selectedEvent],
    enabled: !!selectedEvent
  });

  // Submit mood mutation
  const submitMoodMutation = useMutation({
    mutationFn: async (moodData: any) => {
      const response = await fetch('/api/mood/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moodData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit mood');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your mood has been recorded successfully.",
      });
      
      // Invalidate mood data to trigger refresh on dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/mood'] });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit your mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedMood("");
    setIntensity([5]);
    setComment("");
    setSelectedSession("");
    setIsSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent || !selectedMood) {
      toast({
        title: "Missing Information",
        description: "Please select an event and your current mood.",
        variant: "destructive",
      });
      return;
    }

    const moodData = {
      eventId: parseInt(selectedEvent),
      sessionName: selectedSession || null,
      moodType: selectedMood,
      intensity: intensity[0],
      comment: comment.trim() || null,
      isAnonymous,
    };

    submitMoodMutation.mutate(moodData);
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your mood has been recorded and will help improve this event experience.
            </p>
            <p className="text-sm text-muted-foreground">
              You can submit another mood entry in a few seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">How are you feeling?</h1>
        <p className="text-muted-foreground">
          Help us understand the event experience by sharing your current mood
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>
              Select the event you're currently attending
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event">Event *</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select the event you're attending" />
                </SelectTrigger>
                <SelectContent>
                  {(events as any[]).map((event: any) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.eventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEvent && (sessions as string[]).length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="session">Current Session (Optional)</Label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select current session if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General event</SelectItem>
                    {(sessions as string[]).map((session: string) => (
                      <SelectItem key={session} value={session}>
                        {session}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Your Current Mood *</CardTitle>
            <CardDescription>
              How are you feeling right now during this event?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(MOOD_TYPES).map(([key, type]) => {
                const Icon = type.icon;
                const isSelected = selectedMood === key;
                
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedMood(key)}
                    className={`p-4 border rounded-lg text-center transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Icon 
                      className="h-8 w-8 mx-auto mb-2" 
                      style={{ color: isSelected ? type.color : '#6b7280' }} 
                    />
                    <h3 className="font-semibold mb-1">{type.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Intensity Level */}
        {selectedMood && (
          <Card>
            <CardHeader>
              <CardTitle>Intensity Level</CardTitle>
              <CardDescription>
                How strong is this feeling? (1 = mild, 10 = very strong)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 - Mild</span>
                  <span className="font-semibold">Current: {intensity[0]}/10</span>
                  <span>10 - Very Strong</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optional Comment */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Comments (Optional)</CardTitle>
            <CardDescription>
              Share more details about your experience or suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What specifically is making you feel this way? Any suggestions?"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {comment.length}/500 characters
            </p>
          </CardContent>
        </Card>

        {/* Privacy Options */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              Choose how your feedback is recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              />
              <Label htmlFor="anonymous">
                Submit anonymously (your identity won't be recorded)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!selectedEvent || !selectedMood || submitMoodMutation.isPending}
            >
              {submitMoodMutation.isPending ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit My Mood
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Your feedback helps organizers understand and improve the event experience
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}