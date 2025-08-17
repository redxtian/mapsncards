import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, API_HEADERS } from '@/config/api';
import { ApiError, ApiResponse, GenerateCardsRequest, GenerateCardsResponse, CardDeckListResponse, CardDeckDetailResponse, ValidationReport, LeverageCardGenerationRequest, LeverageCardGenerationResponse, GenerationSystemStatus } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          status: error.response?.status || 500,
          code: error.response?.data?.code,
        };
        
        console.error('API Error:', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  // Direct response methods for APIs that don't follow ApiResponse<T> wrapper
  async getRaw<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async postRaw<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // Card-specific API methods
  async generateCards(request: GenerateCardsRequest): Promise<GenerateCardsResponse> {
    return this.postRaw<GenerateCardsResponse>('/api/cards/generate', request);
  }

  async getCardDecks(page = 1, limit = 20): Promise<CardDeckListResponse> {
    return this.getRaw<CardDeckListResponse>(`/api/cards?page=${page}&limit=${limit}`);
  }

  async getCardDeck(deckId: string): Promise<CardDeckDetailResponse> {
    return this.getRaw<CardDeckDetailResponse>(`/api/cards/${deckId}`);
  }

  async deleteCardDeck(deckId: string): Promise<{ success: boolean; message?: string }> {
    return this.client.delete(`/api/cards/${deckId}`).then(res => res.data);
  }

  async validateCardDeck(cards: any[]): Promise<ValidationReport> {
    return this.postRaw<ValidationReport>('/api/cards/validate', { cards });
  }

  // Sophisticated Leverage Card Generation API methods
  async generateLeverageCards(request: LeverageCardGenerationRequest): Promise<LeverageCardGenerationResponse> {
    return this.postRaw<LeverageCardGenerationResponse>(API_CONFIG.ENDPOINTS.CARDS_GENERATE_LEVERAGE, request);
  }

  async getLeverageGenerationStatus(): Promise<GenerationSystemStatus> {
    return this.getRaw<GenerationSystemStatus>(API_CONFIG.ENDPOINTS.CARDS_GENERATION_STATUS);
  }

  async checkLeverageGenerationHealth(): Promise<{ status: string; service: string; agents_ready: boolean; timestamp: number }> {
    return this.getRaw<{ status: string; service: string; agents_ready: boolean; timestamp: number }>('/api/cards/health');
  }
}

export const apiClient = new ApiClient();