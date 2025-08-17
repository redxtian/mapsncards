'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, TrendingUp, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ScenarioTemplate, ScenarioCategory } from '@/types/scenario';
import { getScenarios } from '@/lib/api/scenarios';

export function ScenarioLibraryPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'recent' | 'rating'>('popularity');

  const loadScenarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getScenarios({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        sort_by: sortBy,
        limit: 50
      });
      setScenarios(response.scenarios);
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, sortBy]);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const handleSearch = () => {
    loadScenarios();
  };

  const handleScenarioSelect = (scenario: ScenarioTemplate) => {
    // Navigate to scenario customization/generation page
    router.push(`/scenarios/${scenario.id}/customize`);
  };

  const filteredScenarios = scenarios.filter(scenario =>
    scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scenario.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories: Array<{ value: ScenarioCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'Workplace', label: 'Workplace' },
    { value: 'Business', label: 'Business' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Personal', label: 'Personal' },
    { value: 'Relationships', label: 'Relationships' },
    { value: 'Purchasing', label: 'Purchasing' },
    { value: 'Conflict Resolution', label: 'Conflict Resolution' }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading scenarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Scenarios</h1>
        <p className="text-gray-600">
          Discover proven negotiation scenarios to kickstart your map creation. 
          Choose from {scenarios.length} professionally crafted templates.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ScenarioCategory | 'all')}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usage_count">Most Popular</SelectItem>
                <SelectItem value="avg_rating">Highest Rated</SelectItem>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="title">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="px-6">
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scenario) => (
          <Card key={scenario.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleScenarioSelect(scenario)}>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="text-xs">
                  {scenario.category}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getComplexityColor(scenario.metadata?.complexity || 'beginner')}`}
                >
                  {scenario.metadata?.complexity || 'beginner'}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{scenario.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {scenario.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{scenario.usage_count || 0} uses</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{scenario.metadata?.time_investment || 15}m</span>
                </div>
                {scenario.avg_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{scenario.avg_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              {scenario.tags && scenario.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {scenario.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {scenario.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{scenario.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <Button className="w-full" size="sm">
                Use This Scenario
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredScenarios.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No scenarios found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or browse all categories.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              loadScenarios();
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}