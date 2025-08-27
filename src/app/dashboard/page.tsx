'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CreditCard, BarChart3, TrendingUp, Eye, Library, Loader2 } from 'lucide-react';
import { useCardStats } from '@/hooks/use-cards';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useCardStats();

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error loading dashboard data</div>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Default stats if no data (shouldn't happen but good fallback)
  const safeStats = stats || {
    totalCards: 0,
    leverageTypes: {
      'Informational': 0,
      'Relational': 0,
      'Resource': 0,
      'Urgency': 0,
      'Narrative': 0,
      'Authority': 0
    },
    intentTypes: {
      'Extract': 0,
      'Increase': 0
    },
    mostUsedLeverage: { type: 'None', count: 0 },
    recentCards: []
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your negotiation cards and track your leverage strategies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/cards">
              <Library className="w-4 h-4 mr-2" />
              View Library
            </Link>
          </Button>
          <Button asChild>
            <Link href="/cards/input">
              <Upload className="w-4 h-4 mr-2" />
              Add Cards
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalCards}</div>
            <p className="text-xs text-muted-foreground">
              Active negotiation cards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leverage Types</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.values(safeStats.leverageTypes).filter(v => v > 0).length}</div>
            <p className="text-xs text-muted-foreground">
              Different leverage strategies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.mostUsedLeverage.type}</div>
            <p className="text-xs text-muted-foreground">
              {safeStats.mostUsedLeverage.count} cards using this type
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intent Split</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.intentTypes.Extract}:{safeStats.intentTypes.Increase}</div>
            <p className="text-xs text-muted-foreground">
              Extract vs Increase ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leverage Types Breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Leverage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(safeStats.leverageTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${safeStats.totalCards > 0 ? (count / safeStats.totalCards) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-4">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href="/cards/input">
                  <Upload className="w-4 h-4 mr-2" />
                  Add New Cards
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/cards">
                  <Library className="w-4 h-4 mr-2" />
                  Browse Card Library
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/cards?filter=Informational">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Informational Cards
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cards */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Cards</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/cards">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {safeStats.recentCards.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No cards yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first negotiation cards.
              </p>
              <Button asChild>
                <Link href="/cards/input">
                  <Upload className="w-4 h-4 mr-2" />
                  Add Cards
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {safeStats.recentCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{card.name}</h4>
                      <p className="text-sm text-gray-500">
                        {card.leverage} • {card.intent} • {card.created_at ? new Date(card.created_at).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/cards">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      </div>
    </ProtectedRoute>
  );
}