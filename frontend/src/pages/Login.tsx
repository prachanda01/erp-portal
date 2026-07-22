import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Lock, Mail, User as UserIcon, Shield, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  initialRegister?: boolean;
}

export const Login: React.FC<LoginProps> = ({ initialRegister }) => {
  const location = useLocation();
  const isRegisterRoute = initialRegister || location.pathname === '/register';
  const [isRegisterMode, setIsRegisterMode] = useState(isRegisterRoute);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('SALES');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleToggleMode = (mode: boolean) => {
    setIsRegisterMode(mode);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('SALES');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        if (!fullName.trim()) {
          throw new Error('Full Name is required');
        }
        await register({ fullName, email, password, role });
        setSuccessMsg('Account created successfully! Redirecting...');
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header / Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 items-center justify-center shadow-lg mb-3 ring-4 ring-indigo-50">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nexus<span className="text-indigo-600 font-bold">ERP</span></h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Enterprise Operations & CRM Suite</p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isRegisterMode
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isRegisterMode
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field (Register mode only) */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isRegisterMode}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            </div>

            {/* Role Selection Dropdown (Register mode only) */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Select User Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  >
                    <option value="SALES">Sales Executive (CRM & Sales Orders)</option>
                    <option value="WAREHOUSE">Warehouse Lead (Inventory & Products)</option>
                    <option value="ACCOUNTS">Accounts Manager (Finance & Invoices)</option>
                    <option value="ADMIN">System Admin (Full Access & Controls)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Create Account & Sign In' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Helper Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            {isRegisterMode ? (
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode(false)}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Sign In here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
