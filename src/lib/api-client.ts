import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';
import cacheManager from './cacheManager';
import logger from './logger';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
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
        logger.error('Request interceptor error', error, 'ApiClient');
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
          logger.warn('Authentication error, clearing cache and redirecting', 'ApiClient');
          // Clear cache and redirect to login
          cacheManager.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Handle server errors
        if (error.response?.status >= 500) {
          logger.error('Server error', error, 'ApiClient', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private generateCacheKey(config: any): string | null {
    if (!config.url) return null;
    
    const params = config.params ? JSON.stringify(config.params) : '';
    return `${config.method}:${config.url}:${params}`;
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // Cache management
  invalidateCache(pattern: string): void {
    cacheManager.invalidatePattern(pattern);
  }

  clearCache(): void {
    cacheManager.clear();
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient; 