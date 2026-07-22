import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  ShieldCheck,
  User,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers CRM', path: '/customers', icon: Users },
    { label: 'Products Catalog', path: '/products', icon: Package },
    { label: 'Inventory & Stock', path: '/inventory', icon: Boxes },
    { label: 'Sales Challans', path: '/challans', icon: FileText },
    ...(user?.role === 'ADMIN' || user?.role === 'ACCOUNTS'
      ? [{ label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck }]
      : []),
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 select-none text-slate-300 shadow-xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 gap-3 bg-slate-900/50 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md ring-1 ring-white/20">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-white tracking-tight leading-none text-lg flex items-center gap-1">
            Nexus<span className="text-indigo-400 font-bold">ERP</span>
          </h1>
          <p className="text-[10px] text-indigo-200/70 tracking-widest uppercase font-semibold mt-0.5">Operations Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Main Modules</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Footer Info */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
        <div className="bg-slate-800/50 rounded-xl p-3 text-xs border border-slate-700/50 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-200">NexusERP v2.4</p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
          </div>
          <p className="text-[11px] mt-1 text-slate-400">Enterprise Edition</p>
        </div>
      </div>
    </aside>
  );
};

