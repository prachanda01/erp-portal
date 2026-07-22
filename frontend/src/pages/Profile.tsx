import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Shield, CheckCircle, Lock } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  const roleCapabilities: Record<string, string[]> = {
    ADMIN: [
      'Full System Access & Configuration',
      'User Registration & Role Assignment',
      'Delete Customers & Products',
      'Manual Stock Adjustment & Movement Audits',
      'Sales Challans Draft, Confirm & Cancellation',
      'View Full Security Audit Logs',
    ],
    SALES: [
      'Create & Update Customer CRM Profiles',
      'Add CRM Follow-up Notes & Reminders',
      'Create Draft & Confirmed Sales Challans',
      'View Product Catalog & Stock Status',
    ],
    WAREHOUSE: [
      'Perform Manual Stock Adjustments (IN / OUT)',
      'Manage Product SKU Master & Min Stock Thresholds',
      'Confirm Sales Challans for Dispatch',
      'View Stock Movement History',
    ],
    ACCOUNTS: [
      'View Sales Challans & Grand Total Financial Reports',
      'Access Security & Action Audit Logs',
      'View Customer Directory & GST Details',
      'Export Invoices & Reports',
    ],
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-md">
          {user?.fullName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{user?.fullName}</h1>
            <Badge variant="purple">{user?.role} ROLE</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Account Active & Authenticated via JWT</span>
          </div>
        </div>
      </div>

      {/* Role Access Matrix */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Role Capabilities & Permissions ({user?.role})
        </h3>

        <p className="text-xs text-slate-500">
          Your current session holds <strong className="text-slate-900">{user?.role}</strong> role permissions within the clean architecture RBAC authorization system.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {(roleCapabilities[user?.role || 'SALES'] || []).map((cap, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs text-slate-800">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Credentials info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-700" />
          Session Security
        </h3>
        <div className="space-y-2 text-xs text-slate-600">
          <p>• Access tokens are signed with HMAC-SHA256 and expire in 15 minutes.</p>
          <p>• Automatic silent refresh via HTTP interceptor using 7-day secure refresh tokens.</p>
          <p>• Password storage secured with bcrypt hashing (10 rounds).</p>
        </div>
      </div>
    </div>
  );
};

