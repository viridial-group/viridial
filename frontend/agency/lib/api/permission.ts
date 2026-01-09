/**
 * API Client pour admin-service - Gestion des permissions
 */

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3006/api/admin';

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionDto {
  resource?: string;
  action?: string;
  description?: string;
}

export interface PermissionFilters {
  resource?: string;
  action?: string;
  search?: string;
}

/**
 * Service de gestion des permissions
 */
export class PermissionService {
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
   * Liste toutes les permissions
   */
  async getAll(filters?: PermissionFilters): Promise<Permission[]> {
    const params = new URLSearchParams();
    if (filters?.resource) params.append('resource', filters.resource);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    const url = `${this.baseUrl}/permissions${query ? `?${query}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch permissions' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Récupérer une permission par ID
   */
  async getById(id: string): Promise<Permission> {
    const response = await fetch(`${this.baseUrl}/permissions/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch permission' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Créer une nouvelle permission
   */
  async create(data: CreatePermissionDto): Promise<Permission> {
    const response = await fetch(`${this.baseUrl}/permissions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create permission' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Mettre à jour une permission
   */
  async update(id: string, data: UpdatePermissionDto): Promise<Permission> {
    const response = await fetch(`${this.baseUrl}/permissions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update permission' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Supprimer une permission
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/permissions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete permission' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Obtenir toutes les permissions groupées par ressource
   */
  async getGroupedByResource(): Promise<Record<string, Permission[]>> {
    const permissions = await this.getAll();
    const grouped: Record<string, Permission[]> = {};

    permissions.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });

    return grouped;
  }
}

export const permissionService = new PermissionService();

