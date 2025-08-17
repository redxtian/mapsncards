'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Edit3, Save, X } from 'lucide-react';

interface CardStepsViewerProps {
  steps: string[];
  cardName: string;
  isEditable?: boolean;
  onStepsUpdate?: (steps: string[], placeholders: Record<string, string>) => void;
}

interface PlaceholderInfo {
  variable: string;
  value: string;
  step: number;
}

export function CardStepsViewer({ 
  steps, 
  cardName, 
  isEditable = true,
  onStepsUpdate 
}: CardStepsViewerProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({});
  const [renderedSteps, setRenderedSteps] = useState(steps);

  // Extract placeholders from steps
  const extractPlaceholders = (stepList: string[]): PlaceholderInfo[] => {
    const found: PlaceholderInfo[] = [];
    stepList.forEach((step, stepIndex) => {
      const matches = step.match(/\[([^\]]+)\]/g);
      if (matches) {
        matches.forEach(match => {
          const variable = match.slice(1, -1); // Remove brackets
          if (!found.some(p => p.variable === variable)) {
            found.push({
              variable,
              value: placeholders[variable] || '',
              step: stepIndex + 1
            });
          }
        });
      }
    });
    return found;
  };

  const allPlaceholders = extractPlaceholders(renderedSteps);

  // Replace placeholders in steps with user values
  const getStepWithPlaceholders = (step: string): string => {
    let processedStep = step;
    Object.entries(placeholders).forEach(([variable, value]) => {
      if (value.trim()) {
        processedStep = processedStep.replace(
          new RegExp(`\\[${variable}\\]`, 'g'),
          `"${value}"`
        );
      }
    });
    return processedStep;
  };

  const handlePlaceholderChange = (variable: string, value: string) => {
    const updatedPlaceholders = { ...placeholders, [variable]: value };
    setPlaceholders(updatedPlaceholders);
    
    if (onStepsUpdate) {
      onStepsUpdate(renderedSteps, updatedPlaceholders);
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const saveChanges = () => {
    setIsEditing(false);
    if (onStepsUpdate) {
      onStepsUpdate(renderedSteps, placeholders);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setRenderedSteps(steps);
    setPlaceholders({});
  };

  const completionPercentage = Math.round((completedSteps.length / renderedSteps.length) * 100);

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Execution Steps: {cardName}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completionPercentage}% Complete
              </Badge>
              {isEditable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => isEditing ? saveChanges() : setIsEditing(true)}
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </Button>
              )}
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Placeholders section */}
      {allPlaceholders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customize Your Strategy</CardTitle>
            <p className="text-sm text-gray-600">
              Fill in these details to personalize your negotiation approach:
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {allPlaceholders.map(({ variable, step }) => (
              <div key={variable} className="space-y-1">
                <Label htmlFor={variable} className="text-sm font-medium">
                  {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  <span className="text-xs text-gray-500 ml-1">(Step {step})</span>
                </Label>
                <Input
                  id={variable}
                  placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                  value={placeholders[variable] || ''}
                  onChange={(e) => handlePlaceholderChange(variable, e.target.value)}
                  className="text-sm"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Steps execution */}
      <div className="space-y-3">
        {renderedSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const processedStep = getStepWithPlaceholders(step);
          const hasUnfilledPlaceholders = /\[[^\]]+\]/.test(processedStep);
          
          return (
            <Card 
              key={index} 
              className={`transition-all duration-200 ${
                isCompleted ? 'border-green-500 bg-green-50' : 
                hasUnfilledPlaceholders ? 'border-orange-200 bg-orange-50' : 
                'border-gray-200'
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleStepComplete(index)}
                    className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
                    disabled={hasUnfilledPlaceholders}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">
                        Step {index + 1}
                      </span>
                      {hasUnfilledPlaceholders && (
                        <Badge variant="outline" className="text-xs">
                          Needs customization
                        </Badge>
                      )}
                    </div>
                    
                    <p className={`text-sm ${
                      isCompleted ? 'text-green-800' : 
                      hasUnfilledPlaceholders ? 'text-orange-800' : 
                      'text-gray-700'
                    }`}>
                      {processedStep}
                    </p>
                    
                    {hasUnfilledPlaceholders && (
                      <p className="text-xs text-orange-600 mt-1">
                        Fill in the details above to complete this step
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <div className="text-sm">
              <span className="font-medium">Progress:</span> {completedSteps.length} of {renderedSteps.length} steps completed
            </div>
            {completionPercentage === 100 && (
              <Badge className="bg-green-600">
                Strategy Ready!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}