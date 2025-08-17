'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CardDeckPayload, AnyCard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Circle, 
  Target, 
  Shield, 
  AlertTriangle,
  PlayCircle,
  Settings,
  Eye,
  Users,
  Map,
  DoorOpen,
  Lightbulb
} from 'lucide-react';

import { CardStepsViewer } from './CardStepsViewer';
import { CardRecoveryTips } from './CardRecoveryTips';
import { CardDeploymentModes } from './CardDeploymentModes';

interface EnhancedCardDeckViewerProps {
  deck: CardDeckPayload;
}

type CardWithStatus = AnyCard & {
  id: string;
  status: 'pending' | 'customizing' | 'ready' | 'completed';
  readinessScore: number;
  recommendedOrder: number;
};

interface GlobalPlaceholders {
  [key: string]: string;
}

export function EnhancedCardDeckViewer({ deck }: EnhancedCardDeckViewerProps) {
  const [cards, setCards] = useState<CardWithStatus[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'overview' | 'customize' | 'execute'>('overview');
  const [globalPlaceholders, setGlobalPlaceholders] = useState<GlobalPlaceholders>({});
  const [selectedDeploymentModes, setSelectedDeploymentModes] = useState<Record<string, 'direct' | 'subtle'>>({});

  const getRecommendedOrder = (card: AnyCard, index: number): number => {
    const typeOrder = {
      'leverage': 1,
      'domain': 2,
      'map': 3,
      'challenge': 4,
      'exit': 5
    };
    return (typeOrder[card.type] || 6) * 10 + index;
  };

  const extractPlaceholdersFromSteps = (steps: string[]): string[] => {
    const placeholders = new Set<string>();
    steps.forEach(step => {
      const matches = step.match(/\[([^\]]+)\]/g);
      if (matches) {
        matches.forEach(match => {
          placeholders.add(match.slice(1, -1));
        });
      }
    });
    return Array.from(placeholders);
  };

  const calculateReadinessScore = useCallback((
    card: CardWithStatus, 
    placeholders: GlobalPlaceholders,
    deploymentModes: Record<string, 'direct' | 'subtle'>
  ): number => {
    let score = 0;
    
    // Base score for having all anatomy fields
    if (card.best_for) score += 20;
    if (card.steps?.length) score += 20;
    if (card.recovery_tip) score += 10;
    if (card.ethical_note) score += 10;
    
    // Placeholder completion score
    if (card.steps) {
      const stepPlaceholders = extractPlaceholdersFromSteps(card.steps);
      const filledPlaceholders = stepPlaceholders.filter(p => placeholders[p]?.trim());
      if (stepPlaceholders.length > 0) {
        score += (filledPlaceholders.length / stepPlaceholders.length) * 30;
      } else {
        score += 30; // No placeholders needed
      }
    }
    
    // Deployment mode selection for leverage cards
    if (card.type === 'leverage' && deploymentModes[card.id]) {
      score += 10;
    } else if (card.type !== 'leverage') {
      score += 10; // Non-leverage cards don't need deployment mode
    }
    
    return Math.round(score);
  }, []);

  const determineCardStatus = useCallback((
    card: CardWithStatus,
    placeholders: GlobalPlaceholders,
    deploymentModes: Record<string, 'direct' | 'subtle'>
  ): 'pending' | 'customizing' | 'ready' | 'completed' => {
    const score = calculateReadinessScore(card, placeholders, deploymentModes);
    
    if (score === 100) return 'ready';
    if (score >= 60) return 'customizing';
    return 'pending';
  }, [calculateReadinessScore]);

  // Initialize cards with enhanced metadata
  useEffect(() => {
    const enhancedCards: CardWithStatus[] = (deck.cards || []).map((card, index) => ({
      ...card,
      id: `card-${index}-${card.name.toLowerCase().replace(/\s+/g, '-')}`,
      status: 'pending' as const,
      readinessScore: 0,
      recommendedOrder: getRecommendedOrder(card, index)
    }));

    // Sort by recommended order
    enhancedCards.sort((a, b) => a.recommendedOrder - b.recommendedOrder);
    setCards(enhancedCards);
    
    if (enhancedCards.length > 0 && enhancedCards[0]) {
      setActiveCardId(enhancedCards[0].id);
    }
  }, [deck.cards]);

  // Calculate readiness scores
  useEffect(() => {
    setCards(prev => prev.map(card => ({
      ...card,
      readinessScore: calculateReadinessScore(card, globalPlaceholders, selectedDeploymentModes),
      status: determineCardStatus(card, globalPlaceholders, selectedDeploymentModes)
    })));
  }, [globalPlaceholders, selectedDeploymentModes, calculateReadinessScore, determineCardStatus]);

  const handlePlaceholderUpdate = (newPlaceholders: GlobalPlaceholders) => {
    setGlobalPlaceholders(prev => ({ ...prev, ...newPlaceholders }));
  };

  const handleDeploymentModeSelect = (cardId: string, mode: 'direct' | 'subtle') => {
    setSelectedDeploymentModes(prev => ({ ...prev, [cardId]: mode }));
  };

  const getCardIcon = (type: string) => {
    const icons = {
      leverage: Shield,
      domain: Users,
      map: Map,
      exit: DoorOpen,
      challenge: AlertTriangle
    };
    return icons[type as keyof typeof icons] || Target;
  };

  const getCardTypeInfo = (type: string) => {
    const info = {
      leverage: { color: 'border-blue-500 bg-blue-50', badge: 'bg-blue-100 text-blue-800' },
      domain: { color: 'border-green-500 bg-green-50', badge: 'bg-green-100 text-green-800' },
      map: { color: 'border-purple-500 bg-purple-50', badge: 'bg-purple-100 text-purple-800' },
      exit: { color: 'border-orange-500 bg-orange-50', badge: 'bg-orange-100 text-orange-800' },
      challenge: { color: 'border-red-500 bg-red-50', badge: 'bg-red-100 text-red-800' }
    };
    return info[type as keyof typeof info] || { color: 'border-gray-500 bg-gray-50', badge: 'bg-gray-100 text-gray-800' };
  };

  const getStatusInfo = (status: string) => {
    const info = {
      pending: { icon: Circle, color: 'text-gray-400', label: 'Not Started' },
      customizing: { icon: Settings, color: 'text-orange-500', label: 'In Progress' },
      ready: { icon: CheckCircle, color: 'text-green-500', label: 'Ready' },
      completed: { icon: CheckCircle, color: 'text-blue-500', label: 'Completed' }
    };
    return info[status as keyof typeof info] || info.pending;
  };

  const overallProgress = cards.length > 0 ? 
    cards.reduce((sum, card) => sum + card.readinessScore, 0) / (cards.length * 100) * 100 : 0;

  const readyCards = cards.filter(card => card.status === 'ready').length;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-blue-900">
                Negotiation Strategy Deck
              </CardTitle>
              <p className="text-sm text-blue-700 mt-1">
                {deck.scenario_input}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {cards.length} Cards
                </Badge>
                <Badge className={readyCards === cards.length ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                  {readyCards}/{cards.length} Ready
                </Badge>
              </div>
              <Progress value={overallProgress} className="w-32" />
              <p className="text-xs text-blue-600 mt-1">
                {Math.round(overallProgress)}% Complete
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Phase Navigation */}
      <Tabs value={currentPhase} onValueChange={(value) => setCurrentPhase(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="customize" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="execute" className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Execute
          </TabsTrigger>
        </TabsList>

        {/* Overview Phase */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Strategy Overview
              </CardTitle>
              <p className="text-sm text-gray-600">
                Your negotiation toolkit with {cards.length} strategic cards. Follow the recommended sequence for best results.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {cards.map((card, index) => {
                  const IconComponent = getCardIcon(card.type);
                  const statusInfo = getStatusInfo(card.status);
                  const typeInfo = getCardTypeInfo(card.type);
                  
                  return (
                    <div key={card.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 min-w-[2rem]">
                          {index + 1}.
                        </span>
                        <IconComponent className={`w-5 h-5 ${typeInfo.color.includes('blue') ? 'text-blue-600' : typeInfo.color.includes('green') ? 'text-green-600' : typeInfo.color.includes('purple') ? 'text-purple-600' : typeInfo.color.includes('orange') ? 'text-orange-600' : 'text-red-600'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{card.name}</h3>
                          <Badge className={typeInfo.badge}>{card.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{card.best_for}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className="text-sm font-medium">{statusInfo.label}</span>
                        </div>
                        <Progress value={card.readinessScore} className="w-24" />
                        <p className="text-xs text-gray-500 mt-1">
                          {card.readinessScore}% ready
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveCardId(card.id);
                          setCurrentPhase('customize');
                        }}
                      >
                        {card.status === 'ready' ? 'Review' : 'Customize'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customize Phase */}
        <TabsContent value="customize" className="space-y-4">
          {activeCardId && (() => {
            const activeCard = cards.find(c => c.id === activeCardId);
            if (!activeCard) return null;
            
            return (
              <div className="space-y-4">
                {/* Card Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Customize Your Strategy
                    </CardTitle>
                    <div className="flex gap-2">
                      {cards.map((card) => (
                        <Button
                          key={card.id}
                          variant={activeCardId === card.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveCardId(card.id)}
                          className="flex items-center gap-1"
                        >
                          {React.createElement(getCardIcon(card.type), { className: "w-3 h-3" })}
                          {card.name}
                        </Button>
                      ))}
                    </div>
                  </CardHeader>
                </Card>

                {/* Active Card Customization */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Steps Customization */}
                  <CardStepsViewer
                    steps={activeCard.steps || []}
                    cardName={activeCard.name}
                    onStepsUpdate={(_, placeholders) => {
                      handlePlaceholderUpdate(placeholders);
                    }}
                  />

                  {/* Deployment Modes (for leverage cards) */}
                  {activeCard.type === 'leverage' && 'deployment_modes' in activeCard && activeCard.deployment_modes && (
                    <CardDeploymentModes
                      cardName={activeCard.name}
                      deploymentModes={activeCard.deployment_modes}
                      leverageFocus={'leverage_focus' in activeCard && typeof activeCard.leverage_focus === 'string' ? activeCard.leverage_focus : undefined}
                      selectedMode={selectedDeploymentModes[activeCard.id]}
                      onModeSelect={(mode) => handleDeploymentModeSelect(activeCard.id, mode)}
                    />
                  )}

                  {/* Recovery Tips */}
                  <CardRecoveryTips
                    cardName={activeCard.name}
                    recoveryTip={activeCard.recovery_tip}
                    ethicalNote={activeCard.ethical_note}
                    cardType={activeCard.type}
                  />
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* Execute Phase */}
        <TabsContent value="execute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Execute Your Strategy
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ready to negotiate? Follow your customized strategy step by step.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cards.filter(card => card.status === 'ready').map((card, index) => {
                  const IconComponent = getCardIcon(card.type);
                  
                  return (
                    <Card key={card.id} className="border-2 border-green-200 bg-green-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5 text-green-600" />
                            <CardTitle className="text-green-900">
                              Step {index + 1}: {card.name}
                            </CardTitle>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Ready to Use
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-green-800">
                            {card.best_for}
                          </p>
                          
                          {card.steps && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-green-700">Action Steps:</h4>
                              <ol className="list-decimal list-inside space-y-1">
                                {card.steps.map((step, stepIndex) => {
                                  // Replace placeholders with actual values
                                  let processedStep = step;
                                  Object.entries(globalPlaceholders).forEach(([key, value]) => {
                                    if (value) {
                                      processedStep = processedStep.replace(
                                        new RegExp(`\\[${key}\\]`, 'g'),
                                        `"${value}"`
                                      );
                                    }
                                  });
                                  
                                  return (
                                    <li key={stepIndex} className="text-sm text-green-700">
                                      {processedStep}
                                    </li>
                                  );
                                })}
                              </ol>
                            </div>
                          )}
                          
                          {card.type === 'leverage' && selectedDeploymentModes[card.id] && (
                            <div className="bg-white p-3 rounded border border-green-200">
                              <h4 className="text-sm font-medium text-green-700 mb-1">
                                Deployment: {selectedDeploymentModes[card.id] === 'direct' ? 'Direct Approach' : 'Subtle Approach'}
                              </h4>
                              <p className="text-sm text-green-600">
                                {(() => {
                                  const mode = selectedDeploymentModes[card.id];
                                  return ('deployment_modes' in card && card.deployment_modes && mode ? 
                                    card.deployment_modes[mode] : 
                                    'Use your selected approach'
                                  );
                                })()}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {cards.filter(card => card.status === 'ready').length === 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-6 text-center">
                      <Lightbulb className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-orange-800 font-medium">
                        Complete your strategy customization first
                      </p>
                      <p className="text-sm text-orange-700 mt-1">
                        Go to the Customize tab to fill in placeholders and set deployment modes.
                      </p>
                      <Button
                        onClick={() => setCurrentPhase('customize')}
                        className="mt-3"
                        variant="outline"
                      >
                        Continue Customizing
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}