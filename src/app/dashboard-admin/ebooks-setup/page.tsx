"use client";

import { useState } from 'react';
import { 
  BookOpenIcon, 
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function EbooksSetupPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createEbooksTable = async () => {
    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/create-ebooks-table-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Er is een fout opgetreden');
        if (data.sqlScript) {
          setResult({ ...data, sqlScript: data.sqlScript });
        }
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het maken van de ebooks tabel');
      console.error('Error creating ebooks table:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ebooks Setup
          </h1>
          <p className="text-gray-600">
            Maak de ebooks tabel aan en voeg het eerste ebook toe voor de Academy lessen.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#3A4D23] rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ebooks Database Setup
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Deze actie zal de volgende database objecten aanmaken:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Wat wordt aangemaakt:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>academy_ebooks</strong> tabel</li>
                  <li>• Database indexes voor snelle zoekopdrachten</li>
                  <li>• Row Level Security (RLS) policies</li>
                  <li>• Automatische updated_at trigger</li>
                  <li>• Voorbeeld ebook voor "De Basis van Discipline"</li>
                </ul>
              </div>
              
              <button
                onClick={createEbooksTable}
                disabled={isCreating}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAE5A]
                  ${isCreating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#8BAE5A] hover:bg-[#3A4D23]'
                  }
                `}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Bezig met aanmaken...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Maak Ebooks Tabel Aan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && result.success && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ebooks Tabel Aangemaakt!
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  De ebooks tabel is succesvol aangemaakt en het eerste ebook is toegevoegd.
                </p>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Resultaat:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✅ Tabel aangemaakt</li>
                    <li>✅ Indexes aangemaakt</li>
                    <li>✅ RLS policies ingesteld</li>
                    <li>✅ Trigger aangemaakt</li>
                    <li>✅ Voorbeeld ebook toegevoegd</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !result?.sqlScript && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Fout bij Aanmaken
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Er is een fout opgetreden bij het aanmaken van de ebooks tabel.
                </p>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-900 mb-2">Foutmelding:</h4>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SQL Script Display */}
        {result && result.sqlScript && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Handmatige SQL Uitvoering Nodig
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  De ebooks tabel bestaat nog niet en moet handmatig aangemaakt worden. Kopieer en plak het volgende SQL script in je Supabase SQL Editor:
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">SQL Script:</h4>
                  <div className="relative">
                    <pre className="text-xs text-gray-800 bg-white p-4 rounded border overflow-x-auto max-h-96">
                      {result.sqlScript.trim()}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.sqlScript.trim());
                        alert('SQL script gekopieerd naar klembord!');
                      }}
                      className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      Kopieer
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Stappen om uit te voeren:</h4>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                      <span>Ga naar je <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase Dashboard</a></span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                      <span>Selecteer je project en ga naar "SQL Editor" in het linker menu</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                      <span>Klik op "New Query" en plak het bovenstaande SQL script</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                      <span>Klik op "Run" om het script uit te voeren</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">5</span>
                      <span>Kom terug naar deze pagina en klik opnieuw op "Maak Ebooks Tabel Aan"</span>
                    </li>
                  </ol>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Let op:</strong> Het script maakt de tabel aan, voegt indexes toe, stelt RLS policies in, en voegt automatisch een voorbeeld ebook toe voor de eerste les.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {result && result.success && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Volgende Stappen
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Nu de ebooks tabel is aangemaakt, kun je:
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Wat je nu kunt doen:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ga naar de Academy en bekijk de eerste les</li>
                    <li>• Download het ebook via de nieuwe download knop</li>
                    <li>• Voeg meer ebooks toe voor andere lessen</li>
                    <li>• Beheer ebooks via de admin interface</li>
                  </ul>
                </div>
                
                <div className="mt-4 space-x-4">
                  <a
                    href="/dashboard/academy"
                    className="inline-flex items-center px-4 py-2 bg-[#8BAE5A] text-white rounded-md hover:bg-[#3A4D23] transition-colors"
                  >
                    Bekijk Academy
                  </a>
                  <a
                    href="/dashboard-admin/academy"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Academy Beheer
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
