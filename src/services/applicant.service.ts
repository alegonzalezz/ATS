/**
 * Applicant Service
 * API client for applicant operations
 */

import { apiClient } from '@/api/client';
import type { ListResponse } from '@/api/types';

export interface Applicant {
  id: string;
  name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  city?: string;
  english?: string;
  created_at?: string;
  updated_at?: string;
  deactive_at?: string | null;
}

export interface CreateApplicantDTO {
  name: string;
  email?: string;
  phone?: string;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export interface UpdateApplicantDTO {
  name?: string;
  email?: string;
  phone?: string;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export const ApplicantService = {
  /**
   * List all applicants
   * @param includeInactive - Include deactivated applicants
   */
  async list(includeInactive = false): Promise<Applicant[]> {
    // Backend returns { count, data, success } directly (not wrapped in ApiResponse)
    const response = await apiClient.get<unknown>(
      `/api/applicants?include_inactive=${includeInactive}`
    ) as unknown as ListResponse<Applicant>;
    return response.data || [];
  },

  /**
   * Search applicants by name, email, or phone
   */
  async search(filters: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<Applicant[]> {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.email) params.append('email', filters.email);
    if (filters.phone) params.append('phone', filters.phone);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/applicants/search?${queryString}`
      : '/api/applicants/search';

    // Backend returns { count, data, success } directly
    const response = await apiClient.get<unknown>(endpoint) as unknown as ListResponse<Applicant>;
    return response.data || [];
  },

  /**
   * Get applicant by ID
   */
  async getById(id: string): Promise<Applicant> {
    // Backend returns { data: Applicant, success: true } directly
    const response = await apiClient.get<unknown>(`/api/applicants/${id}`) as unknown as { data: Applicant; success: boolean };
    if (!response.data) {
      throw new Error('Applicant not found');
    }
    return response.data;
  },

  /**
   * Create new applicant
   */
  async create(data: CreateApplicantDTO): Promise<Applicant> {
    // Backend returns { data: Applicant, success: true } directly
    const response = await apiClient.post<unknown>('/api/applicants', data) as unknown as { data: Applicant; success: boolean };
    if (!response.data) {
      throw new Error('Failed to create applicant');
    }
    return response.data;
  },

  /**
   * Update applicant
   */
  async update(id: string, data: UpdateApplicantDTO): Promise<Applicant> {
    // Backend returns { data: Applicant, success: true } directly
    const response = await apiClient.put<unknown>(`/api/applicants/${id}`, data) as unknown as { data: Applicant; success: boolean };
    if (!response.data) {
      throw new Error('Failed to update applicant');
    }
    return response.data;
  },

  /**
   * Delete applicant
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/applicants/${id}`);
  },

  /**
   * Deactivate applicant (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    await apiClient.post(`/api/applicants/${id}/deactivate`, {});
  },

  /**
   * Reactivate applicant
   */
  async reactivate(id: string): Promise<void> {
    await apiClient.post(`/api/applicants/${id}/reactivate`, {});
  },
};
