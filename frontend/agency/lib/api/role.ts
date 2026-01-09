/**
 * API Client pour admin-service - Gestion des rôles
 */

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3006/api/admin';

export interface Role {
  id: string;
  name: string;
  description?: string;
  organizationId?: string | null;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  organizationId?: string | null;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface RoleFilters {
  organizationId?: string;
  isActive?: boolean;
  search?: string;
}

/**
 * Service de gestion des rôles
 */
export class RoleService {
  private baseUrl: string;

  constructor(baseUrl: string = ADMIN_API_URL) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Liste tous les rôles
   */
  async getAll(filters?: RoleFilters): Promise<Role[]> {
    const params = new URLSearchParams();
    if (filters?.organizationId) params.append('organizationId', filters.organizationId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    const url = `${this.baseUrl}/roles${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch roles' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Récupérer un rôle par ID
   */
  async getById(id: string): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/roles/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch role' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Créer un nouveau rôle
   */
  async create(data: CreateRoleDto): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/roles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create role' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Mettre à jour un rôle
   */
  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    const response = await fetch(`${this.baseUrl}/roles/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update role' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Supprimer un rôle
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/roles/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete role' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

export const roleService = new RoleService();

