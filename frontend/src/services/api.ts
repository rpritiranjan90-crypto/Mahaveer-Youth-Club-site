import {
  HealthStatus,
  ReadyStatus,
  ApiError,
  PaginatedResponse,
  UpdateItem,
  UpdateCreatePayload,
  UpdateUpdatePayload,
  ActivityItem,
  ActivityCreatePayload,
  ActivityUpdatePayload,
  GalleryPhoto,
  GalleryItemCreatePayload,
  GalleryItemUpdatePayload,
  MemberItem,
  MemberCreatePayload,
  MemberUpdatePayload,
  MemberReorderItem,
  ContentStatus,
  SiteAsset,
} from '../types';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Base fetch wrapper with standardized error parsing.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        // Fallback for non-JSON error bodies
      }

      const error: ApiError = {
        code: errorData?.error?.code || `HTTP_${response.status}`,
        message:
          errorData?.error?.message ||
          errorData?.detail ||
          response.statusText ||
          'An unexpected error occurred.',
        status: response.status,
      };
      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err?.code && err?.message) {
      throw err;
    }
    const networkError: ApiError = {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the backend server. Please ensure the server is running.',
    };
    throw networkError;
  }
}

/**
 * Foundation, Security, and CMS API Services
 */
export const apiService = {
  // 1. Health & Status
  getHealth: async (): Promise<HealthStatus> => {
    return request<HealthStatus>('/health');
  },
  getReadiness: async (): Promise<ReadyStatus> => {
    return request<ReadyStatus>('/ready');
  },

  // 2. Admin Authentication
  login: async (email: string, password: string) => {
    return request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  verify2FA: async (challenge_token: string, code: string) => {
    return request<any>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ challenge_token, code }),
    });
  },

  refreshToken: async (refreshToken?: string) => {
    return request<any>('/auth/refresh', {
      method: 'POST',
      headers: refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {},
    });
  },

  getMe: async (token: string) => {
    return request<any>('/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  setup2FA: async (token: string) => {
    return request<{ secret: string; provisioning_uri: string }>('/auth/2fa/setup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  enable2FA: async (token: string, code: string) => {
    return request<{ recovery_codes: string[]; message: string }>('/auth/2fa/enable', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code }),
    });
  },

  disable2FA: async (token: string, current_password: string, code: string) => {
    return request<{ status: string; message: string }>('/auth/2fa/disable', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ current_password, code }),
    });
  },

  regenerateRecoveryCodes: async (token: string, current_password: string, code: string) => {
    return request<{ recovery_codes: string[]; message: string }>(
      '/auth/2fa/recovery-codes/regenerate',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password, code }),
      }
    );
  },

  changePassword: async (token: string, current_password: string, new_password: string) => {
    return request<{ status: string; message: string }>('/auth/password/change', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ current_password, new_password }),
    });
  },

  logout: async (token: string) => {
    return request<{ status: string; message: string }>('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // 3. Admin Security Audit Logs
  getAuditLogs: async (
    token: string,
    page: number = 1,
    page_size: number = 50,
    action?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
    });
    if (action) {
      params.append('action', action);
    }
    return request<any>(`/admin/audit-logs?${params.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ===========================================================================
  // 4. PUBLIC CONTENT APIS (ONLY Published / Visible Content)
  // ===========================================================================
  getPublicUpdates: async (
    page: number = 1,
    pageSize: number = 20,
    search?: string
  ): Promise<PaginatedResponse<UpdateItem>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (search) params.append('search', search);
    return request<PaginatedResponse<UpdateItem>>(`/public/updates?${params.toString()}`);
  },

  getPublicUpdateBySlug: async (slug: string): Promise<UpdateItem> => {
    return request<UpdateItem>(`/public/updates/${encodeURIComponent(slug)}`);
  },

  getPublicActivities: async (
    page: number = 1,
    pageSize: number = 20,
    category?: string
  ): Promise<PaginatedResponse<ActivityItem>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (category && category !== 'All') params.append('category', category);
    return request<PaginatedResponse<ActivityItem>>(`/public/activities?${params.toString()}`);
  },

  getPublicActivityBySlug: async (slug: string): Promise<ActivityItem> => {
    return request<ActivityItem>(`/public/activities/${encodeURIComponent(slug)}`);
  },

  getPublicGallery: async (
    page: number = 1,
    pageSize: number = 50,
    year?: string,
    category?: string
  ): Promise<PaginatedResponse<GalleryPhoto>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (year && year !== 'All') params.append('year', year);
    if (category && category !== 'All') params.append('category', category);
    return request<PaginatedResponse<GalleryPhoto>>(`/public/gallery?${params.toString()}`);
  },

  getGalleryYears: async (): Promise<{ years: string[] }> => {
    return request<{ years: string[] }>('/public/gallery/years');
  },

  getGalleryCategories: async (): Promise<{ categories: string[] }> => {
    return request<{ categories: string[] }>('/public/gallery/categories');
  },

  getPublicMembers: async (
    page: number = 1,
    pageSize: number = 100
  ): Promise<PaginatedResponse<MemberItem>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    return request<PaginatedResponse<MemberItem>>(`/public/members?${params.toString()}`);
  },

  // ===========================================================================
  // 5. ADMIN CONTENT MANAGEMENT APIS
  // ===========================================================================
  // A. Updates
  getAdminUpdates: async (
    token: string,
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    search?: string
  ): Promise<PaginatedResponse<UpdateItem>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    return request<PaginatedResponse<UpdateItem>>(`/admin/updates?${params.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  createAdminUpdate: async (token: string, data: UpdateCreatePayload): Promise<UpdateItem> => {
    return request<UpdateItem>('/admin/updates', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  getAdminUpdate: async (token: string, id: number): Promise<UpdateItem> => {
    return request<UpdateItem>(`/admin/updates/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getUpdatePreview: async (token: string, id: number): Promise<UpdateItem> => {
    return request<UpdateItem>(`/admin/updates/${id}/preview`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateAdminUpdate: async (
    token: string,
    id: number,
    data: UpdateUpdatePayload
  ): Promise<UpdateItem> => {
    return request<UpdateItem>(`/admin/updates/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  changeUpdateStatus: async (
    token: string,
    id: number,
    status: ContentStatus
  ): Promise<UpdateItem> => {
    return request<UpdateItem>(`/admin/updates/${id}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  },

  deleteAdminUpdate: async (token: string, id: number): Promise<{ status: string }> => {
    return request<{ status: string }>(`/admin/updates/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  uploadUpdateImage: async (token: string, id: number, file: File): Promise<UpdateItem> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<UpdateItem>(`/admin/updates/${id}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },

  deleteUpdateImage: async (token: string, id: number): Promise<UpdateItem> => {
    return request<UpdateItem>(`/admin/updates/${id}/image`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // B. Activities
  getAdminActivities: async (
    token: string,
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    category?: string,
    search?: string
  ): Promise<PaginatedResponse<ActivityItem>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (status && status !== 'all') params.append('status', status);
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    return request<PaginatedResponse<ActivityItem>>(`/admin/activities?${params.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  createAdminActivity: async (
    token: string,
    data: ActivityCreatePayload
  ): Promise<ActivityItem> => {
    return request<ActivityItem>('/admin/activities', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  getAdminActivity: async (token: string, id: number): Promise<ActivityItem> => {
    return request<ActivityItem>(`/admin/activities/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getActivityPreview: async (token: string, id: number): Promise<ActivityItem> => {
    return request<ActivityItem>(`/admin/activities/${id}/preview`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateAdminActivity: async (
    token: string,
    id: number,
    data: ActivityUpdatePayload
  ): Promise<ActivityItem> => {
    return request<ActivityItem>(`/admin/activities/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  changeActivityStatus: async (
    token: string,
    id: number,
    status: ContentStatus
  ): Promise<ActivityItem> => {
    return request<ActivityItem>(`/admin/activities/${id}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  },

  deleteAdminActivity: async (token: string, id: number): Promise<{ status: string }> => {
    return request<{ status: string }>(`/admin/activities/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  uploadActivityImage: async (token: string, id: number, file: File): Promise<ActivityItem> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ActivityItem>(`/admin/activities/${id}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },

  deleteActivityImage: async (token: string, id: number): Promise<ActivityItem> => {
    return request<ActivityItem>(`/admin/activities/${id}/image`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // C. Gallery
  getAdminGallery: async (
    token: string,
    page: number = 1,
    pageSize: number = 50,
    status?: string,
    year?: string,
    category?: string
  ): Promise<PaginatedResponse<GalleryPhoto>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (status && status !== 'all') params.append('status', status);
    if (year && year !== 'all') params.append('year', year);
    if (category && category !== 'all') params.append('category', category);
    return request<PaginatedResponse<GalleryPhoto>>(`/admin/gallery?${params.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  createAdminGalleryItem: async (
    token: string,
    data: GalleryItemCreatePayload
  ): Promise<GalleryPhoto> => {
    return request<GalleryPhoto>('/admin/gallery', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  uploadGalleryImage: async (token: string, formData: FormData): Promise<GalleryPhoto> => {
    return request<GalleryPhoto>('/admin/gallery/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },

  updateAdminGalleryItem: async (
    token: string,
    id: number,
    data: GalleryItemUpdatePayload
  ): Promise<GalleryPhoto> => {
    return request<GalleryPhoto>(`/admin/gallery/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  changeGalleryStatus: async (
    token: string,
    id: number,
    status: ContentStatus
  ): Promise<GalleryPhoto> => {
    return request<GalleryPhoto>(`/admin/gallery/${id}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
  },

  deleteAdminGalleryItem: async (token: string, id: number): Promise<{ status: string }> => {
    return request<{ status: string }>(`/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // D. Members (Phase 10 Member Roster & Photo Management)
  getAdminMembers: async (
    token: string,
    page: number = 1,
    pageSize: number = 100,
    isActive?: boolean,
    search?: string
  ): Promise<PaginatedResponse<MemberItem>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (isActive !== undefined) params.append('is_active', isActive.toString());
    if (search) params.append('search', search);
    return request<PaginatedResponse<MemberItem>>(`/admin/members?${params.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getAdminMember: async (token: string, id: number): Promise<MemberItem> => {
    return request<MemberItem>(`/admin/members/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  createAdminMember: async (
    token: string,
    data: MemberCreatePayload
  ): Promise<MemberItem> => {
    return request<MemberItem>('/admin/members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  updateAdminMember: async (
    token: string,
    id: number,
    data: MemberUpdatePayload
  ): Promise<MemberItem> => {
    return request<MemberItem>(`/admin/members/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  uploadMemberPhoto: async (
    token: string,
    id: number,
    file: File
  ): Promise<MemberItem> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<MemberItem>(`/admin/members/${id}/photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },

  deleteMemberPhoto: async (token: string, id: number): Promise<MemberItem> => {
    return request<MemberItem>(`/admin/members/${id}/photo`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  activateMember: async (token: string, id: number): Promise<MemberItem> => {
    return request<MemberItem>(`/admin/members/${id}/activate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  deactivateMember: async (token: string, id: number): Promise<MemberItem> => {
    return request<MemberItem>(`/admin/members/${id}/deactivate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  reorderMembers: async (
    token: string,
    orders: MemberReorderItem[]
  ): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>('/admin/members/reorder', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orders }),
    });
  },

  deleteAdminMember: async (token: string, id: number): Promise<{ status: string }> => {
    return request<{ status: string }>(`/admin/members/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ===========================================================================
  // Site Assets (Official Logo & Current-Year Ganesh Image)
  // ===========================================================================
  getPublicLogo: async (): Promise<SiteAsset> => {
    return request<SiteAsset>('/public/assets/logo', { method: 'GET' });
  },

  getPublicCurrentGanesh: async (): Promise<SiteAsset> => {
    return request<SiteAsset>('/public/assets/ganesh/current', { method: 'GET' });
  },

  getAdminLogo: async (token: string): Promise<SiteAsset> => {
    return request<SiteAsset>('/admin/assets/logo', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  uploadAdminLogo: async (token: string, file: File): Promise<SiteAsset> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<SiteAsset>('/admin/assets/logo', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },

  deleteAdminLogo: async (token: string): Promise<{ message: string }> => {
    return request<{ message: string }>('/admin/assets/logo', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getAdminCurrentGanesh: async (token: string): Promise<SiteAsset> => {
    return request<SiteAsset>('/admin/assets/ganesh/current', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  uploadAdminCurrentGanesh: async (
    token: string,
    file: File,
    year: number
  ): Promise<SiteAsset> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year.toString());
    return request<SiteAsset>('/admin/assets/ganesh/current', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },

  deleteAdminCurrentGanesh: async (token: string): Promise<{ message: string }> => {
    return request<{ message: string }>('/admin/assets/ganesh/current', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

