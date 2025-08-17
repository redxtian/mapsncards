import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mapsApi } from '@/lib/api';
import { CreateMapRequest, GeneratedMapResponse } from '@/types';
import { toast } from 'sonner';

// Query keys
export const mapKeys = {
  all: ['maps'] as const,
  lists: () => [...mapKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...mapKeys.lists(), { filters }] as const,
  details: () => [...mapKeys.all, 'detail'] as const,
  detail: (id: string) => [...mapKeys.details(), id] as const,
};

// Get all maps
export function useMaps(page = 1, limit = 10) {
  return useQuery({
    queryKey: mapKeys.list({ page, limit }),
    queryFn: () => mapsApi.getMaps(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single map
export function useMap(id: string) {
  return useQuery({
    queryKey: mapKeys.detail(id),
    queryFn: () => mapsApi.getMap(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create map mutation
export function useCreateMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMapRequest) => mapsApi.createMap(data),
    onSuccess: (data: GeneratedMapResponse) => {
      // Invalidate and refetch maps list
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() });
      
      // Add the new map to the cache
      queryClient.setQueryData(
        mapKeys.detail(data.metadata.map_id),
        data
      );

      toast.success('Map created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create map: ${error.message}`);
    },
  });
}

// Update map mutation
export function useUpdateMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateMapRequest> }) =>
      mapsApi.updateMap(id, updates),
    onSuccess: (data: GeneratedMapResponse, variables) => {
      // Update the specific map in cache
      queryClient.setQueryData(
        mapKeys.detail(variables.id),
        data
      );

      // Invalidate maps list to show updated data
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() });

      toast.success('Map updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update map: ${error.message}`);
    },
  });
}

// Delete map mutation
export function useDeleteMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mapsApi.deleteMap(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: mapKeys.detail(deletedId) });
      
      // Invalidate maps list
      queryClient.invalidateQueries({ queryKey: mapKeys.lists() });

      toast.success('Map deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete map: ${error.message}`);
    },
  });
}

// Health check query
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => mapsApi.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}