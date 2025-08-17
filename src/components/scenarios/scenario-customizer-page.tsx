'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ScenarioTemplate } from '@/types/scenario';
import { getScenario, generateMapFromTemplate } from '@/lib/api/scenarios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';

interface FormData {
  stakeholders: string[];
  objectives: string[];
  constraints: string[];
  timeline: string;
  context: string;
  additional_requirements?: string;
}

export default function ScenarioCustomizerPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.id as string;

  const [scenario, setScenario] = useState<ScenarioTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    stakeholders: [],
    objectives: [],
    constraints: [],
    timeline: '',
    context: '',
    additional_requirements: ''
  });
  const [error, setError] = useState<string | null>(null);

  const loadScenario = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getScenario(scenarioId);
      const template = response.scenario;
      if (!template) {
        throw new Error('Scenario not found');
      }
      setScenario(template);
      
      // Pre-populate form with template data
      setFormData({
        stakeholders: template.template_data.stakeholders_template ? [template.template_data.stakeholders_template] : [],
        objectives: template.template_data.objectives_template ? [template.template_data.objectives_template] : [],
        constraints: template.template_data.constraints_template ? [template.template_data.constraints_template] : [],
        timeline: template.template_data.timeline_template || '',
        context: template.template_data.context_template || '',
        additional_requirements: ''
      });
    } catch (err) {
      console.error('Error loading scenario:', err);
      setError('Failed to load scenario template');
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  useEffect(() => {
    if (scenarioId) {
      loadScenario();
    }
  }, [scenarioId, loadScenario]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInput = (field: keyof Pick<FormData, 'stakeholders' | 'objectives' | 'constraints'>, value: string) => {
    const items = value.split('\n').filter(item => item.trim());
    handleInputChange(field, items);
  };

  const handleGenerateMap = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await generateMapFromTemplate(scenarioId, {
        customizations: {
          title: scenario?.title || 'Custom Scenario',
          stakeholders: formData.stakeholders.join(', '),
          objectives: formData.objectives.join(', '),
          constraints: formData.constraints.join(', '),
          timeline: formData.timeline,
          context: formData.context
        },
        quick_generate: false,
        save_customization: true
      });

      if (response.generated_map?.id) {
        // Redirect to map viewer or show success
        router.push(`/maps/${response.generated_map.id}`);
      }
    } catch (err) {
      console.error('Error generating map:', err);
      setError('Failed to generate map. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !scenario) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertDescription>Scenario not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scenarios
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{scenario.title}</CardTitle>
                <CardDescription className="mt-2">
                  {scenario.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {scenario.category}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6">
              <div>
                <Label htmlFor="context">Context & Background</Label>
                <Textarea
                  id="context"
                  value={formData.context}
                  onChange={(e) => handleInputChange('context', e.target.value)}
                  rows={4}
                  placeholder="Describe the negotiation context and background..."
                />
              </div>

              <div>
                <Label htmlFor="stakeholders">Stakeholders (one per line)</Label>
                <Textarea
                  id="stakeholders"
                  value={formData.stakeholders.join('\n')}
                  onChange={(e) => handleArrayInput('stakeholders', e.target.value)}
                  rows={3}
                  placeholder="List all stakeholders involved in the negotiation..."
                />
              </div>

              <div>
                <Label htmlFor="objectives">Objectives (one per line)</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives.join('\n')}
                  onChange={(e) => handleArrayInput('objectives', e.target.value)}
                  rows={3}
                  placeholder="What are the main objectives for this negotiation..."
                />
              </div>

              <div>
                <Label htmlFor="constraints">Constraints (one per line)</Label>
                <Textarea
                  id="constraints"
                  value={formData.constraints.join('\n')}
                  onChange={(e) => handleArrayInput('constraints', e.target.value)}
                  rows={3}
                  placeholder="List any constraints, limitations, or boundaries..."
                />
              </div>

              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="e.g., 3 months, ongoing, immediate resolution needed"
                />
              </div>

              <div>
                <Label htmlFor="additional_requirements">Additional Requirements</Label>
                <Textarea
                  id="additional_requirements"
                  value={formData.additional_requirements || ''}
                  onChange={(e) => handleInputChange('additional_requirements', e.target.value)}
                  rows={3}
                  placeholder="Any additional requirements or specific considerations..."
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button
                onClick={handleGenerateMap}
                disabled={generating || !formData.context.trim()}
                className="min-w-[200px]"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Map...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Negotiation Map
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}