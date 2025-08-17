export type DimensionRating = 'Low' | 'Medium' | 'High';

export interface Dimension {
  rating: DimensionRating;
  description: string;
}

export interface MapDimensions {
  variability: Dimension;
  opposition: Dimension;
  cooperation: Dimension;
}

export interface MapMechanics {
  branches: string[];
  events: string[];
}

export interface Challenge {
  description: string;
  mitigationStrategy?: string;
}

export interface NegotiationMap {
  id: string;
  mapName: string;
  mapCategory: string;
  dimensions: MapDimensions;
  narrative: string;
  objectives: string[];
  mechanics: MapMechanics;
  challenges: (string | Challenge)[];
  imagePrompt?: string;
  metadata?: {
    engine?: string;
    execution_time?: number;
    generation_timestamp?: string;
    status?: string;
  };
}

export interface MapMetadata {
  status: string;
  map_id: string;
  map_name: string;
  category: string;
}

export interface GeneratedMapResponse {
  original_prompt: string;
  generated_map: NegotiationMap;
  metadata: MapMetadata;
}

export interface CreateMapRequest {
  prompt: string;
  userId?: string;
}

export interface MapListItem {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}