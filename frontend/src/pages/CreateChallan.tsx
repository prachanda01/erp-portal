import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Customer, Product } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  Building,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export const CreateChallan: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { productId: '', quantity: 1, unitPrice: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch Customers
  const { data: customersData } = useQuery({
    queryKey: ['all-customers-select'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    },
  });

  // Fetch Products
  const { data: productsData } = useQuery({
    queryKey: ['all-products-select'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/challans', payload);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      navigate(`/challans/${res.data.id}`);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create Sales Challan');
    },
  });

  const customers: Customer[] = customersData || [];
  const products: Product[] = productsData || [];

  const handleProductChange = (index: number, pId: string) => {
    const prod = products.find((p) => p.id === pId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: pId,
      unitPrice: prod ? prod.unitPrice : 0,
    };
    setItems(newItems);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, qty);
    setItems(newItems);
  };

  const handleUnitPriceChange = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].unitPrice = Math.max(0, price);
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!customerId) return setFormError('Please select a customer');

    for (const item of items) {
      if (!item.productId) return setFormError('Please select a product for all line items');
    }

    createMutation.mutate({
      customerId,
      items,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/challans')}
          className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Create Sales Challan Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">Select customer account and add product items with snapshot pricing.</p>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selector */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Customer Account Selection
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Wholesale / Retail Buyer *</label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 font-medium"
            >
              <option value="">-- Select Customer Account --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.customerName}) - GST: {c.gstNumber || 'N/A'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Challan Line Items</h3>
            <button
              type="button"
              onClick={addItemRow}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-blue-700 font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const selectedProd = products.find((p) => p.id === item.productId);
              const currentStock = selectedProd ? selectedProd.currentStock ?? 0 : 0;
              const hasStockDeficit = item.quantity > currentStock;

              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Product *</label>
                    <select
                      required
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - Avail: {p.currentStock ?? 0}
                        </option>
                      ))}
                    </select>
                    {selectedProd && (
                      <p className={`text-[10px] mt-1 font-medium ${hasStockDeficit ? 'text-rose-600' : 'text-slate-500'}`}>
                        Available Stock: {currentStock} units {hasStockDeficit && '(Exceeds stock level)'}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Qty *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleQtyChange(idx, parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Unit Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleUnitPriceChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Total (₹)</label>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-blue-700">
                      ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="md:col-span-1 text-right pt-4 md:pt-0">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={items.length <= 1}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand Total Footer Card */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              <span>Total Quantity: <strong className="text-slate-900">{totalQuantity} units</strong> across {items.length} line items.</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Grand Total Amount</span>
              <h2 className="text-2xl font-bold text-emerald-700">
                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
        </div>

        {/* Dispatch Notes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Dispatch / Transport Notes (Optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="LR / Vehicle number, driver details, or special instructions..."
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/challans')}
            className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white shadow-xs"
          >
            Generate Draft Sales Challan
          </button>
        </div>
      </form>
    </div>
  );
};

