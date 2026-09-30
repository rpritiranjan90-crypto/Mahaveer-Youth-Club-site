import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../admin/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { usePageMeta } from '../../hooks/usePageMeta';
import { apiService } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  usePageMeta({
    title: 'Admin Dashboard — Mahaveer Youth Club Banza',
    description: 'Mahaveer Youth Club Banza administrative control panel and CMS overview.',
  });

  const { user, token } = useAuth();

  const [metrics, setMetrics] = useState({
    updatesCount: 0,
    activitiesCount: 0,
    galleryCount: 0,
    membersCount: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiService.getAdminUpdates(token, 1, 1),
      apiService.getAdminActivities(token, 1, 1),
      apiService.getAdminGallery(token, 1, 1),
      apiService.getAdminMembers(token, 1, 1),
    ])
      .then(([updates, activities, gallery, members]) => {
        setMetrics({
          updatesCount: updates.total,
          activitiesCount: activities.total,
          galleryCount: gallery.total,
          membersCount: members.total,
        });
      })
      .catch((err) => {
        console.warn('Could not fetch CMS metrics:', err);
      })
      .finally(() => {
        setLoadingMetrics(false);
      });
  }, [token]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="saffron">CONTROL PANEL</Badge>
            <Badge variant="success">CMS ACTIVE</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Signed in as <span className="font-semibold text-stone-900">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/security">
            <Button variant="outline" size="sm" className="font-bold">
              🛡️ Security & 2FA
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="sm">
              🌐 View Public Site
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. CMS Content Overview Metrics Grid */}
      <div>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
          Content & Asset Management Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Assets & Brand Card */}
          <Card className="p-5 bg-white border border-stone-200 hover:border-orange-300 hover:shadow-xs transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase">Logo & Ganesh</span>
              <span className="text-xl">🎨</span>
            </div>
            <div className="text-sm font-bold text-stone-900">
              Active Assets
            </div>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <Link to="/admin/assets" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                Manage Assets →
              </Link>
            </div>
          </Card>
          {/* Updates Card */}
          <Card className="p-5 bg-white border border-stone-200 hover:border-orange-300 hover:shadow-xs transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase">Updates & Circulars</span>
              <span className="text-xl">📢</span>
            </div>
            <div className="text-2xl font-black text-stone-900">
              {loadingMetrics ? '—' : metrics.updatesCount}
            </div>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <Link to="/admin/updates" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                Manage Circulars →
              </Link>
            </div>
          </Card>

          {/* Activities Card */}
          <Card className="p-5 bg-white border border-stone-200 hover:border-rose-300 hover:shadow-xs transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase">Activities & Seva</span>
              <span className="text-xl">🎯</span>
            </div>
            <div className="text-2xl font-black text-stone-900">
              {loadingMetrics ? '—' : metrics.activitiesCount}
            </div>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <Link to="/admin/activities" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                Manage Activities →
              </Link>
            </div>
          </Card>

          {/* Gallery Card */}
          <Card className="p-5 bg-white border border-stone-200 hover:border-amber-300 hover:shadow-xs transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase">Celebration Photos</span>
              <span className="text-xl">📷</span>
            </div>
            <div className="text-2xl font-black text-stone-900">
              {loadingMetrics ? '—' : metrics.galleryCount}
            </div>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <Link to="/admin/gallery" className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                Manage Gallery →
              </Link>
            </div>
          </Card>

          {/* Members Card */}
          <Card className="p-5 bg-white border border-stone-200 hover:border-emerald-300 hover:shadow-xs transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase">Member Nicknames</span>
              <span className="text-xl">👥</span>
            </div>
            <div className="text-2xl font-black text-stone-900">
              {loadingMetrics ? '—' : metrics.membersCount}
            </div>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <Link to="/admin/members" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Manage Roster →
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 2. Security and System Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 bg-white border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Admin Profile
            </span>
            <Badge variant="neutral">ID: {user?.id}</Badge>
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">{user?.email}</h3>
            <p className="text-xs text-stone-500 mt-0.5">Role: Super Administrator</p>
          </div>
          <div className="pt-2 text-[11px] text-stone-400 border-t border-stone-100">
            Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </div>
        </Card>

        {/* 2FA Status Card */}
        <Card className="p-6 bg-white border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Two-Factor Auth
            </span>
            <Badge variant={user?.totp_enabled ? 'success' : 'amber'}>
              {user?.totp_enabled ? 'ENABLED' : 'DISABLED'}
            </Badge>
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {user?.totp_enabled ? 'RFC 6238 TOTP Active' : '2FA Not Yet Configured'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.totp_enabled
                ? 'Your account is protected by authenticator app verification.'
                : 'Enable 2FA to secure your account with TOTP and recovery codes.'}
            </p>
          </div>
          <div className="pt-2">
            <Link to="/admin/security" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
              {user?.totp_enabled ? 'Manage 2FA Settings →' : 'Set Up 2FA Now →'}
            </Link>
          </div>
        </Card>

        {/* Audit Logs Shortcut Card */}
        <Card className="p-6 bg-white border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Security Logs
            </span>
            <span className="text-xl" aria-hidden="true">📜</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Audit Trail</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Review persistent security events, logins, and publishing changes.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
              View Audit Logs →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
