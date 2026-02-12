/**
 * Recruiter Service
 * API client for recruiter operations
 */

import { apiClient } from '@/api/client';
import type { ListResponse } from '@/api/types';

export interface Recruiter {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface CreateRecruiterDTO {
  name: string;
  description?: string;
}

export interface UpdateRecruiterDTO {
  name?: string;
  description?: string;
}

export const RecruiterService = {
  /**
   * List all recruiters
   * @param includeInactive - Include deactivated recruiters
   */
  async list(includeInactive = false): Promise<Recruiter[]> {
    // Backend returns { count, data, success } directly (not wrapped in ApiResponse)
    const response = await apiClient.get<unknown>(
      `/api/recruiters?include_inactive=${includeInactive}`
    ) as unknown as ListResponse<Recruiter>;
    return response.data || [];
  },

  /**
   * Search recruiters by name or description
   */
  async search(name?: string, description?: string): Promise<Recruiter[]> {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (description) params.append('description', description);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/recruiters/search?${queryString}`
      : '/api/recruiters/search';

    // Backend returns { count, data, success } directly
    const response = await apiClient.get<unknown>(endpoint) as unknown as ListResponse<Recruiter>;
    return response.data || [];
  },

  /**
   * Get recruiter by ID
   */
  async getById(id: string): Promise<Recruiter> {
    // Backend returns { data: Recruiter, success: true } directly
    const response = await apiClient.get<unknown>(`/api/recruiters/${id}`) as unknown as { data: Recruiter; success: boolean };
    if (!response.data) {
      throw new Error('Recruiter not found');
    }
    return response.data;
  },

  /**
   * Create new recruiter
   */
  async create(data: CreateRecruiterDTO): Promise<Recruiter> {
    // Backend returns { data: Recruiter, success: true } directly
    const response = await apiClient.post<unknown>('/api/recruiters', data) as unknown as { data: Recruiter; success: boolean };
    if (!response.data) {
      throw new Error('Failed to create recruiter');
    }
    return response.data;
  },

  /**
   * Update recruiter
   */
  async update(id: string, data: UpdateRecruiterDTO): Promise<Recruiter> {
    // Backend returns { data: Recruiter, success: true } directly
    const response = await apiClient.put<unknown>(`/api/recruiters/${id}`, data) as unknown as { data: Recruiter; success: boolean };
    if (!response.data) {
      throw new Error('Failed to update recruiter');
    }
    return response.data;
  },

  /**
   * Delete recruiter
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/recruiters/${id}`);
  },

  /**
   * Deactivate recruiter (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    await apiClient.post(`/api/recruiters/${id}/deactivate`, {});
  },

  /**
   * Reactivate recruiter
   */
  async reactivate(id: string): Promise<void> {
    await apiClient.post(`/api/recruiters/${id}/reactivate`, {});
  },
};
