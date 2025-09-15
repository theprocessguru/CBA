import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Target,
  Star,
  TrendingUp,
  Award
} from "lucide-react";
import { Link } from "wouter";
import { calculateProfileCompletion, type ProfileCompletionResult } from "@/lib/profileCompletion";

interface ProfileCompletionWidgetProps {
  userData: any;
  variant?: 'full' | 'compact' | 'sidebar';
  showNextSteps?: boolean;
  showSections?: boolean;
  className?: string;
  onActionClick?: (actionType: string) => void;
}

export function ProfileCompletionWidget({
  userData,
  variant = 'full',
  showNextSteps = true,
  showSections = true,
  className = "",
  onActionClick
}: ProfileCompletionWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completion: ProfileCompletionResult = calculateProfileCompletion(userData);
  
  const { overall, sections, nextRecommendedActions, completionBenefits } = completion;
  
  // Get progress color based on completion percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-500";
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-gray-400";
  };

  // Get completion status icon
  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <Award className="h-5 w-5 text-emerald-600" />;
    if (percentage >= 75) return <Star className="h-5 w-5 text-green-600" />;
    if (percentage >= 50) return <TrendingUp className="h-5 w-5 text-blue-600" />;
    return <Target className="h-5 w-5 text-orange-600" />;
  };

  // Sidebar variant - compact display
  if (variant === 'sidebar') {
    return (
      <div className={`p-3 ${className}`} data-testid="widget-profile-completion-sidebar">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700" data-testid="text-completion-title">
            Profile Complete
          </span>
          <span className="text-sm font-bold text-gray-900" data-testid="text-completion-percentage">
            {overall.percentage}%
          </span>
        </div>
        <Progress 
          value={overall.percentage} 
          className="h-2 mb-2"
          data-testid="progress-completion" 
        />
        {overall.percentage < 100 && (
          <Link href="/profile">
            <a className="text-xs text-primary hover:underline" data-testid="link-complete-profile">
              Complete your profile →
            </a>
          </Link>
        )}
      </div>
    );
  }

  // Compact variant - single row with basic info
  if (variant === 'compact') {
    return (
      <Card className={`${className}`} data-testid="widget-profile-completion-compact">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {getStatusIcon(overall.percentage)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium" data-testid="text-milestone-title">
                  {overall.milestone.title}
                </h3>
                <Badge variant="secondary" data-testid="badge-completion-percentage">
                  {overall.percentage}% Complete
                </Badge>
              </div>
              <Progress 
                value={overall.percentage} 
                className="h-2"
                data-testid="progress-completion"
              />
            </div>
            {overall.percentage < 100 && (
              <Link href="/profile">
                <Button variant="outline" size="sm" data-testid="button-complete-profile">
                  <ArrowRight className="h-4 w-4 ml-1" />
                  Complete
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant - comprehensive display
  return (
    <Card className={`${className}`} data-testid="widget-profile-completion-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(overall.percentage)}
            <div>
              <CardTitle className="text-lg" data-testid="text-milestone-title">
                {overall.milestone.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1" data-testid="text-milestone-message">
                {overall.milestone.message}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900" data-testid="text-completion-percentage">
              {overall.percentage}%
            </div>
            <div className="text-sm text-gray-500" data-testid="text-completion-fraction">
              {overall.completed} of {overall.total} completed
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={overall.percentage} 
            className="h-3"
            data-testid="progress-completion"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Getting Started</span>
            <span>Profile Expert</span>
          </div>
        </div>

        {/* Next Steps */}
        {showNextSteps && nextRecommendedActions.length > 0 && overall.percentage < 100 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center" data-testid="text-next-steps-title">
              <Clock className="h-4 w-4 mr-2" />
              Next Steps to Improve Your Profile
            </h4>
            <ul className="space-y-1">
              {nextRecommendedActions.slice(0, 3).map((action, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start" data-testid={`text-next-step-${index}`}>
                  <ArrowRight className="h-3 w-3 mt-0.5 mr-2 flex-shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
            <Link href="/profile">
              <Button size="sm" className="mt-3" data-testid="button-update-profile">
                Update Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Completion Benefits */}
        {completionBenefits.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center" data-testid="text-benefits-title">
              <Star className="h-4 w-4 mr-2" />
              Benefits of a Complete Profile
            </h4>
            <ul className="space-y-1">
              {completionBenefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="text-sm text-green-800 flex items-start" data-testid={`text-benefit-${index}`}>
                  <CheckCircle className="h-3 w-3 mt-0.5 mr-2 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Section Progress */}
        {showSections && sections.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                data-testid="button-toggle-sections"
              >
                <span>View Section Details</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {sections.map((section) => (
                <div key={section.id} className="border rounded-lg p-3" data-testid={`section-${section.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-gray-900" data-testid={`text-section-${section.id}-name`}>
                        {section.name}
                      </h5>
                      <p className="text-xs text-gray-600" data-testid={`text-section-${section.id}-description`}>
                        {section.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {section.isComplete ? (
                        <CheckCircle className="h-4 w-4 text-green-600" data-testid={`icon-section-${section.id}-complete`} />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-600" data-testid={`icon-section-${section.id}-incomplete`} />
                      )}
                      <span className="text-sm font-medium" data-testid={`text-section-${section.id}-percentage`}>
                        {section.percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={section.percentage} 
                    className="h-2 mb-2"
                    data-testid={`progress-section-${section.id}`}
                  />
                  <div className="text-xs text-gray-500" data-testid={`text-section-${section.id}-fraction`}>
                    {section.completed} of {section.total} completed
                  </div>
                  
                  {/* Section-specific next steps */}
                  {section.nextSteps.length > 0 && !section.isComplete && (
                    <div className="mt-2 space-y-1">
                      {section.nextSteps.slice(0, 2).map((step, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-start" data-testid={`text-section-${section.id}-step-${index}`}>
                          <ArrowRight className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                          {step}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Perfect Profile Celebration */}
        {overall.percentage === 100 && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 text-center">
            <Award className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-emerald-900 mb-1" data-testid="text-perfect-profile-title">
              🎉 Perfect Profile!
            </h4>
            <p className="text-sm text-emerald-800" data-testid="text-perfect-profile-message">
              Your complete profile maximizes your networking potential and helps others connect with you.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}