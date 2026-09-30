import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../admin/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageMeta } from '../../hooks/usePageMeta';
import { apiService } from '../../services/api';
import { GalleryPhoto, ContentStatus } from '../../types';

export const AdminGalleryPage: React.FC = () => {
  usePageMeta({
    title: 'Manage Celebration Photo Gallery — Admin Panel',
    description: 'Upload, edit, publish, and archive festival photo archives for Mahaveer Youth Club Banza.',
  });

  const { token } = useAuth();

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modals & Action States
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState<GalleryPhoto | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Upload Form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    category: 'Ganesh Puja',
    alt_text: '',
    item_status: 'draft' as ContentStatus,
  });

  // Edit Metadata Form
  const [editData, setEditData] = useState({
    title: '',
    year: '',
    category: '',
    alt_text: '',
    status: 'draft' as ContentStatus,
  });

  const categories = ['Ganesh Puja', 'Cultural Events', 'Seva & Welfare', 'Other'];

  const fetchGallery = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAdminGallery(
        token,
        page,
        24,
        statusFilter,
        yearFilter,
        categoryFilter
      );
      setPhotos(data.items);
      setTotalPages(data.total_pages);
      setTotalCount(data.total);

      // Extract dynamic years
      const yearsSet = new Set<string>();
      data.items.forEach((p) => {
        if (p.year) yearsSet.add(p.year);
      });
      setAvailableYears(Array.from(yearsSet).sort().reverse());
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch gallery items.');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, yearFilter, categoryFilter]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum permitted file size is 5MB.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file format. Please choose a JPEG, PNG, or WebP image.');
      return;
    }

    setError(null);
    setUploadFile(file);
    setFilePreview(URL.createObjectURL(file));

    // Auto-populate title if blank
    if (!uploadData.title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadData((prev) => ({ ...prev, title: cleanName }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !uploadFile) {
      setError('Please select an image file to upload.');
      return;
    }

    setActionLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('year', uploadData.year);
    formData.append('category', uploadData.category);
    formData.append('alt_text', uploadData.alt_text || uploadData.title);
    formData.append('item_status', uploadData.item_status);
    formData.append('file', uploadFile);

    try {
      await apiService.uploadGalleryImage(token, formData);
      setIsUploadOpen(false);
      setUploadFile(null);
      setFilePreview(null);
      setUploadData({
        title: '',
        year: new Date().getFullYear().toString(),
        category: 'Ganesh Puja',
        alt_text: '',
        item_status: 'draft',
      });
      setSuccessMessage('Photo uploaded and processed successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchGallery();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload photo.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setEditData({
      title: photo.title,
      year: photo.year,
      category: photo.category,
      alt_text: photo.alt_text || '',
      status: photo.status || 'draft',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingPhoto) return;
    setActionLoading(true);
    setError(null);
    try {
      await apiService.updateAdminGalleryItem(token, Number(editingPhoto.id), {
        title: editData.title,
        year: editData.year,
        category: editData.category,
        alt_text: editData.alt_text,
        status: editData.status,
      });
      setEditingPhoto(null);
      setSuccessMessage('Photo metadata updated.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchGallery();
    } catch (err: any) {
      setError(err?.message || 'Failed to update photo metadata.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (photo: GalleryPhoto, newStatus: ContentStatus) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await apiService.changeGalleryStatus(token, Number(photo.id), newStatus);
      setSuccessMessage(`Photo status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchGallery();
    } catch (err: any) {
      setError(err?.message || 'Failed to change photo status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deletingPhoto) return;
    setActionLoading(true);
    try {
      await apiService.deleteAdminGalleryItem(token, Number(deletingPhoto.id));
      setDeletingPhoto(null);
      setSuccessMessage('Photo deleted and removed from storage.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchGallery();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete photo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyUrl = (photo: GalleryPhoto) => {
    const url = photo.image_url || photo.thumbnail_url || photo.url || '';
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(String(photo.id));
      setTimeout(() => setCopiedUrl(null), 2500);
    });
  };

  const renderStatusBadge = (status?: ContentStatus) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">PUBLISHED</Badge>;
      case 'archived':
        return <Badge variant="neutral">ARCHIVED</Badge>;
      case 'draft':
      default:
        return <Badge variant="amber">DRAFT</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="saffron">CONTENT MANAGEMENT</Badge>
            <Badge variant="neutral">{totalCount} PHOTOS</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Celebration Photo Gallery
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Securely upload festival photographs, generate auto-optimized thumbnails, and manage annual archives.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setIsUploadOpen(true);
            setError(null);
          }}
          className="shrink-0 font-bold shadow-xs"
        >
          📷 Upload New Photo
        </Button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center justify-between">
          <span>✅ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="p-4 bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex items-center flex-wrap gap-1 bg-stone-100 p-1 rounded-lg">
          {['all', 'draft', 'published', 'archived'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                statusFilter === st ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Year and Category Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Gallery Cards Grid */}
      {loading ? (
        <LoadingState message="Loading photo gallery..." />
      ) : photos.length === 0 ? (
        <EmptyState
          title="No photos found."
          description={
            statusFilter !== 'all' || yearFilter !== 'all' || categoryFilter !== 'all'
              ? 'No photos match the selected filters. Try adjusting your filter selection.'
              : 'Upload your first celebration photo using the Upload button above.'
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {photos.map((photo) => {
              const displayImg = photo.thumbnail_url || photo.image_url || photo.url || '';
              return (
                <div
                  key={photo.id}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-4/3 bg-stone-100 relative overflow-hidden cursor-pointer" onClick={() => setPreviewPhoto(photo)}>
                      <img
                        src={displayImg}
                        alt={photo.alt_text || photo.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                      />
                      <div className="absolute top-2 right-2">
                        {renderStatusBadge(photo.status)}
                      </div>
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                        <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                          {photo.year}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-stone-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                          🔍 View Preview
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {photo.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(photo)}
                          className="text-[11px] text-stone-500 hover:text-stone-800 font-mono transition-colors flex items-center gap-1"
                          title="Copy public image URL"
                        >
                          {copiedUrl === String(photo.id) ? (
                            <span className="text-emerald-600 font-bold">✓ Copied</span>
                          ) : (
                            <span>🔗 Copy Link</span>
                          )}
                        </button>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 mt-1" title={photo.title}>
                        {photo.title}
                      </h3>
                      {photo.alt_text && (
                        <p className="text-[11px] text-stone-500 line-clamp-1 italic">
                          Alt: "{photo.alt_text}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(photo)}
                        className="text-xs px-2 py-1 h-7"
                      >
                        ✏️ Edit
                      </Button>

                      {photo.status !== 'published' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleStatusChange(photo, 'published')}
                          className="text-xs px-2 py-1 h-7 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-semibold"
                        >
                          🚀 Publish
                        </Button>
                      )}

                      {photo.status === 'published' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleStatusChange(photo, 'archived')}
                          className="text-xs px-2 py-1 h-7 text-stone-700 bg-stone-200 hover:bg-stone-300"
                        >
                          📦 Archive
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingPhoto(photo)}
                      className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1 h-7"
                      title="Delete photo"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="p-4 border border-stone-200 flex items-center justify-between bg-white rounded-xl text-xs">
              <span className="text-stone-500">
                Page {page} of {totalPages} ({totalCount} photos)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {previewPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">{previewPhoto.title}</span>
                {renderStatusBadge(previewPhoto.status)}
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-900 max-h-[60vh] flex items-center justify-center p-2">
              <img
                src={previewPhoto.image_url || previewPhoto.url || ''}
                alt={previewPhoto.alt_text || previewPhoto.title}
                className="max-h-[55vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="saffron">{previewPhoto.year}</Badge>
                  <span className="text-stone-600 font-medium">{previewPhoto.category}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(previewPhoto)}
                  className="text-xs h-7"
                >
                  {copiedUrl === String(previewPhoto.id) ? '✓ URL Copied' : '🔗 Copy Image URL'}
                </Button>
              </div>

              {previewPhoto.alt_text && (
                <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  <strong>Alt Description:</strong> {previewPhoto.alt_text}
                </p>
              )}
            </div>

            <div className="p-3 border-t border-stone-200 bg-stone-50 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreviewPhoto(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-900">Upload Celebration Photo</h2>
                <p className="text-xs text-stone-500 mt-0.5">Secure upload with auto-thumbnail generation</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Dropzone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Select Image File (JPEG, PNG, WebP — Max 5MB) *
                </label>
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors">
                  {filePreview ? (
                    <div className="space-y-2">
                      <div className="aspect-16/9 rounded-lg overflow-hidden bg-stone-100 max-h-44 mx-auto border border-stone-300 shadow-xs">
                        <img src={filePreview} alt="Upload preview" className="w-full h-full object-contain" />
                      </div>
                      <label className="cursor-pointer inline-block text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                        Choose Different File
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2 py-3">
                      <div className="text-3xl text-stone-400">📤</div>
                      <p className="text-xs font-bold text-stone-700">
                        Click or drag to choose an image
                      </p>
                      <p className="text-[11px] text-stone-500">
                        JPEG, PNG, or WebP (Maximum 5MB)
                      </p>
                      <input
                        type="file"
                        required
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Ganesh Visarjan Shobhayatra"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026, 2027"
                    value={uploadData.year}
                    onChange={(e) => setUploadData({ ...uploadData, year: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Status *
                  </label>
                  <select
                    value={uploadData.item_status}
                    onChange={(e) => setUploadData({ ...uploadData, item_status: e.target.value as ContentStatus })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Alt Text (Accessibility Description)
                </label>
                <input
                  type="text"
                  placeholder="Describe image contents for screen readers..."
                  value={uploadData.alt_text}
                  onChange={(e) => setUploadData({ ...uploadData, alt_text: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading || !uploadFile} className="font-bold">
                  {actionLoading ? 'Uploading & Processing...' : 'Upload Photo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT METADATA MODAL */}
      {editingPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-lg font-bold text-stone-900">Edit Photo Metadata</h2>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.year}
                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Status *
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as ContentStatus })}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editData.alt_text}
                  onChange={(e) => setEditData({ ...editData, alt_text: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingPhoto(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="font-bold">
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-stone-900">Confirm Photo Deletion</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-stone-900">"{deletingPhoto.title}"</strong>? If this image is referenced in other sections, the system will safely retain the media file while removing it from the public gallery.
            </p>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeletingPhoto(null)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 font-bold"
              >
                {actionLoading ? 'Deleting...' : 'Delete Photo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
