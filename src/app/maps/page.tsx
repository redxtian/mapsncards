'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common';
import { 
  PlusCircle, 
  Map, 
  Eye, 
  Search, 
  Calendar,
  Zap,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { NegotiationMap } from '@/types/map';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function MapsPage() {
  const [maps, setMaps] = useState<NegotiationMap[]>([]);
  const [filteredMaps, setFilteredMaps] = useState<NegotiationMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [engineFilter, setEngineFilter] = useState<string>('all');
  const [deletingMapId, setDeletingMapId] = useState<string | null>(null);

  const fetchMaps = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/maps');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch maps: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.maps)) {
        // Transform database format to frontend format
        const transformedMaps = result.maps.map((dbMap: Record<string, any>) => ({
          id: dbMap.id,
          mapName: dbMap.generated_map?.mapName || dbMap.map_name,
          mapCategory: dbMap.generated_map?.mapCategory || dbMap.map_category,
          dimensions: dbMap.generated_map?.dimensions || {},
          narrative: dbMap.generated_map?.narrative || '',
          objectives: dbMap.generated_map?.objectives || [],
          mechanics: dbMap.generated_map?.mechanics || { branches: [], events: [] },
          challenges: dbMap.generated_map?.challenges || [],
          metadata: {
            engine: dbMap.metadata?.engine || dbMap.scenario_type,
            execution_time: dbMap.metadata?.execution_time,
            generation_timestamp: dbMap.created_at || dbMap.metadata?.generation_timestamp,
            status: dbMap.metadata?.status
          }
        }));
        
        setMaps(transformedMaps);
        setFilteredMaps(transformedMaps);
      } else {
        console.warn('API returned unexpected format:', result);
        setMaps([]);
        setFilteredMaps([]);
        throw new Error(result.message || 'Failed to load maps');
      }
    } catch (error) {
      console.error('Error fetching maps:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load maps');
      setMaps([]);
      setFilteredMaps([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  useEffect(() => {
    let filtered = maps;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(map =>
        map.mapName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        map.narrative.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(map => map.mapCategory === categoryFilter);
    }

    // Apply engine filter
    if (engineFilter !== 'all') {
      filtered = filtered.filter(map => map.metadata?.engine === engineFilter);
    }

    setFilteredMaps(filtered);
  }, [maps, searchQuery, categoryFilter, engineFilter]);

  const handleDeleteMap = async (mapId: string, mapName: string) => {
    if (!confirm(`Are you sure you want to delete "${mapName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingMapId(mapId);

    try {
      const response = await fetch(`/api/maps/${mapId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete map: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Remove the deleted map from local state
        const updatedMaps = maps.filter(map => map.id !== mapId);
        setMaps(updatedMaps);
        setFilteredMaps(updatedMaps.filter(map => {
          // Apply current filters
          let filtered = [map];
          
          if (searchQuery.trim()) {
            filtered = filtered.filter(m =>
              m.mapName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.narrative.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          
          if (categoryFilter !== 'all') {
            filtered = filtered.filter(m => m.mapCategory === categoryFilter);
          }
          
          if (engineFilter !== 'all') {
            filtered = filtered.filter(m => m.metadata?.engine === engineFilter);
          }
          
          return filtered.length > 0;
        }));

        toast.success('Map deleted successfully');
      } else {
        throw new Error(result.message || 'Failed to delete map');
      }
    } catch (error) {
      console.error('Error deleting map:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete map');
    } finally {
      setDeletingMapId(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Chaotic':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Adversarial':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Cooperative':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Stable':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Maps</h2>
            <p className="text-gray-500">Fetching your negotiation maps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Maps</h1>
          <p className="text-gray-600 mt-2">
            Manage and organize your negotiation maps ({maps.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMaps}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/maps/create">
              <PlusCircle className="w-4 h-4 mr-2" />
              New Map
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search maps by name or content..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Chaotic">Chaotic</SelectItem>
                  <SelectItem value="Adversarial">Adversarial</SelectItem>
                  <SelectItem value="Cooperative">Cooperative</SelectItem>
                  <SelectItem value="Stable">Stable</SelectItem>
                </SelectContent>
              </Select>
              <Select value={engineFilter} onValueChange={setEngineFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engines</SelectItem>
                  <SelectItem value="crewai">CrewAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active Filters */}
          {(searchQuery || categoryFilter !== 'all' || engineFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('')}>
                  Search: &quot;{searchQuery}&quot; ×
                </Badge>
              )}
              {categoryFilter !== 'all' && (
                <Badge variant="outline" className="cursor-pointer" onClick={() => setCategoryFilter('all')}>
                  Category: {categoryFilter} ×
                </Badge>
              )}
              {engineFilter !== 'all' && (
                <Badge variant="outline" className="cursor-pointer" onClick={() => setEngineFilter('all')}>
                  Engine: {engineFilter} ×
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maps Grid */}
      {!filteredMaps || filteredMaps.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {maps.length === 0 ? 'No maps yet' : 'No maps match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {maps.length === 0 
                ? 'Get started by creating your first negotiation map.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
            {maps.length === 0 ? (
              <Button asChild>
                <Link href="/maps/create">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Map
                </Link>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setEngineFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredMaps || []).map((map) => (
            <Card key={map.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Map className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate" title={map.mapName}>
                        {map.mapName}
                      </CardTitle>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMap(map.id, map.mapName)}
                    disabled={deletingMapId === map.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                    title="Delete map"
                  >
                    {deletingMapId === map.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Category</span>
                    <Badge className={getCategoryColor(map.mapCategory)}>
                      {map.mapCategory}
                    </Badge>
                  </div>
                  
                  {map.metadata?.engine && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Engine</span>
                      <div className="flex items-center">
                        <Zap className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-sm capitalize">{map.metadata.engine}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Created</span>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-sm">
                        {map.metadata?.generation_timestamp 
                          ? new Date(map.metadata.generation_timestamp).toLocaleDateString()
                          : 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Narrative Preview */}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {map.narrative.length > 100 
                        ? `${map.narrative.substring(0, 100)}...`
                        : map.narrative
                      }
                    </p>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button size="sm" asChild className="w-full">
                      <Link href={`/maps/${map.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Map
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}