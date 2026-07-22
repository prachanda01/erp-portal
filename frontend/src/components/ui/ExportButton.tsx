import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
  totalRows?: number;
  label?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled = false,
  totalRows,
  label = 'Export CSV',
  className = '',
}) => {
  const [exported, setExported] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    onExport();
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ${className}`}
      title={disabled ? 'No data to export' : `Export ${totalRows !== undefined ? totalRows : ''} rows as CSV`}
    >
      {exported ? (
        <>
          <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-200" />
          <span className="text-emerald-700 font-medium">Exported!</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
          <span>{label}</span>
          {totalRows !== undefined && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
              {totalRows}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default ExportButton;
