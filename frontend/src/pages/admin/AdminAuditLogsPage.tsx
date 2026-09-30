import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../admin/AuthContext';
import { apiService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageMeta } from '../../hooks/usePageMeta';

interface AuditLogEntry {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export const AdminAuditLogsPage: React.FC = () => {
  usePageMeta({
    title: 'Security Audit Logs',
    description: 'Review persistent security events and administrative actions.',
  });

  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (p: number) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAuditLogs(token, p, pageSize);
      setLogs(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch (err: any) {
      setError(err?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [token, pageSize]);

  useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('SUCCESS') || action.includes('ENABLED')) return 'success';
    if (action.includes('FAIL') || action.includes('DISABLED') || action.includes('REJECTED')) return 'error';
    if (action.includes('CHALLENGE') || action.includes('RATE_LIMITED')) return 'amber';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="saffron">AUDIT TRAIL</Badge>
            <Badge variant="neutral">RECORDS: {total}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Security Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Immutable chronicle of authentication attempts, 2FA events, and credential updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchLogs(page)}
            disabled={loading}
          >
            🔄 Refresh
          </Button>
          <Link to="/admin">
            <Button variant="outline" size="sm">
              ← Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Table */}
      {loading ? (
        <LoadingState message="Loading security audit records..." />
      ) : error ? (
        <ErrorState title="Audit Logs Unavailable" message={error} onRetry={() => fetchLogs(page)} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs recorded yet"
          description="Security and authentication events will appear here automatically."
        />
      ) : (
        <Card className="p-0 bg-white border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-sans text-stone-900 font-medium">
                      {log.user_email || '—'}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {log.ip_address || '—'}
                    </td>
                    <td className="py-3 px-4 text-stone-600 max-w-xs truncate font-sans text-[11px]">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-stone-200 flex items-center justify-between gap-4 text-xs text-stone-600">
            <div>
              Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span> ({total} total logs)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Next →
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
