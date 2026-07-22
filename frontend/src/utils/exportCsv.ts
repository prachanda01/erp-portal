/**
 * CSV Export Utility for NexusERP Operations Suite
 * Standardized utility for converting client-side tabular dataset into formatted CSV downloads.
 */

export interface ExportColumn<T = any> {
  header: string;
  accessor: keyof T | ((row: T) => any);
}

/**
 * Converts data rows to CSV string and triggers a browser download.
 * @param filename Name of the file to save (e.g. "customers_export.csv")
 * @param columns Header definitions and accessors
 * @param data Array of objects to export
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
): void {
  if (!data || !data.length) {
    console.warn('No data available to export to CSV');
    return;
  }

  // 1. Build CSV Header row
  const headerRow = columns.map((col) => escapeCsvField(col.header)).join(',');

  // 2. Build Data rows
  const dataRows = data.map((row) => {
    return columns
      .map((col) => {
        let value: any;
        if (typeof col.accessor === 'function') {
          value = col.accessor(row);
        } else {
          value = row[col.accessor];
        }

        // Format dates or objects cleanly if needed
        if (value instanceof Date) {
          value = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }

        return escapeCsvField(value);
      })
      .join(',');
  });

  // 3. Combine with newline
  const csvContent = [headerRow, ...dataRows].join('\r\n');

  // 4. Create Blob & Trigger Download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const formattedFilename = filename.toLowerCase().endsWith('.csv')
    ? filename
    : `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', formattedFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes fields containing commas, double quotes, or newlines.
 */
function escapeCsvField(field: any): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const str = String(field);
  // If field contains double quotes, escape them with double quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}
