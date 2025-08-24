'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Eye, Brain } from 'lucide-react';

interface LeverageCard {
  name: string;
  leverage_focus: string;
  action: string;
  sophistication_score?: number;
}

interface LeverageCardsWidgetProps {
  recentCards?: LeverageCard[];
  totalCards?: number;
}

export function LeverageCardsWidget({ 
  recentCards = [], 
  totalCards = 0 
}: LeverageCardsWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Leverage Cards
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/cards/leverage">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
          <div>
            <div className="text-2xl font-bold text-blue-900">{totalCards}</div>
            <div className="text-sm text-blue-700">Total Cards Generated</div>
          </div>
          <div className="text-right">
            <Button size="sm" asChild>
              <Link href="/cards/leverage">
                <Plus className="w-4 h-4 mr-1" />
                Generate
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Cards */}
        {recentCards.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">No leverage cards yet</h4>
            <p className="text-sm text-gray-600 mb-4">
              Generate sophisticated leverage cards for strategic negotiations
            </p>
            <Button size="sm" asChild>
              <Link href="/cards/leverage">
                <Zap className="w-4 h-4 mr-2" />
                Get Started
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCards.slice(0, 3).map((card, index) => (
              <div
                key={`${card.name}-${index}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">{card.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {card.leverage_focus}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {card.action}
                    </Badge>
                    {card.sophistication_score && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(card.sophistication_score * 100)}% quality
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {recentCards.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/cards/leverage">
                    View {recentCards.length - 3} more cards
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}