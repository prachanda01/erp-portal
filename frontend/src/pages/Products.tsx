import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Product } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ExportButton } from '../components/ui/ExportButton';
import { exportToCsv } from '../utils/exportCsv';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Tag,
} from 'lucide-react';

export const Products: React.FC = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    tag: '',
    unitPrice: 0,
    minStock: 10,
    initialStock: 50,
    imageUrl: '',
  });
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, lowStockOnly],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { search, lowStock: lowStockOnly },
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/products', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.put(`/products/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'Electronics',
      tag: '',
      unitPrice: 0,
      minStock: 10,
      initialStock: 50,
      imageUrl: '',
    });
    setFormError('');
  };

  const openEditModal = (p: Product) => {
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      tag: p.tag || '',
      unitPrice: p.unitPrice,
      minStock: p.minStock,
      initialStock: p.currentStock || 0,
      imageUrl: p.imageUrl || '',
    });
    setFormError('');
    setEditingProduct(p);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        payload: {
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          tag: formData.tag || null,
          unitPrice: Number(formData.unitPrice),
          minStock: Number(formData.minStock),
          imageUrl: formData.imageUrl || null,
        },
      });
    } else {
      createMutation.mutate({
        ...formData,
        tag: formData.tag || null,
        unitPrice: Number(formData.unitPrice),
        minStock: Number(formData.minStock),
        initialStock: Number(formData.initialStock),
      });
    }
  };

  const products: Product[] = data?.data || [];

  const handleExportCsv = () => {
    exportToCsv(
      'nexuserp_products_export',
      [
        { header: 'Product Name', accessor: 'name' },
        { header: 'SKU', accessor: 'sku' },
        { header: 'Category', accessor: 'category' },
        { header: 'Tag', accessor: (row) => row.tag || 'N/A' },
        { header: 'Unit Price (INR)', accessor: 'unitPrice' },
        { header: 'Current Stock', accessor: (row) => row.currentStock ?? 0 },
        { header: 'Min Stock Threshold', accessor: 'minStock' },
        { header: 'Status', accessor: (row) => (row.isLowStock ? 'Low Stock' : 'In Stock') },
      ],
      products
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Product Master & Stock Levels
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage wholesale products, unit pricing, SKUs, tags, and min stock triggers.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            onExport={handleExportCsv}
            disabled={products.length === 0}
            totalRows={products.length}
          />
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
              lowStockOnly
                ? 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock Filter Only</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      {isLoading ? (
        <LoadingSpinner message="Fetching product catalog..." />
      ) : products.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-xs">
          <Package className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="font-semibold text-slate-800">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 uppercase tracking-wider text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Product Details</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Unit Price</th>
                  <th className="px-6 py-3.5">Current Stock</th>
                  <th className="px-6 py-3.5">Stock Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLow = p.isLowStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                              {p.tag && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Tag className="w-2.5 h-2.5" />
                                  {p.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">Min Stock Limit: {p.minStock} units</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-indigo-700">{p.sku}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-slate-900">{p.currentStock ?? 0} units</div>
                      </td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <Badge variant="danger">Low Stock ({p.currentStock})</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete product ${p.name}?`)) {
                                deleteMutation.mutate(p.id);
                              }
                            }}
                            title="Delete Product"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || !!editingProduct}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product Specification' : 'Add New Product to Catalog'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Industrial Control Valve"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU (Stock Keeping Unit) *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="PRD-VAL-001"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Electronics, Hardware..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tag / Highlight</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g. Bestseller, Essential"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Wholesale Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Stock Alert Threshold *</label>
              <input
                type="number"
                required
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            {!editingProduct && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Opening Stock Qty</label>
                <input
                  type="number"
                  value={formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, initialStock: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Image URL (Optional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingProduct(null);
              }}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white shadow-xs"
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

