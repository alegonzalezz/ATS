/**
 * Generic HTTP Client
 * Base class for making API requests with error handling
 */

import { API_CONFIG } from './config';
import type { ApiResponse } from './types';

export class ApiError extends Error {
  statusCode?: number;
  response?: unknown;

  constructor(message: string, statusCode?: number, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(config: { baseURL: string; headers: Record<string, string> }) {
    this.baseURL = config.baseURL;
    this.headers = config.headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const contentType = response.headers.get('content-type');

      // Check if response is JSON
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new ApiError(
          `Server returned ${response.status} with non-JSON content. URL: ${url}`,
          response.status,
          text.substring(0, 500)
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'API request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Health check endpoint
   * Verifies if the API is running
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    return this.get('/api/health');
  }
}

export const apiClient = new ApiClient(API_CONFIG);
export { ApiClient };
