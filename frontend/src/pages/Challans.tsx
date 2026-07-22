import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { SalesChallan, ChallanStatus } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { ExportButton } from '../components/ui/ExportButton';
import { exportToCsv } from '../utils/exportCsv';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Filter,
  CheckCircle2,
  XCircle,
  Building,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Challans: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['challans', search, statusFilter, page],
    queryFn: async () => {
      const res = await api.get('/challans', {
        params: { search, status: statusFilter, page, limit: 10 },
      });
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ChallanStatus }) => {
      const res = await api.patch(`/challans/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update challan status');
    },
  });

  const challans: SalesChallan[] = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleExportCsv = () => {
    exportToCsv(
      'nexuserp_challans_export',
      [
        { header: 'Challan Number', accessor: 'challanNumber' },
        { header: 'Customer Business', accessor: (row) => row.customer?.businessName || 'N/A' },
        { header: 'Contact Person', accessor: (row) => row.customer?.customerName || 'N/A' },
        { header: 'Total Quantity', accessor: 'totalQuantity' },
        { header: 'Grand Total (INR)', accessor: 'grandTotal' },
        { header: 'Status', accessor: 'status' },
        { header: 'Created Date', accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
      ],
      challans
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Sales Challans & Dispatch Slips
          </h1>
          <p className="text-xs text-slate-500 mt-1">Generate draft challans, confirm dispatches (auto stock deduct), or process cancellations.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            onExport={handleExportCsv}
            disabled={challans.length === 0}
            totalRows={challans.length}
          />
          <button
            onClick={() => navigate('/challans/create')}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Challan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Challan #, customer name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner message="Fetching sales challans..." />
      ) : challans.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-xs">
          <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="font-semibold text-slate-800">No Sales Challans found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 uppercase tracking-wider text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Challan Number</th>
                  <th className="px-6 py-3.5">Customer Account</th>
                  <th className="px-6 py-3.5">Total Qty</th>
                  <th className="px-6 py-3.5">Grand Total (₹)</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-700 text-sm">
                      {ch.challanNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{ch.customer?.businessName}</p>
                          <p className="text-[11px] text-slate-500">{ch.customer?.customerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {ch.totalQuantity} items
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      ₹{ch.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          ch.status === 'CONFIRMED'
                            ? 'success'
                            : ch.status === 'DRAFT'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {ch.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/challans/${ch.id}`)}
                          title="View Invoice / Printable Challan"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-700" />
                          <span>View</span>
                        </button>

                        {ch.status === 'DRAFT' && (
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({ id: ch.id, status: 'CONFIRMED' })
                            }
                            disabled={updateStatusMutation.isPending}
                            title="Confirm Challan & Deduct Stock"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium border border-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}

                        {ch.status !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              if (confirm(`Cancel Challan ${ch.challanNumber}? If confirmed, stock will be restored.`)) {
                                updateStatusMutation.mutate({ id: ch.id, status: 'CANCELLED' });
                              }
                            }}
                            disabled={updateStatusMutation.isPending}
                            title="Cancel Challan"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
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
              Page {meta.page} of {meta.totalPages} ({meta.total} Total Challans)
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

