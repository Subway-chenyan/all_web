import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import { cn } from '@/utils';

export interface ExportDataItem {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ExportDataProps {
  data: ExportDataItem[];
  filename?: string;
  formats?: ('csv' | 'excel' | 'pdf' | 'json')[];
  onExport?: (format: string, data: ExportDataItem[]) => void;
  className?: string;
  disabled?: boolean;
}

const ExportData: React.FC<ExportDataProps> = ({
  data,
  filename = 'export_data',
  formats = ['csv', 'excel', 'json'],
  onExport,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: <FileText className="w-4 h-4" /> },
    { value: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { value: 'json', label: 'JSON', icon: <FileText className="w-4 h-4" /> },
    { value: 'pdf', label: 'PDF', icon: <FileImage className="w-4 h-4" /> },
  ].filter(option => formats.includes(option.value as 'csv' | 'excel' | 'pdf' | 'json'));

  const downloadCSV = (data: ExportDataItem[]) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadJSON = (data: ExportDataItem[]) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExport = async (format: string) => {
    if (disabled || isExporting) return;

    setIsExporting(format);

    try {
      if (onExport) {
        await onExport(format, data);
      } else {
        switch (format) {
          case 'csv':
            downloadCSV(data);
            break;
          case 'json':
            downloadJSON(data);
            break;
          case 'excel':
            // Excel export would require a library like xlsx
            console.log('Excel export not implemented');
            break;
          case 'pdf':
            // PDF export would require a library like jspdf
            console.log('PDF export not implemented');
            break;
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm',
          'text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
        )}
      >
        <Download className="w-4 h-4 text-gray-400" />
        <span>导出数据</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleExport(option.value)}
                disabled={isExporting === option.value}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150',
                  'focus:outline-none focus:bg-gray-50 flex items-center gap-2',
                  'text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {option.icon}
                <span>{option.label}</span>
                {isExporting === option.value && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportData;