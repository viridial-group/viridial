/**
 * API Client pour admin-service - Gestion des organisations
 */

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3006/api/admin';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  subscriptionPlan?: string;
  subscriptionStatus: string;
  trialEndsAt?: string;
  maxUsers: number;
  maxProperties: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug?: string;
  contactEmail: string;
  contactPhone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  subscriptionPlan?: string;
  maxUsers?: number;
  maxProperties?: number;
}

export interface UpdateOrganizationDto {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  maxUsers?: number;
  maxProperties?: number;
  isActive?: boolean;
}

export class OrganizationService {
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
   * Liste toutes les organisations
   */
  async getAll(): Promise<Organization[]> {
    const response = await fetch(`${this.baseUrl}/organizations`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch organizations' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Récupérer une organisation par ID
   */
  async getById(id: string): Promise<Organization> {
    const response = await fetch(`${this.baseUrl}/organizations/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch organization' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Créer une nouvelle organisation
   */
  async create(data: CreateOrganizationDto): Promise<Organization> {
    const response = await fetch(`${this.baseUrl}/organizations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create organization' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Mettre à jour une organisation
   */
  async update(id: string, data: UpdateOrganizationDto): Promise<Organization> {
    const response = await fetch(`${this.baseUrl}/organizations/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update organization' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Supprimer une organisation
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/organizations/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete organization' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Générer un slug depuis un nom
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export const organizationService = new OrganizationService();

