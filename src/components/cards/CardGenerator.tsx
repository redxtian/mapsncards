'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common';
import { CardDeckViewer } from './CardDeckViewer';
import { Wand2, Save, RefreshCw, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { AnyCard, CardDeckPayload } from '@/types';

const CARD_TYPES = [
  { value: 'domain', label: 'Domain', description: 'Context-specific adaptations' },
  { value: 'challenge', label: 'Challenge', description: 'Problem-solving strategies' },
  { value: 'leverage', label: 'Leverage', description: 'Power and influence tactics' },
  { value: 'exit', label: 'Exit', description: 'Graceful disengagement options' },
  { value: 'map', label: 'Map', description: 'Strategic framework adaptations' }
];

interface GenerationOptions {
  include_types: string[];
  max_challenge_cards: number;
}

export function CardGenerator() {
  const [scenario, setScenario] = useState('');
  const [options, setOptions] = useState<GenerationOptions>({
    include_types: ['domain', 'challenge'],
    max_challenge_cards: 2
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<CardDeckPayload | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    if (!scenario.trim()) {
      toast.error('Please enter a scenario description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          scenario: scenario.trim(),
          include_types: options.include_types,
          max_challenge_cards: options.max_challenge_cards
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        const deck: CardDeckPayload = {
          scenario_input: result.scenario_input,
          cards: result.cards as AnyCard[],
          metadata: {
            generation_time: result.generation_time,
            card_types: options.include_types,
            total_cards: result.total_cards
          }
        };
        setGeneratedDeck(deck);
        toast.success(`Generated ${result.total_cards} cards successfully!`);
      } else {
        throw new Error(result.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate cards');
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
        toast.success('Card deck saved successfully!');
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save deck');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTypeToggle = (type: string) => {
    setOptions(prev => ({
      ...prev,
      include_types: prev.include_types.includes(type)
        ? prev.include_types.filter(t => t !== type)
        : [...prev.include_types, type]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate Strategic Cards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario Description</Label>
            <Textarea
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe your negotiation scenario in detail. Include context, parties involved, objectives, and constraints..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Card Type Selection */}
          <div className="space-y-2">
            <Label>Card Types to Generate</Label>
            <div className="flex flex-wrap gap-2">
              {CARD_TYPES.map(type => (
                <Badge
                  key={type.value}
                  variant={options.include_types.includes(type.value) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => handleTypeToggle(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Click to toggle card types. Selected types will be generated.
            </p>
          </div>

          {/* Advanced Options */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-auto p-1 text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>

            {showAdvanced && (
              <div className="bg-gray-50 p-3 rounded space-y-3">
                <div>
                  <Label htmlFor="maxChallengeCards">Max Challenge Cards</Label>
                  <Input
                    id="maxChallengeCards"
                    type="number"
                    min="1"
                    max="5"
                    value={options.max_challenge_cards}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      max_challenge_cards: parseInt(e.target.value) || 2
                    }))}
                    className="w-20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum number of challenge cards to generate (1-5)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !scenario.trim() || options.include_types.length === 0}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating Cards...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Cards
                </>
              )}
            </Button>

            {generatedDeck && (
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Deck
                  </>
                )}
              </Button>
            )}

            {generatedDeck && (
              <Button
                variant="ghost"
                onClick={() => setGeneratedDeck(null)}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Cards Display */}
      {generatedDeck && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold">Generated Cards</h2>
            <Badge variant="outline">
              {generatedDeck.cards?.length || 0} cards
            </Badge>
            {generatedDeck.metadata?.generation_time ? (
              <Badge variant="secondary">
                {(generatedDeck.metadata.generation_time as number).toFixed(2)}s
              </Badge>
            ) : null}
          </div>
          <CardDeckViewer deck={generatedDeck} />
        </div>
      )}
    </div>
  );
}

export default CardGenerator;