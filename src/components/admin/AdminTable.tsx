import React from 'react';

interface AdminTableProps {
  headers: string[];
  data: any[];
  actions?: (item: any) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export default function AdminTable({ 
  headers, 
  data, 
  actions, 
  className = '',
  emptyMessage = 'Geen data beschikbaar',
  loading = false
}: AdminTableProps) {
  if (loading) {
    return (
      <div className={`bg-[#232D1A] border border-[#3A4D23] rounded-xl overflow-hidden ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-[#232D1A] border border-[#3A4D23] rounded-xl overflow-hidden ${className}`}>
        <div className="p-8 text-center">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#232D1A] border border-[#3A4D23] rounded-xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#181F17] border-b border-[#3A4D23]">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acties
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3A4D23]">
            {data.map((item, rowIndex) => {
              // Check if this is a completed task by looking at the status column (index 3)
              const isCompleted = item[3] && item[3].props && item[3].props.children && 
                item[3].props.children[1] && item[3].props.children[1].props && 
                item[3].props.children[1].props.children === 'Voltooid';
              
              return (
                <tr key={rowIndex} className={`transition-all duration-300 ${
                  isCompleted 
                    ? 'completed-task-row bg-[#1A2D17] border-l-4 border-[#8BAE5A] hover:bg-[#2A3D27]' 
                    : 'pending-task-row hover:bg-[#232D1A]'
                }`}>
                  {item.map((value: any, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {typeof value === 'boolean' ? (
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          value 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {value ? 'Ja' : 'Nee'}
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 