/**
 * Utility to resolve media and asset URLs cleanly across both local dev and production deployments.
 * Handles:
 * 1. Absolute external URLs (https://, http://, data:, blob:)
 * 2. Static bundled assets (/images/...)
 * 3. Dynamic uploaded backend files (/uploads/...) -> prepends backend origin for direct loading or falls back safely
 */
import { resolveApiBaseUrl } from '../services/api';

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // If it's a frontend bundled asset (e.g. /images/...)
  if (trimmed.startsWith('/images/') || trimmed.startsWith('images/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  // If it's an uploaded asset from the backend (e.g. /uploads/...)
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const apiBase = resolveApiBaseUrl();
    const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '');
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${backendOrigin}${cleanPath}`;
  }

  return trimmed;
}
