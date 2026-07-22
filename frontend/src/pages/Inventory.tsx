import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { StockMovement, Warehouse, Product } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ExportButton } from '../components/ui/ExportButton';
import { exportToCsv } from '../utils/exportCsv';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Building2,
  MapPin,
  Clock,
  User,
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const queryClient = useQueryClient();

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch Stock Movements
  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const res = await api.get('/inventory/movements');
      return res.data;
    },
  });

  // Fetch Warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await api.get('/inventory/warehouses');
      return res.data.data;
    },
  });

  // Fetch Products for dropdown
  const { data: productsData } = useQuery({
    queryKey: ['all-products-dropdown'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.data;
    },
  });

  const adjustMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/inventory/adjust', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsAdjustModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Stock adjustment failed');
    },
  });

  const resetForm = () => {
    setProductId('');
    setWarehouseId('');
    setQuantity(10);
    setReason('');
    setMovementType('IN');
    setFormError('');
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!productId) return setFormError('Please select a product');
    const targetWhId = warehouseId || (warehousesData && warehousesData[0]?.id);
    if (!targetWhId) return setFormError('Please select a warehouse');

    adjustMutation.mutate({
      productId,
      warehouseId: targetWhId,
      quantity: Number(quantity),
      movementType,
      reason,
    });
  };

  const movements: StockMovement[] = movementsData?.data || [];
  const warehouses: Warehouse[] = warehousesData || [];
  const products: Product[] = productsData || [];

  const handleExportCsv = () => {
    exportToCsv(
      'nexuserp_stock_movements_export',
      [
        { header: 'Type', accessor: 'movementType' },
        { header: 'Product Name', accessor: (row) => row.product?.name || 'N/A' },
        { header: 'SKU', accessor: (row) => row.product?.sku || 'N/A' },
        { header: 'Quantity', accessor: 'quantity' },
        { header: 'Reason', accessor: 'reason' },
        { header: 'Recorded By', accessor: (row) => row.createdBy?.fullName || 'User' },
        { header: 'Timestamp', accessor: (row) => new Date(row.createdAt).toLocaleString() },
      ],
      movements
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            Inventory & Stock Audit Movements
          </h1>
          <p className="text-xs text-slate-500 mt-1">Immutable stock movement log (IN/OUT dispatches) and warehouse management.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            onExport={handleExportCsv}
            disabled={movements.length === 0}
            totalRows={movements.length}
          />
          <button
            onClick={() => {
              resetForm();
              if (warehouses.length > 0) setWarehouseId(warehouses[0].id);
              if (products.length > 0) setProductId(products[0].id);
              setIsAdjustModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Stock Adjustment</span>
          </button>
        </div>
      </div>

      {/* Warehouses Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{wh.name}</h3>
              <p className="font-mono text-xs text-blue-700 font-semibold mt-0.5">{wh.code}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{wh.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Movements Log Table */}
      {movementsLoading ? (
        <LoadingSpinner message="Fetching audit movements..." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">Immutable Stock Audit Log</h3>
            <Badge variant="info">Audit Compliance Active</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 uppercase tracking-wider text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Product & SKU</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Adjustment Reason</th>
                  <th className="px-6 py-3.5">Recorded By</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      {m.movementType === 'IN' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          <ArrowUpRight className="w-3.5 h-3.5" /> OUT
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{m.product?.name}</p>
                      <span className="font-mono text-[11px] text-blue-700">{m.product?.sku}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {m.movementType === 'IN' ? '+' : '-'}{m.quantity} units
                    </td>
                    <td className="px-6 py-4 text-slate-700">{m.reason}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{m.createdBy?.fullName || 'User'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Stock Adjustment Entry"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Movement Direction *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMovementType('IN')}
                className={`py-2.5 rounded-lg font-semibold text-xs border flex items-center justify-center gap-2 transition-all ${
                  movementType === 'IN'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs font-bold'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>STOCK IN (Procurement / Return)</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('OUT')}
                className={`py-2.5 rounded-lg font-semibold text-xs border flex items-center justify-center gap-2 transition-all ${
                  movementType === 'OUT'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs font-bold'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>STOCK OUT (Dispatch / Issue)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Target Product *</label>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - Current Stock: {p.currentStock ?? 0}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Warehouse *</label>
            <select
              required
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Quantity *</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Reason / Voucher Notes *</label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Received shipment PO-8891 or Physical count correction..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjustMutation.isPending}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white shadow-xs"
            >
              Confirm Stock Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

