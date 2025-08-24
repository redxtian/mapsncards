'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common';
import { SimplifiedCardDeckViewer } from './SimplifiedCardDeckViewer';
import { Brain, Sparkles, BarChart3, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { LeverageCardGenerationRequest, LeverageCardGenerationResponse, GenerationSystemStatus, LeverageCard as ApiLeverageCard } from '@/types/api';
import { AnyCard, CardDeckPayload } from '@/types';

type LeverageTypeValue = 'informational' | 'relational' | 'resource' | 'urgency' | 'narrative' | 'authority';
type CognitiveFrameworkValue = 'think_probe_refine' | 'assess_build_propose' | 'identify_link_suggest' | 'surface_analyze_apply' | 'establish_demonstrate_leverage';

const LEVERAGE_TYPES: { value: LeverageTypeValue; label: string; description: string }[] = [
  { value: 'informational', label: 'Informational', description: 'Research and data advantages' },
  { value: 'relational', label: 'Relational', description: 'Connection and trust leverage' },
  { value: 'resource', label: 'Resource', description: 'Assets and capabilities' },
  { value: 'urgency', label: 'Urgency', description: 'Time and deadline pressure' },
  { value: 'narrative', label: 'Narrative', description: 'Story and framing power' },
  { value: 'authority', label: 'Authority', description: 'Credibility and expertise' }
];

const COGNITIVE_FRAMEWORKS: { value: CognitiveFrameworkValue; label: string; description: string }[] = [
  { value: 'think_probe_refine', label: 'Think-Probe-Refine', description: 'Strategic analysis pattern' },
  { value: 'assess_build_propose', label: 'Assess-Build-Propose', description: 'Solution construction pattern' },
  { value: 'identify_link_suggest', label: 'Identify-Link-Suggest', description: 'Connection-based pattern' },
  { value: 'surface_analyze_apply', label: 'Surface-Analyze-Apply', description: 'Discovery-focused pattern' },
  { value: 'establish_demonstrate_leverage', label: 'Establish-Demonstrate-Leverage', description: 'Authority-building pattern' }
];

export function SophisticatedLeverageGenerator() {
  const [request, setRequest] = useState<LeverageCardGenerationRequest>({
    leverage_types: ['informational', 'relational'],
    action_focus: 'both',
    card_count: 3,
    sophistication_level: 'high',
    deployment_preference: 'both',
    cognitive_frameworks: []
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [systemStatus, setSystemStatus] = useState<GenerationSystemStatus | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<LeverageCardGenerationResponse | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const status = await apiClient.getLeverageGenerationStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to check system status:', error);
      toast.error('Could not connect to leverage generation system');
    }
  };

  const handleGenerate = async () => {
    if (!request.leverage_types || request.leverage_types.length === 0) {
      toast.error('Please select at least one leverage type');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiClient.generateLeverageCards(request);
      
      if (response.success) {
        setGeneratedResponse(response);
        toast.success(
          `Generated ${response.cards.length} sophisticated cards! ` +
          `Quality score: ${response.generation_metadata.total_sophistication_score.toFixed(2)}`
        );
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate leverage cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLeverageTypeToggle = (type: LeverageTypeValue) => {
    setRequest(prev => ({
      ...prev,
      leverage_types: prev.leverage_types?.includes(type)
        ? prev.leverage_types.filter(t => t !== type)
        : [...(prev.leverage_types || []), type]
    }));
  };

  const handleFrameworkToggle = (framework: CognitiveFrameworkValue) => {
    setRequest(prev => ({
      ...prev,
      cognitive_frameworks: prev.cognitive_frameworks?.includes(framework)
        ? prev.cognitive_frameworks.filter(f => f !== framework)
        : [...(prev.cognitive_frameworks || []), framework]
    }));
  };

  // (removed unused getQualityIndicator helper)

  // Convert LeverageCard[] to the format expected by SimplifiedCardDeckViewer
  const convertToCardDeck = (cards: ApiLeverageCard[]): CardDeckPayload => ({
    scenario_input: 'Sophisticated Leverage Cards',
    cards: cards.map(card => (({
      // spread the API card and add fields required by Card types
      ...(card as unknown as AnyCard),
      deployment_text: card.deployment_modes?.direct ?? '',
      impact_level: 'high',
      risk_level: 'low',
      preparation_time: 'medium',
      ethical_note: (card as any).ethical_note ?? ''
    }) as unknown as AnyCard)),
    metadata: {
      generation_method: 'crewai_agents',
      complexity: 'advanced',
      scenario_category: 'leverage_focused'
    }
  });

  return (
    <div className="space-y-6">
      {/* System Status */}
      {systemStatus && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">AI Agent System Status</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Agents: {systemStatus.system_status.agents_initialized}/5</span>
                <span>Knowledge Base: {systemStatus.system_status.knowledge_base_loaded ? '✓' : '✗'}</span>
                <span>Benchmarks: {systemStatus.system_status.benchmarks_established ? '✓' : '✗'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Sophisticated Leverage Card Generation
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate psychologically sophisticated, scenario-agnostic leverage cards using specialized AI agents
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Leverage Type Selection */}
          <div className="space-y-2">
            <Label>Leverage Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {LEVERAGE_TYPES.map(type => (
                <Badge
                  key={type.value}
                  variant={request.leverage_types?.includes(type.value) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-center justify-center"
                  onClick={() => handleLeverageTypeToggle(type.value)}
                >
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs opacity-80">{type.description}</div>
                  </div>
                </Badge>
              ))}
            </div>
          </div>

          {/* Basic Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action-focus">Action Focus</Label>
              <Select 
                value={request.action_focus} 
                onValueChange={(value) => setRequest(prev => ({ ...prev, action_focus: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extract">Extract Leverage</SelectItem>
                  <SelectItem value="increase">Increase Leverage</SelectItem>
                  <SelectItem value="both">Both Actions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-count">Number of Cards</Label>
              <Input
                id="card-count"
                type="number"
                min="1"
                max="10"
                value={request.card_count}
                onChange={(e) => setRequest(prev => ({ ...prev, card_count: parseInt(e.target.value) || 3 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sophistication">Sophistication Level</Label>
              <Select 
                value={request.sophistication_level} 
                onValueChange={(value) => setRequest(prev => ({ ...prev, sophistication_level: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High (Match Hand-crafted)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-auto p-1 text-xs"
            >
              <Settings2 className="h-3 w-3 mr-1" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>

            {showAdvanced && (
              <div className="bg-gray-50 p-4 rounded space-y-4">
                <div className="space-y-2">
                  <Label>Deployment Preference</Label>
                  <Select 
                    value={request.deployment_preference} 
                    onValueChange={(value) => setRequest(prev => ({ ...prev, deployment_preference: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Mode Only</SelectItem>
                      <SelectItem value="subtle">Subtle Mode Only</SelectItem>
                      <SelectItem value="both">Both Modes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cognitive Frameworks (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {COGNITIVE_FRAMEWORKS.map(framework => (
                      <Badge
                        key={framework.value}
                        variant={request.cognitive_frameworks?.includes(framework.value) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-2 text-left"
                        onClick={() => handleFrameworkToggle(framework.value)}
                      >
                        <div>
                          <div className="font-medium text-xs">{framework.label}</div>
                          <div className="text-xs opacity-80">{framework.description}</div>
                        </div>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Leave empty for automatic framework selection based on leverage types
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !request.leverage_types || request.leverage_types.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                AI Agents Generating Cards...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Sophisticated Cards
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Results */}
      {generatedResponse && (
        <div className="space-y-4">
          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Generation Quality Metrics
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMetrics(!showMetrics)}
                >
                  {showMetrics ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {generatedResponse.generation_metadata.total_sophistication_score.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">Sophistication Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {generatedResponse.cards.length}
                  </div>
                  <div className="text-xs text-gray-600">Cards Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedResponse.generation_metadata.generation_time_seconds.toFixed(1)}s
                  </div>
                  <div className="text-xs text-gray-600">Generation Time</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${generatedResponse.generation_metadata.quality_benchmark_match ? 'text-green-600' : 'text-yellow-600'}`}>
                    {generatedResponse.generation_metadata.quality_benchmark_match ? '✓' : '◐'}
                  </div>
                  <div className="text-xs text-gray-600">Benchmark Match</div>
                </div>
              </div>

              {showMetrics && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Agents Used</h4>
                      <div className="space-y-1">
                        {generatedResponse.generation_metadata.agents_used.map(agent => (
                          <Badge key={agent} variant="outline" className="text-xs">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Framework Distribution</h4>
                      <div className="space-y-1">
                        {Object.entries(generatedResponse.generation_metadata.framework_distribution).map(([framework, count]) => (
                          <div key={framework} className="flex justify-between">
                            <span className="text-xs">{framework}</span>
                            <span className="text-xs font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Cards */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              Generated Leverage Cards
              <Badge variant="outline">
                {generatedResponse.cards.length} cards
              </Badge>
            </h2>
            <SimplifiedCardDeckViewer deck={convertToCardDeck(generatedResponse.cards) as any} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SophisticatedLeverageGenerator;