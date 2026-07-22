import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Clock,
  Plus,
  Calendar,
  User,
} from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [formError, setFormError] = useState('');

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer-detail', id],
    queryFn: async () => {
      const res = await api.get(`/customers/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const addFollowupMutation = useMutation({
    mutationFn: async (payload: { notes: string; nextFollowupDate?: string }) => {
      const res = await api.post(`/customers/${id}/followups`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-detail', id] });
      setIsFollowupModalOpen(false);
      setNotes('');
      setNextFollowupDate('');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to add follow-up');
    },
  });

  if (isLoading) return <LoadingSpinner message="Fetching customer history & timeline..." />;
  if (error || !customer) {
    return (
      <div className="p-8 text-center text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
        Customer record not found.
      </div>
    );
  }

  const handleFollowupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    addFollowupMutation.mutate({
      notes,
      nextFollowupDate: nextFollowupDate || undefined,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{customer.businessName}</h1>
            <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'danger'}>
              {customer.status}
            </Badge>
            <Badge variant="info">{customer.customerType}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Contact: {customer.customerName}</p>
        </div>
      </div>

      {/* Grid: Left Column Overview, Right Column Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3">
            Account Profile & GST
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-[10px]">
                GST Identification Number
              </span>
              <span className="font-mono text-slate-900 text-sm font-semibold">
                {customer.gstNumber || 'Not Registered'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-[10px]">
                Email & Phone
              </span>
              <div className="mt-1 space-y-1 text-slate-700">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-600" /> {customer.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-600" /> {customer.mobile}</div>
              </div>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-[10px]">
                Registered Address
              </span>
              <p className="text-slate-700 leading-relaxed mt-1">{customer.address}</p>
            </div>

            {customer.notes && (
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-semibold block text-[10px]">
                  Internal CRM Notes
                </span>
                <p className="text-slate-600 italic mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  "{customer.notes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CRM Timeline & Sales History */}
        <div className="lg:col-span-2 space-y-6">
          {/* CRM Follow-ups Timeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">CRM Follow-Up Timeline</h3>
              </div>
              <button
                onClick={() => setIsFollowupModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Follow-Up Note</span>
              </button>
            </div>

            {customer.followups && customer.followups.length > 0 ? (
              <div className="space-y-3">
                {customer.followups.map((f: any) => (
                  <div key={f.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{f.createdBy?.fullName || 'Sales Executive'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(f.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700">{f.notes}</p>
                    {f.nextFollowupDate && (
                      <div className="mt-2 text-[11px] text-amber-800 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-700" />
                        <span>Scheduled Next Follow-Up: {new Date(f.nextFollowupDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No CRM follow-up notes logged yet.</p>
            )}
          </div>

          {/* Sales Challans History */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-slate-900 text-sm">Sales Challans History</h3>
              </div>
            </div>

            {customer.challans && customer.challans.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {customer.challans.map((ch: any) => (
                  <div
                    key={ch.id}
                    onClick={() => navigate(`/challans/${ch.id}`)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-700">{ch.challanNumber}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {new Date(ch.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{ch.grandTotal.toLocaleString()}</p>
                      <Badge
                        variant={
                          ch.status === 'CONFIRMED'
                            ? 'success'
                            : ch.status === 'DRAFT'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {ch.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No sales challans recorded for this customer.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Followup Modal */}
      <Modal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        title="Add CRM Follow-up Note"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleFollowupSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Discussion Summary / Interaction Notes *
            </label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record details of call, meeting, or email discussion..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Scheduled Follow-up Date (Optional)
            </label>
            <input
              type="date"
              value={nextFollowupDate}
              onChange={(e) => setNextFollowupDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFollowupModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addFollowupMutation.isPending}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white shadow-xs"
            >
              Save Follow-up Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

