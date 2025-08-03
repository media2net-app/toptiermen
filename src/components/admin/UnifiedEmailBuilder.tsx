'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  EyeIcon, 
  DocumentArrowDownIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface UnifiedEmailBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (html: string, design: any) => void;
  initialContent?: string;
  emailName?: string;
}

interface EmailSection {
  id: string;
  type: 'header' | 'text' | 'button' | 'image' | 'divider' | 'social' | 'footer';
  content: any;
  order: number;
}

const DEFAULT_SECTIONS: EmailSection[] = [
  {
    id: '1',
    type: 'header',
    order: 1,
    content: {
      backgroundColor: '#8BAE5A',
      text: '🚀 Welkom bij Toptiermen',
      textColor: '#ffffff',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '20px'
    }
  },
  {
    id: '2',
    type: 'text',
    order: 2,
    content: {
      text: 'Beste {{name}},\n\nWelkom bij Toptiermen! We zijn verheugd dat je interesse hebt getoond in onze exclusieve broederschap van top performers.',
      fontSize: '16px',
      textColor: '#333333',
      padding: '20px',
      textAlign: 'left'
    }
  },
  {
    id: '3',
    type: 'button',
    order: 3,
    content: {
      text: 'Start Je Reis',
      backgroundColor: '#FFD700',
      textColor: '#000000',
      fontSize: '18px',
      fontWeight: 'bold',
      padding: '15px 30px',
      borderRadius: '8px',
      textAlign: 'center',
      url: '#'
    }
  }
];

