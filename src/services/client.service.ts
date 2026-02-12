/**
 * Client Service
 * API client for client operations
 */

import { apiClient } from '@/api/client';
import type { ListResponse } from '@/api/types';

export interface Client {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface CreateClientDTO {
  name: string;
  description?: string;
}

export interface UpdateClientDTO {
  name?: string;
  description?: string;
}

export const ClientService = {
  /**
   * List all clients
   * @param includeInactive - Include deactivated clients
   */
  async list(includeInactive = false): Promise<Client[]> {
    // Backend returns { count, data, success } directly (not wrapped in ApiResponse)
    const response = await apiClient.get<unknown>(
      `/api/clients?include_inactive=${includeInactive}`
    ) as unknown as ListResponse<Client>;
    return response.data || [];
  },

  /**
   * Search clients by name or description
   */
  async search(name?: string, description?: string): Promise<Client[]> {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (description) params.append('description', description);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/clients/search?${queryString}`
      : '/api/clients/search';

    // Backend returns { count, data, success } directly
    const response = await apiClient.get<unknown>(endpoint) as unknown as ListResponse<Client>;
    return response.data || [];
  },

  /**
   * Get client by ID
   */
  async getById(id: string): Promise<Client> {
    // Backend returns { data: Client, success: true } directly
    const response = await apiClient.get<unknown>(`/api/clients/${id}`) as unknown as { data: Client; success: boolean };
    if (!response.data) {
      throw new Error('Client not found');
    }
    return response.data;
  },

  /**
   * Create new client
   */
  async create(data: CreateClientDTO): Promise<Client> {
    // Backend returns { data: Client, success: true } directly
    const response = await apiClient.post<unknown>('/api/clients', data) as unknown as { data: Client; success: boolean };
    if (!response.data) {
      throw new Error('Failed to create client');
    }
    return response.data;
  },

  /**
   * Update client
   */
  async update(id: string, data: UpdateClientDTO): Promise<Client> {
    // Backend returns { data: Client, success: true } directly
    const response = await apiClient.put<unknown>(`/api/clients/${id}`, data) as unknown as { data: Client; success: boolean };
    if (!response.data) {
      throw new Error('Failed to update client');
    }
    return response.data;
  },

  /**
   * Delete client
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/clients/${id}`);
  },

  /**
   * Deactivate client (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    await apiClient.post(`/api/clients/${id}/deactivate`, {});
  },

  /**
   * Reactivate client
   */
  async reactivate(id: string): Promise<void> {
    await apiClient.post(`/api/clients/${id}/reactivate`, {});
  },
};
