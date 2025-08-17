export type { 
  DimensionRating,
  Dimension,
  MapDimensions,
  MapMechanics,
  NegotiationMap,
  MapMetadata,
  GeneratedMapResponse,
  CreateMapRequest,
  MapListItem
} from './map';

export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  GenerateCardsRequest,
  GenerateCardsResponse,
  CardDeckListResponse,
  CardDeckDetailResponse,
  ValidationReport
} from './api';

export type {
  ScenarioTemplate,
  ScenarioSearchParams,
  ScenarioListResponse,
  ScenarioDetailResponse,
  ScenarioAnalytics,
  UserScenarioInteraction,
  CategoryStats,
  ComplexityStats,
  TemplateCustomizations,
  TemplateGenerateRequest,
  ScenarioRecommendation,
  ScenarioRecommendationsResponse,
  ScenarioFilters,
  ScenarioSortOption,
  ScenarioCardProps,
  ScenarioLibraryProps,
  CategoryBrowserProps,
  TemplateCustomizerProps,
  ScenarioCategory,
  ComplexityLevel,
  SortOption
} from './scenario';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type {
  CardType,
  BaseCard,
  LeverageCard,
  DomainCard,
  ChallengeCard,
  ExitCard,
  MapCard,
  AnyCard,
  CardDeckPayload
} from './cards';
