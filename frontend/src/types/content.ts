export type ContentStatus = 'draft' | 'published' | 'archived';

export interface PaginatedResponse<T> {
  items: T[];
  total: int_or_number;
  page: number;
  page_size: number;
  total_pages: number;
}

type int_or_number = number;

// =============================================================================
// Updates
// =============================================================================
export interface UpdateItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt?: string | null;
  content: string;
  featured_image?: string | null;
  status?: ContentStatus;
  published_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface UpdateCreatePayload {
  title: string;
  category?: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  status?: ContentStatus;
}

export interface UpdateUpdatePayload {
  title?: string;
  category?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  status?: ContentStatus;
}

// =============================================================================
// Activities
// =============================================================================
export interface ActivityItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  date: string;
  category: string;
  image?: string | null;
  status?: ContentStatus;
  published_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ActivityCreatePayload {
  title: string;
  description: string;
  date: string;
  category?: string;
  image?: string;
  status?: ContentStatus;
}

export interface ActivityUpdatePayload {
  title?: string;
  description?: string;
  date?: string;
  category?: string;
  image?: string;
  status?: ContentStatus;
}

// =============================================================================
// Gallery
// =============================================================================
export interface GalleryPhoto {
  id: number | string;
  title: string;
  image_url?: string;
  url?: string;
  thumbnail_url?: string | null;
  year: string;
  category: string;
  alt_text: string;
  status?: ContentStatus;
  published_at?: string | null;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface GalleryItemCreatePayload {
  title: string;
  image_url: string;
  thumbnail_url?: string;
  year: string;
  category?: string;
  alt_text: string;
  status?: ContentStatus;
}

export interface GalleryItemUpdatePayload {
  title?: string;
  image_url?: string;
  thumbnail_url?: string;
  year?: string;
  category?: string;
  alt_text?: string;
  status?: ContentStatus;
}

// =============================================================================
// Members (Phase 10 Member Roster & Photo Management)
// =============================================================================
export interface MemberItem {
  id: number;
  name: string;
  designation: string;
  bio?: string | null;
  display_order: number;
  is_active?: boolean;
  photo_url?: string | null;
  photo_storage_path?: string | null;
  photo_original_filename?: string | null;
  photo_mime_type?: string | null;
  photo_file_size?: number | null;
  photo_width?: number | null;
  photo_height?: number | null;
  created_at?: string;
  updated_at?: string | null;
  // Backward compatibility aliases
  display_name?: string;
  role?: string | null;
  sort_order?: number;
  is_visible?: boolean;
}

export interface MemberCreatePayload {
  name: string;
  designation?: string;
  bio?: string;
  display_order?: number;
  is_active?: boolean;
  // Aliases
  display_name?: string;
  role?: string;
  sort_order?: number;
  is_visible?: boolean;
}

export interface MemberUpdatePayload {
  name?: string;
  designation?: string;
  bio?: string;
  display_order?: number;
  is_active?: boolean;
  // Aliases
  display_name?: string;
  role?: string;
  sort_order?: number;
  is_visible?: boolean;
}

export interface MemberReorderItem {
  id: number;
  display_order?: number;
  sort_order?: number;
}

// =============================================================================
// Site Assets (Logo & Current-Year Ganesh Image)
// =============================================================================
export interface SiteAsset {
  id: number;
  asset_type: 'LOGO' | 'GANESH_CURRENT';
  year?: number | null;
  storage_path: string;
  image_url: string;
  original_filename?: string | null;
  mime_type: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
  is_active?: boolean;
  created_by?: number | null;
  created_at: string;
  updated_at?: string | null;
}

