import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { AuditLog } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { ExportButton } from '../components/ui/ExportButton';
import { exportToCsv } from '../utils/exportCsv';
import { ShieldCheck, User, Clock, Monitor } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const res = await api.get('/audit-logs', { params: { page, limit: 15 } });
      return res.data;
    },
  });

  const logs: AuditLog[] = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleExportCsv = () => {
    exportToCsv(
      'nexuserp_audit_logs_export',
      [
        { header: 'Action', accessor: 'action' },
        { header: 'Entity', accessor: 'entity' },
        { header: 'User', accessor: (row) => row.user?.fullName || 'System' },
        { header: 'Role', accessor: (row) => row.user?.role || 'SYSTEM' },
        { header: 'Details', accessor: (row) => row.details || 'N/A' },
        { header: 'IP Address', accessor: (row) => row.ipAddress || '127.0.0.1' },
        { header: 'Timestamp', accessor: (row) => new Date(row.createdAt).toLocaleString() },
      ],
      logs
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            System Audit & Security Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">Immutable trace of user sign-ins, customer edits, stock adjustments, and challan status changes.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            onExport={handleExportCsv}
            disabled={logs.length === 0}
            totalRows={logs.length}
          />
          <Badge variant="purple">Restricted Access (Admin / Accounts)</Badge>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner message="Fetching system audit logs..." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 uppercase tracking-wider text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5">IP Address</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{log.entity}</td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.user.fullName} ({log.user.role})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Auto</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 max-w-xs truncate" title={log.details || ''}>
                      {log.details || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      <div className="flex items-center gap-1">
                        <Monitor className="w-3 h-3 text-slate-400" />
                        <span>{log.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} Total Audit Records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium shadow-2xs"
              >
                Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