export default function UnifiedEmailBuilder({ 
  isOpen, 
  onClose, 
  onSave, 
  initialContent,
  emailName = 'Email Builder'
}: UnifiedEmailBuilderProps) {
  const [sections, setSections] = useState<EmailSection[]>(DEFAULT_SECTIONS);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        if (parsed.sections) {
          setSections(parsed.sections);
        }
      } catch (error) {
        console.error('Error parsing initial content:', error);
      }
    }
  }, [initialContent]);

  const addSection = (type: EmailSection['type']) => {
    const newSection: EmailSection = {
      id: Date.now().toString(),
      type,
      order: sections.length + 1,
      content: getDefaultContentForType(type)
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const getDefaultContentForType = (type: EmailSection['type']) => {
    switch (type) {
      case 'header':
        return {
          backgroundColor: '#8BAE5A',
          text: 'Nieuwe Header',
          textColor: '#ffffff',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '20px'
        };
      case 'text':
        return {
          text: 'Voeg hier je tekst toe...',
          fontSize: '16px',
          textColor: '#333333',
          padding: '20px',
          textAlign: 'left'
        };
      case 'button':
        return {
          text: 'Klik Hier',
          backgroundColor: '#FFD700',
          textColor: '#000000',
          fontSize: '18px',
          fontWeight: 'bold',
          padding: '15px 30px',
          borderRadius: '8px',
          textAlign: 'center',
          url: '#'
        };
      case 'image':
        return {
          src: 'https://via.placeholder.com/600x300/8BAE5A/FFFFFF?text=Toptiermen',
          alt: 'Toptiermen Image',
          width: '100%',
          height: 'auto',
          padding: '20px'
        };
      case 'divider':
        return {
          backgroundColor: '#E5E7EB',
          height: '1px',
          margin: '20px 0'
        };
      case 'social':
        return {
          backgroundColor: '#F3F4F6',
          padding: '20px',
          textAlign: 'center',
          text: 'Volg ons op social media',
          fontSize: '14px',
          textColor: '#6B7280'
        };
      case 'footer':
        return {
          backgroundColor: '#181F17',
          text: '© 2024 Toptiermen. Alle rechten voorbehouden.',
          textColor: '#8BAE5A',
          fontSize: '12px',
          textAlign: 'center',
          padding: '20px'
        };
      default:
        return {};
    }
  };

  const updateSection = (sectionId: string, updates: any) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, content: { ...section.content, ...updates } }
        : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const index = prev.findIndex(section => section.id === sectionId);
      if (index === -1) return prev;
      
      const newSections = [...prev];
      if (direction === 'up' && index > 0) {
        [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
      } else if (direction === 'down' && index < newSections.length - 1) {
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      }
      
      return newSections.map((section, idx) => ({ ...section, order: idx + 1 }));
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const design = { sections };
      const html = generateHTML(sections);
      onSave(html, design);
      setIsLoading(false);
      toast.success('Email succesvol opgeslagen!');
      onClose();
    } catch (error) {
      setIsLoading(false);
      toast.error('Er is een fout opgetreden bij het opslaan');
    }
  };

  const generateHTML = (sections: EmailSection[]) => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailName}</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .email-container { max-width: 600px; margin: 0 auto; }
          .section { width: 100%; }
          @media (max-width: 600px) {
            .email-container { width: 100% !important; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
    `;

    sections.forEach(section => {
      switch (section.type) {
        case 'header':
          html += `
            <div class="section" style="
              background-color: ${section.content.backgroundColor};
              color: ${section.content.textColor};
              font-size: ${section.content.fontSize};
              font-weight: ${section.content.fontWeight};
              text-align: ${section.content.textAlign};
              padding: ${section.content.padding};
            ">
              ${section.content.text}
            </div>
          `;
          break;
        case 'text':
          html += `
            <div class="section" style="
              font-size: ${section.content.fontSize};
              color: ${section.content.textColor};
              padding: ${section.content.padding};
              text-align: ${section.content.textAlign};
              line-height: 1.6;
            ">
              ${section.content.text.replace(/\n/g, '<br>')}
            </div>
          `;
          break;
        case 'button':
          html += `
            <div class="section" style="text-align: center; padding: 20px;">
              <a href="${section.content.url}" style="
                display: inline-block;
                background-color: ${section.content.backgroundColor};
                color: ${section.content.textColor};
                font-size: ${section.content.fontSize};
                font-weight: ${section.content.fontWeight};
                padding: ${section.content.padding};
                border-radius: ${section.content.borderRadius};
                text-decoration: none;
                text-align: ${section.content.textAlign};
              ">
                ${section.content.text}
              </a>
            </div>
          `;
          break;
        case 'image':
          html += `
            <div class="section" style="padding: ${section.content.padding};">
              <img src="${section.content.src}" alt="${section.content.alt}" style="
                width: ${section.content.width};
                height: ${section.content.height};
                display: block;
              ">
            </div>
          `;
          break;
        case 'divider':
          html += `
            <div class="section" style="
              background-color: ${section.content.backgroundColor};
              height: ${section.content.height};
              margin: ${section.content.margin};
            "></div>
          `;
          break;
        case 'social':
          html += `
            <div class="section" style="
              background-color: ${section.content.backgroundColor};
              padding: ${section.content.padding};
              text-align: ${section.content.textAlign};
              font-size: ${section.content.fontSize};
              color: ${section.content.textColor};
            ">
              ${section.content.text}
            </div>
          `;
          break;
        case 'footer':
          html += `
            <div class="section" style="
              background-color: ${section.content.backgroundColor};
              color: ${section.content.textColor};
              font-size: ${section.content.fontSize};
              text-align: ${section.content.textAlign};
              padding: ${section.content.padding};
            ">
              ${section.content.text}
            </div>
          `;
          break;
      }
    });

    html += `
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const renderPreview = () => {
    return (
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'}`}>
        <div className="bg-gray-100 p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-xs text-gray-500">
            {previewMode === 'mobile' ? '📱 Mobile' : '💻 Desktop'}
          </div>
        </div>
        
        <div className="email-container" style={{ maxWidth: previewMode === 'mobile' ? '375px' : '600px', margin: '0 auto' }}>
          {sections.map(section => (
            <div key={section.id} className="section" style={{
              backgroundColor: section.content.backgroundColor,
              color: section.content.textColor,
              fontSize: section.content.fontSize,
              fontWeight: section.content.fontWeight,
              textAlign: section.content.textAlign,
              padding: section.content.padding,
              lineHeight: section.type === 'text' ? '1.6' : 'normal'
            }}>
              {section.type === 'text' ? (
                <div dangerouslySetInnerHTML={{ __html: section.content.text.replace(/\n/g, '<br>') }} />
              ) : section.type === 'button' ? (
                <a href={section.content.url} style={{
                  display: 'inline-block',
                  backgroundColor: section.content.backgroundColor,
                  color: section.content.textColor,
                  fontSize: section.content.fontSize,
                  fontWeight: section.content.fontWeight,
                  padding: section.content.padding,
                  borderRadius: section.content.borderRadius,
                  textDecoration: 'none',
                  textAlign: section.content.textAlign
                }}>
                  {section.content.text}
                </a>
              ) : section.type === 'image' ? (
                <img src={section.content.src} alt={section.content.alt} style={{
                  width: section.content.width,
                  height: section.content.height,
                  display: 'block'
                }} />
              ) : section.type === 'divider' ? (
                <div style={{
                  backgroundColor: section.content.backgroundColor,
                  height: section.content.height,
                  margin: section.content.margin
                }}></div>
              ) : (
                section.content.text
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionEditor = () => {
    if (!selectedSection) {
      return (
        <div className="flex items-center justify-center h-full text-[#B6C948]">
          <div className="text-center">
            <DocumentTextIcon className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Selecteer een sectie</p>
            <p className="text-sm">Klik op een sectie in de preview om deze te bewerken</p>
          </div>
        </div>
      );
    }

    const section = sections.find(s => s.id === selectedSection);
    if (!section) return null;

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#8BAE5A] capitalize">
            {section.type} Sectie
          </h3>
          <button
            onClick={() => deleteSection(section.id)}
            className="text-red-400 hover:text-red-300"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        {section.type === 'header' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#B6C948] mb-1">Tekst</label>
              <input
                type="text"
                value={section.content.text}
                onChange={(e) => updateSection(section.id, { text: e.target.value })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white focus:border-[#8BAE5A] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-1">Achtergrond</label>
                <input
                  type="color"
                  value={section.content.backgroundColor}
                  onChange={(e) => updateSection(section.id, { backgroundColor: e.target.value })}
                  className="w-full h-10 rounded border border-[#3A4D23]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-1">Tekst Kleur</label>
                <input
                  type="color"
                  value={section.content.textColor}
                  onChange={(e) => updateSection(section.id, { textColor: e.target.value })}
                  className="w-full h-10 rounded border border-[#3A4D23]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#B6C948] mb-1">Font Grootte</label>
              <select
                value={section.content.fontSize}
                onChange={(e) => updateSection(section.id, { fontSize: e.target.value })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white focus:border-[#8BAE5A] focus:outline-none"
              >
                <option value="16px">Klein (16px)</option>
                <option value="18px">Normaal (18px)</option>
                <option value="20px">Medium (20px)</option>
                <option value="24px">Groot (24px)</option>
                <option value="28px">Extra Groot (28px)</option>
              </select>
            </div>
          </div>
        )}

        {section.type === 'text' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#B6C948] mb-1">Tekst</label>
              <textarea
                value={section.content.text}
                onChange={(e) => updateSection(section.id, { text: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white focus:border-[#8BAE5A] focus:outline-none resize-none"
                placeholder="Voeg hier je tekst toe..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-1">Tekst Kleur</label>
                <input
                  type="color"
                  value={section.content.textColor}
                  onChange={(e) => updateSection(section.id, { textColor: e.target.value })}
                  className="w-full h-10 rounded border border-[#3A4D23]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-1">Font Grootte</label>
                <select
                  value={section.content.fontSize}
                  onChange={(e) => updateSection(section.id, { fontSize: e.target.value })}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white focus:border-[#8BAE5A] focus:outline-none"
                >
                  <option value="14px">Klein (14px)</option>
                  <option value="16px">Normaal (16px)</option>
                  <option value="18px">Medium (18px)</option>
                  <option value="20px">Groot (20px)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {section.type === 'button' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#B6C948] mb-1">Knop Tekst</label>
              <input
                type="text"
                value={section.content.text}
                onChange={(e) => updateSection(section.id, { text: e.target.value })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white focus:border-[#8BAE5A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#B6C948] mb-1">URL</label>
              <input
                type="text"
                value={section.content.url}
                onChange={(e) => updateSection(section.id, { url: e.target.value })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white focus:border-[#8BAE5A] focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-1">Achtergrond</label>
                <input
                  type="color"
                  value={section.content.backgroundColor}
                  onChange={(e) => updateSection(section.id, { backgroundColor: e.target.value })}
                  className="w-full h-10 rounded border border-[#3A4D23]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-1">Tekst Kleur</label>
                <input
                  type="color"
                  value={section.content.textColor}
                  onChange={(e) => updateSection(section.id, { textColor: e.target.value })}
                  className="w-full h-10 rounded border border-[#3A4D23]"
                />
              </div>
            </div>
          </div>
        )}

        {section.type === 'image' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#B6C948] mb-1">Afbeelding URL</label>
              <input
                type="text"
                value={section.content.src}
                onChange={(e) => updateSection(section.id, { src: e.target.value })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white focus:border-[#8BAE5A] focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#B6C948] mb-1">Alt Tekst</label>
              <input
                type="text"
                value={section.content.alt}
                onChange={(e) => updateSection(section.id, { alt: e.target.value })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white focus:border-[#8BAE5A] focus:outline-none"
                placeholder="Beschrijving van de afbeelding"
              />
            </div>
          </div>
        )}

        {/* Section Controls */}
        <div className="pt-4 border-t border-[#3A4D23]">
          <div className="flex gap-2">
            <button
              onClick={() => moveSection(section.id, 'up')}
              disabled={section.order === 1}
              className="px-3 py-1 bg-[#3A4D23] text-[#B6C948] rounded hover:bg-[#4A5D33] disabled:opacity-50 text-sm"
            >
              ↑ Omhoog
            </button>
            <button
              onClick={() => moveSection(section.id, 'down')}
              disabled={section.order === sections.length}
              className="px-3 py-1 bg-[#3A4D23] text-[#B6C948] rounded hover:bg-[#4A5D33] disabled:opacity-50 text-sm"
            >
              ↓ Omlaag
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-[#8BAE5A]">
              {emailName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-[#B6C948]">
              <SparklesIcon className="w-4 h-4" />
              Unified Builder
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Preview Mode Toggle */}
            <div className="flex bg-[#181F17] rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  previewMode === 'desktop' 
                    ? 'bg-[#8BAE5A] text-black' 
                    : 'text-[#B6C948] hover:text-white'
                }`}
              >
                💻 Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  previewMode === 'mobile' 
                    ? 'bg-[#8BAE5A] text-black' 
                    : 'text-[#B6C948] hover:text-white'
                }`}
              >
                📱 Mobile
              </button>
            </div>

            {/* Sidebar Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="px-3 py-1 bg-[#3A4D23] text-[#B6C948] rounded-lg hover:bg-[#4A5D33] transition-colors"
            >
              {showSidebar ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-1 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#A6C97B] transition-colors font-semibold flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Opslaan...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  Opslaan
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-[#B6C948] hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#8BAE5A]">Live Preview</h3>
                <div className="text-sm text-[#B6C948]">
                  {sections.length} secties
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                {renderPreview()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 bg-[#181F17] border-l border-[#3A4D23] flex flex-col">
              {/* Add Section */}
              <div className="p-4 border-b border-[#3A4D23]">
                <h3 className="text-[#8BAE5A] font-semibold mb-3">Secties Toevoegen</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addSection('header')}
                    className="p-2 bg-[#3A4D23] text-[#B6C948] rounded hover:bg-[#4A5D33] transition-colors text-sm flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Header
                  </button>
                  <button
                    onClick={() => addSection('text')}
                    className="p-2 bg-[#3A4D23] text-[#B6C948] rounded hover:bg-[#4A5D33] transition-colors text-sm flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Tekst
                  </button>
                  <button
                    onClick={() => addSection('button')}
                    className="p-2 bg-[#3A4D23] text-[#B6C948] rounded hover:bg-[#4A5D33] transition-colors text-sm flex items-center gap-2"
                  >
                    <ChartBarIcon className="w-4 h-4" />
                    Knop
                  </button>
                  <button
                    onClick={() => addSection('image')}
                    className="p-2 bg-[#3A4D23] text-[#B6C948] rounded hover:bg-[#4A5D33] transition-colors text-sm flex items-center gap-2"
                  >
                    <PhotoIcon className="w-4 h-4" />
                    Afbeelding
                  </button>
                  <button
                    onClick={() => addSection('divider')}
                    className="p-2 bg-[#3A4D23] text-[#B6C948] rounded hover:bg-[#4A5D33] transition-colors text-sm flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Scheidingslijn
                  </button>
                  <button
                    onClick={() => addSection('footer')}
                    className="p-2 bg-[#3A4D23] text-[#B6C948] rounded hover:bg-[#4A5D33] transition-colors text-sm flex items-center gap-2"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    Footer
                  </button>
                </div>
              </div>

              {/* Section Editor */}
              <div className="flex-1 overflow-y-auto">
                {renderSectionEditor()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 