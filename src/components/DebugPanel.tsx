'use client';
import { useDebug } from '@/contexts/DebugContext';

interface DebugPanelProps {
  data: Record<string, any>;
  title?: string;
}

export default function DebugPanel({ data, title = "Debug Info" }: DebugPanelProps) {
  const { showDebug } = useDebug();

  if (!showDebug) {
    return null;
  }

  return (
    <div className="bg-[#181F17] p-4 rounded-xl border border-[#3A4D23] mt-6">
      <h3 className="text-[#8BAE5A] font-semibold mb-2">{title}:</h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="text-white">
            <span className="text-[#B6C948] font-medium">{key}:</span>{' '}
            {typeof value === 'object' ? (
              <pre className="text-[#8BAE5A] text-sm mt-1 bg-[#232D1A] p-2 rounded-lg overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <span className="text-[#8BAE5A]">{String(value)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 