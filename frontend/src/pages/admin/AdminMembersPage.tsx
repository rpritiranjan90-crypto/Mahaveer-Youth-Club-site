import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../admin/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageMeta } from '../../hooks/usePageMeta';
import { apiService } from '../../services/api';
import { MemberItem } from '../../types';

export const AdminMembersPage: React.FC = () => {
  usePageMeta({
    title: 'Manage Member Roster — Admin Panel',
    description: 'Manage public nicknames and display ordering for Mahaveer Youth Club Banza volunteers.',
  });

  const { token } = useAuth();

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [deletingMember, setDeletingMember] = useState<MemberItem | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Form
  const [formData, setFormData] = useState({
    display_name: '',
    role: 'Club Youth Member',
    sort_order: 0,
    is_visible: true,
  });

  const fetchMembers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAdminMembers(token, 1, 200);
      setMembers(data.items);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch member roster.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openAddModal = () => {
    const nextSortOrder = members.length > 0 ? Math.max(...members.map((m) => m.sort_order)) + 1 : 1;
    setFormData({
      display_name: '',
      role: 'Club Youth Member',
      sort_order: nextSortOrder,
      is_visible: true,
    });
    setIsAddOpen(true);
  };

  const openEditModal = (item: MemberItem) => {
    setEditingMember(item);
    setFormData({
      display_name: item.display_name,
      role: item.role || 'Club Youth Member',
      sort_order: item.sort_order,
      is_visible: item.is_visible !== undefined ? item.is_visible : true,
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      await apiService.createAdminMember(token, {
        display_name: formData.display_name,
        role: formData.role,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible,
      });
      setIsAddOpen(false);
      setSuccessMessage('Member nickname added to roster.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchMembers();
    } catch (err: any) {
      setError(err?.message || 'Failed to add member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingMember) return;
    setActionLoading(true);
    setError(null);
    try {
      await apiService.updateAdminMember(token, editingMember.id, {
        display_name: formData.display_name,
        role: formData.role,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible,
      });
      setEditingMember(null);
      setSuccessMessage('Member details updated.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchMembers();
    } catch (err: any) {
      setError(err?.message || 'Failed to update member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVisibility = async (item: MemberItem) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await apiService.updateAdminMember(token, item.id, {
        is_visible: !item.is_visible,
      });
      setSuccessMessage(
        `${item.display_name} is now ${!item.is_visible ? 'visible on public roster' : 'hidden from public roster'}.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchMembers();
    } catch (err: any) {
      setError(err?.message || 'Failed to toggle visibility.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!token) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const newMembers = [...members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;

    // Update sort_order values sequentially
    const reorderPayload = newMembers.map((m, idx) => ({
      id: m.id,
      sort_order: idx + 1,
    }));

    setActionLoading(true);
    try {
      await apiService.reorderMembers(token, reorderPayload);
      setSuccessMessage('Member order updated.');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchMembers();
    } catch (err: any) {
      setError(err?.message || 'Failed to reorder members.');
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
      setSuccessMessage('Member removed from roster.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchMembers();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete member.');
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
            <Badge variant="neutral">{members.length} MEMBERS</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Member Roster & Nicknames
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Maintain approved public volunteer nicknames and committee designations.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openAddModal} className="shrink-0 font-bold shadow-xs">
          + Add Member
        </Button>
      </div>

      {/* Privacy Notice Banner */}
      <Card className="p-4 bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <span className="text-lg shrink-0">🔒</span>
        <div className="space-y-1">
          <p className="font-bold">Strict Privacy Protection Policy</p>
          <p className="text-amber-800 leading-relaxed">
            Only approved public nicknames and titles are stored. No personal phone numbers, emails, addresses, dates of birth, or sensitive records are ever collected or exposed.
          </p>
        </div>
      </Card>

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

      {/* Members Table */}
      {loading ? (
        <LoadingState message="Loading membership roster..." />
      ) : members.length === 0 ? (
        <EmptyState
          title="No members registered in roster yet."
          description="Click the Add Member button above to enter approved public volunteer nicknames."
        />
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Order</th>
                  <th className="py-3 px-4">Public Nickname</th>
                  <th className="py-3 px-4">Role / Title</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-center w-24">Reorder</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {members.map((item, index) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-500 text-xs">
                      #{item.sort_order}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{item.display_name}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-medium">
                      {item.role || 'Club Youth Member'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(item)}
                        className="cursor-pointer focus:outline-hidden"
                        title="Click to toggle public visibility"
                      >
                        {item.is_visible ? (
                          <Badge variant="success">VISIBLE</Badge>
                        ) : (
                          <Badge variant="neutral">HIDDEN</Badge>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0 || actionLoading}
                          onClick={() => handleMove(index, 'up')}
                          className="p-1 text-xs rounded hover:bg-stone-200 disabled:opacity-30"
                          title="Move Up"
                        >
                          ⬆️
                        </button>
                        <button
                          type="button"
                          disabled={index === members.length - 1 || actionLoading}
                          onClick={() => handleMove(index, 'down')}
                          className="p-1 text-xs rounded hover:bg-stone-200 disabled:opacity-30"
                          title="Move Down"
                        >
                          ⬇️
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="text-xs px-2.5 py-1"
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingMember(item)}
                          className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1"
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
        </div>
      )}

      {/* ADD / EDIT MEMBER MODAL */}
      {(isAddOpen || editingMember) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-lg font-bold text-stone-900">
                {isAddOpen ? 'Add Member Nickname' : `Edit: ${editingMember?.display_name}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingMember(null);
                }}
                className="text-stone-400 hover:text-stone-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Public Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh K. / Pintu"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Role / Committee Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Committee Member / Volunteer"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Sort Order *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Public Visibility
                  </label>
                  <select
                    value={formData.is_visible ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingMember(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="font-bold">
                  {actionLoading ? 'Saving...' : isAddOpen ? 'Add Member' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-stone-900">Confirm Member Removal</h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-stone-900">"{deletingMember.display_name}"</strong> from the roster? This action is recorded in audit logs.
            </p>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setDeletingMember(null)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 font-bold"
              >
                {actionLoading ? 'Removing...' : 'Remove Member'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
