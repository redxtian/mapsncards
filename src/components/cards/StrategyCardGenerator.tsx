'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common';
import { CardDeckViewer } from './CardDeckViewer';
import { 
  ArrowLeft, 
  Target, 
  Zap, 
  Users, 
  Brain, 
  Shield, 
  Play,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { AnyCard, CardDeckPayload } from '@/types';

const LEVERAGE_TYPES = [
  { 
    id: 'informational', 
    label: 'Informational', 
    icon: Brain,
    description: 'Knowledge and data advantages',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    id: 'relational', 
    label: 'Relational', 
    icon: Users,
    description: 'Relationship and network power',
    color: 'bg-green-100 text-green-800'
  },
  { 
    id: 'resource', 
    label: 'Resource', 
    icon: Shield,
    description: 'Financial and asset leverage',
    color: 'bg-purple-100 text-purple-800'
  },
  { 
    id: 'urgency', 
    label: 'Urgency', 
    icon: Zap,
    description: 'Time and deadline pressure',
    color: 'bg-red-100 text-red-800'
  },
  { 
    id: 'narrative', 
    label: 'Narrative', 
    icon: Target,
    description: 'Story and framing control',
    color: 'bg-yellow-100 text-yellow-800'
  },
  { 
    id: 'authority', 
    label: 'Authority', 
    icon: Shield,
    description: 'Position and decision power',
    color: 'bg-gray-100 text-gray-800'
  }
];

const DEPLOYMENT_MODES = [
  {
    id: 'direct',
    label: 'Direct Approach',
    description: 'Overt, transparent strategy deployment',
    icon: Play,
    color: 'bg-blue-600'
  },
  {
    id: 'inception',
    label: 'Inception Approach', 
    description: 'Subtle, indirect influence tactics',
    icon: Eye,
    color: 'bg-purple-600'
  }
];

interface StrategyCardGeneratorProps {
  scenario: any;
  onBack: () => void;
}

export function StrategyCardGenerator({ scenario, onBack }: StrategyCardGeneratorProps) {
  const [selectedLeverageTypes, setSelectedLeverageTypes] = useState<string[]>(['informational', 'relational']);
  const [selectedDeploymentMode, setSelectedDeploymentMode] = useState<string>('direct');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<CardDeckPayload | null>(null);

  const handleLeverageToggle = (leverageId: string) => {
    setSelectedLeverageTypes(prev => {
      if (prev.includes(leverageId)) {
        return prev.filter(id => id !== leverageId);
      } else if (prev.length < 4) { // Max 4 leverage types
        return [...prev, leverageId];
      }
      return prev;
    });
  };

  const handleGenerateCards = async () => {
    if (selectedLeverageTypes.length < 2) {
      toast.error('Please select at least 2 leverage types for a strategic approach');
      return;
    }

    setIsGenerating(true);
    try {
      // Create a detailed scenario prompt from the gold standard data
      const scenarioPrompt = `
NEGOTIATION SCENARIO: ${scenario.title}
CONTEXT: ${scenario.description}

STAKEHOLDERS: ${scenario.template_data.stakeholders_template}
OBJECTIVES: ${scenario.template_data.objectives_template}
CONSTRAINTS: ${scenario.template_data.constraints_template}
TIMELINE: ${scenario.template_data.timeline_template}
SITUATION: ${scenario.template_data.context_template}

CATEGORY: ${scenario.category}
COMPLEXITY: ${scenario.metadata.complexity}
POWER DYNAMICS: ${scenario.metadata.power_dynamics}
RELATIONSHIP TYPE: ${scenario.metadata.relationship_type}

SELECTED LEVERAGE TYPES: ${selectedLeverageTypes.join(', ')}
DEPLOYMENT MODE: ${selectedDeploymentMode}

Generate a strategic card deck optimized for this specific scenario with emphasis on the selected leverage types.
      `.trim();

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          scenario: scenarioPrompt,
          include_types: ['leverage', 'domain', 'exit'], // Focus on strategy game types
          max_challenge_cards: 1,
          leverage_types: selectedLeverageTypes,
          deployment_mode: selectedDeploymentMode,
          scenario_metadata: scenario.metadata
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        const deck: CardDeckPayload = {
          scenario_input: scenario.title,
          cards: result.cards as AnyCard[],
          metadata: {
            ...result.metadata,
            original_scenario: scenario,
            selected_leverage_types: selectedLeverageTypes,
            deployment_mode: selectedDeploymentMode,
            generation_time: result.generation_time,
            total_cards: result.total_cards
          }
        };
        setGeneratedDeck(deck);
        toast.success(`Generated strategic deck with ${result.total_cards} cards!`);
      } else {
        throw new Error(result.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate strategy cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedDeck) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_input: generatedDeck.scenario_input,
          cards: generatedDeck.cards,
          metadata: generatedDeck.metadata
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Strategy deck saved successfully!');
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save strategy deck');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generate Strategy Cards</h2>
          <p className="text-gray-600">{scenario.title}</p>
        </div>
      </div>

      {/* Scenario Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">{scenario.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{scenario.category}</Badge>
            <Badge className={
              scenario.metadata.complexity === 'beginner' ? 'bg-green-100 text-green-800' :
              scenario.metadata.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {scenario.metadata.complexity}
            </Badge>
            <Badge variant="outline">{scenario.metadata.power_dynamics}</Badge>
            <Badge variant="outline">{scenario.metadata.time_investment}min</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Leverage Type Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Leverage Types (2-4 recommended)</h4>
              <Badge variant="outline">{selectedLeverageTypes.length}/4 selected</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {LEVERAGE_TYPES.map(leverage => {
                const Icon = leverage.icon;
                const isSelected = selectedLeverageTypes.includes(leverage.id);
                return (
                  <Card 
                    key={leverage.id}
                    className={`cursor-pointer border-2 transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleLeverageToggle(leverage.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5 text-gray-600" />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{leverage.label}</h5>
                          <p className="text-xs text-gray-600 mt-1">{leverage.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Deployment Mode Selection */}
          <div className="space-y-3">
            <h4 className="font-medium">Deployment Mode</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEPLOYMENT_MODES.map(mode => {
                const Icon = mode.icon;
                const isSelected = selectedDeploymentMode === mode.id;
                return (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer border-2 transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDeploymentMode(mode.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${mode.color} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">{mode.label}</h5>
                          <p className="text-sm text-gray-600">{mode.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerateCards}
          disabled={isGenerating || selectedLeverageTypes.length < 2}
          className="flex-1"
          size="lg"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating Strategy Deck...
            </>
          ) : (
            <>
              <Target className="h-5 w-5 mr-2" />
              Generate Strategy Cards
            </>
          )}
        </Button>

        {generatedDeck && (
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save Deck'
            )}
          </Button>
        )}
      </div>

      {/* Generated Strategy Deck */}
      {generatedDeck && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-2xl font-semibold">Your Strategy Deck</h3>
            <Badge variant="outline">
              {generatedDeck.cards?.length || 0} cards
            </Badge>
            <div className="flex gap-1">
              {selectedLeverageTypes.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              {selectedDeploymentMode} mode
            </Badge>
          </div>
          <CardDeckViewer deck={generatedDeck} />
        </div>
      )}
    </div>
  );
}

export default StrategyCardGenerator;