'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Wand2, 
  Users, 
  Target, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

// Zod schema for form validation
const scenarioSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  stakeholders: z.string().min(10, 'Please describe the stakeholders involved'),
  objectives: z.string().min(10, 'Please describe your objectives'),
  constraints: z.string().min(5, 'Please describe any constraints or challenges'),
  timeline: z.string().min(5, 'Please provide timeline information'),
  context: z.string().min(10, 'Please provide additional context'),
  engine: z.literal('crewai')
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

interface ScenarioBuilderProps {
  onSubmit: (data: ScenarioFormData) => Promise<void>;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Wand2, description: 'Title and description' },
  { id: 2, title: 'Stakeholders', icon: Users, description: 'Who is involved?' },
  { id: 3, title: 'Objectives', icon: Target, description: 'What do you want?' },
  { id: 4, title: 'Constraints', icon: AlertTriangle, description: 'Challenges and limits' },
  { id: 5, title: 'Timeline', icon: Clock, description: 'When and how long?' },
  { id: 6, title: 'Review', icon: CheckCircle, description: 'Final review' }
];

export function ScenarioBuilder({ onSubmit, isLoading = false }: ScenarioBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [categoryPrediction, setCategoryPrediction] = useState<string>('');

  const form = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      title: '',
      description: '',
      stakeholders: '',
      objectives: '',
      constraints: '',
      timeline: '',
      context: '',
      engine: 'crewai'
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, watch, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Calculate completeness score
  const calculateCompleteness = useCallback(() => {
    const fields = ['title', 'description', 'stakeholders', 'objectives', 'constraints', 'timeline'];
    const completed = fields.filter(field => {
      const value = watchedValues[field as keyof ScenarioFormData];
      return typeof value === 'string' && value.trim().length > 0;
    }).length;
    return Math.round((completed / fields.length) * 100);
  }, [watchedValues]);

  // Predict category based on content
  const predictCategory = useCallback(() => {
    const text = `${watchedValues.description} ${watchedValues.constraints}`.toLowerCase();
    
    if (text.includes('deadline') || text.includes('urgent') || text.includes('changing')) {
      return 'Chaotic';
    } else if (text.includes('conflict') || text.includes('aggressive') || text.includes('dispute')) {
      return 'Adversarial';
    } else if (text.includes('partnership') || text.includes('collaboration') || text.includes('mutual')) {
      return 'Cooperative';
    } else {
      return 'Stable';
    }
  }, [watchedValues]);

  // Update scores when form changes
  React.useEffect(() => {
    setCompletenessScore(calculateCompleteness());
    setCategoryPrediction(predictCategory());
  }, [calculateCompleteness, predictCategory]);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = async (data: ScenarioFormData) => {
    const scenarioText = `
Title: ${data.title}

Description: ${data.description}

Stakeholders: ${data.stakeholders}

Objectives: ${data.objectives}

Constraints: ${data.constraints}

Timeline: ${data.timeline}

Additional Context: ${data.context}
    `.trim();

    await onSubmit({
      ...data,
      description: scenarioText
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Scenario Title</Label>
              <Input
                id="title"
                placeholder="e.g., Salary Negotiation with Manager"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Scenario Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the overall situation, what's at stake, and the background context..."
                rows={6}
                {...register('description')}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="stakeholders">Stakeholders & Relationships</Label>
              <Textarea
                id="stakeholders"
                placeholder="Who is involved? What are their roles, interests, and relationships to each other?"
                rows={6}
                {...register('stakeholders')}
                className={errors.stakeholders ? 'border-red-500' : ''}
              />
              {errors.stakeholders && (
                <p className="text-sm text-red-600">{errors.stakeholders.message}</p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Tip</span>
              </div>
              <p className="text-sm text-blue-800">
                Consider power dynamics, decision-making authority, and how each party&apos;s success is measured.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="objectives">Your Objectives & Desired Outcomes</Label>
              <Textarea
                id="objectives"
                placeholder="What do you want to achieve? What would success look like? What are your priorities?"
                rows={6}
                {...register('objectives')}
                className={errors.objectives ? 'border-red-500' : ''}
              />
              {errors.objectives && (
                <p className="text-sm text-red-600">{errors.objectives.message}</p>
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-medium text-green-900">Tip</span>
              </div>
              <p className="text-sm text-green-800">
                Think about both must-haves and nice-to-haves. What&apos;s your walk-away point?
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="constraints">Constraints & Challenges</Label>
              <Textarea
                id="constraints"
                placeholder="What limitations, challenges, or obstacles do you face? What could go wrong?"
                rows={6}
                {...register('constraints')}
                className={errors.constraints ? 'border-red-500' : ''}
              />
              {errors.constraints && (
                <p className="text-sm text-red-600">{errors.constraints.message}</p>
              )}
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                <span className="font-medium text-orange-900">Tip</span>
              </div>
              <p className="text-sm text-orange-800">
                Consider budget limits, time pressures, regulatory requirements, or relationship constraints.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline & Context</Label>
              <Textarea
                id="timeline"
                placeholder="When does this need to happen? How much time do you have? Any deadlines or time pressures?"
                rows={6}
                {...register('timeline')}
                className={errors.timeline ? 'border-red-500' : ''}
              />
              {errors.timeline && (
                <p className="text-sm text-red-600">{errors.timeline.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Additional Context</Label>
              <Textarea
                id="context"
                placeholder="Any other relevant information, history, or context that might be important?"
                rows={4}
                {...register('context')}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completeness Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Progress value={completenessScore} className="flex-1" />
                    <span className="font-bold text-lg">{completenessScore}%</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {completenessScore >= 80 ? 'Great! Your scenario is comprehensive.' :
                     completenessScore >= 60 ? 'Good start. Consider adding more detail.' :
                     'Add more information for better results.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Predicted Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      categoryPrediction === 'Chaotic' ? 'bg-red-500' :
                      categoryPrediction === 'Adversarial' ? 'bg-orange-500' :
                      categoryPrediction === 'Cooperative' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="font-medium">{categoryPrediction || 'Analyzing...'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on your scenario content
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Label htmlFor="engine">AI Engine</Label>
              <div className="p-3 bg-blue-50 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-blue-900">CrewAI</span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Primary</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Advanced multi-agent system with native orchestration
                </p>
              </div>
            </div>

            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Ready to Generate Your Map</h3>
                <p className="text-sm text-gray-700">
                  Your scenario will be processed to create a strategic negotiation map with leverage analysis,
                  potential challenges, and recommended approaches.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2
                ${currentStep === step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : currentStep > step.id 
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }
              `}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`
                  absolute w-full h-0.5 mt-5 -z-10
                  ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}
                `} style={{ left: '50%', width: `${100 / (STEPS.length - 1)}%` }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
          <p className="text-gray-600">{STEPS[currentStep - 1]?.description}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Map
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}