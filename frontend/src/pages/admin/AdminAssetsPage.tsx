import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../admin/AuthContext';
import { useBrand } from '../../context/BrandContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';
import { resolveMediaUrl } from '../../utils/media';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SiteAsset } from '../../types';

export const AdminAssetsPage: React.FC = () => {
  const { token } = useAuth();
  const { refreshLogo, refreshGanesh } = useBrand();
  const { t } = useLanguage();

  // State for logo
  const [logo, setLogo] = useState<SiteAsset | null>(null);
  const [logoLoading, setLogoLoading] = useState<boolean>(true);
  const [logoUploading, setLogoUploading] = useState<boolean>(false);
  const [logoDeleting, setLogoDeleting] = useState<boolean>(false);
  const [showLogoDeleteModal, setShowLogoDeleteModal] = useState<boolean>(false);

  // State for Ganesh image
  const [ganesh, setGanesh] = useState<SiteAsset | null>(null);
  const [ganeshYear, setGaneshYear] = useState<number>(new Date().getFullYear());
  const [ganeshLoading, setGaneshLoading] = useState<boolean>(true);
  const [ganeshUploading, setGaneshUploading] = useState<boolean>(false);
  const [ganeshDeleting, setGaneshDeleting] = useState<boolean>(false);
  const [showGaneshDeleteModal, setShowGaneshDeleteModal] = useState<boolean>(false);

  // Global messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const ganeshInputRef = useRef<HTMLInputElement>(null);

  const fetchLogo = useCallback(async () => {
    if (!token) return;
    setLogoLoading(true);
    try {
      const data = await apiService.getAdminLogo(token);
      setLogo(data);
    } catch {
      setLogo(null);
    } finally {
      setLogoLoading(false);
    }
  }, [token]);

  const fetchGanesh = useCallback(async () => {
    if (!token) return;
    setGaneshLoading(true);
    try {
      const data = await apiService.getAdminCurrentGanesh(token);
      setGanesh(data);
      if (data.year) {
        setGaneshYear(data.year);
      }
    } catch {
      setGanesh(null);
    } finally {
      setGaneshLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLogo();
    fetchGanesh();
  }, [fetchLogo, fetchGanesh]);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg(null);
    } else {
      setSuccessMsg(msg);
      setErrorMsg(null);
    }
    setTimeout(() => {
      setErrorMsg(null);
      setSuccessMsg(null);
    }, 5000);
  };

  // ---------------------------------------------------------------------------
  // Logo Actions
  // ---------------------------------------------------------------------------
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Reset input so re-selecting the same file fires change event
    e.target.value = '';

    setLogoUploading(true);
    setErrorMsg(null);
    try {
      const updated = await apiService.uploadAdminLogo(token, file);
      setLogo(updated);
      await refreshLogo();
      showToast(t('admin.assets.uploadSuccess'));
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload official logo.', true);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!token) return;
    setLogoDeleting(true);
    try {
      await apiService.deleteAdminLogo(token);
      setLogo(null);
      await refreshLogo();
      setShowLogoDeleteModal(false);
      showToast(t('admin.assets.deleteSuccess'));
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete official logo.', true);
    } finally {
      setLogoDeleting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Ganesh Image Actions
  // ---------------------------------------------------------------------------
  const handleGaneshFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    e.target.value = '';

    setGaneshUploading(true);
    setErrorMsg(null);
    try {
      const updated = await apiService.uploadAdminCurrentGanesh(token, file, ganeshYear);
      setGanesh(updated);
      await refreshGanesh();
      showToast(t('admin.assets.uploadSuccess'));
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload current-year Ganesh image.', true);
    } finally {
      setGaneshUploading(false);
    }
  };

  const handleDeleteGanesh = async () => {
    if (!token) return;
    setGaneshDeleting(true);
    try {
      await apiService.deleteAdminCurrentGanesh(token);
      setGanesh(null);
      await refreshGanesh();
      setShowGaneshDeleteModal(false);
      showToast(t('admin.assets.deleteSuccess'));
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete current-year Ganesh image.', true);
    } finally {
      setGaneshDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Title Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
          {t('admin.assets.title')}
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {t('admin.assets.subtitle')}
        </p>
      </div>

      {/* Global Notifications */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl animate-in fade-in duration-150">
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl animate-in fade-in duration-150">
          ✓ {successMsg}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={logoInputRef}
        onChange={handleLogoFileChange}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-hidden="true"
      />
      <input
        type="file"
        ref={ganeshInputRef}
        onChange={handleGaneshFileChange}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ===================================================================
            SECTION 1: Official Club Logo
        =================================================================== */}
        <Card className="p-6 bg-white border border-stone-200 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                {t('admin.assets.logo.title')}
              </h2>
              <Badge variant={logo ? 'success' : 'neutral'}>
                {logo ? 'Active Logo' : 'Text Fallback'}
              </Badge>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t('admin.assets.logo.desc')}
            </p>

            {/* Logo Preview Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
              {logoLoading ? (
                <div className="text-xs text-stone-500 font-mono">Loading logo metadata...</div>
              ) : logo ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-2xs">
                    <img
                      src={`${resolveMediaUrl(logo.image_url)}?v=${new Date(logo.updated_at || logo.created_at).getTime()}`}
                      alt={t('brand.logoAlt')}
                      className="max-h-28 max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="text-center space-y-0.5 text-[11px] font-mono text-stone-500">
                    <p className="font-semibold text-stone-700">{logo.original_filename}</p>
                    <p>{t('admin.assets.fileSize', { size: formatFileSize(logo.file_size) })}</p>
                    {logo.width && logo.height && (
                      <p>{t('admin.assets.dimensions', { width: logo.width, height: logo.height })}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 max-w-xs">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-orange-100 text-orange-700 font-black text-xl flex items-center justify-center">
                    MYC
                  </div>
                  <p className="text-xs text-stone-500">
                    {t('admin.assets.logo.none')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={logoUploading || logoLoading}
              onClick={() => logoInputRef.current?.click()}
            >
              {logoUploading
                ? 'Uploading...'
                : logo
                ? t('admin.assets.logo.replaceBtn')
                : t('admin.assets.logo.uploadBtn')}
            </Button>

            {logo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-rose-700 hover:bg-rose-50 border-rose-200"
                disabled={logoDeleting || logoUploading}
                onClick={() => setShowLogoDeleteModal(true)}
              >
                {t('admin.assets.logo.deleteBtn')}
              </Button>
            )}
          </div>
        </Card>

        {/* ===================================================================
            SECTION 2: Current-Year Ganesh Image
        =================================================================== */}
        <Card className="p-6 bg-white border border-stone-200 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                {t('admin.assets.ganesh.title')}
              </h2>
              <Badge variant={ganesh ? 'success' : 'neutral'}>
                {ganesh ? `Year ${ganesh.year}` : 'Pending Upload'}
              </Badge>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t('admin.assets.ganesh.desc')}
            </p>

            {/* Year Input Control */}
            <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
              <label htmlFor="ganesh-year" className="text-xs font-bold text-stone-700 whitespace-nowrap">
                {t('admin.assets.ganesh.yearLabel')}
              </label>
              <input
                id="ganesh-year"
                type="number"
                min="2012"
                max="2100"
                value={ganeshYear}
                onChange={(e) => setGaneshYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-28 px-3 py-1.5 text-xs font-mono font-bold rounded border border-stone-300 bg-white"
              />
            </div>

            {/* Ganesh Image Preview Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
              {ganeshLoading ? (
                <div className="text-xs text-stone-500 font-mono">Loading image metadata...</div>
              ) : ganesh ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-2 bg-white rounded-xl border border-stone-200 shadow-2xs max-w-full">
                    <img
                      src={`${resolveMediaUrl(ganesh.image_url)}?v=${new Date(ganesh.updated_at || ganesh.created_at).getTime()}`}
                      alt={t('brand.ganeshAlt', { year: ganesh.year || ganeshYear })}
                      className="max-h-36 max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="text-center space-y-0.5 text-[11px] font-mono text-stone-500">
                    <p className="font-semibold text-stone-700">{ganesh.original_filename}</p>
                    <p>{t('admin.assets.fileSize', { size: formatFileSize(ganesh.file_size) })}</p>
                    {ganesh.width && ganesh.height && (
                      <p>{t('admin.assets.dimensions', { width: ganesh.width, height: ganesh.height })}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 max-w-xs">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 text-amber-700 font-black text-xl flex items-center justify-center">
                    🪔
                  </div>
                  <p className="text-xs text-stone-500">
                    {t('admin.assets.ganesh.none')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={ganeshUploading || ganeshLoading}
              onClick={() => ganeshInputRef.current?.click()}
            >
              {ganeshUploading
                ? 'Uploading...'
                : ganesh
                ? t('admin.assets.ganesh.replaceBtn')
                : t('admin.assets.ganesh.uploadBtn')}
            </Button>

            {ganesh && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-rose-700 hover:bg-rose-50 border-rose-200"
                disabled={ganeshDeleting || ganeshUploading}
                onClick={() => setShowGaneshDeleteModal(true)}
              >
                {t('admin.assets.ganesh.deleteBtn')}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* =====================================================================
          DELETE CONFIRMATION MODALS
      ===================================================================== */}
      {showLogoDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-bold text-stone-900">
              {t('admin.assets.logo.deleteBtn')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t('admin.assets.logo.deleteConfirm')}
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoDeleteModal(false)}
                disabled={logoDeleting}
              >
                {t('admin.assets.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={handleDeleteLogo}
                disabled={logoDeleting}
              >
                {logoDeleting ? 'Deleting...' : t('admin.assets.confirmDelete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showGaneshDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-bold text-stone-900">
              {t('admin.assets.ganesh.deleteBtn')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t('admin.assets.ganesh.deleteConfirm')}
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGaneshDeleteModal(false)}
                disabled={ganeshDeleting}
              >
                {t('admin.assets.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={handleDeleteGanesh}
                disabled={ganeshDeleting}
              >
                {ganeshDeleting ? 'Deleting...' : t('admin.assets.confirmDelete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
