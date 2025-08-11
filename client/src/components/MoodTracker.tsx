import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Smile,
  Frown,
  Heart,
  Zap,
  Brain,
  Target,
  HelpCircle,
  Coffee,
  AlertTriangle,
  Meh,
} from "lucide-react";

interface MoodTrackerProps {
  eventId: number;
  sessionName?: string;
  className?: string;
  compact?: boolean;
}

const moodTypes = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'bg-yellow-500', description: 'Feeling joy and positivity' },
  { id: 'excited', label: 'Excited', icon: Zap, color: 'bg-orange-500', description: 'Energetic and enthusiastic' },
  { id: 'inspired', label: 'Inspired', icon: Heart, color: 'bg-pink-500', description: 'Motivated and creative' },
  { id: 'focused', label: 'Focused', icon: Target, color: 'bg-blue-500', description: 'Concentrated and attentive' },
  { id: 'confused', label: 'Confused', icon: HelpCircle, color: 'bg-purple-500', description: 'Need clarification' },
  { id: 'bored', label: 'Bored', icon: Coffee, color: 'bg-gray-500', description: 'Uninterested or tired' },
  { id: 'frustrated', label: 'Frustrated', icon: AlertTriangle, color: 'bg-red-500', description: 'Finding it difficult' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'bg-slate-500', description: 'Neither positive nor negative' },
];

export function MoodTracker({ eventId, sessionName, className = "", compact = false }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [intensity, setIntensity] = useState<number[]>([5]);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitMoodMutation = useMutation({
    mutationFn: async (moodData: any) => {
      return await apiRequest('POST', `/api/events/${eventId}/mood`, moodData);
    },
    onSuccess: () => {
      toast({
        title: "Mood Submitted",
        description: "Thank you for sharing your feedback!",
      });
      
      // Reset form
      setSelectedMood("");
      setIntensity([5]);
      setComment("");
      setIsSubmitting(false);
      
      // Invalidate and refetch mood data
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/mood`] });
    },
    onError: (error: any) => {
      console.error("Error submitting mood:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your mood. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Select a Mood",
        description: "Please select how you're feeling first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const moodData = {
      moodType: selectedMood,
      intensity: intensity[0],
      comment: comment.trim() || null,
      sessionName: sessionName || null,
      userId: isAuthenticated && !isAnonymous ? user?.id : null,
      isAnonymous,
    };

    submitMoodMutation.mutate(moodData);
  };

  const selectedMoodData = moodTypes.find(mood => mood.id === selectedMood);

  if (compact) {
    return (
      <Card className={`${className} border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-sm">Quick Mood Check</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            {moodTypes.slice(0, 4).map((mood) => {
              const IconComponent = mood.icon;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedMood === mood.id
                      ? `${mood.color} text-white border-white shadow-lg`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mx-auto" />
                  <span className="text-xs mt-1 block">{mood.label}</span>
                </button>
              );
            })}
          </div>

          {selectedMood && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Intensity (1-10): {intensity[0]}
                </label>
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="sm"
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Brain className="h-6 w-6" />
          How are you feeling right now?
        </CardTitle>
        {sessionName && (
          <Badge variant="outline" className="w-fit">
            Session: {sessionName}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Choose your mood</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {moodTypes.map((mood) => {
              const IconComponent = mood.icon;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedMood === mood.id
                      ? `${mood.color} text-white border-white shadow-lg`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-6 w-6 mx-auto mb-2" />
                  <span className="font-medium block">{mood.label}</span>
                  <span className="text-xs opacity-75 block mt-1">
                    {mood.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedMood && (
          <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              {selectedMoodData && <selectedMoodData.icon className="h-5 w-5" />}
              <span className="font-medium">
                You selected: {selectedMoodData?.label}
              </span>
            </div>

            {/* Intensity Slider */}
            <div>
              <label className="font-medium text-gray-700 mb-2 block">
                Intensity Level: {intensity[0]}/10
              </label>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Strong</span>
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="font-medium text-gray-700 mb-2 block">
                Additional Comments (Optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about how you're feeling..."
                className="w-full"
                rows={3}
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Submit anonymously
              </label>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? "Submitting..." : "Share Your Mood"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}