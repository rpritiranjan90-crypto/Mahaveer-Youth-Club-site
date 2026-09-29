import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from './api';
import {
  Megaphone,
  Image,
  Calendar,
  History,
  ArrowRight,
  PlusCircle,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';

interface DashboardStats {
  counts: {
    total_updates: number;
    published_updates: number;
    total_gallery: number;
    published_gallery: number;
    total_activities: number;
    total_history: number;
  };
  recent_updates: Array<{
    id: number;
    title: string;
    category: string;
    published: boolean;
    created_at: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" color="saffron" />
        <p className="text-xs text-slate-500 font-medium">Fetching real-time portal statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-orange-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 4 Active Management System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Club Executive Control Center
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Manage live public announcements, Puja ritual schedules, devotee photo galleries, and
            transparent UPI donation credentials in one centralized dashboard.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Backend Connection Note</p>
            <p className="text-xs mt-0.5 text-amber-700">{error}</p>
          </div>
          <button
            onClick={fetchStats}
            className="text-xs font-bold underline hover:text-amber-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Updates Metric */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Notices & Updates
            </span>
            <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.counts.total_updates ?? 0}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {stats?.counts.published_updates ?? 0} Live
            </span>
          </div>
          <Link
            to="/admin/updates"
            className="mt-4 inline-flex items-center text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            <span>Manage Notices</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Gallery Metric */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Photo Gallery
            </span>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Image className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.counts.total_gallery ?? 0}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {stats?.counts.published_gallery ?? 0} Live
            </span>
          </div>
          <Link
            to="/admin/gallery"
            className="mt-4 inline-flex items-center text-xs font-semibold text-amber-600 hover:text-amber-700"
          >
            <span>Manage Photos</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Activities Metric */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Puja & Activities
            </span>
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.counts.total_activities ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">Rituals & Welfare</span>
          </div>
          <Link
            to="/admin/activities"
            className="mt-4 inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700"
          >
            <span>Manage Schedule</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* History Milestones Metric */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              History Milestones
            </span>
            <div className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.counts.total_history ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">1998 — Present</span>
          </div>
          <Link
            to="/admin/history"
            className="mt-4 inline-flex items-center text-xs font-semibold text-yellow-700 hover:text-yellow-800"
          >
            <span>Manage Milestones</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Quick Administrative Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/admin/updates?new=true"
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-orange-500/50 hover:bg-orange-50/50 transition-all group"
          >
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Publish Notice</p>
              <p className="text-[11px] text-slate-500">Post news or bulletin</p>
            </div>
          </Link>

          <Link
            to="/admin/gallery?upload=true"
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/50 transition-all group"
          >
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Upload Photos</p>
              <p className="text-[11px] text-slate-500">Add to photo gallery</p>
            </div>
          </Link>

          <Link
            to="/admin/activities?new=true"
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-red-500/50 hover:bg-red-50/50 transition-all group"
          >
            <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Add Activity</p>
              <p className="text-[11px] text-slate-500">Schedule Aarti or camp</p>
            </div>
          </Link>

          <Link
            to="/admin/donation"
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all group"
          >
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Donation Settings</p>
              <p className="text-[11px] text-slate-500">Update UPI QR & info</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Updates Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800">Recent Notices & Bulletins</h2>
          </div>
          <Link
            to="/admin/updates"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            View All
          </Link>
        </div>

        {stats?.recent_updates && stats.recent_updates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_updates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {item.published ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-700 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/updates?edit=${item.id}`}
                        className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No updates created yet. Click "Publish Notice" above to create your first bulletin.
          </div>
        )}
      </div>
    </div>
  );
};
