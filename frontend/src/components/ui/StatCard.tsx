import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'sky',
}) => {
  const colorMap = {
    sky: 'text-blue-700 bg-blue-50 border-blue-200',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-800 bg-amber-50 border-amber-200',
    purple: 'text-purple-700 bg-purple-50 border-purple-200',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span
            className={`font-semibold px-2 py-0.5 rounded-md border ${
              trend.isPositive
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-rose-700 bg-rose-50 border-rose-200'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="ml-2 text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
};

