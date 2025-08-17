'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MapViewer } from '@/components/maps/map-viewer';
import { LoadingSpinner } from '@/components/common';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { NegotiationMap } from '@/types/map';

export default function MapPage() {
  const params = useParams();
  const router = useRouter();
  const mapId = params?.mapId as string;
  
  const [map, setMap] = useState<NegotiationMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMap = useCallback(async () => {
    if (!mapId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/maps/${mapId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Map not found');
        }
        throw new Error(`Failed to load map: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.map) {
        // Transform database format to frontend format
        const dbMap = result.map;
        const transformedMap = {
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
        };
        
        setMap(transformedMap);
      } else {
        throw new Error(result.message || 'Failed to load map');
      }
    } catch (error) {
      console.error('Error fetching map:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load map';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mapId]);

  useEffect(() => {
    fetchMap();
  }, [fetchMap]);

  const handleExport = () => {
    if (!map) return;
    
    try {
      // Create JSON export
      const exportData = {
        ...map,
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${map.mapName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_map.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Map exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export map');
    }
  };

  const handleShare = async () => {
    if (!map) return;
    
    try {
      const shareUrl = `${window.location.origin}/maps/${mapId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: map.mapName,
          text: `Check out this negotiation map: ${map.mapName}`,
          url: shareUrl,
        });
        toast.success('Map shared successfully!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Map URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share map');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Map</h2>
            <p className="text-gray-500">Retrieving your negotiation map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !map) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/maps">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Maps
          </Link>
        </Button>
        
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error === 'Map not found' ? 'Map Not Found' : 'Error Loading Map'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error === 'Map not found' 
                ? 'The map you\'re looking for doesn\'t exist or may have been deleted.'
                : error || 'Something went wrong while loading the map.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={fetchMap}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/maps">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Maps
        </Link>
      </Button>

      {/* Map Display */}
      <MapViewer 
        map={map} 
        onExport={handleExport}
        onShare={handleShare}
      />
    </div>
  );
}