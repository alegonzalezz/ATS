/**
 * API Response Types
 * Common types used across all API services
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ListResponse<T> {
  data: T[];
  count: number;
}
