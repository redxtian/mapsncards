export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Card Generation API Types
export interface GenerateCardsRequest {
  scenario: string;
  include_types?: ('leverage' | 'domain' | 'map' | 'exit' | 'challenge')[];
  max_challenge_cards?: number;
  leverage_types?: ('informational' | 'relational' | 'resource' | 'urgency' | 'narrative' | 'authority')[];
  deployment_mode?: 'direct' | 'subtle';
  scenario_metadata?: Record<string, unknown>;
  anatomy_compliant?: boolean;
  include_placeholders?: boolean;
  ethical_guidelines?: boolean;
}

export interface GenerateCardsResponse {
  success: boolean;
  scenario_input?: string;
  cards: any[]; // Will be AnyCard[] when anatomy compliant
  total_cards: number;
  generation_time?: number;
  message?: string;
  generation_id?: number;
  anatomy_version?: string;
  anatomy_compliant?: boolean;
  deck_composition?: Record<string, number>;
  ethical_compliance?: boolean;
}

export interface CardDeckListResponse {
  success: boolean;
  decks: any[];
  total_count: number;
  page: number;
  limit: number;
  message?: string;
}

export interface CardDeckDetailResponse {
  success: boolean;
  deck?: any;
  source?: string;
  message?: string;
}

// Sophisticated Leverage Card Generation Types
export interface LeverageCardGenerationRequest {
  leverage_types?: ('informational' | 'relational' | 'resource' | 'urgency' | 'narrative' | 'authority')[];
  action_focus?: 'extract' | 'increase' | 'both';
  card_count?: number;
  sophistication_level?: 'high' | 'medium';
  deployment_preference?: 'direct' | 'subtle' | 'both';
  cognitive_frameworks?: ('think_probe_refine' | 'assess_build_propose' | 'identify_link_suggest' | 'surface_analyze_apply' | 'establish_demonstrate_leverage')[];
}

export interface LeverageCard {
  name: string;
  type: 'leverage';
  leverage_focus: string;
  action: string;
  best_for: string;
  steps: string[];
  deployment_modes: {
    direct: string;
    subtle: string;
  };
  recovery_tip: string;
  map_adaptation: Record<string, string>;
  cognitive_framework: string;
  anatomy_compliant: boolean;
  sophistication_score?: number;
}

export interface GenerationMetadata {
  agents_used: string[];
  total_sophistication_score: number;
  quality_benchmark_match: boolean;
  cards_generated: number;
  generation_time_seconds: number;
  framework_distribution: Record<string, number>;
  leverage_type_coverage: Record<string, number>;
  type_distribution: Record<string, number>;
  action_distribution: Record<string, number>;
  performance_summary: Record<string, any>;
}

export interface LeverageCardGenerationResponse {
  success: boolean;
  cards: LeverageCard[];
  generation_metadata: GenerationMetadata;
  error?: string;
}

export interface GenerationSystemStatus {
  success: boolean;
  system_status: {
    agents_initialized: number;
    knowledge_base_loaded: boolean;
    benchmarks_established: boolean;
    system_healthy: boolean;
  };
  endpoints_available: string[];
  rate_limits: {
    requests_per_minute: number;
    max_cards_per_request: number;
  };
}

// Card Anatomy Validation Types
export interface ValidationReport {
  is_valid: boolean;
  errors: string[];
  total_cards: number;
  type_composition: Record<string, number>;
  placeholder_stats: {
    cards_with_placeholders: number;
    total_placeholders: number;
    steps_with_placeholders: number;
  };
  anatomy_version: string;
  validation_timestamp: string;
}