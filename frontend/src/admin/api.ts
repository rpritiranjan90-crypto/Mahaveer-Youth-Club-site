/**
 * Mahaveer Youth Club - Admin & Public API Client
 * Secure REST API integration with token management and standardized error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

// Token Storage Helpers
export const getToken = (): string | null => localStorage.getItem('myc_admin_token');
export const setToken = (token: string): void => localStorage.setItem('myc_admin_token', token);
export const removeToken = (): void => localStorage.removeItem('myc_admin_token');

// Generic Fetch Wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: { message: response.statusText, code: response.status } };
    }

    const errorMsg =
      errorData?.error?.message ||
      errorData?.detail ||
      `Request failed with status ${response.status}`;

    const error: ApiError = {
      code: response.status,
      message: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
      details: errorData?.error?.details || errorData?.detail,
    };

    if (response.status === 401) {
      removeToken();
    }

    throw error;
  }

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// -----------------------------------------------------------------------------
// Authentication APIs
// -----------------------------------------------------------------------------
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await request<{ access_token: string; token_type: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (data.access_token) {
      setToken(data.access_token);
    }
    return data;
  },

  getMe: async () => {
    return request<{ id: number; name: string; email: string; role: string; is_active: boolean }>(
      '/auth/me'
    );
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      removeToken();
    }
  },
};

// -----------------------------------------------------------------------------
// Admin CRUD APIs
// -----------------------------------------------------------------------------
export const adminApi = {
  getStats: () => request<any>('/admin/stats'),

  // Updates
  getUpdates: () => request<any[]>('/admin/updates'),
  createUpdate: (data: any) =>
    request<any>('/admin/updates', { method: 'POST', body: JSON.stringify(data) }),
  updateUpdate: (id: number, data: any) =>
    request<any>(`/admin/updates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUpdate: (id: number) =>
    request<any>(`/admin/updates/${id}`, { method: 'DELETE' }),

  // Gallery
  getGallery: () => request<any[]>('/admin/gallery'),
  createGalleryItem: (data: any) =>
    request<any>('/admin/gallery', { method: 'POST', body: JSON.stringify(data) }),
  updateGalleryItem: (id: number, data: any) =>
    request<any>(`/admin/gallery/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteGalleryItem: (id: number) =>
    request<any>(`/admin/gallery/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: () => request<any[]>('/admin/activities'),
  createActivity: (data: any) =>
    request<any>('/admin/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id: number, data: any) =>
    request<any>(`/admin/activities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteActivity: (id: number) =>
    request<any>(`/admin/activities/${id}`, { method: 'DELETE' }),

  // History
  getHistory: () => request<any[]>('/admin/history'),
  createHistoryItem: (data: any) =>
    request<any>('/admin/history', { method: 'POST', body: JSON.stringify(data) }),
  updateHistoryItem: (id: number, data: any) =>
    request<any>(`/admin/history/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteHistoryItem: (id: number) =>
    request<any>(`/admin/history/${id}`, { method: 'DELETE' }),

  // Club Settings
  getClub: () => request<any>('/admin/club'),
  updateClub: (data: any) =>
    request<any>('/admin/club', { method: 'PATCH', body: JSON.stringify(data) }),

  // Donation Settings
  getDonation: () => request<any>('/admin/donation'),
  updateDonation: (data: any) =>
    request<any>('/admin/donation', { method: 'PATCH', body: JSON.stringify(data) }),

  // File Upload
  uploadImage: async (file: File): Promise<{ file_url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let err;
      try {
        err = await response.json();
      } catch {
        err = { error: { message: 'Image upload failed' } };
      }
      throw new Error(err.error?.message || err.detail || 'Upload failed');
    }

    return response.json();
  },
};

// -----------------------------------------------------------------------------
// Public Read-Only APIs
// -----------------------------------------------------------------------------
export const publicApi = {
  getClub: () => request<any>('/public/club'),
  getUpdates: () => request<any[]>('/public/updates'),
  getUpdateBySlug: (slug: string) => request<any>(`/public/updates/${slug}`),
  getGallery: () => request<any[]>('/public/gallery'),
  getActivities: () => request<any[]>('/public/activities'),
  getHistory: () => request<any[]>('/public/history'),
  getDonation: () => request<any>('/public/donation'),
};
