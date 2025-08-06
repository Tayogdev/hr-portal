import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import cacheManager, { CACHE_KEYS, invalidateCache } from './cacheManager';

// API client configuration
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const session = await getSession();
        if (session?.user) {
          config.headers.Authorization = `Bearer ${session.user.id}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and caching
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Cache successful GET requests
        if (response.config.method?.toLowerCase() === 'get' && response.status === 200) {
          const cacheKey = this.generateCacheKey(response.config);
          if (cacheKey) {
            cacheManager.set(cacheKey, response.data, 5 * 60 * 1000); // 5 minutes
          }
        }
        return response;
      },
      async (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
          // Clear cache and redirect to login
          cacheManager.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Handle server errors
        if (error.response?.status >= 500) {
          console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
      }
    );
  }

  private generateCacheKey(config: AxiosRequestConfig): string | null {
    if (!config.url) return null;
    
    const method = config.method?.toLowerCase();
    const url = config.url;
    const params = config.params ? JSON.stringify(config.params) : '';
    
    return `${method}:${url}:${params}`;
  }

  // Generic request method with caching
  async request<T>(config: AxiosRequestConfig, useCache = true): Promise<T> {
    const cacheKey = this.generateCacheKey(config);
    
    // Check cache for GET requests
    if (useCache && config.method?.toLowerCase() === 'get' && cacheKey) {
      const cachedData = cacheManager.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const response = await this.client.request<T>(config);
    return response.data;
  }

  // GET request with caching
  async get<T>(url: string, config?: AxiosRequestConfig, useCache = true): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url }, useCache);
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data }, false);
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data }, false);
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url }, false);
  }

  // PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data }, false);
  }

  // Clear cache for specific patterns
  clearCache(pattern?: string) {
    if (pattern) {
      cacheManager.invalidatePattern(pattern);
    } else {
      cacheManager.clear();
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// API endpoints with proper typing
export const api = {
  // Pages
  pages: {
    getAll: () => apiClient.get('/api/pages'),
    getById: (id: string) => apiClient.get(`/api/pages/${id}`),
    create: (data: any) => apiClient.post('/api/pages', data),
    update: (id: string, data: any) => apiClient.put(`/api/pages/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/pages/${id}`),
  },

  // Events
  events: {
    getAll: (pageId: string) => apiClient.get(`/api/events?pageId=${pageId}`),
    getById: (id: string) => apiClient.get(`/api/events/${id}`),
    create: (data: any) => apiClient.post('/api/events', data),
    update: (id: string, data: any) => apiClient.put(`/api/events/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/events/${id}`),
    getApplicants: (id: string) => apiClient.get(`/api/events/${id}/applicants`),
  },

  // Opportunities
  opportunities: {
    getAll: (pageId: string) => apiClient.get(`/api/opportunities?pageId=${pageId}`),
    getById: (id: string) => apiClient.get(`/api/opportunities/${id}`),
    create: (data: any) => apiClient.post('/api/opportunities', data),
    update: (id: string, data: any) => apiClient.put(`/api/opportunities/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/opportunities/${id}`),
    getApplicants: (id: string) => apiClient.get(`/api/opportunities/${id}/applicants`),
  },

  // Applicants
  applicants: {
    getAll: () => apiClient.get('/api/opportunities/applicants'),
    getById: (id: string) => apiClient.get(`/api/applicants/${id}`),
    update: (id: string, data: any) => apiClient.put(`/api/applicants/${id}`, data),
  },

  // Cache management
  cache: {
    clear: (pattern?: string) => apiClient.clearCache(pattern),
    invalidate: {
      pages: () => invalidateCache.pages(),
      events: (eventId: string) => invalidateCache.event(eventId),
      opportunities: (opportunityId: string) => invalidateCache.opportunity(opportunityId),
      applicants: () => invalidateCache.applicants(),
    }
  }
};

export default apiClient; 