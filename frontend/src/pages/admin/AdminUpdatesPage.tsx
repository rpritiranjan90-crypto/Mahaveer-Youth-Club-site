import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../admin/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageMeta } from '../../hooks/usePageMeta';
import { apiService } from '../../services/api';
import { UpdateItem, ContentStatus } from '../../types';

export const AdminUpdatesPage: React.FC = () => {
  usePageMeta({
    title: 'Manage Updates & Circulars — Admin Panel',
    description: 'Create, edit, publish, and archive official notices for Mahaveer Youth Club Banza.',
  });

  const { token } = useAuth();

  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<UpdateItem | null>(null);
  const [previewItem, setPreviewItem] = useState<UpdateItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<UpdateItem | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Form inputs
  const [formData, setFormData] = useState({
    title: '',
    category: 'Official Notice',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft' as ContentStatus,
  });

  const fetchUpdates = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAdminUpdates(
        token,
        page,
        15,
        statusFilter,
        activeSearch || undefined
      );
      setUpdates(data.items);
      setTotalPages(data.total_pages);
      setTotalCount(data.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch updates.');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, activeSearch]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchTerm.trim());
  };

  const openCreateModal = () => {
    setFormData({
      title: '',
      category: 'Official Notice',
      excerpt: '',
      content: '',
      featured_image: '',
      status: 'draft',
    });
    setIsCreateOpen(true);
  };

  const openEditModal = (item: UpdateItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      excerpt: item.excerpt || '',
      content: item.content,
      featured_image: item.featured_image || '',
      status: item.status || 'draft',
    });
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      await apiService.createAdminUpdate(token, {
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt || undefined,
        content: formData.content,
        featured_image: formData.featured_image || undefined,
        status: formData.status,
      });
      setIsCreateOpen(false);
      setSuccessMessage('Update circular created successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchUpdates();
    } catch (err: any) {
      setError(err?.message || 'Failed to create update.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingItem) return;
    setActionLoading(true);
    setError(null);
    try {
      await apiService.updateAdminUpdate(token, editingItem.id, {
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt || undefined,
        content: formData.content,
        featured_image: formData.featured_image || undefined,
        status: formData.status,
      });
      setEditingItem(null);
      setSuccessMessage('Update circular updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchUpdates();
    } catch (err: any) {
      setError(err?.message || 'Failed to update circular.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (item: UpdateItem, newStatus: ContentStatus) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await apiService.changeUpdateStatus(token, item.id, newStatus);
      setSuccessMessage(`Update status changed to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchUpdates();
    } catch (err: any) {
      setError(err?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deletingItem) return;
    setActionLoading(true);
    try {
      await apiService.deleteAdminUpdate(token, deletingItem.id);
      setDeletingItem(null);
      setSuccessMessage('Update deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchUpdates();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete update.');
    } finally {
      setActionLoading(false);
    }
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
            <Badge variant="neutral">{totalCount} NOTICES</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Updates & Circulars
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Manage official announcements, executive meeting minutes, and festival schedules with draft and publishing workflows.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} className="shrink-0 font-bold shadow-xs">
          + New Update
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

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto">
          {['all', 'draft', 'published', 'archived'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by title or excerpt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 w-full sm:w-64 bg-white"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
          {activeSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setActiveSearch('');
                setPage(1);
              }}
            >
              Reset
            </Button>
          )}
        </form>
      </Card>

      {/* Content Table / Cards */}
      {loading ? (
        <LoadingState message="Loading updates and circulars..." />
      ) : updates.length === 0 ? (
        <EmptyState
          title="No updates found."
          description={
            activeSearch || statusFilter !== 'all'
              ? 'No updates match the selected filter or query. Try resetting filters.'
              : 'Create your first official announcement or bulletin using the button above.'
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Published At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {updates.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{item.title}</div>
                      <div className="text-[11px] text-stone-400 font-mono">/updates/{item.slug}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{renderStatusBadge(item.status)}</td>
                    <td className="py-3.5 px-4 text-xs text-stone-500">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Preview */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewItem(item)}
                          className="text-xs text-stone-600"
                        >
                          👁️ Preview
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="text-xs"
                        >
                          ✏️ Edit
                        </Button>

                        {/* Status Transition buttons */}
                        {item.status !== 'published' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => handleStatusChange(item, 'published')}
                            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                          >
                            🚀 Publish
                          </Button>
                        )}

                        {item.status === 'published' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => handleStatusChange(item, 'archived')}
                            className="text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200"
                          >
                            📦 Archive
                          </Button>
                        )}

                        {item.status === 'archived' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={actionLoading}
                            onClick={() => handleStatusChange(item, 'draft')}
                            className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                          >
                            ↩️ Draft
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingItem(item)}
                          className="text-xs text-rose-600 hover:bg-rose-50"
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 flex items-center justify-between bg-stone-50 text-xs">
              <span className="text-stone-500">
                Showing page {page} of {totalPages} ({totalCount} total)
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

      {/* CREATE / EDIT MODAL */}
      {(isCreateOpen || editingItem) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h2 className="text-xl font-bold text-stone-900">
                {isCreateOpen ? 'Create New Update Circular' : `Edit: ${editingItem?.title}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingItem(null);
                }}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={isCreateOpen ? handleSaveCreate : handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Ganesh Puja 2026 Committee Meeting"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Official Notice, Festival Schedule"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="draft">Draft (Private to Admin)</option>
                    <option value="published">Published (Visible on Website)</option>
                    <option value="archived">Archived (Stored Privately)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Short Excerpt (Optional Summary)
                </label>
                <input
                  type="text"
                  placeholder="Brief 1-2 sentence preview for cards..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Featured Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://... or /uploads/gallery/..."
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Content (HTML / Rich Text) *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Full bulletin text. Basic HTML like <p>, <b>, <ul>, <li> is supported and sanitized automatically."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono bg-stone-50"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Server-side security sanitizer automatically strips dangerous scripts, iframes, and malicious code.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="font-bold">
                  {actionLoading ? 'Saving...' : isCreateOpen ? 'Create Update' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="saffron">PREVIEW MODE</Badge>
                {renderStatusBadge(previewItem.status)}
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Badge variant="neutral">{previewItem.category}</Badge>
                <span>Slug: {previewItem.slug}</span>
              </div>

              <h2 className="text-2xl font-extrabold text-stone-900">{previewItem.title}</h2>

              {previewItem.featured_image && (
                <div className="rounded-xl overflow-hidden max-h-72 w-full bg-stone-100">
                  <img src={previewItem.featured_image} alt={previewItem.title} className="w-full h-full object-cover" />
                </div>
              )}

              {previewItem.excerpt && (
                <p className="text-sm font-medium text-stone-700 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                  {previewItem.excerpt}
                </p>
              )}

              <div
                className="prose prose-stone text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3 border-t border-stone-100 pt-4"
                dangerouslySetInnerHTML={{ __html: previewItem.content }}
              />
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreviewItem(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-stone-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-stone-900">"{deletingItem.title}"</strong>? This action will generate a security audit log event and cannot be undone.
            </p>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeletingItem(null)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 font-bold"
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
