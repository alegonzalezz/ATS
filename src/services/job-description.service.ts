/**
 * Job Description Service
 * API client for job description operations
 */

import { apiClient } from '@/api/client';
import type { ListResponse } from '@/api/types';

export type JobStatus = 'OPEN' | 'CLOSED' | 'FILLED';

export interface JobDescription {
  id: string;
  title: string;
  description: string;
  client_id: string;
  recruiter_id?: string;
  min_salary?: number;
  max_salary?: number;
  currency: string;
  location?: string;
  remote_policy?: string;
  employment_type?: string;
  status: JobStatus;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface CreateJobDescriptionDTO {
  title: string;
  description: string;
  client_id: string;
  recruiter_id?: string;
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  location?: string;
  remote_policy?: string;
  employment_type?: string;
  status?: JobStatus;
}

export interface UpdateJobDescriptionDTO {
  title?: string;
  description?: string;
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  location?: string;
  remote_policy?: string;
  employment_type?: string;
  status?: JobStatus;
}

export interface JobSearchFilters {
  title?: string;
  status?: JobStatus;
  client_id?: string;
  min_salary_min?: number;
  min_salary_max?: number;
}

export const JobDescriptionService = {
  /**
   * List all job descriptions
   * @param includeInactive - Include deactivated jobs
   */
  async list(includeInactive = false): Promise<JobDescription[]> {
    // Backend returns { count, data, success } directly (not wrapped in ApiResponse)
    const response = await apiClient.get<unknown>(
      `/api/job-descriptions?include_inactive=${includeInactive}`
    ) as unknown as ListResponse<JobDescription>;
    return response.data || [];
  },

  /**
   * Search job descriptions with filters
   */
  async search(filters: JobSearchFilters): Promise<JobDescription[]> {
    const params = new URLSearchParams();
    if (filters.title) params.append('title', filters.title);
    if (filters.status) params.append('status', filters.status);
    if (filters.client_id) params.append('client_id', filters.client_id);
    if (filters.min_salary_min !== undefined) params.append('min_salary_min', String(filters.min_salary_min));
    if (filters.min_salary_max !== undefined) params.append('min_salary_max', String(filters.min_salary_max));

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/job-descriptions/search?${queryString}`
      : '/api/job-descriptions/search';

    // Backend returns { count, data, success } directly
    const response = await apiClient.get<unknown>(endpoint) as unknown as ListResponse<JobDescription>;
    return response.data || [];
  },

  /**
   * Get job description by ID
   */
  async getById(id: string): Promise<JobDescription> {
    // Backend returns { data: JobDescription, success: true } directly
    const response = await apiClient.get<unknown>(`/api/job-descriptions/${id}`) as unknown as { data: JobDescription; success: boolean };
    if (!response.data) {
      throw new Error('Job description not found');
    }
    return response.data;
  },

  /**
   * Create new job description
   */
  async create(data: CreateJobDescriptionDTO): Promise<JobDescription> {
    // Backend returns { data: JobDescription, success: true } directly
    const response = await apiClient.post<unknown>('/api/job-descriptions', data) as unknown as { data: JobDescription; success: boolean };
    if (!response.data) {
      throw new Error('Failed to create job description');
    }
    return response.data;
  },

  /**
   * Update job description
   */
  async update(id: string, data: UpdateJobDescriptionDTO): Promise<JobDescription> {
    // Backend returns { data: JobDescription, success: true } directly
    const response = await apiClient.put<unknown>(`/api/job-descriptions/${id}`, data) as unknown as { data: JobDescription; success: boolean };
    if (!response.data) {
      throw new Error('Failed to update job description');
    }
    return response.data;
  },

  /**
   * Update job status only
   */
  async updateStatus(id: string, status: JobStatus): Promise<JobDescription> {
    // Backend returns { data: JobDescription, success: true } directly
    const response = await apiClient.put<unknown>(`/api/job-descriptions/${id}/status`, { status }) as unknown as { data: JobDescription; success: boolean };
    if (!response.data) {
      throw new Error('Failed to update job status');
    }
    return response.data;
  },

  /**
   * Close a job
   */
  async close(id: string): Promise<void> {
    await apiClient.post(`/api/job-descriptions/${id}/close`, {});
  },

  /**
   * Reopen a job
   */
  async reopen(id: string): Promise<void> {
    await apiClient.post(`/api/job-descriptions/${id}/reopen`, {});
  },

  /**
   * Delete job description
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/job-descriptions/${id}`);
  },
};
