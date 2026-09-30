import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../admin/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';
import { GalleryPhoto, ContentStatus } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';

export interface MediaPickerProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  label = 'Media / Image',
  value,
  onChange,
  helperText,
  required = false,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const { token } = useAuth();

  // Modal State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');

  // Gallery Browse State
  const [galleryItems, setGalleryItems] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [tempSelectedUrl, setTempSelectedUrl] = useState<string>(value || '');
  const [selectedItemMeta, setSelectedItemMeta] = useState<GalleryPhoto | null>(null);

  // Upload Tab State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    category: 'Ganesh Puja',
    alt_text: '',
    item_status: 'published' as ContentStatus,
  });

  const categories = ['Ganesh Puja', 'Cultural Events', 'Seva & Welfare', 'Other'];

  // Fetch available gallery images
  const fetchGalleryItems = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getAdminGallery(
        token,
        1,
        60,
        'all',
        selectedYear !== 'all' ? selectedYear : undefined,
        selectedCategory !== 'all' ? selectedCategory : undefined
      );
      setGalleryItems(res.items);

      // Extract unique years
      const years = Array.from(new Set(res.items.map((i) => i.year).filter(Boolean))).sort().reverse();
      setAvailableYears(years);

      // If a value is currently selected, find its metadata
      if (value) {
        const found = res.items.find((i) => i.image_url === value || i.thumbnail_url === value || i.url === value);
        if (found) {
          setSelectedItemMeta(found);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load gallery images.');
    } finally {
      setLoading(false);
    }
  }, [token, selectedYear, selectedCategory, value]);

  useEffect(() => {
    if (isOpen) {
      fetchGalleryItems();
    }
  }, [isOpen, fetchGalleryItems]);

  // Handle open modal
  const handleOpen = (tab: 'gallery' | 'upload' = 'gallery') => {
    setActiveTab(tab);
    setTempSelectedUrl(value || '');
    setError(null);
    setUploadError(null);
    setIsOpen(true);
  };

  // Handle Remove Selection
  const handleRemove = () => {
    onChange('');
    setTempSelectedUrl('');
    setSelectedItemMeta(null);
  };

  // Filter gallery items by search
  const filteredItems = galleryItems.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      (item.year && item.year.includes(term)) ||
      (item.alt_text && item.alt_text.toLowerCase().includes(term))
    );
  });

  // Handle direct file selection in Upload Tab
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Unsupported format. Please select a JPEG, PNG, or WebP image.');
      return;
    }

    setUploadError(null);
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    if (!uploadForm.title) {
      const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadForm((prev) => ({ ...prev, title: rawName }));
    }
  };

  // Submit direct upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !uploadFile) {
      setUploadError('Please choose an image file to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('year', uploadForm.year);
    formData.append('category', uploadForm.category);
    formData.append('alt_text', uploadForm.alt_text || uploadForm.title);
    formData.append('item_status', uploadForm.item_status);
    formData.append('file', uploadFile);

    try {
      const newPhoto = await apiService.uploadGalleryImage(token, formData);
      const chosenUrl = newPhoto.image_url || newPhoto.thumbnail_url || newPhoto.url || '';
      onChange(chosenUrl);
      setSelectedItemMeta(newPhoto);
      setIsOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload photo. Please verify the image file.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Confirm selection from Gallery
  const handleConfirmGallerySelection = () => {
    if (tempSelectedUrl) {
      onChange(tempSelectedUrl);
      const meta = galleryItems.find((i) => i.image_url === tempSelectedUrl || i.url === tempSelectedUrl);
      if (meta) setSelectedItemMeta(meta);
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      </div>

      {/* Selected Image Box or Action Buttons */}
      {value ? (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-28 h-20 sm:w-32 sm:h-24 rounded-lg overflow-hidden border border-stone-300 bg-stone-200 shrink-0 shadow-xs">
              <img
                src={value}
                alt="Selected media preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
                }}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-900 truncate">
                  {selectedItemMeta?.title || 'Selected Image'}
                </span>
                {selectedItemMeta?.year && (
                  <Badge variant="saffron">
                    {selectedItemMeta.year}
                  </Badge>
                )}
                {selectedItemMeta?.category && (
                  <span className="text-[11px] text-stone-500 font-medium">
                    {selectedItemMeta.category}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 truncate font-mono">
                {value.length > 50 ? `...${value.slice(-45)}` : value}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => handleOpen('gallery')}
                  className="text-xs h-7 px-2.5"
                >
                  🔄 {t('admin.media.change')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={handleRemove}
                  className="text-xs h-7 px-2.5 text-rose-600 hover:bg-rose-50"
                >
                  🗑️ {t('admin.media.remove')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-stone-300 hover:border-orange-400 bg-stone-50/50 hover:bg-orange-50/20 rounded-xl p-4 sm:p-5 transition-colors text-center space-y-3">
          <div className="text-stone-400 text-2xl">🖼️</div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-stone-700">
              {t('admin.media.noImageSelected')}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {helperText || t('admin.media.helperDefault')}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2.5 flex-wrap pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => handleOpen('gallery')}
              className="text-xs font-semibold bg-white shadow-xs"
            >
              🖼️ {t('admin.media.selectFromGallery')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={disabled}
              onClick={() => handleOpen('upload')}
              className="text-xs font-semibold shadow-xs"
            >
              ⬆️ {t('admin.media.uploadNew')}
            </Button>
          </div>
        </div>
      )}

      {/* MEDIA SELECTION MODAL */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {t('admin.media.modalTitle')}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t('admin.media.modalSubtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg text-lg font-bold hover:bg-stone-200 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-100/60 px-4 sm:px-6 pt-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'gallery'
                    ? 'border-orange-600 text-orange-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                🖼️ {t('admin.media.tabBrowseGallery')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'upload'
                    ? 'border-orange-600 text-orange-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                ⬆️ {t('admin.media.tabUploadNew')}
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === 'gallery' ? (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div>
                      <input
                        type="text"
                        placeholder={t('admin.media.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                    </div>
                    <div>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        <option value="all">{t('admin.media.allYears')}</option>
                        {availableYears.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        <option value="all">{t('admin.media.allCategories')}</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  {loading ? (
                    <LoadingState message={t('admin.media.loadingGallery')} />
                  ) : error ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                      {error}
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <EmptyState
                      title={t('admin.media.emptyGalleryTitle')}
                      description={t('admin.media.emptyGalleryDesc')}
                      actionLabel={`⬆️ ${t('admin.media.uploadFirstPhoto')}`}
                      onAction={() => setActiveTab('upload')}
                    />
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredItems.map((item) => {
                        const imgUrl = item.thumbnail_url || item.image_url || item.url || '';
                        const targetUrl = item.image_url || item.thumbnail_url || item.url || '';
                        const isSelected = tempSelectedUrl === targetUrl;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTempSelectedUrl(targetUrl)}
                            className={`group relative text-left rounded-xl overflow-hidden border-2 transition-all p-1 bg-stone-50 ${
                              isSelected
                                ? 'border-orange-600 ring-2 ring-orange-500/30 bg-orange-50/30'
                                : 'border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            <div className="aspect-4/3 overflow-hidden rounded-lg bg-stone-200 relative">
                              <img
                                src={imgUrl}
                                alt={item.alt_text || item.title}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-103"
                              />
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
                                  ✓
                                </div>
                              )}
                            </div>
                            <div className="p-1.5">
                              <p className="text-xs font-bold text-stone-900 truncate">
                                {item.title}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-stone-500 mt-0.5">
                                <span>{item.year}</span>
                                <span className="truncate">{item.category}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* UPLOAD TAB */
                <form onSubmit={handleUploadSubmit} className="space-y-4 max-w-xl mx-auto">
                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                      {uploadError}
                    </div>
                  )}

                  {/* Dropzone */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {t('admin.media.uploadFileLabel')} *
                    </label>
                    <div className="border-2 border-dashed border-stone-300 rounded-xl p-5 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors">
                      {uploadPreview ? (
                        <div className="space-y-3">
                          <div className="w-36 h-28 mx-auto rounded-lg overflow-hidden border border-stone-300 shadow-xs bg-stone-100">
                            <img
                              src={uploadPreview}
                              alt="Upload preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <label className="cursor-pointer text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                              {t('admin.media.chooseDifferentFile')}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block space-y-2">
                          <div className="text-3xl text-stone-400">📤</div>
                          <p className="text-xs font-bold text-stone-700">
                            {t('admin.media.dragDropOrBrowse')}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            JPEG, PNG, WebP (Max 5MB)
                          </p>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Upload Metadata */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {t('admin.media.titleLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ganesh Puja Pandal Aarti"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        {t('admin.media.yearLabel')} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="2026"
                        value={uploadForm.year}
                        onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        {t('admin.media.categoryLabel')} *
                      </label>
                      <select
                        value={uploadForm.category}
                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {t('admin.media.altTextLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder="Optional descriptive caption for screen readers"
                      value={uploadForm.alt_text}
                      onChange={(e) => setUploadForm({ ...uploadForm, alt_text: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={uploadLoading || !uploadFile}
                      className="w-full font-bold shadow-xs py-2"
                    >
                      {uploadLoading ? t('admin.media.uploading') : t('admin.media.uploadAndSelect')}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            {activeTab === 'gallery' && (
              <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
                <div className="text-xs text-stone-500">
                  {tempSelectedUrl ? (
                    <span className="text-orange-700 font-semibold">
                      ✓ {t('admin.media.photoSelected')}
                    </span>
                  ) : (
                    <span>{t('admin.media.clickToSelect')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('common.close')}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!tempSelectedUrl}
                    onClick={handleConfirmGallerySelection}
                    className="font-bold"
                  >
                    {t('admin.media.useSelectedImage')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
