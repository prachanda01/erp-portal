import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell, Search, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SALES':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'WAREHOUSE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ACCOUNTS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 shadow-xs">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Challans, Customers, SKUs..."
            className="w-full bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>

        <div className="h-6 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100/80 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3 h-3 text-slate-400" />
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getRoleBadge(
                    user?.role
                  )}`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

