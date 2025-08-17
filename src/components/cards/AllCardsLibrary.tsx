'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common';
import { API_CONFIG } from '@/config/api';
import { 
  Search,
  Filter,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Grid,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import { CardDeckPayload } from '@/types';

interface LibraryCard {
  name: string;
  type: string;
  best_for: string;
  steps: string[];
  recovery_tip?: string;
  ethical_note?: string;
  deployment_modes?: {
    direct?: string;
    inception?: string;
    subtle?: string;
  };
  leverage_focus?: {
    type: string;
    actions: string[];
  };
  domain_insights?: string[];
  challenge_tactics?: string[];
  exit_strategy?: {
    type: string;
    actions: string[];
  };
  map_insights?: string[];
  scenario_title?: string;
  scenario_category?: string;
  deck_id?: string;
}

interface FilterState {
  cardTypes: string[];
  categories: string[];
  searchTerm: string;
}

export function AllCardsLibrary() {
  const [allCards, setAllCards] = useState<LibraryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [expandedDeployment, setExpandedDeployment] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<FilterState>({
    cardTypes: [],
    categories: [],
    searchTerm: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const fetchAllCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/cards`);
      if (!response.ok) throw new Error(`Failed to fetch cards: ${response.status}`);
      
      const result = await response.json();
      if (result.success && Array.isArray(result.decks)) {
        // Flatten all cards from all decks with metadata
        const cards: LibraryCard[] = [];
        
        result.decks.forEach((deck: CardDeckPayload) => {
          const metadata = deck.metadata as any;
          const scenarioTitle = metadata?.scenario_title || 
                               metadata?.title || 
                               deck.deck_id?.replace(/^lib_/, '').replace(/_/g, ' ');
          
          deck.cards?.forEach((card) => {
            cards.push({
              ...card,
              scenario_title: scenarioTitle,
              scenario_category: metadata?.category || 'General',
              deck_id: deck.deck_id
            });
          });
        });
        
        setAllCards(cards);
        toast.success(`Loaded ${cards.length} cards from ${result.decks.length} scenarios`);
      } else {
        setAllCards([]);
        toast.info('No cards found in the library');
      }
    } catch (error) {
      console.error('Library fetch error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch card library');
      setAllCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCards();
  }, []);

  // Get unique values for filters
  const availableCardTypes = useMemo(() => {
    return Array.from(new Set(allCards.map(card => card.type))).sort();
  }, [allCards]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(allCards.map(card => card.scenario_category).filter((category): category is string => Boolean(category)))).sort();
  }, [allCards]);

  // Filter cards based on current filters
  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      // Card type filter
      if (filters.cardTypes.length > 0 && !filters.cardTypes.includes(card.type)) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(card.scenario_category || '')) {
        return false;
      }

      // Search filter
      if (filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          card.name.toLowerCase().includes(searchLower) ||
          card.best_for.toLowerCase().includes(searchLower) ||
          (card.scenario_title && card.scenario_title.toLowerCase().includes(searchLower)) ||
          (card.steps && card.steps.some(step => step.toLowerCase().includes(searchLower)))
        );
      }

      return true;
    });
  }, [allCards, filters]);

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const toggleDeploymentView = (cardId: string) => {
    setExpandedDeployment(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const updateFilter = (type: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      cardTypes: [],
      categories: [],
      searchTerm: ''
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

  const getCardId = (card: LibraryCard, index: number) => {
    return `${card.deck_id || 'unknown'}-${card.name.replace(/\s+/g, '_')}-${index}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Loading Card Library</h3>
          <p className="text-gray-500">Fetching all strategic cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Cards Library</h1>
          <p className="text-gray-600 mt-1">
            Browse and filter all strategic cards ({filteredCards.length} of {allCards.length} cards)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAllCards}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search cards by name, description, scenario, or steps..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(filters.cardTypes.length > 0 || filters.categories.length > 0) && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.cardTypes.length + filters.categories.length}
                  </Badge>
                )}
              </Button>
              {(filters.cardTypes.length > 0 || filters.categories.length > 0 || filters.searchTerm) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="border-t pt-4 space-y-4">
                {/* Card Types */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Card Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableCardTypes.map(type => {
                      const isSelected = filters.cardTypes.includes(type);
                      return (
                        <Button
                          key={type}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              updateFilter('cardTypes', filters.cardTypes.filter(t => t !== type));
                            } else {
                              updateFilter('cardTypes', [...filters.cardTypes, type]);
                            }
                          }}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${getCardTypeColor(type).replace('text-', 'bg-')}`} />
                          {type}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Scenario Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(category => {
                      const isSelected = filters.categories.includes(category);
                      return (
                        <Button
                          key={category}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              updateFilter('categories', filters.categories.filter(c => c !== category));
                            } else {
                              updateFilter('categories', [...filters.categories, category]);
                            }
                          }}
                        >
                          {category}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {selectedCards.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                <strong>{selectedCards.size}</strong> cards selected for your strategy deck
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedCards(new Set())}>
                  Clear Selection
                </Button>
                <Button size="sm">
                  Create Strategy Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards Display */}
      {filteredCards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Cards Found</h3>
            <p className="text-gray-600 mb-4">
              No cards match your current filters. Try adjusting your search or filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredCards.map((card, index) => {
            const cardId = getCardId(card, index);
            const isSelected = selectedCards.has(cardId);
            const isExpanded = expandedDeployment.has(cardId);
            const hasDeploymentModes = card.deployment_modes && 
              typeof card.deployment_modes === 'object' &&
              ('direct' in card.deployment_modes || 'inception' in card.deployment_modes);

            return (
              <Card 
                key={cardId} 
                className={`border-2 transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                } ${viewMode === 'list' ? 'flex' : ''}`}
              >
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
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
                        {card.scenario_title && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>From: {card.scenario_title}</span>
                            {card.scenario_category && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {card.scenario_category}
                                </Badge>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCardSelection(cardId)}
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

                    {/* Deployment Modes */}
                    {hasDeploymentModes && (
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Deployment Approaches</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDeploymentView(cardId)}
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

                        <div className="space-y-2">
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
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AllCardsLibrary;