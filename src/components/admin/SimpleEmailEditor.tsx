'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  EyeIcon, 
  DocumentArrowDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface SimpleEmailEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent?: string;
  emailName?: string;
}

export default function SimpleEmailEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  initialContent = '',
  emailName = 'Email Bewerken'
}: SimpleEmailEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Email content mag niet leeg zijn');
      return;
    }

    setIsLoading(true);
    try {
      onSave(content);
      setIsLoading(false);
      toast.success('Email succesvol opgeslagen!');
      onClose();
    } catch (error) {
      setIsLoading(false);
      toast.error('Er is een fout opgetreden bij het opslaan');
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + variable + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const variables = [
    { name: 'Naam', value: '{{name}}', sample: 'John Doe' },
    { name: 'Email', value: '{{email}}', sample: 'john@example.com' },
    { name: 'Interesse Niveau', value: '{{interestLevel}}', sample: 'Hoog' },
    { name: 'Bedrijf', value: '{{company}}', sample: 'Toptiermen' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-[#8BAE5A]">
              {emailName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-[#B6C948]">
              <SparklesIcon className="w-4 h-4" />
              Snelle Editor
            </div>
          </div>
          
          <div className="flex items-center gap-3">
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

        {/* Variables Panel */}
        <div className="bg-[#181F17] p-4 border-b border-[#3A4D23]">
          <h3 className="text-[#8BAE5A] font-semibold mb-3">Beschikbare Variabelen</h3>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => (
              <button
                key={variable.value}
                onClick={() => insertVariable(variable.value)}
                className="px-3 py-1 bg-[#3A4D23] text-[#B6C948] rounded-lg hover:bg-[#4A5D33] transition-colors text-sm border border-[#3A4D23] hover:border-[#8BAE5A]"
                title={`${variable.name}: ${variable.sample}`}
              >
                {variable.name}
              </button>
            ))}
          </div>
        </div>

        {/* Email Content Editor */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            {/* Subject Line */}
            <div className="mb-4">
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Onderwerp
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Voer het email onderwerp in..."
                className="w-full px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-[#B6C948]/50 focus:outline-none focus:border-[#8BAE5A]"
              />
            </div>

            {/* Content Editor */}
            <div className="flex-1 flex flex-col">
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Email Content
              </label>
              <textarea
                id="email-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Schrijf je email content hier...&#10;&#10;Gebruik de variabelen hierboven om persoonlijke content te maken.&#10;Bijvoorbeeld: 'Beste {{name}}, welkom bij {{company}}!'"
                className="flex-1 w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-[#B6C948]/50 focus:outline-none focus:border-[#8BAE5A] resize-none font-mono text-sm leading-relaxed"
                style={{ minHeight: '400px' }}
              />
            </div>

            {/* Character Count */}
            <div className="mt-3 text-right text-sm text-[#B6C948]">
              {content.length} karakters
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3A4D23] bg-[#181F17]">
          <div className="flex items-center justify-between text-sm text-[#B6C948]">
            <div>
              <p>💡 Tip: Gebruik variabelen om persoonlijke emails te maken</p>
              <p>📧 Preview je email voordat je het opslaat</p>
            </div>
            <div className="text-right">
              <p>Voor geavanceerde email editing</p>
              <p>gebruik de Email Builder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 