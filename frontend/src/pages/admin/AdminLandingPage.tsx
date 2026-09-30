import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { usePageMeta } from '../../hooks/usePageMeta';

export const AdminLandingPage: React.FC = () => {
  usePageMeta({
    title: 'Admin Portal',
    description: 'Mahaveer Youth Club Banza administrative control portal.',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="warning">PHASE 1 PLACEHOLDER</Badge>
            <Badge variant="neutral">PORTAL</Badge>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Admin Control Portal</h1>
          <p className="text-sm text-stone-600">
            Administrative shell and route structure for Mahaveer Youth Club Banza.
          </p>
        </div>
      </div>

      <Card className="p-6 bg-amber-50/50 border-amber-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl" aria-hidden="true">🔒</span>
          <div>
            <h2 className="text-base font-bold text-amber-900">Authentication Deferred</h2>
            <p className="text-sm text-amber-800 mt-1">
              Admin authentication, 2FA/TOTP verification, and content management workflows will be implemented in a later phase.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-1">Admin Login</h3>
            <p className="text-xs text-stone-600 mb-4">
              Access point for administrative session management and authentication.
            </p>
          </div>
          <Link to="/admin/login">
            <Button variant="outline" size="sm" className="w-full">
              Go to Login Route →
            </Button>
          </Link>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-1">Admin Dashboard</h3>
            <p className="text-xs text-stone-600 mb-4">
              Control panel for future club content, gallery, updates, and activities.
            </p>
          </div>
          <Link to="/admin/dashboard">
            <Button variant="outline" size="sm" className="w-full">
              Go to Dashboard Route →
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
