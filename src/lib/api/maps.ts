import { apiClient } from './client';
import { API_CONFIG } from '@/config/api';
import { 
  GeneratedMapResponse, 
  CreateMapRequest, 
  MapListItem,
  PaginatedResponse 
} from '@/types';

export const mapsApi = {
  // Create a new map
  createMap: async (request: CreateMapRequest): Promise<GeneratedMapResponse> => {
    return apiClient.post(API_CONFIG.ENDPOINTS.MAPS, request);
  },

  // Get all maps
  getMaps: async (page = 1, limit = 10): Promise<PaginatedResponse<MapListItem>> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.MAPS}?page=${page}&limit=${limit}`);
  },

  // Get a specific map by ID
  getMap: async (id: string): Promise<GeneratedMapResponse> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.MAPS}/${id}`);
  },

  // Update a map
  updateMap: async (id: string, updates: Partial<CreateMapRequest>): Promise<GeneratedMapResponse> => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.MAPS}/${id}`, updates);
  },

  // Delete a map
  deleteMap: async (id: string): Promise<void> => {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.MAPS}/${id}`);
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    return apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
  },
};