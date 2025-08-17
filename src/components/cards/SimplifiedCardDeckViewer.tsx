'use client';

import React, { useState } from 'react';
import { CardDeckPayload, AnyCard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Grid,
  List,
  Filter,
  Users,
  Shield,
  Map,
  DoorOpen,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { NegotiationCard } from './NegotiationCard';

interface SimplifiedCardDeckViewerProps {
  deck: CardDeckPayload;
}

export function SimplifiedCardDeckViewer({ deck }: SimplifiedCardDeckViewerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const cards = (deck.cards || []) as AnyCard[];

  // Get deck composition stats
  const deckStats = cards.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter cards by type
  const filteredCards = selectedType === 'all' 
    ? cards 
    : cards.filter(card => card.type === selectedType);

  // Sort cards by recommended play order
  const sortedCards = [...filteredCards].sort((a, b) => {
    const typeOrder = {
      'leverage': 1,
      'domain': 2,
      'map': 3,
      'challenge': 4,
      'exit': 5
    };
    return (typeOrder[a.type as keyof typeof typeOrder] || 6) - 
           (typeOrder[b.type as keyof typeof typeOrder] || 6);
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      leverage: Shield,
      domain: Users,
      map: Map,
      exit: DoorOpen,
      challenge: AlertTriangle
    };
    return icons[type as keyof typeof icons] || Shield;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      leverage: 'bg-blue-100 text-blue-800 border-blue-200',
      domain: 'bg-green-100 text-green-800 border-green-200',
      map: 'bg-purple-100 text-purple-800 border-purple-200',
      exit: 'bg-orange-100 text-orange-800 border-orange-200',
      challenge: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type as keyof typeof colors] || colors.leverage;
  };

  return (
    <div className="space-y-6">
      {/* Deck Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Negotiation Strategy Deck
              </CardTitle>
              <p className="text-sm text-blue-700 mt-1">
                {deck.scenario_input}
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-100 text-blue-800 mb-2">
                {cards.length} Total Cards
              </Badge>
              <div className="text-xs text-blue-600">
                Ready to play • No setup required
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Deck Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Deck Composition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
              className="flex items-center gap-1"
            >
              <Grid className="w-3 h-3" />
              All Cards ({cards.length})
            </Button>
            
            {Object.entries(deckStats).map(([type, count]) => {
              const IconComponent = getTypeIcon(type);
              return (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center gap-1 ${selectedType === type ? '' : getTypeColor(type)}`}
                >
                  <IconComponent className="w-3 h-3" />
                  {type} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Showing {filteredCards.length} of {cards.length} cards
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cards Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedCards.map((card, index) => (
            <NegotiationCard
              key={`${card.name}-${index}`}
              card={card}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCards.map((card, index) => (
            <div key={`${card.name}-${index}`} className="max-w-sm">
              <NegotiationCard card={card} index={index} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <Card className="border-2 border-gray-200 bg-gray-50">
          <CardContent className="pt-6 text-center">
            <Filter className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">
              No cards found for selected type
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Try selecting a different card type or view all cards
            </p>
            <Button
              onClick={() => setSelectedType('all')}
              className="mt-3"
              variant="outline"
            >
              Show All Cards
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Deck Metadata */}
      {deck.metadata && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Deck Information</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(deck.metadata).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                  <br />
                  <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SimplifiedCardDeckViewer;