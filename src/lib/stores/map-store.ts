import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { NegotiationMap, MapListItem } from '@/types';

interface MapState {
  // Current map being viewed/edited
  currentMap: NegotiationMap | null;
  
  // List of user's maps
  maps: MapListItem[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentMap: (map: NegotiationMap | null) => void;
  setMaps: (maps: MapListItem[]) => void;
  addMap: (map: MapListItem) => void;
  updateMap: (id: string, updates: Partial<MapListItem>) => void;
  removeMap: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    (set) => ({
      currentMap: null,
      maps: [],
      isLoading: false,
      error: null,

      setCurrentMap: (map) => 
        set({ currentMap: map }, false, 'setCurrentMap'),

      setMaps: (maps) => 
        set({ maps }, false, 'setMaps'),

      addMap: (map) => 
        set(
          (state) => ({ maps: [map, ...state.maps] }),
          false,
          'addMap'
        ),

      updateMap: (id, updates) =>
        set(
          (state) => ({
            maps: state.maps.map((map) =>
              map.id === id ? { ...map, ...updates } : map
            ),
          }),
          false,
          'updateMap'
        ),

      removeMap: (id) =>
        set(
          (state) => ({
            maps: state.maps.filter((map) => map.id !== id),
          }),
          false,
          'removeMap'
        ),

      setLoading: (isLoading) => 
        set({ isLoading }, false, 'setLoading'),

      setError: (error) => 
        set({ error }, false, 'setError'),

      clearError: () => 
        set({ error: null }, false, 'clearError'),
    }),
    {
      name: 'map-store',
    }
  )
);