/**
 * Application Service
 * API client for applicant-job-application operations
 */

import { apiClient } from '@/api/client';
import type { ListResponse } from '@/api/types';

export type ApplicationStatus = 'INICIADO' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';

export interface Application {
  id: number;
  applicant_id: string;
  job_description_id: string;
  recruiter_id?: string;
  status: ApplicationStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deactive_at?: string | null;
  is_active?: boolean;
}

export interface ApplicationWithDetails extends Application {
  applicant_name?: string;
  job_title?: string;
  client_name?: string;
  recruiter_name?: string;
}

export interface CreateApplicationDTO {
  applicant_id: string;
  job_description_id: string;
  status?: ApplicationStatus;
  notes?: string;
}

export interface UpdateApplicationDTO {
  status?: ApplicationStatus;
  notes?: string;
}

export interface ApplicationSearchFilters {
  applicant_id?: string;
  job_id?: string;
  status?: ApplicationStatus;
}

export const ApplicationService = {
  /**
   * List all applications
   * @param includeInactive - Include deactivated applications
   */
  async list(includeInactive = false): Promise<Application[]> {
    // Backend returns { count, data, success } directly (not wrapped in ApiResponse)
    const response = await apiClient.get<unknown>(
      `/api/applicant-job-applications?include_inactive=${includeInactive}`
    ) as unknown as ListResponse<Application>;
    return response.data || [];
  },

  /**
   * Search applications by applicant, job, or status
   */
  async search(filters: ApplicationSearchFilters): Promise<Application[]> {
    const params = new URLSearchParams();
    if (filters.applicant_id) params.append('applicant_id', filters.applicant_id);
    if (filters.job_id) params.append('job_id', filters.job_id);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/applicant-job-applications/search?${queryString}`
      : '/api/applicant-job-applications/search';

    // Backend returns { count, data, success } directly
    const response = await apiClient.get<unknown>(endpoint) as unknown as ListResponse<Application>;
    return response.data || [];
  },

  /**
   * Get application by ID
   */
  async getById(id: number): Promise<Application> {
    // Backend returns { data: Application, success: true } directly
    const response = await apiClient.get<unknown>(`/api/applicant-job-applications/${id}`) as unknown as { data: Application; success: boolean };
    if (!response.data) {
      throw new Error('Application not found');
    }
    return response.data;
  },

  /**
   * Create new application
   */
  async create(data: CreateApplicationDTO): Promise<Application> {
    // Backend returns { data: Application, success: true } directly
    const response = await apiClient.post<unknown>('/api/applicant-job-applications', data) as unknown as { data: Application; success: boolean };
    if (!response.data) {
      throw new Error('Failed to create application');
    }
    return response.data;
  },

  /**
   * Update application
   */
  async update(id: number, data: UpdateApplicationDTO): Promise<Application> {
    // Backend returns { data: Application, success: true } directly
    const response = await apiClient.put<unknown>(`/api/applicant-job-applications/${id}`, data) as unknown as { data: Application; success: boolean };
    if (!response.data) {
      throw new Error('Failed to update application');
    }
    return response.data;
  },

  /**
   * Delete application
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/applicant-job-applications/${id}`);
  },

  /**
   * Deactivate application (soft delete)
   */
  async deactivate(id: number): Promise<void> {
    await apiClient.post(`/api/applicant-job-applications/${id}/deactivate`, {});
  },

  /**
   * Reactivate application
   */
  async reactivate(id: number): Promise<void> {
    await apiClient.post(`/api/applicant-job-applications/${id}/reactivate`, {});
  },

  /**
   * Assign recruiter to application
   */
  async assignRecruiter(id: number, recruiterId: string): Promise<void> {
    await apiClient.post(`/api/applicant-job-applications/${id}/assign-recruiter`, {
      recruiter_id: recruiterId,
    });
  },

  /**
   * Unassign recruiter from application
   */
  async unassignRecruiter(id: number): Promise<void> {
    await apiClient.post(`/api/applicant-job-applications/${id}/unassign-recruiter`, {});
  },
};
