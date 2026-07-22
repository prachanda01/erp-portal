import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { SalesChallan } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: challan, isLoading, error } = useQuery<SalesChallan>({
    queryKey: ['challan-detail', id],
    queryFn: async () => {
      const res = await api.get(`/challans/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: 'CONFIRMED' | 'CANCELLED') => {
      const res = await api.patch(`/challans/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challan-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Status update failed');
    },
  });

  if (isLoading) return <LoadingSpinner message="Generating printable invoice..." />;

  if (error || !challan) {
    return (
      <div className="p-8 text-center text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
        Sales Challan not found.
      </div>
    );
  }

  // Parse Snapshots
  let customerDetails: any = {};
  try {
    customerDetails = JSON.parse(challan.customerSnapshot);
  } catch (e) {
    customerDetails = challan.customer || {};
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Action Bar (Hidden during printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/challans')}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                {challan.challanNumber}
              </h1>
              <Badge
                variant={
                  challan.status === 'CONFIRMED'
                    ? 'success'
                    : challan.status === 'DRAFT'
                    ? 'warning'
                    : 'danger'
                }
              >
                {challan.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">Generated on {new Date(challan.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Invoice / Export PDF</span>
          </button>

          {challan.status === 'DRAFT' && (
            <button
              onClick={() => updateStatusMutation.mutate('CONFIRMED')}
              disabled={updateStatusMutation.isPending}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Deduct Stock</span>
            </button>
          )}

          {challan.status !== 'CANCELLED' && (
            <button
              onClick={() => {
                if (confirm('Cancel this challan? Stock will be restored if previously confirmed.')) {
                  updateStatusMutation.mutate('CANCELLED');
                }
              }}
              disabled={updateStatusMutation.isPending}
              className="px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium text-xs transition-all flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Challan</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Invoice Document */}
      <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 font-sans">
        {/* Invoice Top Header */}
        <div className="flex items-start justify-between border-b border-slate-200 print:border-slate-300 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white text-base">
                N
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">NexERP Wholesale Logistics</h2>
                <p className="text-xs text-slate-500">Central Industrial Distribution Hub</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              SALES DISPATCH CHALLAN
            </span>
            <h3 className="text-xl font-bold font-mono text-slate-900 mt-0.5">{challan.challanNumber}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Date: {new Date(challan.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-2 gap-8 my-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Billed & Dispatched To:
            </span>
            <h4 className="font-bold text-base mt-1 text-slate-900">{customerDetails.businessName}</h4>
            <p className="text-xs text-slate-700 mt-1">Attn: {customerDetails.customerName}</p>
            <p className="text-xs text-slate-600 mt-1">{customerDetails.address}</p>
            <p className="text-xs text-slate-600 mt-1">
              Contact: {customerDetails.mobile} | {customerDetails.email}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Tax & Order References:
            </span>
            <p className="text-xs mt-2">
              <span className="text-slate-500">GSTIN:</span>{' '}
              <strong className="font-mono text-slate-900">{customerDetails.gstNumber || 'URP (Unregistered)'}</strong>
            </p>
            <p className="text-xs mt-1">
              <span className="text-slate-500">Status:</span>{' '}
              <strong className="uppercase font-semibold text-blue-700">{challan.status}</strong>
            </p>
            <p className="text-xs mt-1">
              <span className="text-slate-500">Issued By:</span>{' '}
              <strong className="text-slate-900">{challan.createdBy?.fullName || 'Sales Department'}</strong>
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Product Description & SKU</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-right">Unit Price (₹)</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {challan.items.map((item, index) => {
                let pSnap: any = {};
                try {
                  pSnap = JSON.parse(item.productSnapshot);
                } catch (e) {
                  pSnap = item.product || {};
                }

                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-mono text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{pSnap.name}</p>
                      <span className="font-mono text-[10px] text-blue-700">{pSnap.sku}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{item.quantity} units</td>
                    <td className="px-4 py-3 text-right text-slate-800">
                      ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">
                      ₹{item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200">
          <div className="max-w-md text-xs text-slate-500">
            {challan.notes && (
              <p className="mb-3">
                <strong className="text-slate-800">Transport Notes:</strong> {challan.notes}
              </p>
            )}
            <p className="text-[11px] italic">
              * Goods once dispatched cannot be returned without authorized RMA. Received in good order & condition.
            </p>
          </div>

          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 sm:mt-0 text-right space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Total Quantity:</span>
              <span className="font-bold text-slate-900">{challan.totalQuantity} units</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Grand Total:</span>
              <span className="text-emerald-700 text-lg">
                ₹{challan.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Block */}
        <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-200 text-xs">
          <div className="text-center">
            <div className="h-12 border-b border-dashed border-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Receiver's Stamp & Signature</p>
          </div>
          <div className="text-center">
            <div className="h-12 border-b border-dashed border-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Authorized Signatory (NexERP)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

