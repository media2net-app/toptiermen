'use client';

import { useState, useRef, useEffect } from 'react';
import { EmailEditor } from 'react-email-editor';
import { 
  XMarkIcon, 
  EyeIcon, 
  DocumentArrowDownIcon,
  CogIcon,
  PhotoIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface EmailBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (html: string, design: any) => void;
  initialContent?: string;
  emailName?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  design: any;
}

const BROTHERHOOD_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welkom Email',
    category: 'Onboarding',
    thumbnail: '🎉',
    design: {
      body: {
        backgroundColor: '#ffffff',
        width: '600px'
      },
      content: [
        {
          type: 'header',
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
          type: 'text',
          content: {
            text: 'Beste {{name}},\n\nWelkom bij Toptiermen! We zijn verheugd dat je interesse hebt getoond in onze exclusieve broederschap van top performers.',
            fontSize: '16px',
            textColor: '#333333',
            padding: '20px'
          }
        },
        {
          type: 'button',
          content: {
            text: 'Start Je Reis',
            backgroundColor: '#FFD700',
            textColor: '#000000',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '15px 30px',
            borderRadius: '8px',
            textAlign: 'center'
          }
        }
      ]
    }
  },
  {
    id: 'newsletter',
    name: 'Newsletter Template',
    category: 'Marketing',
    thumbnail: '📧',
    design: {
      body: {
        backgroundColor: '#f8f9fa',
        width: '600px'
      },
      content: [
        {
          type: 'header',
          content: {
            backgroundColor: '#181F17',
            text: 'Toptiermen Newsletter',
            textColor: '#8BAE5A',
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '25px'
          }
        },
        {
          type: 'text',
          content: {
            text: 'De laatste updates en tips van de broederschap',
            fontSize: '16px',
            textColor: '#666666',
            textAlign: 'center',
            padding: '20px'
          }
        }
      ]
    }
  },
  {
    id: 'promotion',
    name: 'Promotie Email',
    category: 'Sales',
    thumbnail: '💰',
    design: {
      body: {
        backgroundColor: '#ffffff',
        width: '600px'
      },
      content: [
        {
          type: 'header',
          content: {
            backgroundColor: '#FFD700',
            text: '🎯 Exclusieve Korting',
            textColor: '#000000',
            fontSize: '26px',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '25px'
          }
        },
        {
          type: 'text',
          content: {
            text: 'Beste {{name}},\n\nSpeciaal voor jou hebben we een exclusieve aanbieding!',
            fontSize: '16px',
            textColor: '#333333',
            padding: '20px'
          }
        }
      ]
    }
  }
];

export default function EmailBuilder({ 
  isOpen, 
  onClose, 
  onSave, 
  initialContent,
  emailName = 'Nieuwe Email'
}: EmailBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const emailEditorRef = useRef<any>(null);

  const handleSave = async () => {
    if (emailEditorRef.current) {
      setIsLoading(true);
      try {
        emailEditorRef.current.saveDesign((design: any) => {
          emailEditorRef.current.exportHtml((data: any) => {
            onSave(data.html, design);
            setIsLoading(false);
            toast.success('Email succesvol opgeslagen!');
            onClose();
          });
        });
      } catch (error) {
        setIsLoading(false);
        toast.error('Er is een fout opgetreden bij het opslaan');
      }
    }
  };

  const handlePreview = () => {
    if (emailEditorRef.current) {
      emailEditorRef.current.saveDesign((design: any) => {
        emailEditorRef.current.exportHtml((data: any) => {
          // Open preview in new window
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(data.html);
            newWindow.document.close();
          }
        });
      });
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
    if (emailEditorRef.current) {
      emailEditorRef.current.loadDesign(template.design);
    }
  };

  const editorConfig: any = {
    displayMode: 'email' as const,
    features: {
      preview: true,
      imageEditor: true,
      stockImages: true,
      textEditor: {
        spellChecker: true,
        thesaurus: true
      },
      customCSS: true
    },
    customJS: [
      'https://cdn.jsdelivr.net/npm/@unlayer/editor@latest/dist/editor.js'
    ],
    customCSS: [
      'https://cdn.jsdelivr.net/npm/@unlayer/editor@latest/dist/editor.css'
    ],
    mergeTags: [
      { name: 'name', value: '{{name}}', sample: 'John Doe' },
      { name: 'email', value: '{{email}}', sample: 'john@example.com' },
      { name: 'interestLevel', value: '{{interestLevel}}', sample: 'Hoog' },
      { name: 'company', value: '{{company}}', sample: 'Toptiermen' }
    ],
    tools: {
      button: {
        properties: {
          backgroundColor: {
            value: '#8BAE5A'
          },
          textColor: {
            value: '#ffffff'
          }
        }
      },
      header: {
        properties: {
          backgroundColor: {
            value: '#181F17'
          },
          textColor: {
            value: '#8BAE5A'
          }
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-[#8BAE5A]">
              Email Builder: {emailName}
            </h2>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1 bg-[#3A4D23] text-[#B6C948] rounded-lg hover:bg-[#4A5D33] transition-colors text-sm"
            >
              Templates
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              className="px-3 py-1 bg-[#3A4D23] text-[#B6C948] rounded-lg hover:bg-[#4A5D33] transition-colors flex items-center gap-2 text-sm"
            >
              <EyeIcon className="w-4 h-4" />
              Preview
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

        {/* Template Selector */}
        {showTemplates && (
          <div className="bg-[#181F17] p-4 border-b border-[#3A4D23]">
            <h3 className="text-[#8BAE5A] font-semibold mb-3">Kies een Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BROTHERHOOD_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg hover:bg-[#2A3520] transition-colors text-left"
                >
                  <div className="text-2xl mb-2">{template.thumbnail}</div>
                  <div className="text-[#8BAE5A] font-semibold">{template.name}</div>
                  <div className="text-[#B6C948] text-sm">{template.category}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email Editor */}
        <div className="flex-1 bg-white rounded-b-2xl overflow-hidden">
          <EmailEditor
            ref={emailEditorRef}
            style={{ height: '100%' }}
            options={editorConfig}
            projectId={1}
            onLoad={() => {
              // Load initial content if provided
              if (initialContent) {
                emailEditorRef.current.loadDesign(JSON.parse(initialContent));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 