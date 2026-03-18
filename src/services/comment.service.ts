/**
 * Comment Service
 * API client for comment operations
 */

import { apiClient } from '@/api/client';
import type { Comment } from '@/types';

export interface CreateCommentDTO {
  applicant_id: string;
  recruiter_id: string;
  comment: string;
}

export interface UpdateCommentDTO {
  comment: string;
}

export const CommentService = {
  /**
   * Create a new comment for an applicant
   */
  async create(data: CreateCommentDTO): Promise<Comment> {
    const response = await apiClient.post<unknown>('/api/comments', data) as unknown as { data: Comment; success: boolean };
    if (!response.data) {
      throw new Error('Failed to create comment');
    }
    return response.data;
  },

  /**
   * Update an existing comment
   */
  async update(id: string, data: UpdateCommentDTO): Promise<Comment> {
    const response = await apiClient.put<unknown>(`/api/comments/${id}`, data) as unknown as { data: Comment; success: boolean };
    if (!response.data) {
      throw new Error('Failed to update comment');
    }
    return response.data;
  },

  /**
   * Delete a comment
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/comments/${id}`);
  },
};
