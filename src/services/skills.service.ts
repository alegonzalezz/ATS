/**
 * Skills Service
 * API client for skills operations
 */

import { apiClient } from '@/api/client';
import type { Skill } from '@/types';
import type { ListResponse } from '@/api/types';

export interface CreateSkillDTO {
  name: string;
}

export interface UpdateSkillDTO {
  deactive_at: string | null;
}

export interface AddSkillToApplicantDTO {
  skill_id: string;
}

export const SkillsService = {
  /**
   * List all skills
   * @param search - Partial name search
   * @param includeInactive - Include deactivated skills
   */
  async list(search?: string, includeInactive = false): Promise<Skill[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('include_inactive', String(includeInactive));

    const endpoint = `/api/skills?${params.toString()}`;
    const response = await apiClient.get<unknown>(endpoint) as unknown as ListResponse<Skill>;
    return response.data || [];
  },

  /**
   * Get skill by ID
   */
  async getById(id: string): Promise<Skill> {
    const response = await apiClient.get<unknown>(`/api/skills/${id}`) as unknown as { data: Skill; success: boolean };
    if (!response.data) {
      throw new Error('Skill not found');
    }
    return response.data;
  },

  /**
   * Create new skill
   */
  async create(data: CreateSkillDTO): Promise<Skill> {
    // Normalize name to uppercase as per backend requirement
    const normalizedData = { name: data.name.toUpperCase() };
    const response = await apiClient.post<unknown>('/api/skills', normalizedData) as unknown as { data: Skill; success: boolean; message?: string; error?: string };
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create skill');
    }
    return response.data;
  },

  /**
   * Update skill status (activate/deactivate)
   */
  async updateStatus(id: string, deactive_at: string | null): Promise<Skill> {
    const response = await apiClient.patch<unknown>(`/api/skills/${id}`, { deactive_at }) as unknown as { data: Skill; success: boolean; message?: string };
    
    if (!response.success || !response.data) {
      throw new Error('Failed to update skill status');
    }
    return response.data;
  },

  /**
   * Deactivate a skill
   */
  async deactivate(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.updateStatus(id, now);
  },

  /**
   * Reactivate a skill
   */
  async reactivate(id: string): Promise<void> {
    await this.updateStatus(id, null);
  },

  // Applicant-Skill relationship methods

  /**
   * Get skills for a specific applicant
   */
  async getByApplicantId(applicantId: string, includeInactive = false): Promise<Skill[]> {
    const params = new URLSearchParams();
    params.append('include_inactive', String(includeInactive));
    const endpoint = `/api/applicants/${applicantId}/skills?${params.toString()}`;
    const response = await apiClient.get<unknown>(endpoint) as unknown as ListResponse<Skill>;
    return response.data || [];
  },

  /**
   * Add skill to applicant
   */
  async addSkillToApplicant(applicantId: string, skillId: string): Promise<void> {
    const response = await apiClient.post<unknown>(
      `/api/applicants/${applicantId}/skills`,
      { skill_id: skillId }
    ) as unknown as { success: boolean; message?: string; error?: string };

    if (!response.success) {
      throw new Error(response.error || 'Failed to add skill to applicant');
    }
  },

  /**
   * Update applicant-skill association status
   */
  async updateApplicantSkillStatus(applicantId: string, skillId: string, deactive_at: string | null): Promise<void> {
    const response = await apiClient.patch<unknown>(
      `/api/applicants/${applicantId}/skills/${skillId}`,
      { deactive_at }
    ) as unknown as { success: boolean; message?: string };

    if (!response.success) {
      throw new Error('Failed to update skill association status');
    }
  },

  /**
   * Remove skill from applicant (deactivate association)
   */
  async removeSkillFromApplicant(applicantId: string, skillId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.updateApplicantSkillStatus(applicantId, skillId, now);
  },

  /**
   * Reactivate skill association for applicant
   */
  async reactivateSkillForApplicant(applicantId: string, skillId: string): Promise<void> {
    await this.updateApplicantSkillStatus(applicantId, skillId, null);
  },
};
