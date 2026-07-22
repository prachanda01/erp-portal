import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Customer, CustomerType } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ExportButton } from '../components/ui/ExportButton';
import { exportToCsv } from '../utils/exportCsv';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Building,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Customers: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    businessName: '',
    email: '',
    mobile: '',
    gstNumber: '',
    customerType: 'WHOLESALE' as CustomerType,
    address: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  // Fetch Customers Query
  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, customerType, page],
    queryFn: async () => {
      const res = await api.get('/customers', {
        params: { search, customerType, page, limit: 10 },
      });
      return res.data;
    },
  });

  // Create / Update Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/customers', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to save customer');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.put(`/customers/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingCustomer(null);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to update customer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const resetForm = () => {
    setFormData({
      customerName: '',
      businessName: '',
      email: '',
      mobile: '',
      gstNumber: '',
      customerType: 'WHOLESALE',
      address: '',
      notes: '',
    });
    setFormError('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setFormData({
      customerName: cust.customerName,
      businessName: cust.businessName,
      email: cust.email,
      mobile: cust.mobile,
      gstNumber: cust.gstNumber || '',
      customerType: cust.customerType,
      address: cust.address,
      notes: cust.notes || '',
    });
    setFormError('');
    setEditingCustomer(cust);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const customers: Customer[] = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleExportCsv = () => {
    exportToCsv(
      'nexuserp_customers_export',
      [
        { header: 'Business Name', accessor: 'businessName' },
        { header: 'Contact Person', accessor: 'customerName' },
        { header: 'Email', accessor: 'email' },
        { header: 'Mobile', accessor: 'mobile' },
        { header: 'GST Number', accessor: (row) => row.gstNumber || 'N/A' },
        { header: 'Customer Type', accessor: 'customerType' },
        { header: 'Status', accessor: 'status' },
        { header: 'Address', accessor: 'address' },
      ],
      customers
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Customer CRM & Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage wholesale buyers, retail outlets, and customer follow-up notes.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            onExport={handleExportCsv}
            disabled={customers.length === 0}
            totalRows={customers.length}
          />
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, business, GST, email..."
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
            value={customerType}
            onChange={(e) => {
              setCustomerType(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="">All Customer Types</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
            <option value="RETAIL">Retail</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading customer directory..." />
      ) : customers.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-xs">
          <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="font-semibold text-slate-800">No customers found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new customer.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 uppercase tracking-wider text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Business & Contact</th>
                  <th className="px-6 py-3.5">GST Number</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Next Follow-up</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{cust.businessName}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{cust.customerName}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {cust.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {cust.mobile}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      {cust.gstNumber || <span className="text-slate-400 font-sans">N/A</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          cust.customerType === 'WHOLESALE'
                            ? 'info'
                            : cust.customerType === 'DISTRIBUTOR'
                            ? 'purple'
                            : 'default'
                        }
                      >
                        {cust.customerType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {cust.followupDate ? (
                        <div className="flex items-center gap-1.5 text-amber-700">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(cust.followupDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">No date set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={cust.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {cust.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/customers/${cust.id}`)}
                          title="View Timeline & CRM Details"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(cust)}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${cust.businessName}?`)) {
                              deleteMutation.mutate(cust.id);
                            }
                          }}
                          title="Delete Customer"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              Showing Page {meta.page} of {meta.totalPages} ({meta.total} Total Customers)
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || !!editingCustomer}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer Information' : 'Add New Wholesale / Retail Customer'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Apex Electronics Ltd"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. Rajesh Sharma"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone *</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GST Number</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="27AAACA1234A1Z5"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 uppercase focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Category</label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="RETAIL">Retail</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Billing & Shipping Address *</label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full industrial address..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingCustomer(null);
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
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

