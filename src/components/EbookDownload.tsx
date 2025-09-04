"use client";

import { BookOpenIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface EbookDownloadProps {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  moduleNumber?: string;
  ebookData?: any; // Flexibele ebook data structuur
  isCompleted?: boolean;
}

export default function EbookDownload({
  lessonId,
  lessonTitle,
  moduleTitle,
  moduleNumber,
  ebookData,
  isCompleted = false
}: EbookDownloadProps) {

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#3A4D23] rounded-lg flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Les Ebook
              </h3>
              {isCompleted && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Voltooid
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Download het uitgebreide ebook voor <strong>{lessonTitle}</strong> uit de module <strong>{moduleNumber ? `Module ${moduleNumber}: ` : ''}{moduleTitle}</strong>. 
              Dit ebook bevat extra lesmateriaal, praktische oefeningen en reflectie vragen.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Wat krijg je in dit ebook?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Uitgebreide samenvatting van de les</li>
                <li>• Praktische oefeningen en opdrachten</li>
                <li>• Dagelijkse checklists en routines</li>
                <li>• Reflectie vragen voor persoonlijke groei</li>
                <li>• Volgende stappen en actieplan</li>
              </ul>
            </div>
            
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 mb-1">
                  Ebooks in ontwikkeling
                </h4>
                <p className="text-sm text-amber-700">
                  De ebooks zijn momenteel niet beschikbaar. We werken hard aan het verbeteren van de inhoud en kwaliteit. 
                  Binnenkort zullen alle ebooks weer beschikbaar zijn met verbeterde content.
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
  );
}