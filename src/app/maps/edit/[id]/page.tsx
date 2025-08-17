'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { MapBuilder } from '@/components/forms/map-builder';
import { ArrowLeft } from 'lucide-react';
import { useMap, useUpdateMap } from '@/hooks/use-maps';
import { NegotiationMap } from '@/types/map';
import { toast } from 'sonner';

interface EditMapPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMapPage({ params }: EditMapPageProps) {
  const router = useRouter();
  const [mapId, setMapId] = React.useState<string>('');
  
  // Get mapId from params
  React.useEffect(() => {
    params.then(({ id }) => setMapId(id));
  }, [params]);

  const { data: mapResponse, isLoading, error } = useMap(mapId);
  const updateMapMutation = useUpdateMap();

  const handleSaveMap = async (updatedMap: NegotiationMap) => {
    try {
      await updateMapMutation.mutateAsync({
        id: mapId,
        updates: {
          prompt: JSON.stringify(updatedMap) // Convert to prompt format for API
        }
      });
      
      toast.success('Map updated successfully!');
      router.push(`/maps/view/${mapId}`);
    } catch (error) {
      console.error('Error updating map:', error);
      toast.error('Failed to update map');
    }
  };

  if (!mapId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Map</h2>
            <p className="text-gray-500">Fetching map data for editing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/maps">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Maps
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Map</h1>
            <p className="text-gray-600 mt-1">Map ID: {mapId}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <ErrorMessage 
              title="Failed to load map data" 
              message={error instanceof Error ? error.message : 'Unknown error occurred'}
            />
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/maps">Return to Maps</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mapResponse?.generated_map) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" asChild>
            <Link href="/maps">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Maps
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Map</h1>
            <p className="text-gray-600 mt-1">Map ID: {mapId}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Map not found or invalid format.</p>
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href="/maps">Return to Maps</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert API response to NegotiationMap format
  const negotiationMap: NegotiationMap = {
    id: mapResponse.metadata.map_id,
    mapName: mapResponse.generated_map.mapName,
    mapCategory: mapResponse.generated_map.mapCategory,
    dimensions: mapResponse.generated_map.dimensions,
    narrative: mapResponse.generated_map.narrative,
    objectives: mapResponse.generated_map.objectives,
    mechanics: mapResponse.generated_map.mechanics,
    challenges: mapResponse.generated_map.challenges,
    imagePrompt: mapResponse.generated_map.imagePrompt,
    metadata: {
      engine: (mapResponse.metadata as any)?.engine,
      generation_timestamp: (mapResponse.metadata as any)?.generation_timestamp,
      status: mapResponse.metadata.status
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/maps/view/${mapId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Map View
          </Link>
        </Button>
      </div>

      {/* Map Builder */}
      <MapBuilder
        originalMap={negotiationMap}
        onSave={handleSaveMap}
        isLoading={updateMapMutation.isPending}
      />
    </div>
  );
}