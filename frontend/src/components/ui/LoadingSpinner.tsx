import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-600">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <span className="mt-3 text-sm font-medium">{message}</span>
    </div>
  );
};

