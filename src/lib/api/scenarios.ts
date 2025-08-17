import { apiClient } from './client';
import { API_CONFIG } from '@/config/api';
import {
  ScenarioTemplate,
  ScenarioSearchParams,
  ScenarioListResponse,
  ScenarioDetailResponse,
  ScenarioRecommendationsResponse,
  TemplateGenerateRequest,
  CategoryStats,
  GeneratedMapResponse,
  TemplateCustomizations
} from '@/types';

export const scenariosApi = {
  // List and search scenarios
  getScenarios: async (params: ScenarioSearchParams = {}): Promise<ScenarioListResponse> => {
    const searchParams = new URLSearchParams();
    
    // Add search parameters
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);
    if (params.complexity) searchParams.append('complexity', params.complexity);
    if (params.tags?.length) searchParams.append('tags', params.tags.join(','));
    if (params.industries?.length) searchParams.append('industries', params.industries.join(','));
    if (params.featured_only) searchParams.append('featured_only', 'true');
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.user_id) searchParams.append('user_id', params.user_id);
    
    const url = `${API_CONFIG.ENDPOINTS.SCENARIOS}?${searchParams.toString()}`;
    return apiClient.get(url);
  },

  // Get scenario detail
  getScenario: async (id: string, userId?: string): Promise<ScenarioDetailResponse> => {
    const url = userId 
      ? `${API_CONFIG.ENDPOINTS.SCENARIOS}/${id}?user_id=${userId}`
      : `${API_CONFIG.ENDPOINTS.SCENARIOS}/${id}`;
    return apiClient.get(url);
  },

  // Generate map from template
  generateFromTemplate: async (
    templateId: string, 
    request: TemplateGenerateRequest
  ): Promise<GeneratedMapResponse> => {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.SCENARIOS}/${templateId}/generate`, request);
  },

  // Get category statistics
  getCategoryStats: async (): Promise<{ success: boolean; categories: CategoryStats[] }> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SCENARIOS}/categories/stats`);
  },

  // Get recommendations for user
  getRecommendations: async (userId: string, limit = 10): Promise<ScenarioRecommendationsResponse> => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SCENARIOS}/recommendations/${userId}?limit=${limit}`);
  },

  // Toggle favorite status
  toggleFavorite: async (
    templateId: string, 
    userId: string
  ): Promise<{ success: boolean; is_favorite: boolean; message: string }> => {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.SCENARIOS}/${templateId}/favorite`, { user_id: userId });
  },

  // Search scenarios with advanced filters
  searchScenarios: async (query: string, filters?: Partial<ScenarioSearchParams>): Promise<ScenarioListResponse> => {
    return scenariosApi.getScenarios({
      search: query,
      ...filters
    });
  },

  // Get featured scenarios
  getFeaturedScenarios: async (limit = 6): Promise<ScenarioListResponse> => {
    return scenariosApi.getScenarios({
      featured_only: true,
      limit,
      sort_by: 'popularity'
    });
  },

  // Get scenarios by category
  getScenariosByCategory: async (category: string, limit = 20): Promise<ScenarioListResponse> => {
    return scenariosApi.getScenarios({
      category,
      limit,
      sort_by: 'popularity'
    });
  },

  // Get popular scenarios
  getPopularScenarios: async (limit = 10): Promise<ScenarioListResponse> => {
    return scenariosApi.getScenarios({
      sort_by: 'popularity',
      limit
    });
  },

  // Get recent scenarios
  getRecentScenarios: async (limit = 10): Promise<ScenarioListResponse> => {
    return scenariosApi.getScenarios({
      sort_by: 'recent',
      limit
    });
  },

  // Build scenario text from template and customizations (utility function)
  buildScenarioText: (template: ScenarioTemplate, customizations: TemplateCustomizations): string => {
    const {
      title = template.title,
      stakeholders = template.template_data.stakeholders_template,
      objectives = template.template_data.objectives_template,
      constraints = template.template_data.constraints_template,
      timeline = template.template_data.timeline_template,
      context = template.template_data.context_template
    } = customizations;

    return `
Title: ${title}

Description: ${template.description}

Stakeholders: ${stakeholders}

Objectives: ${objectives}

Constraints: ${constraints}

Timeline: ${timeline}

Context: ${context}
    `.trim();
  },

  // Validate template customizations
  validateCustomizations: (customizations: TemplateCustomizations): string[] => {
    const errors: string[] = [];
    
    if (customizations.stakeholders && customizations.stakeholders.length < 10) {
      errors.push('Stakeholders description should be at least 10 characters');
    }
    
    if (customizations.objectives && customizations.objectives.length < 10) {
      errors.push('Objectives description should be at least 10 characters');
    }
    
    if (customizations.constraints && customizations.constraints.length < 5) {
      errors.push('Constraints description should be at least 5 characters');
    }
    
    return errors;
  },

  // Get scenario complexity info
  getComplexityInfo: (complexity: 'beginner' | 'intermediate' | 'advanced') => {
    const complexityMap = {
      beginner: {
        label: 'Beginner',
        description: 'Simple scenarios with clear outcomes',
        color: 'green',
        timeEstimate: '10-15 minutes'
      },
      intermediate: {
        label: 'Intermediate', 
        description: 'Moderate complexity with multiple considerations',
        color: 'yellow',
        timeEstimate: '15-25 minutes'
      },
      advanced: {
        label: 'Advanced',
        description: 'Complex scenarios with multiple stakeholders',
        color: 'red', 
        timeEstimate: '25-40 minutes'
      }
    };
    
    return complexityMap[complexity];
  },

  // Get category info
  getCategoryInfo: (category: string) => {
    const categoryMap = {
      'Workplace': {
        icon: '💼',
        description: 'Professional workplace situations',
        color: 'blue'
      },
      'Business': {
        icon: '🏢',
        description: 'Business deals and partnerships',
        color: 'purple'
      },
      'Sales': {
        icon: '🤝',
        description: 'Sales negotiations and client relations',
        color: 'green'
      },
      'Personal': {
        icon: '🏠',
        description: 'Family and personal life situations',
        color: 'orange'
      },
      'Relationships': {
        icon: '❤️',
        description: 'Social and relationship dynamics',
        color: 'pink'
      },
      'Purchasing': {
        icon: '🛒',
        description: 'Buying and consumer negotiations',
        color: 'indigo'
      },
      'Conflict Resolution': {
        icon: '⚖️',
        description: 'Dispute resolution and mediation',
        color: 'red'
      }
    };
    
    return categoryMap[category as keyof typeof categoryMap] || {
      icon: '📋',
      description: 'General negotiation scenario',
      color: 'gray'
    };
  }
};

// Generate map from template (convenience function)
export const generateMapFromTemplate = async (
  templateId: string,
  request: TemplateGenerateRequest
): Promise<GeneratedMapResponse> => {
  return scenariosApi.generateFromTemplate(templateId, request);
};

// Get scenarios (convenience function)
export const getScenarios = async (params?: ScenarioSearchParams): Promise<ScenarioListResponse> => {
  return scenariosApi.searchScenarios(params?.search || '', params);
};

// Get scenario (convenience function)
export const getScenario = async (id: string, userId?: string): Promise<ScenarioDetailResponse> => {
  return scenariosApi.getScenario(id, userId);
};

// Utility exports for easier imports
export { scenariosApi as default };