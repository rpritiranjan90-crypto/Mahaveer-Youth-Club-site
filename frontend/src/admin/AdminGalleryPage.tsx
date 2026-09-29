import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from './api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import {
  Upload,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  year: string;
  sort_order: number;
  published: boolean;
  created_at: string;
}

const CATEGORIES = ['All', 'Pandal', 'Rituals', 'Murti', 'Community', 'Cultural'];

export const AdminGalleryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'Pandal',
    year: '2026',
    sort_order: 0,
    published: true,
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      openCreateModal();
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchGallery = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getGallery();
      setItems(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch gallery items.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      category: 'Pandal',
      year: '2026',
      sort_order: items.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url,
      category: item.category,
      year: item.year,
      sort_order: item.sort_order,
      published: item.published,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const res = await adminApi.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        image_url: res.file_url || res.url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
    } catch (err: any) {
      setError(err?.message || 'Image upload failed. Ensure JPG/PNG/WebP format under 5MB.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image_url.trim()) {
      setError('Title and image are required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingItem) {
        await adminApi.updateGalleryItem(editingItem.id, formData);
        setSuccessMsg(`Photo "${formData.title}" updated successfully.`);
      } else {
        await adminApi.createGalleryItem(formData);
        setSuccessMsg(`Photo "${formData.title}" added to gallery.`);
      }
      setIsModalOpen(false);
      fetchGallery();
    } catch (err: any) {
      setError(err?.message || 'Failed to save gallery photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteGalleryItem(deleteTarget.id);
      setSuccessMsg('Gallery item deleted.');
      setDeleteTarget(null);
      fetchGallery();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete photo.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Photo Gallery Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Upload and organize festival moments, rituals, pandal construction, and community events.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGallery}
            className="text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Upload Photo</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert variant="success">
          {successMsg}
        </Alert>
      )}

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {/* Category Filter Pills */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 shrink-0">
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" color="saffron" />
          <p className="text-xs text-slate-500 font-medium">Loading photo gallery...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col group"
            >
              {/* Image Preview Container */}
              <div className="aspect-4/3 bg-slate-100 relative overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                    {item.year}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-bold">
                    {item.category}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  {item.published ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                      Live
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Order: #{item.sort_order}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Edit Photo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-slate-200/80">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No photos found</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Upload your first festival photograph to showcase to visiting devotees.
          </p>
          <Button size="sm" variant="primary" onClick={openCreateModal}>
            Upload Photo
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* Upload & Edit Modal */}
      {/* ------------------------------------------------------------------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Photo Metadata' : 'Upload Festival Photo'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Dropzone / Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Photograph *
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-amber-500/60 transition-colors bg-slate-50/50">
              {formData.image_url ? (
                <div className="space-y-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="max-h-36 mx-auto rounded-lg object-contain"
                  />
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-[11px] text-slate-500 truncate max-w-xs">
                      {formData.image_url}
                    </span>
                    <label className="text-xs font-bold text-amber-600 hover:underline cursor-pointer">
                      Change
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-600 hover:underline">
                      {uploadingImage ? 'Uploading image...' : 'Click to choose image'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, or WebP up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Photo Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Vedic Pandal Sanctum at Twilight"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Pandal">Pandal</option>
                <option value="Rituals">Rituals</option>
                <option value="Murti">Murti</option>
                <option value="Community">Community</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Festival Year
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief context or moment details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Published Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">Show in Public Gallery</p>
              <p className="text-[11px] text-slate-500">
                Immediately visible in the public Photo Gallery.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving || uploadingImage}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              {editingItem ? 'Save Photo' : 'Add Photo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------------------- */}
      {/* Delete Confirmation Modal */}
      {/* ------------------------------------------------------------------------- */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Gallery Photo"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-slate-900 font-bold">"{deleteTarget?.title}"</strong>?
          </p>
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete Photo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
