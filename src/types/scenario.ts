export interface ScenarioTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Workplace' | 'Business' | 'Sales' | 'Personal' | 'Relationships' | 'Purchasing' | 'Conflict Resolution';
  template_data: {
    stakeholders_template: string;
    objectives_template: string;
    constraints_template: string;
    timeline_template: string;
    context_template: string;
  };
  metadata: {
    complexity: 'beginner' | 'intermediate' | 'advanced';
    time_investment: number;
    industry: string[];
    stakeholder_types: string[];
    power_dynamics: string;
    relationship_type: string;
    common_outcomes: string[];
  };
  tags: string[];
  keywords: string[];
  usage_count: number;
  success_rate: number;
  avg_rating: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  relevance_score?: number;
  user_interaction?: {
    is_favorite: boolean;
    last_used_at?: string;
    usage_count: number;
  };
}

export interface ScenarioSearchParams {
  search?: string;
  category?: string;
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  industries?: string[];
  featured_only?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'relevance' | 'popularity' | 'recent' | 'rating';
  user_id?: string;
}

export interface ScenarioListResponse {
  success: boolean;
  scenarios: ScenarioTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
    total_pages: number;
  };
  filters: {
    categories: CategoryStats[];
    complexity_levels: ComplexityStats[];
  };
  message?: string;
}

export interface ScenarioDetailResponse {
  success: boolean;
  scenario?: ScenarioTemplate;
  analytics?: ScenarioAnalytics;
  similar_scenarios?: ScenarioTemplate[];
  user_interaction?: UserScenarioInteraction;
  message?: string;
}

export interface ScenarioAnalytics {
  usage_stats: {
    total_views: number;
    total_customizations: number;
    total_generations: number;
    total_completions: number;
    total_ratings: number;
    unique_users: number;
  };
  performance_metrics: {
    success_rate: number;
    avg_feedback_score: number;
    conversion_rate: number;
    completion_rate: number;
  };
  activity_metrics: {
    recent_activity: number;
    monthly_activity: number;
    first_usage?: string;
    last_usage?: string;
    activity_trend: number;
  };
}

export interface UserScenarioInteraction {
  is_favorite: boolean;
  last_used_at?: string;
  usage_count: number;
}

export interface CategoryStats {
  category: string;
  total_scenarios: number;
  avg_rating: number;
  total_usage: number;
  featured_count: number;
}

export interface ComplexityStats {
  level: 'beginner' | 'intermediate' | 'advanced';
  count: number;
}

export interface TemplateCustomizations {
  title?: string;
  stakeholders?: string;
  objectives?: string;
  constraints?: string;
  timeline?: string;
  context?: string;
}

export interface TemplateGenerateRequest {
  customizations: TemplateCustomizations;
  quick_generate?: boolean;
  save_customization?: boolean;
  user_id?: string;
}

export interface ScenarioRecommendation extends ScenarioTemplate {
  recommendation_reason: string;
  relevance_score: number;
}

export interface ScenarioRecommendationsResponse {
  success: boolean;
  recommendations: ScenarioRecommendation[];
}

// Filter and search related types
export interface ScenarioFilters {
  categories: string[];
  complexities: string[];
  industries: string[];
  tags: string[];
  featured_only: boolean;
}

export interface ScenarioSortOption {
  value: 'relevance' | 'popularity' | 'recent' | 'rating';
  label: string;
  description: string;
}

// UI component prop types
export interface ScenarioCardProps {
  scenario: ScenarioTemplate;
  variant?: 'compact' | 'detailed' | 'featured';
  showAnalytics?: boolean;
  showFavorite?: boolean;
  onSelect?: (scenario: ScenarioTemplate) => void;
  onQuickGenerate?: (scenario: ScenarioTemplate) => void;
  onFavorite?: (scenario: ScenarioTemplate) => void;
  className?: string;
}

export interface ScenarioLibraryProps {
  onScenarioSelect: (scenario: ScenarioTemplate) => void;
  initialCategory?: string;
  initialSearch?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  variant?: 'grid' | 'list';
  userId?: string;
}

export interface CategoryBrowserProps {
  categories: CategoryStats[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  showCounts?: boolean;
  variant?: 'grid' | 'list' | 'tabs';
}

export interface TemplateCustomizerProps {
  template: ScenarioTemplate;
  onSubmit: (customizations: TemplateCustomizations) => void;
  onCancel: () => void;
  initialValues?: TemplateCustomizations;
  isLoading?: boolean;
  showPreview?: boolean;
}

// API response types for error handling
export interface ApiError {
  success: false;
  message: string;
  detail?: string;
}

export type ScenarioApiResponse<T> = T | ApiError;

// Utility types
export type ScenarioCategory = ScenarioTemplate['category'];
export type ComplexityLevel = ScenarioTemplate['metadata']['complexity'];
export type SortOption = ScenarioSearchParams['sort_by'];

// Constants
export const SCENARIO_CATEGORIES: ScenarioCategory[] = [
  'Workplace',
  'Business', 
  'Sales',
  'Personal',
  'Relationships',
  'Purchasing',
  'Conflict Resolution'
];

export const COMPLEXITY_LEVELS: ComplexityLevel[] = [
  'beginner',
  'intermediate', 
  'advanced'
];

export const SORT_OPTIONS: ScenarioSortOption[] = [
  { value: 'relevance', label: 'Most Relevant', description: 'Best match for your search' },
  { value: 'popularity', label: 'Most Popular', description: 'Most used by other users' },
  { value: 'recent', label: 'Recently Added', description: 'Newest scenarios first' },
  { value: 'rating', label: 'Highest Rated', description: 'Best user ratings' }
];

// Type guards
export function isScenarioTemplate(obj: any): obj is ScenarioTemplate {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    SCENARIO_CATEGORIES.includes(obj.category) &&
    obj.template_data &&
    obj.metadata;
}

export function isApiError(response: any): response is ApiError {
  return response && response.success === false && typeof response.message === 'string';
}