import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-amber-700" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 mt-2 max-w-md">
        The route or resource you are looking for does not exist in the Operations Portal.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};

