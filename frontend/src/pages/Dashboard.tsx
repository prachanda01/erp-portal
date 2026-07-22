import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { StatCard } from '../components/ui/StatCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import {
  Users,
  Boxes,
  FileText,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner message="Fetching executive metrics..." />;

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
        Failed to load dashboard data. Please make sure the backend server is running.
      </div>
    );
  }

  const { metrics, charts, recentActivities } = data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="font-bold text-indigo-700">NexusERP Operations Suite</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time overview of Sales Challans, CRM directory, and Warehouse Inventory valuation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center gap-2 shadow-2xs"
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Manage Customers</span>
          </button>
          <button
            onClick={() => navigate('/challans/create')}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sales Challan</span>
          </button>
        </div>
      </div>


      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(metrics.totalInventoryValue)}
          subtitle={`${metrics.totalProducts} Products across Warehouses`}
          icon={Boxes}
          color="sky"
          trend={{ value: '12.4%', isPositive: true }}
        />
        <StatCard
          title="Monthly Confirmed Sales"
          value={formatCurrency(metrics.monthlySalesValue)}
          subtitle={`${metrics.monthlySalesCount} Orders fulfilled`}
          icon={TrendingUp}
          color="emerald"
          trend={{ value: '18.2%', isPositive: true }}
        />
        <StatCard
          title="Total Active Customers"
          value={metrics.activeCustomers}
          subtitle={`Out of ${metrics.totalCustomers} total accounts`}
          icon={Users}
          color="purple"
          trend={{ value: '5 new', isPositive: true }}
        />
        <StatCard
          title="Low Stock Alerts"
          value={metrics.lowStockCount}
          subtitle="Items at or below minimum threshold"
          icon={AlertTriangle}
          color={metrics.lowStockCount > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Sales Performance</h3>
              <p className="text-xs text-slate-500">Total revenue generated per month (₹)</p>
            </div>
            <Badge variant="info">2026 Revenue</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlySales}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Sales Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Customer Account Growth</h3>
              <p className="text-xs text-slate-500">New onboarded wholesale clients</p>
            </div>
            <Badge variant="purple">CRM Leads</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Stats & Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sales Challan Activity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Today's Challans Summary</h3>
                  <p className="text-xs text-slate-500">Sales dispatches generated today</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/challans')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Today's Total Count</span>
                <h4 className="text-2xl font-bold text-slate-900 mt-1">{metrics.todaysChallanCount} <span className="text-xs text-slate-500 font-normal">challans</span></h4>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Today's Gross Value</span>
                <h4 className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(metrics.todaysChallanValue)}</h4>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Stock automatically updates upon Challan confirmation.</span>
            <Badge variant="success">Auto Sync Active</Badge>
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Audit & Activity Log</h3>
                <p className="text-xs text-slate-500">System actions executed across modules</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4 max-h-64 overflow-y-auto pr-1">
            {recentActivities?.slice(0, 5).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 text-xs p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{log.action} ({log.entity})</span>
                    <span className="text-[10px] text-slate-400 font-normal">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

