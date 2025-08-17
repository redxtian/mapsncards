'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common';
import { 
  ArrowLeft, 
  Library, 
  Eye, 
  EyeOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { CardDeckPayload } from '@/types';

interface CardLibraryBrowserProps {
  scenario: any;
  onBack: () => void;
}

interface LibraryCard {
  name: string;
  type: string;
  best_for: string;
  steps: string[];
  recovery_tip?: string;
  ethical_note?: string;
  deployment_modes?: {
    direct: string;
    inception: string;
  };
}

export function CardLibraryBrowser({ scenario, onBack }: CardLibraryBrowserProps) {
  const [libraryCards, setLibraryCards] = useState<LibraryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [expandedDeployment, setExpandedDeployment] = useState<Set<number>>(new Set());

  const fetchLibraryCards = useCallback(async () => {
    setIsLoading(true);
    try {
      // Search for cards related to this scenario
      const response = await fetch('/api/cards');
      if (!response.ok) throw new Error(`Failed to fetch cards: ${response.status}`);
      
      const result = await response.json();
      if (result.success && Array.isArray(result.decks)) {
        // Filter cards that match the scenario category or are similar
        const relevantDecks = result.decks.filter((deck: CardDeckPayload) => {
          if (!deck.metadata) return false;
          const metadata = deck.metadata as any;
          return metadata.category === scenario.category ||
                 metadata.scenario_id === scenario.title.replace(" ", "_").toLowerCase() ||
                 metadata.is_library_card === true;
        });

        // Extract all cards from relevant decks
        const allCards = relevantDecks.flatMap((deck: CardDeckPayload) => deck.cards || []) as LibraryCard[];
        
        setLibraryCards(allCards);
        
        if (allCards.length === 0) {
          toast.info(`No library cards found for ${scenario.category} scenarios. Generate library first.`);
        }
      } else {
        setLibraryCards([]);
      }
    } catch (error) {
      console.error('Library fetch error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch card library');
      setLibraryCards([]);
    } finally {
      setIsLoading(false);
    }
  }, [scenario]);

  useEffect(() => {
    fetchLibraryCards();
  }, [fetchLibraryCards]);

  const toggleCardSelection = (index: number) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleDeploymentView = (index: number) => {
    setExpandedDeployment(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getCardTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      leverage: 'bg-purple-100 text-purple-800',
      domain: 'bg-blue-100 text-blue-800', 
      challenge: 'bg-rose-100 text-rose-800',
      exit: 'bg-amber-100 text-amber-800',
      map: 'bg-teal-100 text-teal-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scenarios
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Card Library</h2>
            <p className="text-gray-600">{scenario.title}</p>
          </div>
        </div>
        
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Loading Card Library</h3>
            <p className="text-gray-500">Fetching strategic cards for this scenario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scenarios
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Card Library</h2>
          <p className="text-gray-600">{scenario.title}</p>
        </div>
        <Button variant="outline" onClick={fetchLibraryCards}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Library
        </Button>
      </div>

      {/* Scenario Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="h-5 w-5" />
            Available Strategic Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-3">{scenario.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{scenario.category}</Badge>
            <Badge className={
              scenario.metadata.complexity === 'beginner' ? 'bg-green-100 text-green-800' :
              scenario.metadata.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {scenario.metadata.complexity}
            </Badge>
            <Badge variant="outline">{libraryCards.length} cards available</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Library Cards */}
      {libraryCards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Library Cards Available</h3>
            <p className="text-gray-600 mb-4">
              No strategic cards have been generated for this scenario category yet.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator to generate the card library for {scenario.category} scenarios.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Selection Summary */}
          {selectedCards.size > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm text-blue-800">
                  <strong>{selectedCards.size}</strong> cards selected for your strategy deck
                </p>
              </CardContent>
            </Card>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {libraryCards.map((card, index) => {
              const isSelected = selectedCards.has(index);
              const isExpanded = expandedDeployment.has(index);
              const hasDeploymentModes = card.deployment_modes && 
                typeof card.deployment_modes === 'object' &&
                ('direct' in card.deployment_modes || 'inception' in card.deployment_modes);

              return (
                <Card 
                  key={`${card.name}-${index}`} 
                  className={`border-2 transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{card.name}</CardTitle>
                          <Badge className={getCardTypeColor(card.type)}>{card.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Best for:</strong> {card.best_for}
                        </p>
                      </div>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCardSelection(index)}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Steps */}
                    {card.steps && card.steps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Strategic Steps</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {card.steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deployment Modes - DUAL DISPLAY */}
                    {hasDeploymentModes && (
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Deployment Approaches</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDeploymentView(index)}
                          >
                            {isExpanded ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                View Modes
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {card.deployment_modes?.direct && (
                            <div className={`p-2 rounded ${isExpanded ? 'bg-blue-50' : 'bg-gray-50'}`}>
                              <span className="text-xs font-medium text-blue-700">DIRECT:</span>
                              <p className="text-xs text-gray-700 mt-1">
                                {isExpanded ? card.deployment_modes.direct : `${card.deployment_modes.direct.substring(0, 50)}...`}
                              </p>
                            </div>
                          )}
                          {card.deployment_modes?.inception && (
                            <div className={`p-2 rounded ${isExpanded ? 'bg-purple-50' : 'bg-gray-50'}`}>
                              <span className="text-xs font-medium text-purple-700">INCEPTION:</span>
                              <p className="text-xs text-gray-700 mt-1">
                                {isExpanded ? card.deployment_modes.inception : `${card.deployment_modes.inception.substring(0, 50)}...`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recovery & Ethics */}
                    <div className="border-t pt-3 text-xs text-gray-600">
                      {card.recovery_tip && (
                        <p><span className="font-medium">Recovery:</span> {card.recovery_tip}</p>
                      )}
                      {card.ethical_note && (
                        <p><span className="font-medium">Ethics:</span> {card.ethical_note}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedCards.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Ready for Negotiation</h3>
                <p className="text-sm text-blue-700">
                  You've selected {selectedCards.size} strategic cards for your approach
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedCards(new Set())}>
                  Clear Selection
                </Button>
                <Button>
                  Start Strategy Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CardLibraryBrowser;