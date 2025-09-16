"use client";

import { BookOpenIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

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

  // Mapping between lesson titles and ebook filenames
  const ebookMapping: { [key: string]: string } = {
    'Wat is Testosteron': 'wat-is-testosteron',
    'De Kracht van Hoog Testosteron': 'de-kracht-van-hoog-testosteron',
    'Testosteron Killers - Wat Moet Je Elimineren': 'testosteron-killers-wat-moet-je-elimineren',
    'De Waarheid over Testosteron & Doping': 'de-waarheid-over-testosteron-doping',
    'TRT en Mijn Visie': 'trt-en-mijn-visie',
    'Het Belang van Kracht, Spiermassa en Conditie': 'het-belang-van-kracht-spiermassa-en-conditie',
    'Waarom is Fysieke Dominantie zo Belangrijk': 'waarom-is-fysieke-dominantie-zo-belangrijk',
    'De Basis van Discipline': 'de-basis-van-discipline',
    'Militaire Discipline': 'militaire-discipline',
    'Discipline van Korte-termijn naar een Levensstijl': 'discipline-van-korte-termijn-naar-een-levensstijl',
    'Wat is Mentale Kracht': 'wat-is-mentale-kracht',
    'Mentale Weerbaarheid in de Praktijk': 'mentale-weerbaarheid-in-de-praktijk',
    'Een Onbreekbare Mindset': 'een-onbreekbare-mindset',
    'Wordt een Onbreekbare Man': 'wordt-een-onbreekbare-man',
    'Embrace the Suck': 'embrace-the-suck',
    'Cut the Weak': 'cut-the-weak',
    'Wat is Identiteit en Waarom zijn Kernwaarden Essentieel': 'wat-is-identiteit-en-waarom-zijn-kernwaarden-essentieel',
    'Ontdek je Kernwaarden en Bouw je Top Tier Identiteit': 'ontdek-je-kernwaarden-en-bouw-je-top-tier-identiteit',
    'Status, Zelfrespect en Aantrekkingskracht': 'status-zelfrespect-en-aantrekkingskracht',
    'Waarom een Brotherhood': 'waarom-een-brotherhood',
    'Bouw de Juiste Kring': 'bouw-de-juiste-kring',
    'Hoe je je Broeders Versterkt en Samen Groeit': 'hoe-je-je-broeders-versterkt-en-samen-groeit',
    'Eer en Loyaliteit': 'eer-en-loyaliteit',
    'De Financiële Mindset': 'de-financile-mindset',
    'Grip op je Geld': 'grip-op-je-geld',
    'Van Werknemer naar Eigen Verdienmodellen': 'van-werknemer-naar-eigen-verdienmodellen',
    'Vermogen Opbouwen - Begin met Investeren': 'vermogen-opbouwen-begin-met-investeren',
    'Financiële Vrijheid en Legacy': 'financile-vrijheid-en-legacy',
    'Gezondheid als Fundament': 'gezondheid-als-fundament',
    'Energie en Focus': 'energie-en-focus',
    'Slaap - De Vergeten Superkracht': 'slaap-de-vergeten-superkracht',
    'Hydratatie en Water Inname': 'hydratatie-en-water-inname',
    'Vitaliteit en Levensduur': 'vitaliteit-en-levensduur',
    'De Basisprincipes van Voeding': 'de-basisprincipes-van-voeding'
  };

  // Function to open ebook in new tab
  const handleOpenEbook = () => {
    try {
      // Try to find exact mapping first
      let ebookFilename = ebookMapping[lessonTitle];
      
      // If no exact mapping found, create filename from title
      if (!ebookFilename) {
        ebookFilename = lessonTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      }
      
      const ebookUrl = `/ebooks/${ebookFilename}.html`;
      const fullUrl = window.location.origin + ebookUrl;
      
      // Debug logging
      console.log('📖 Opening ebook:', {
        lessonTitle,
        ebookFilename,
        ebookUrl,
        fullUrl,
        hasMapping: !!ebookMapping[lessonTitle]
      });
      
      // Method 1: Try direct window.open with user interaction
      console.log('✅ Attempting to open ebook directly:', ebookUrl);
      
      // Try window.open first (most reliable for user-initiated actions)
      const newWindow = window.open(ebookUrl, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        console.log('✅ Ebook opened successfully in new tab');
        return; // Success, exit early
      }
      
      // If window.open failed (popup blocked), try the link method
      console.log('⚠️ window.open failed, trying link method');
      
      // Create a temporary link element and click it - this bypasses popup blockers
      const link = document.createElement('a');
      link.href = ebookUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Ebook link clicked successfully');
      
      // Only show fallback message if window.open explicitly failed
      // Don't show popup blocker message if the link method was used
      console.log('✅ Link method completed - ebook should be opening');
      
    } catch (error) {
      console.error('❌ Error in handleOpenEbook:', error);
      
      // Only show fallback if there's a real error, not just popup blocking
      if (error instanceof Error && error.message.includes('blocked')) {
        // Show a simple message without being too intrusive
        console.log('🚫 Popup blocked, but link method should have worked');
      } else {
        // Show error message for real errors
        alert(`Er is een probleem opgetreden bij het openen van het ebook.\n\nProbeer het volgende:\n1. Klik met de rechtermuisknop op de knop\n2. Selecteer "Open in nieuw tabblad"\n3. Of kopieer deze URL: ${window.location.origin}/ebooks/${ebookMapping[lessonTitle] || lessonTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '')}.html`);
      }
    }
  };

  // Check if this lesson has an ebook available
  const hasEbook = true; // All lessons now have ebooks

  // Debug function to list available ebooks (for development)
  const debugAvailableEbooks = () => {
    console.log('📚 Available ebooks in mapping:', Object.keys(ebookMapping));
    console.log('📚 Current lesson title:', lessonTitle);
    console.log('📚 Mapped filename:', ebookMapping[lessonTitle] || 'No mapping found');
    
    // Test if the ebook file exists
    const mappedFilename = ebookMapping[lessonTitle];
    if (mappedFilename) {
      const testUrl = `/ebooks/${mappedFilename}.html`;
      console.log('📚 Testing ebook URL:', testUrl);
      
      // Quick test to see if file exists
      fetch(testUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            console.log('✅ Ebook file exists and is accessible');
          } else {
            console.error('❌ Ebook file not found or not accessible:', response.status);
          }
        })
        .catch(error => {
          console.error('❌ Error testing ebook file:', error);
        });
    }
  };

  // Call debug function in development
  if (process.env.NODE_ENV === 'development') {
    debugAvailableEbooks();
  }

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

          {/* Show ebook button for all lessons */}
          {hasEbook ? (
            <div className="mb-4">
              <button
                onClick={handleOpenEbook}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white rounded-lg hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Bekijk E-book
                <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Het ebook opent in een nieuw tabblad met alle praktische informatie en oefeningen.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}