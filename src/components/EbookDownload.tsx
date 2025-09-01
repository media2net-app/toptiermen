"use client";

import { useState, useEffect } from 'react';
import {
  DocumentArrowDownIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface EbookDownloadProps {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  ebookUrl: string;
  isCompleted?: boolean;
}

export default function EbookDownload({
  lessonId,
  lessonTitle,
  moduleTitle,
  ebookUrl,
  isCompleted = false
}: EbookDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [downloadType, setDownloadType] = useState<'html' | 'pdf'>('html');
  const [showModal, setShowModal] = useState(false);

  // Reset download status when component mounts or when lesson changes
  useEffect(() => {
    setDownloadStatus('idle');
    setIsDownloading(false);
  }, [lessonId]);



  const handleDownload = async (type: 'html' | 'pdf') => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadStatus('idle');
    setDownloadType(type);

    try {
      if (type === 'html') {
        // Open de HTML versie van het ebook in een modal
        setShowModal(true);
        setDownloadStatus('success');
      } else {
        // Download de PDF versie
        const pdfUrl = ebookUrl.replace('.html', '.pdf');
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${lessonTitle.replace(/\s+/g, '-').toLowerCase()}-ebook.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadStatus('success');
      }
      
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

  const getStatusIcon = () => {
    switch (downloadStatus) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <DocumentArrowDownIcon className="w-5 h-5 text-[#8BAE5A]" />;
    }
  };

  const getStatusText = () => {
    switch (downloadStatus) {
      case 'success':
        return downloadType === 'html' ? 'Ebook geopend!' : 'PDF gedownload!';
      case 'error':
        return 'Actie mislukt. Probeer opnieuw.';
      default:
        return 'Kies een optie';
    }
  };

  const getButtonClass = () => {
    if (isDownloading) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    
    switch (downloadStatus) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-[#8BAE5A] hover:bg-[#3A4D23]';
    }
  };

  return (
    <>
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
            Download het uitgebreide ebook voor <strong>{lessonTitle}</strong> uit de module <strong>{moduleTitle}</strong>. 
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleDownload('html')}
              disabled={isDownloading}
              className={`
                flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white 
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAE5A]
                ${downloadType === 'html' && downloadStatus === 'success' ? 'bg-green-500' : 'bg-[#8BAE5A] hover:bg-[#3A4D23]'}
                ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <ComputerDesktopIcon className="w-5 h-5 mr-2" />
              {isDownloading && downloadType === 'html' ? 'Openen...' : 'Bekijk Ebook'}
            </button>
            
            <button
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
              className={`
                flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white 
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAE5A]
                ${downloadType === 'pdf' && downloadStatus === 'success' ? 'bg-green-500' : 'bg-[#3A4D23] hover:bg-[#8BAE5A]'}
                ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              {isDownloading && downloadType === 'pdf' ? 'Downloaden...' : 'Download PDF'}
            </button>
          </div>
          
          {downloadStatus === 'success' && (
            <p className="text-sm text-green-600 mt-2">
              {downloadType === 'html' 
                ? 'Het ebook is geopend in een nieuwe tab. Je kunt het nu lezen en eventueel printen of opslaan!'
                : 'Het PDF ebook is gedownload naar je computer. Je kunt het nu offline lezen!'
              }
            </p>
          )}
          
          {downloadStatus === 'error' && (
            <p className="text-sm text-red-600 mt-2">
              Er is een fout opgetreden. Controleer je internetverbinding en probeer opnieuw.
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Ebook Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-5/6 flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {lessonTitle} - Ebook
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="flex-1 p-4 overflow-hidden">
            <iframe
              src={ebookUrl.replace('.pdf', '.html')}
              className="w-full h-full border-0 rounded"
              title={`${lessonTitle} Ebook`}
            />
          </div>
          
          {/* Modal Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Je kunt dit ebook ook downloaden als PDF voor offline gebruik.
            </p>
            <button
              onClick={() => {
                const pdfUrl = ebookUrl.replace('.html', '.pdf');
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `${lessonTitle.replace(/\s+/g, '-').toLowerCase()}-ebook.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 bg-[#8BAE5A] text-white rounded-md hover:bg-[#3A4D23] transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
