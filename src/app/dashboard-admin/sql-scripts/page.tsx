'use client';

import { useState } from 'react';
import { AdminCard, AdminButton } from '@/components/admin';
import { toast } from 'react-hot-toast';
import { WrenchScrewdriverIcon, PlayIcon, DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SQLResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  query?: string;
  instructions?: string[];
  note?: string;
}

export default function SQLScriptsPage() {
  const [sqlQuery, setSqlQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<SQLResult | null>(null);
  const [selectedScript, setSelectedScript] = useState<string>('');

  const predefinedScripts = {
    'nutrition-plans-setup': {
      name: 'Voedingsplannen Tabel Setup',
      description: 'Maakt de nutrition_plans tabel aan met alle benodigde kolommen',
      sql: `-- Complete setup voor nutrition_plans tabel
-- Voer dit uit in: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql

-- 1. Voeg ontbrekende kolommen toe
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS color VARCHAR(100);
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS icon VARCHAR(10);
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS meals JSONB;
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Maak indexes aan
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_plan_id ON nutrition_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_active ON nutrition_plans(is_active);

-- 3. Enable Row Level Security
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

-- 4. Drop bestaande policies (als ze bestaan)
DROP POLICY IF EXISTS "Allow authenticated users to read active nutrition plans" ON nutrition_plans;
DROP POLICY IF EXISTS "Allow admins to manage nutrition plans" ON nutrition_plans;

-- 5. Maak nieuwe policies aan
CREATE POLICY "Allow authenticated users to read active nutrition plans" ON nutrition_plans
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Allow admins to manage nutrition plans" ON nutrition_plans
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- 6. Update bestaande records om is_active te zetten
UPDATE nutrition_plans SET is_active = true WHERE is_active IS NULL;

-- 7. Toon resultaat
SELECT 'Tabel setup voltooid!' as status;
SELECT COUNT(*) as total_plans FROM nutrition_plans;`
    },
    'check-tables': {
      name: 'Controleer Database Tabellen',
      description: 'Toont alle tabellen in de database',
      sql: `SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;`
    },
    'check-nutrition-plans': {
      name: 'Controleer Voedingsplannen Tabel',
      description: 'Toont de structuur van de nutrition_plans tabel',
      sql: `SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'nutrition_plans' 
ORDER BY ordinal_position;`
    }
  };

  const executeSQL = async (sql: string) => {
    setIsExecuting(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql })
      });

      const result = await response.json();
      setResult(result);

      if (result.success) {
        toast.success('SQL query uitgevoerd!');
      } else {
        toast.error(`SQL fout: ${result.error}`);
      }
    } catch (error) {
      console.error('SQL execution error:', error);
      toast.error('Fout bij uitvoeren SQL query');
      setResult({
        success: false,
        error: 'Netwerk fout bij uitvoeren SQL query'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleScriptSelect = (scriptKey: string) => {
    const script = predefinedScripts[scriptKey as keyof typeof predefinedScripts];
    if (script) {
      setSelectedScript(scriptKey);
      setSqlQuery(script.sql);
    }
  };

  const handleExecute = () => {
    if (!sqlQuery.trim()) {
      toast.error('Voer een SQL query in');
      return;
    }
    executeSQL(sqlQuery);
  };

  return (
    <div className="space-y-6">
      <AdminCard
        title="SQL Scripts Uitvoeren"
        subtitle="Database beheer en troubleshooting"
        icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
        gradient
      >
        <div className="space-y-6">
          {/* Predefined Scripts */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Vooraf Gedefinieerde Scripts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(predefinedScripts).map(([key, script]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedScript === key
                      ? 'border-[#8BAE5A] bg-[#2A3D1A]'
                      : 'border-[#3A4D23] bg-[#181F17] hover:border-[#8BAE5A]'
                  }`}
                  onClick={() => handleScriptSelect(key)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#8BAE5A] mb-2">{script.name}</h4>
                      <p className="text-sm text-[#B6C948]">{script.description}</p>
                    </div>
                    {selectedScript === key && (
                      <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A] ml-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SQL Editor */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">SQL Query Editor</h3>
            <div className="space-y-4">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="Voer je SQL query in..."
                className="w-full h-64 p-4 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white font-mono text-sm resize-none focus:border-[#8BAE5A] focus:outline-none"
              />
              <div className="flex gap-4">
                <AdminButton
                  onClick={handleExecute}
                  disabled={isExecuting || !sqlQuery.trim()}
                  className="flex items-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  {isExecuting ? 'Uitvoeren...' : 'Uitvoeren'}
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  onClick={() => {
                    setSqlQuery('');
                    setSelectedScript('');
                    setResult(null);
                  }}
                >
                  Wissen
                </AdminButton>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Resultaat</h3>
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'border-green-500 bg-green-900/20' 
                  : 'border-red-500 bg-red-900/20'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {result.success ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-semibold ${
                    result.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.success ? 'Succesvol' : 'Fout'}
                  </span>
                </div>

                {result.message && (
                  <p className="text-white mb-3">{result.message}</p>
                )}

                {result.query && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Uitgevoerde Query:</h4>
                    <pre className="bg-black/50 p-3 rounded text-sm text-gray-300 overflow-x-auto">
                      {result.query}
                    </pre>
                  </div>
                )}

                {result.instructions && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Instructies:</h4>
                    <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                      {result.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {result.note && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Notitie:</h4>
                    <p className="text-sm text-gray-300">{result.note}</p>
                  </div>
                )}

                {result.data && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Data:</h4>
                    <pre className="bg-black/50 p-3 rounded text-sm text-gray-300 overflow-x-auto max-h-64 overflow-y-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}

                {result.error && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2">Fout:</h4>
                    <p className="text-sm text-red-400">{result.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
            <h3 className="text-lg font-semibold text-[#8BAE5A] mb-3">Hoe te gebruiken</h3>
            <div className="space-y-2 text-sm text-[#B6C948]">
              <p>1. <strong>Selecteer een vooraf gedefinieerd script</strong> of voer je eigen SQL query in</p>
              <p>2. <strong>Klik op "Uitvoeren"</strong> om de query uit te voeren</p>
              <p>3. <strong>Bekijk het resultaat</strong> in het resultaat paneel</p>
              <p>4. <strong>Voor DDL operaties</strong> (CREATE, ALTER, DROP) ga naar Supabase Dashboard</p>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
