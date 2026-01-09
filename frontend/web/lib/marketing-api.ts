/**
 * Client API pour le service marketing
 */

const MARKETING_API_URL =
  process.env.NEXT_PUBLIC_MARKETING_API_URL || 'http://localhost:3005';

interface ApiOptions extends RequestInit {
  organizationId?: string;
}

async function marketingApi(endpoint: string, options: ApiOptions = {}) {
  const { organizationId, ...fetchOptions } = options;

  // Récupérer le token depuis localStorage ou cookies
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (organizationId) {
    headers['X-Organization-Id'] = organizationId;
  }

  const response = await fetch(`${MARKETING_API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Campagnes
export const campaignsApi = {
  getAll: (organizationId?: string) =>
    marketingApi('/marketing/campaigns', { organizationId }),
  getOne: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/campaigns/${id}`, { organizationId }),
  create: (data: any) => marketingApi('/marketing/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
    organizationId: data.organizationId,
  }),
  update: (id: string, data: any) =>
    marketingApi(`/marketing/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  delete: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/campaigns/${id}`, {
      method: 'DELETE',
      organizationId,
    }),
  schedule: (id: string, scheduledAt: Date, organizationId?: string) =>
    marketingApi(`/marketing/campaigns/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt, organizationId }),
      organizationId,
    }),
  send: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/campaigns/${id}/send`, {
      method: 'POST',
      organizationId,
    }),
};

// Templates Email
export const emailTemplatesApi = {
  getAll: (organizationId?: string) =>
    marketingApi('/marketing/email-templates', { organizationId }),
  getOne: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/email-templates/${id}`, { organizationId }),
  create: (data: any) =>
    marketingApi('/marketing/email-templates', {
      method: 'POST',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  update: (id: string, data: any) =>
    marketingApi(`/marketing/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  delete: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/email-templates/${id}`, {
      method: 'DELETE',
      organizationId,
    }),
};

// Leads
export const leadsApi = {
  getAll: (organizationId?: string, filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.segmentId) params.append('segmentId', filters.segmentId);
    const query = params.toString();
    return marketingApi(
      `/marketing/leads${query ? `?${query}` : ''}`,
      { organizationId },
    );
  },
  getOne: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/leads/${id}`, { organizationId }),
  create: (data: any) =>
    marketingApi('/marketing/leads', {
      method: 'POST',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  update: (id: string, data: any) =>
    marketingApi(`/marketing/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  delete: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/leads/${id}`, {
      method: 'DELETE',
      organizationId,
    }),
};

// Workflows
export const workflowsApi = {
  getAll: (organizationId?: string) =>
    marketingApi('/marketing/workflows', { organizationId }),
  getOne: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/workflows/${id}`, { organizationId }),
  create: (data: any) =>
    marketingApi('/marketing/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  update: (id: string, data: any) =>
    marketingApi(`/marketing/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  delete: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/workflows/${id}`, {
      method: 'DELETE',
      organizationId,
    }),
  activate: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/workflows/${id}/activate`, {
      method: 'POST',
      organizationId,
    }),
  trigger: (id: string, leadId: string) =>
    marketingApi(`/marketing/workflows/${id}/trigger`, {
      method: 'POST',
      body: JSON.stringify({ leadId }),
    }),
};

// Segments
export const segmentsApi = {
  getAll: (organizationId?: string) =>
    marketingApi('/marketing/segments', { organizationId }),
  getOne: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/segments/${id}`, { organizationId }),
  create: (data: any) =>
    marketingApi('/marketing/segments', {
      method: 'POST',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  update: (id: string, data: any) =>
    marketingApi(`/marketing/segments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  delete: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/segments/${id}`, {
      method: 'DELETE',
      organizationId,
    }),
};

// Formulaires
export const formsApi = {
  getAll: (organizationId?: string) =>
    marketingApi('/marketing/forms', { organizationId }),
  getOne: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/forms/${id}`, { organizationId }),
  create: (data: any) =>
    marketingApi('/marketing/forms', {
      method: 'POST',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  update: (id: string, data: any) =>
    marketingApi(`/marketing/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  delete: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/forms/${id}`, {
      method: 'DELETE',
      organizationId,
    }),
  submit: (id: string, data: any) =>
    marketingApi(`/marketing/forms/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Analytics
export const analyticsApi = {
  getStats: (organizationId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return marketingApi(
      `/marketing/analytics/stats${query ? `?${query}` : ''}`,
      { organizationId },
    );
  },
  getCampaignStats: (campaignId: string, organizationId?: string) =>
    marketingApi(`/marketing/analytics/campaigns/${campaignId}/stats`, { organizationId }),
};

// Landing Pages
export const landingPagesApi = {
  getAll: (organizationId?: string) =>
    marketingApi('/marketing/landing-pages', { organizationId }),
  getOne: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/landing-pages/${id}`, { organizationId }),
  getBySlug: (slug: string) =>
    marketingApi(`/marketing/landing-pages/slug/${slug}`),
  create: (data: any) =>
    marketingApi('/marketing/landing-pages', {
      method: 'POST',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  update: (id: string, data: any) =>
    marketingApi(`/marketing/landing-pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      organizationId: data.organizationId,
    }),
  delete: (id: string, organizationId?: string) =>
    marketingApi(`/marketing/landing-pages/${id}`, {
      method: 'DELETE',
      organizationId,
    }),
};

