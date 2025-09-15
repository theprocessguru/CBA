import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RoleField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'number';
  placeholder?: string;
  options?: string[] | { value: string; label: string }[];
  required?: boolean;
  description?: string;
}

interface RoleSectionProps {
  roleName: string;
  roleDisplayName: string;
  roleIcon: string;
  roleColor: string;
  roleData: Record<string, any>;
  fields: RoleField[];
  onSave: (roleName: string, data: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function RoleSection({
  roleName,
  roleDisplayName,
  roleIcon,
  roleColor,
  roleData,
  fields,
  onSave,
  isSaving = false,
  isOpen = false,
  onToggle
}: RoleSectionProps) {
  const [formData, setFormData] = useState(roleData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const updateField = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name] === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCompletion = (): number => {
    const totalFields = fields.length;
    const completedFields = fields.filter(field => 
      formData[field.name] && formData[field.name] !== ''
    ).length;
    
    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSave(roleName, formData);
      toast({
        title: "Role Profile Updated",
        description: `Your ${roleDisplayName} profile has been saved successfully`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save role profile",
        variant: "destructive",
      });
    }
  };

  const renderField = (field: RoleField) => {
    const fieldId = `${roleName}-${field.name}`;
    const hasError = !!errors[field.name];

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={fieldId}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => updateField(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              data-testid={`input-${fieldId}`}
            />
            {field.description && (
              <p className="text-xs text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors[field.name]}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={fieldId}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => updateField(field.name, e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              data-testid={`textarea-${fieldId}`}
            />
            {field.description && (
              <p className="text-xs text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors[field.name]}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={fieldId}
              value={formData[field.name] || ''}
              onChange={(e) => updateField(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              data-testid={`select-${fieldId}`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
            {field.description && (
              <p className="text-xs text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors[field.name]}
              </p>
            )}
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                const isSelected = formData[field.name]?.includes(value) || false;
                
                return (
                  <label key={value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentValues = formData[field.name] || [];
                        if (e.target.checked) {
                          updateField(field.name, [...currentValues, value]);
                        } else {
                          updateField(field.name, currentValues.filter((v: string) => v !== value));
                        }
                      }}
                      className="rounded"
                      data-testid={`checkbox-${fieldId}-${value}`}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                );
              })}
            </div>
            {field.description && (
              <p className="text-xs text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors[field.name]}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData[field.name] || false}
                onChange={(e) => updateField(field.name, e.target.checked)}
                className="rounded"
                data-testid={`checkbox-${fieldId}`}
              />
              <span className="text-sm font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
            {field.description && (
              <p className="text-xs text-gray-600 ml-6">{field.description}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={fieldId}
              type="date"
              value={formData[field.name] || ''}
              onChange={(e) => updateField(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              data-testid={`date-${fieldId}`}
            />
            {field.description && (
              <p className="text-xs text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors[field.name]}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const completion = calculateCompletion();

  return (
    <Card className="w-full" data-testid={`role-section-${roleName}`}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{roleIcon}</span>
                <div>
                  <CardTitle className="text-lg">{roleDisplayName}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant="secondary" 
                      className={`${roleColor} text-xs`}
                    >
                      {completion}% complete
                    </Badge>
                    {completion > 0 && (
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map(renderField)}
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2"
                data-testid={`button-save-${roleName}`}
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Role Profile'}</span>
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}