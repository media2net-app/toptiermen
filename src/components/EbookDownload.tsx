"use client";

import { useState, useEffect } from 'react';
import {
  DocumentArrowDownIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Reset download status when component mounts or when lesson changes
  useEffect(() => {
    setDownloadStatus('idle');
    setIsDownloading(false);
  }, [lessonId]);

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadStatus('idle');

    try {
      // Open de HTML versie van het ebook in een nieuw tabblad
      // Map lesson titles to our new ebook filenames
      const lessonToEbookMap = {
        // Module 1: Testosteron
        'Wat is Testosteron': '/books/module-1-les-1-wat-is-testosteron-ebook.html',
        'De Kracht van Hoog Testosteron': '/books/module-1-les-2-kracht-hoog-testosteron-ebook.html',
        'Testosteron Killers: Wat moet je Elimineren': '/books/module-1-les-3-testosteron-killers-ebook.html',
        'De Waarheid over Testosteron Doping': '/books/module-1-les-4-waarheid-testosteron-doping-ebook.html',
        'TRT en mijn Visie': '/books/module-1-les-5-trt-mijn-visie-ebook.html',
        
        // Module 2: Discipline & Identiteit
        'De basis van Discipline': '/books/module-2-les-1-de-basis-van-discipline-ebook.html',
        'Militaire Discipline': '/books/module-2-les-2-militaire-discipline-ebook.html',
        'Discipline van korte termijn naar een levensstijl': '/books/module-2-les-3-discipline-levensstijl-ebook.html',
        'Wat is Identiteit en Waarom zijn Kernwaarden Essentieel?': '/books/module-2-les-4-identiteit-kernwaarden-ebook.html',
        'Ontdek je kernwaarden en bouw je Top Tier identiteit': '/books/module-2-les-5-top-tier-identiteit-ebook.html',
        
        // Module 3: Fysieke Dominantie
        'Waarom is fysieke dominantie zo belangrijk?': '/books/module-3-les-1-fysieke-dominantie-belangrijk-ebook.html',
        'Het belang van kracht, spiermassa en conditie': '/books/module-3-les-2-kracht-spiermassa-conditie-ebook.html',
        ' Status, Zelfrespect en Aantrekkingskracht': '/books/module-3-les-3-status-zelfrespect-aantrekkingskracht-ebook.html',
        'Vitaliteit en Levensduur': '/books/module-3-les-4-vitaliteit-levensduur-ebook.html',
        'Embrace the Suck': '/books/module-3-les-5-embrace-the-suck-ebook.html',
        
        // Module 4: Mentale Kracht/Weerbaarheid
        'Wat is mentale kracht': '/books/module-4-les-1-wat-is-mentale-kracht-ebook.html',
        'Een Onbreekbare Mindset': '/books/module-4-les-2-onbreekbare-mindset-ebook.html',
        'Mentale Weerbaarheid in de Praktijk': '/books/module-4-les-3-mentale-weerbaarheid-praktijk-ebook.html',
        'Wordt Een Onbreekbare Man': '/books/module-4-les-4-wordt-onbreekbare-man-ebook.html',
        
        // Module 5: Business and Finance
        'De Financiële Mindset ': '/books/module-5-les-1-financiele-mindset-ebook.html',
        'Grip op je geld': '/books/module-5-les-2-grip-op-je-geld-ebook.html',
        'Van Werknemer naar eigen Verdienmodellen': '/books/module-5-les-3-werknemer-naar-verdienmodellen-ebook.html',
        'Vermogen Opbouwen Begin met Investeren': '/books/module-5-les-4-vermogen-opbouwen-investeren-ebook.html',
        'Financiële Vrijheid en Legacy ': '/books/module-5-les-5-financiele-vrijheid-legacy-ebook.html',
        
        // Module 6: Brotherhood
        'Waarom een Brotherhood': '/books/module-6-les-1-waarom-een-brotherhood-ebook.html',
        'Eer en Loyaliteit': '/books/module-6-les-2-eer-en-loyaliteit-ebook.html',
        'Bouw de juiste Kring ': '/books/module-6-les-3-bouw-de-juiste-kring-ebook.html',
        'Cut The Weak': '/books/module-6-les-4-cut-the-weak-ebook.html',
        'Hoe je je Broeders versterkt en samen groeit': '/books/module-6-les-5-broeders-versterkt-samen-groeit-ebook.html',
        
        // Module 7: Voeding & Gezondheid
        'De Basisprincipes van Voeding': '/books/module-7-les-1-basisprincipes-voeding-ebook.html',
        'Hydratatie en Water inname': '/books/module-7-les-2-hydratatie-water-inname-ebook.html',
        'Slaap de vergeten superkracht': '/books/module-7-les-3-slaap-vergeten-superkracht-ebook.html',
        'Energie en Focus': '/books/module-7-les-4-energie-en-focus-ebook.html',
        'Gezondheid als Fundament': '/books/module-7-les-5-gezondheid-als-fundament-ebook.html'
      };
      
      const htmlUrl = lessonToEbookMap[lessonTitle] || ebookData?.path || ebookData?.file_url || `/books/${lessonTitle.toLowerCase().replace(/\s+/g, '-')}-ebook.html`;
      window.open(htmlUrl, '_blank');
      setDownloadStatus('success');
      
      // Reset status na 3 seconden
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      
      // Reset status na 3 seconden
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 3000);
    } finally {
      setIsDownloading(false);
    }
  };

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
          
          <div className="flex justify-center">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`
                flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white 
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAE5A]
                ${downloadStatus === 'success' ? 'bg-green-500' : 'bg-[#8BAE5A] hover:bg-[#3A4D23]'}
                ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <ComputerDesktopIcon className="w-5 h-5 mr-2" />
              {isDownloading ? 'Openen...' : 'Open in Nieuw Tabblad'}
            </button>
          </div>
          
          {downloadStatus === 'success' && (
            <p className="text-sm text-green-600 mt-2 text-center">
              Het ebook is geopend in een nieuw tabblad. Je kunt het nu lezen en eventueel printen of opslaan!
            </p>
          )}
          
          {downloadStatus === 'error' && (
            <p className="text-sm text-red-600 mt-2 text-center">
              Er is een fout opgetreden. Controleer je internetverbinding en probeer opnieuw.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}