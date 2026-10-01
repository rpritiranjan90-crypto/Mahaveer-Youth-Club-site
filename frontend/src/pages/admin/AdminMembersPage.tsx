import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../admin/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageMeta } from '../../hooks/usePageMeta';
import { apiService } from '../../services/api';
import { resolveMediaUrl } from '../../utils/media';
import { MemberItem } from '../../types';

const COMMON_ROLES = [
  'President',
  'Vice President',
  'General Secretary',
  'Treasurer',
  'Joint Secretary',
  'Cultural Coordinator',
  'Puja Coordinator',
  'Executive Member',
  'Youth Member',
  'Volunteer',
];

export const AdminMembersPage: React.FC = () => {
  const { t } = useLanguage();
  usePageMeta({
    title: 'Manage Member Roster — Admin Panel',
    description: 'Manage verified club members, executive committee designations, photographs, and public visibility.',
  });

  const { token } = useAuth();

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [photoMember, setPhotoMember] = useState<MemberItem | null>(null);
  const [deletingMember, setDeletingMember] = useState<MemberItem | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    designation: 'Member',
    customDesignation: '',
    bio: '',
    display_order: 0,
    is_active: true,
  });

  // Photo upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const activeParam = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
      const data = await apiService.getAdminMembers(token, 1, 200, activeParam, searchQuery || undefined);
      setMembers(data.items);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch member roster.');
    } finally {
      setLoading(false);
    }
  }, [token, activeFilter, searchQuery]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 4000);
  };

  const getInitials = (name: string): string => {
    if (!name) return 'MY';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ---------------------------------------------------------------------------
  // Modal Handlers
  // ---------------------------------------------------------------------------
  const openAddModal = () => {
    const nextOrder = members.length > 0 ? Math.max(...members.map((m) => m.display_order || m.sort_order || 0)) + 1 : 1;
    setFormData({
      name: '',
      designation: 'Youth Member',
      customDesignation: '',
      bio: '',
      display_order: nextOrder,
      is_active: true,
    });
    setIsAddOpen(true);
  };

  const openEditModal = (item: MemberItem) => {
    const isCommon = COMMON_ROLES.includes(item.designation || item.role || '');
    setEditingMember(item);
    setFormData({
      name: item.name || item.display_name || '',
      designation: isCommon ? (item.designation || item.role || 'Member') : 'Other',
      customDesignation: isCommon ? '' : (item.designation || item.role || ''),
      bio: item.bio || '',
      display_order: item.display_order ?? item.sort_order ?? 0,
      is_active: item.is_active ?? item.is_visible ?? true,
    });
  };

  const openPhotoModal = (item: MemberItem) => {
    setPhotoMember(item);
    setPhotoUploadError(null);
  };

  // ---------------------------------------------------------------------------
  // Save Add & Edit
  // ---------------------------------------------------------------------------
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.name.trim()) {
      showToast('Member name is required.', true);
      return;
    }

    const finalDesignation = formData.designation === 'Other'
      ? formData.customDesignation.trim() || 'Member'
      : formData.designation;

    setActionLoading(true);
    try {
      await apiService.createAdminMember(token, {
        name: formData.name.trim(),
        designation: finalDesignation,
        bio: formData.bio.trim() || undefined,
        display_order: formData.display_order,
        is_active: formData.is_active,
      });
      setIsAddOpen(false);
      showToast(t('admin.members.saveSuccess'));
      fetchMembers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to add member.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingMember) return;
    if (!formData.name.trim()) {
      showToast('Member name is required.', true);
      return;
    }

    const finalDesignation = formData.designation === 'Other'
      ? formData.customDesignation.trim() || 'Member'
      : formData.designation;

    setActionLoading(true);
    try {
      await apiService.updateAdminMember(token, editingMember.id, {
        name: formData.name.trim(),
        designation: finalDesignation,
        bio: formData.bio.trim() || undefined,
        display_order: formData.display_order,
        is_active: formData.is_active,
      });
      setEditingMember(null);
      showToast(t('admin.members.saveSuccess'));
      fetchMembers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update member.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Toggle Visibility / Status
  // ---------------------------------------------------------------------------
  const handleToggleActive = async (item: MemberItem) => {
    if (!token) return;
    setActionLoading(true);
    try {
      const currentActive = item.is_active ?? item.is_visible ?? true;
      if (currentActive) {
        await apiService.deactivateMember(token, item.id);
      } else {
        await apiService.activateMember(token, item.id);
      }
      showToast(`${item.name || item.display_name} is now ${!currentActive ? 'visible publicly' : 'hidden from public view'}.`);
      fetchMembers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to change visibility.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Photo Upload & Deletion
  // ---------------------------------------------------------------------------
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !photoMember) return;

    e.target.value = '';
    setActionLoading(true);
    setPhotoUploadError(null);
    try {
      const updated = await apiService.uploadMemberPhoto(token, photoMember.id, file);
      setPhotoMember(updated);
      showToast(t('admin.members.uploadSuccess'));
      fetchMembers();
    } catch (err: any) {
      setPhotoUploadError(err?.message || 'Failed to upload photograph.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!token || !photoMember) return;
    setActionLoading(true);
    setPhotoUploadError(null);
    try {
      const updated = await apiService.deleteMemberPhoto(token, photoMember.id);
      setPhotoMember(updated);
      showToast(t('admin.members.photoDeleteSuccess'));
      fetchMembers();
    } catch (err: any) {
      setPhotoUploadError(err?.message || 'Failed to remove photograph.');
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Reorder & Delete
  // ---------------------------------------------------------------------------
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!token) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const newMembers = [...members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;

    const reorderPayload = newMembers.map((m, idx) => ({
      id: m.id,
      display_order: idx + 1,
    }));

    setActionLoading(true);
    try {
      await apiService.reorderMembers(token, reorderPayload);
      showToast('Member display order updated.');
      fetchMembers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to reorder members.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deletingMember) return;
    setActionLoading(true);
    try {
      await apiService.deleteAdminMember(token, deletingMember.id);
      setDeletingMember(null);
      showToast(t('admin.members.deleteSuccess'));
      fetchMembers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete member.', true);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="saffron">CONTENT MANAGEMENT</Badge>
            <Badge variant="neutral">{members.length} REGISTERED</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t('admin.members.title')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {t('admin.members.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openAddModal}
          className="shrink-0 font-bold shadow-xs flex items-center gap-1.5"
        >
          {t('admin.members.addBtn')}
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.members.searchPlaceholder')}
            className="w-full px-3.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              activeFilter === 'all' ? 'bg-orange-600 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t('admin.members.filterAll')}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              activeFilter === 'active' ? 'bg-emerald-600 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t('admin.members.filterActive')}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('inactive')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              activeFilter === 'inactive' ? 'bg-stone-800 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t('admin.members.filterInactive')}
          </button>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <LoadingState message="Loading membership roster..." />
      ) : members.length === 0 ? (
        <EmptyState
          title={t('admin.members.noMembersFound')}
          description={t('admin.members.noMembersDesc')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4 w-14 text-center">{t('admin.members.colOrder')}</th>
                  <th className="py-3 px-4 w-16 text-center">{t('admin.members.colPhoto')}</th>
                  <th className="py-3 px-4">{t('admin.members.colName')}</th>
                  <th className="py-3 px-4">{t('admin.members.colDesignation')}</th>
                  <th className="py-3 px-4 w-28">{t('admin.members.colStatus')}</th>
                  <th className="py-3 px-4 text-center w-24">Reorder</th>
                  <th className="py-3 px-4 text-right">{t('admin.members.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {members.map((item, index) => {
                  const memberName = item.name || item.display_name || 'Member';
                  const memberRole = item.designation || item.role || 'Member';
                  const isActive = item.is_active ?? item.is_visible ?? true;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-bold text-stone-500 text-xs">
                        #{item.display_order ?? item.sort_order ?? index + 1}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-200 bg-stone-100 mx-auto flex items-center justify-center">
                          {item.photo_url ? (
                            <img
                              src={resolveMediaUrl(item.photo_url)}
                              alt={memberName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-xs text-orange-700 font-mono">
                              {getInitials(memberName)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{memberName}</div>
                        {item.bio ? (
                          <div className="text-[11px] text-stone-500 truncate max-w-xs">{item.bio}</div>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {memberRole}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className="cursor-pointer focus:outline-hidden"
                          title="Click to toggle public visibility"
                        >
                          {isActive ? (
                            <Badge variant="success">{t('admin.members.activeBadge')}</Badge>
                          ) : (
                            <Badge variant="neutral">{t('admin.members.inactiveBadge')}</Badge>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0 || actionLoading}
                            className="p-1 rounded hover:bg-stone-200 text-stone-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === members.length - 1 || actionLoading}
                            className="p-1 rounded hover:bg-stone-200 text-stone-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPhotoModal(item)}
                            className="text-xs"
                          >
                            📷 {t('admin.members.photo')}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(item)}
                            className="text-xs"
                          >
                            ✏️ {t('admin.members.edit')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeletingMember(item)}
                            className="text-xs"
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 1: Add Member
      =================================================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold text-stone-900">
              {t('admin.members.addModalTitle')}
            </h2>
            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  {t('admin.members.nameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('admin.members.namePlaceholder')}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    {t('admin.members.designationLabel')}
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    {COMMON_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                    <option value="Other">Custom Designation...</option>
                  </select>
                </div>

                {formData.designation === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Custom Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customDesignation}
                      onChange={(e) => setFormData({ ...formData, customDesignation: e.target.value })}
                      placeholder="e.g. Patron / Advisor"
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    {t('admin.members.orderLabel')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  {t('admin.members.bioLabel')}
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t('admin.members.bioPlaceholder')}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="add-is-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded border-stone-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="add-is-active" className="text-xs font-medium text-stone-800 cursor-pointer select-none">
                  {t('admin.members.activeLabel')}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsAddOpen(false)}
                  disabled={actionLoading}
                >
                  {t('admin.members.cancelBtn')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={actionLoading}
                  className="font-bold"
                >
                  {actionLoading ? 'Saving...' : t('admin.members.saveBtn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: Edit Member
      =================================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold text-stone-900">
              {t('admin.members.editModalTitle')}
            </h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  {t('admin.members.nameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('admin.members.namePlaceholder')}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    {t('admin.members.designationLabel')}
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    {COMMON_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                    <option value="Other">Custom Designation...</option>
                  </select>
                </div>

                {formData.designation === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Custom Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customDesignation}
                      onChange={(e) => setFormData({ ...formData, customDesignation: e.target.value })}
                      placeholder="e.g. Patron / Advisor"
                      className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    {t('admin.members.orderLabel')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  {t('admin.members.bioLabel')}
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t('admin.members.bioPlaceholder')}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded border-stone-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="edit-is-active" className="text-xs font-medium text-stone-800 cursor-pointer select-none">
                  {t('admin.members.activeLabel')}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setEditingMember(null)}
                  disabled={actionLoading}
                >
                  {t('admin.members.cancelBtn')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={actionLoading}
                  className="font-bold"
                >
                  {actionLoading ? 'Saving...' : t('admin.members.saveBtn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 3: Manage Member Photo
      =================================================================== */}
      {photoMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-center">
            <h2 className="text-xl font-bold text-stone-900">
              {t('admin.members.photoModalTitle')}
            </h2>
            <p className="text-xs text-stone-500">
              {photoMember.name || photoMember.display_name} ({photoMember.designation || photoMember.role})
            </p>

            {photoUploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl text-left">
                ⚠️ {photoUploadError}
              </div>
            )}

            {/* Photo Preview Container */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-100 shadow-md bg-stone-100 flex items-center justify-center relative">
                {photoMember.photo_url ? (
                  <img
                    src={resolveMediaUrl(photoMember.photo_url)}
                    alt={photoMember.name || photoMember.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-3xl text-orange-700 font-mono">
                    {getInitials(photoMember.name || photoMember.display_name || '')}
                  </span>
                )}
              </div>
              {photoMember.photo_file_size ? (
                <p className="text-[11px] font-mono text-stone-500 mt-2">
                  {Math.round(photoMember.photo_file_size / 1024)} KB ({photoMember.photo_width} × {photoMember.photo_height} px)
                </p>
              ) : null}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoFileChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={actionLoading}
                  className="flex-1 font-bold"
                >
                  {actionLoading
                    ? 'Uploading...'
                    : photoMember.photo_url
                    ? t('admin.members.replacePhotoBtn')
                    : t('admin.members.uploadPhotoBtn')}
                </Button>
                {photoMember.photo_url && (
                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    onClick={handleDeletePhoto}
                    disabled={actionLoading}
                  >
                    {t('admin.members.deletePhotoBtn')}
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhotoMember(null)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4: Delete Confirmation
      =================================================================== */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold">
              🗑️
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              {t('admin.members.deleteConfirmTitle')}
            </h2>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
              <p className="font-bold">{deletingMember.name || deletingMember.display_name}</p>
              <p className="text-stone-500">{deletingMember.designation || deletingMember.role}</p>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t('admin.members.deleteConfirmText')}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setDeletingMember(null)}
                disabled={actionLoading}
              >
                {t('admin.members.cancelBtn')}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="font-bold"
              >
                {actionLoading ? 'Deleting...' : t('admin.members.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
