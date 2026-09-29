import React, { useState, useEffect } from 'react';
import { adminApi } from './api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  History as HistoryIcon,
  RefreshCw,
  Info,
} from 'lucide-react';

interface HistoryItem {
  id: number;
  year: string;
  title: string;
  description: string;
  tag?: string;
  image_url?: string;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export const AdminHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    year: '',
    title: '',
    description: '',
    tag: '',
    image_url: '',
    sort_order: 1,
    published: true,
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<HistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch history milestones.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      year: new Date().getFullYear().toString(),
      title: '',
      description: '',
      tag: 'Milestone',
      image_url: '',
      sort_order: history.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: HistoryItem) => {
    setEditingItem(item);
    setFormData({
      year: item.year,
      title: item.title,
      description: item.description,
      tag: item.tag || '',
      image_url: item.image_url || '',
      sort_order: item.sort_order,
      published: item.published,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year.trim() || !formData.title.trim() || !formData.description.trim()) {
      setError('Year, title, and description are required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingItem) {
        await adminApi.updateHistoryItem(editingItem.id, formData);
        setSuccessMsg(`Milestone "${formData.year} - ${formData.title}" updated successfully.`);
      } else {
        await adminApi.createHistoryItem(formData);
        setSuccessMsg(`Milestone "${formData.year} - ${formData.title}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchHistory();
    } catch (err: any) {
      setError(err?.message || 'Failed to save milestone.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteHistoryItem(deleteTarget.id);
      setSuccessMsg('Milestone deleted.');
      setDeleteTarget(null);
      fetchHistory();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete milestone.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            History & Milestones Chronicle
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Document foundational years, eco-friendly milestones, social service programs, and awards.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistory}
            className="text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="bg-yellow-700 hover:bg-yellow-800 text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Milestone</span>
          </Button>
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 text-xs">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Content Verification Note:</strong> Initial records are development placeholders
          established for layout demonstration. Club executive members can modify or replace these
          records with verified historical archives.
        </p>
      </div>

      {successMsg && (
        <Alert variant="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Milestones List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" color="primary" />
            <p className="text-xs text-slate-500 font-medium">Loading history chronicle...</p>
          </div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Year</th>
                  <th className="px-5 py-3.5">Milestone Title & Summary</th>
                  <th className="px-5 py-3.5">Tag</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-400">
                      #{item.sort_order}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">{item.year}</td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {item.tag && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                          {item.tag}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {item.published ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Live</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-yellow-700 hover:bg-yellow-50 transition-colors"
                        title="Edit Milestone"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <HistoryIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No milestones found</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Add key historical milestones from 1998 onwards.
            </p>
            <Button size="sm" variant="primary" onClick={openCreateModal}>
              Add Milestone
            </Button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* Create / Edit Modal */}
      {/* ------------------------------------------------------------------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Milestone Record' : 'Add History Milestone'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Year & Tag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Year *
              </label>
              <input
                type="text"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="1998"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Badge / Tag
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="Founding Year, Social Welfare..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Milestone Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Club Foundation & First Neighborhood Puja"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Display Sequence Order
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Milestone Story & Details *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed background regarding how this milestone was achieved..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Published Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">Show in History Timeline</p>
              <p className="text-[11px] text-slate-500">
                Immediately displayed on public Our History page.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 rounded text-yellow-600 focus:ring-yellow-500 border-slate-300"
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
              isLoading={saving}
              className="bg-yellow-700 hover:bg-yellow-800 text-white font-bold"
            >
              {editingItem ? 'Save Changes' : 'Add Milestone'}
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
        title="Delete Milestone"
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
              Delete Milestone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
