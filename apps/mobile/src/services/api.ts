// Mo'edim API Service Layer
// Centralized API configuration and request handling

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// API Response wrapper
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// HTTP methods type
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request configuration
interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Set authentication token
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Get authentication token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Build headers with authentication
  private buildHeaders(customHeaders: Record<string, string> = {}, requiresAuth: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (requiresAuth && this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = false,
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = this.buildHeaders(headers, requiresAuth);

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        data,
        success: true,
        message: 'Request successful',
      };
    } catch (error) {
      console.error(`API Request failed: ${method} ${url}`, error);
      throw {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T = any>(endpoint: string, body: any, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  async put<T = any>(endpoint: string, body: any, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  async delete<T = any>(endpoint: string, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }

  async patch<T = any>(endpoint: string, body: any, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.get('/');
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export class and types
export { ApiService };
export type { ApiResponse, HttpMethod, RequestConfig };