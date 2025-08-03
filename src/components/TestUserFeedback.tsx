'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  BugAntIcon, 
  LightBulbIcon, 
  XMarkIcon, 
  DocumentTextIcon,
  CameraIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface TestUserFeedbackProps {
  isTestUser: boolean;
  currentPage: string;
  onNoteCreated?: (note: any) => void;
  userRole?: string;
}

interface FeedbackNote {
  id: string;
  type: 'bug' | 'improvement' | 'general';
  page_url: string;
  element_selector?: string;
  area_selection?: { x: number; y: number; width: number; height: number } | null;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  screenshot_url?: string;
  created_at: string;
}

export default function TestUserFeedback({ isTestUser, currentPage, onNoteCreated, userRole }: TestUserFeedbackProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isAreaSelecting, setIsAreaSelecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [noteType, setNoteType] = useState<'bug' | 'improvement' | 'general'>('bug');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState<FeedbackNote[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'element' | 'area'>('element');

  const overlayRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectionRef = useRef<HTMLDivElement | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // Update event listeners when selection mode changes
  useEffect(() => {
    if (isHighlighting) {
      setupEventListeners(selectionMode);
    }
  }, [selectionMode, isHighlighting]);

  // Only show for test users
  if (!isTestUser) return null;

  const startHighlighting = () => {
    setIsHighlighting(true);
    setIsOpen(false);
    
    // Add highlighting styles
    const style = document.createElement('style');
    style.id = 'test-user-highlighting';
    style.textContent = `
      .test-user-highlight {
        outline: 3px solid #ef4444 !important;
        outline-offset: 2px !important;
        background-color: rgba(239, 68, 68, 0.1) !important;
        cursor: crosshair !important;
        position: relative !important;
        z-index: 9999 !important;
      }
      .test-user-highlight:hover {
        outline-color: #dc2626 !important;
        background-color: rgba(239, 68, 68, 0.2) !important;
      }
      .test-user-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.3);
        z-index: 9998;
        cursor: crosshair;
      }
      .test-user-area-selection {
        position: fixed;
        border: 2px dashed #3b82f6;
        background-color: rgba(59, 130, 246, 0.1);
        z-index: 10000;
        pointer-events: none;
      }
      .test-user-selection-handle {
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: #3b82f6;
        border: 1px solid white;
        border-radius: 50%;
        cursor: move;
        pointer-events: all;
      }
      .test-user-selection-handle.top-left { top: -4px; left: -4px; cursor: nw-resize; }
      .test-user-selection-handle.top-right { top: -4px; right: -4px; cursor: ne-resize; }
      .test-user-selection-handle.bottom-left { bottom: -4px; left: -4px; cursor: sw-resize; }
      .test-user-selection-handle.bottom-right { bottom: -4px; right: -4px; cursor: se-resize; }
    `;
    document.head.appendChild(style);

    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'test-user-overlay';
    overlay.onclick = stopHighlighting;
    document.body.appendChild(overlay);

    // Add mode selection UI
    const modeSelector = document.createElement('div');
    modeSelector.id = 'test-user-mode-selector';
    modeSelector.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #181F17;
      border: 2px solid #3A4D23;
      border-radius: 12px;
      padding: 12px;
      z-index: 10001;
      display: flex;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    const updateButtonStyles = () => {
      elementBtn.style.background = selectionMode === 'element' ? '#8BAE5A' : '#232D1A';
      elementBtn.style.color = selectionMode === 'element' ? 'black' : '#8BAE5A';
      areaBtn.style.background = selectionMode === 'area' ? '#8BAE5A' : '#232D1A';
      areaBtn.style.color = selectionMode === 'area' ? 'black' : '#8BAE5A';
    };
    
    const elementBtn = document.createElement('button');
    elementBtn.textContent = 'Element Selecteren';
    elementBtn.style.cssText = `
      padding: 8px 16px;
      background: ${selectionMode === 'element' ? '#8BAE5A' : '#232D1A'};
      color: ${selectionMode === 'element' ? 'black' : '#8BAE5A'};
      border: 1px solid #3A4D23;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    `;
    elementBtn.onclick = () => {
      setSelectionMode('element');
      setSelectedArea(null);
      setSelectedElement(null);
      updateButtonStyles();
      setupEventListeners('element');
    };
    
    const areaBtn = document.createElement('button');
    areaBtn.textContent = 'Gebied Selecteren';
    areaBtn.style.cssText = `
      padding: 8px 16px;
      background: ${selectionMode === 'area' ? '#8BAE5A' : '#232D1A'};
      color: ${selectionMode === 'area' ? 'black' : '#8BAE5A'};
      border: 1px solid #3A4D23;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    `;
    areaBtn.onclick = () => {
      setSelectionMode('area');
      setSelectedArea(null);
      setSelectedElement(null);
      updateButtonStyles();
      setupEventListeners('area');
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Bevestigen';
    confirmBtn.style.cssText = `
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    `;
    confirmBtn.onclick = () => {
      if (selectedElement || selectedArea) {
        stopHighlighting();
        setIsOpen(true);
      } else {
        // Show error message if nothing is selected
        alert('Selecteer eerst een element of gebied');
      }
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annuleren';
    cancelBtn.style.cssText = `
      padding: 8px 16px;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    `;
    cancelBtn.onclick = stopHighlighting;
    
    modeSelector.appendChild(elementBtn);
    modeSelector.appendChild(areaBtn);
    modeSelector.appendChild(confirmBtn);
    modeSelector.appendChild(cancelBtn);
    document.body.appendChild(modeSelector);

    // Setup initial event listeners
    setupEventListeners(selectionMode);
  };

  const setupEventListeners = (mode: 'element' | 'area') => {
    // Remove all existing event listeners first
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('click', handleElementClick, true);
    document.removeEventListener('mousedown', handleAreaSelectionStart);
    document.removeEventListener('mousemove', handleAreaSelectionMove);
    document.removeEventListener('mouseup', handleAreaSelectionEnd);

    // Clean up any existing area selection
    const existingSelection = document.querySelector('.test-user-area-selection');
    if (existingSelection) {
      existingSelection.remove();
    }

    // Add event listeners based on mode
    if (mode === 'element') {
      document.addEventListener('mouseover', handleMouseOver);
      document.addEventListener('click', handleElementClick, true);
    } else {
      document.addEventListener('mousedown', handleAreaSelectionStart);
      document.addEventListener('mousemove', handleAreaSelectionMove);
      document.addEventListener('mouseup', handleAreaSelectionEnd);
    }
  };

  const handleMouseOver = (e: MouseEvent) => {
    if (!isHighlighting) return;
    
    const target = e.target as HTMLElement;
    if (target === overlayRef.current || target === buttonRef.current) return;

    // Remove previous highlights
    document.querySelectorAll('.test-user-highlight').forEach(el => {
      el.classList.remove('test-user-highlight');
    });

    // Add highlight to current element
    target.classList.add('test-user-highlight');
  };

  const handleElementClick = (e: MouseEvent) => {
    if (!isHighlighting) return;
    
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (target === overlayRef.current || target === buttonRef.current) return;

    setSelectedElement(target);
    stopHighlighting();
    setIsOpen(true);
  };

  const handleAreaSelectionStart = (e: MouseEvent) => {
    if (!isHighlighting) return;
    if (selectionMode !== 'area') return;

    setIsAreaSelecting(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    const selectionDiv = document.createElement('div');
    selectionDiv.className = 'test-user-area-selection';
    document.body.appendChild(selectionDiv);
    selectionRef.current = selectionDiv;
  };

  const handleAreaSelectionMove = (e: MouseEvent) => {
    if (!isHighlighting || !isAreaSelecting || !startPosRef.current) return;
    if (selectionMode !== 'area') return;

    const currentPos = { x: e.clientX, y: e.clientY };
    const start = startPosRef.current;

    const minX = Math.min(start.x, currentPos.x);
    const minY = Math.min(start.y, currentPos.y);
    const maxX = Math.max(start.x, currentPos.x);
    const maxY = Math.max(start.y, currentPos.y);

    selectionRef.current!.style.left = `${minX}px`;
    selectionRef.current!.style.top = `${minY}px`;
    selectionRef.current!.style.width = `${maxX - minX}px`;
    selectionRef.current!.style.height = `${maxY - minY}px`;

    // Update selected area state
    setSelectedArea({ x: minX, y: minY, width: maxX - minX, height: maxY - minY });
  };

  const handleAreaSelectionEnd = () => {
    if (!isHighlighting || !isAreaSelecting) return;
    if (selectionMode !== 'area') return;

    setIsAreaSelecting(false);
    
    // Keep the selection visible but stop the selection process
    if (selectionRef.current) {
      selectionRef.current.style.pointerEvents = 'none';
    }
    
    // Don't stop highlighting here, let user confirm with the confirm button
  };

  const stopHighlighting = () => {
    setIsHighlighting(false);
    
    // Remove highlighting styles
    const style = document.getElementById('test-user-highlighting');
    if (style) style.remove();

    // Remove overlay
    const overlay = document.querySelector('.test-user-overlay');
    if (overlay) overlay.remove();

    // Remove highlights
    document.querySelectorAll('.test-user-highlight').forEach(el => {
      el.classList.remove('test-user-highlight');
    });

    // Remove event listeners
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('click', handleElementClick, true);
    document.removeEventListener('mousedown', handleAreaSelectionStart);
    document.removeEventListener('mousemove', handleAreaSelectionMove);
    document.removeEventListener('mouseup', handleAreaSelectionEnd);

    // Remove mode selector
    const modeSelector = document.getElementById('test-user-mode-selector');
    if (modeSelector) modeSelector.remove();
  };

  const getElementSelector = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c).join('.');
      return `.${classes}`;
    }
    return element.tagName.toLowerCase();
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Beschrijving is verplicht');
      return;
    }

    setIsSubmitting(true);

    try {
      const noteData = {
        test_user_id: '1', // This should come from user context or props
        type: noteType,
        page_url: currentPage,
        element_selector: selectedElement ? getElementSelector(selectedElement) : undefined,
        description: description.trim(),
        priority,
        screenshot_url: undefined // Could be added later
      };

      // Save to database
      const response = await fetch('/api/test-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save note');
      }

      // Add to local state
      const newNote: FeedbackNote = {
        id: result.note.id,
        type: noteType,
        page_url: currentPage,
        element_selector: selectedElement ? getElementSelector(selectedElement) : undefined,
        area_selection: selectedArea ? {
          x: selectedArea.x,
          y: selectedArea.y,
          width: selectedArea.width,
          height: selectedArea.height
        } : undefined,
        description: description.trim(),
        priority,
        created_at: result.note.created_at
      };

      setNotes(prev => [newNote, ...prev]);
      
      // Call callback if provided
      if (onNoteCreated) {
        onNoteCreated(newNote);
      }

      toast.success('Notitie succesvol opgeslagen');
      
      // Reset form
      setDescription('');
      setSelectedElement(null);
      setSelectedArea(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Fout bij opslaan van notitie');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDescription('');
    setSelectedElement(null);
    setSelectedArea(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 group"
          title={`Bug/Verbetering melden${userRole === 'admin' ? ' (Admin Mode)' : ''}`}
        >
          <BugAntIcon className="w-6 h-6" />
          {userRole === 'admin' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-black">A</span>
            </div>
          )}
        </button>
        
        <button
          onClick={startHighlighting}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 group"
          title={`Element markeren${userRole === 'admin' ? ' (Admin Mode)' : ''}`}
        >
          <DocumentTextIcon className="w-6 h-6" />
          {userRole === 'admin' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-black">A</span>
            </div>
          )}
        </button>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 group"
          title={`Mijn notities${userRole === 'admin' ? ' (Admin Mode)' : ''}`}
        >
          <span className="text-sm font-bold">{notes.length}</span>
          {userRole === 'admin' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-black">A</span>
            </div>
          )}
        </button>
      </div>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">
                {noteType === 'bug' ? '🐛 Bug Melden' : noteType === 'improvement' ? '💡 Verbetering Voorstellen' : '📝 Notitie'}
                {userRole === 'admin' && <span className="text-yellow-400 text-lg ml-2">(Admin Mode)</span>}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {selectedElement && (
              <div className="mb-4 p-3 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
                <div className="flex items-center gap-2 text-[#8BAE5A] text-sm">
                  <CheckIcon className="w-4 h-4" />
                  Element geselecteerd: {selectedElement.tagName.toLowerCase()}
                  {selectedElement.className && ` (${selectedElement.className.split(' ')[0]})`}
                </div>
              </div>
            )}

            {selectedArea && (
              <div className="mb-4 p-3 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
                <div className="flex items-center gap-2 text-[#8BAE5A] text-sm">
                  <CheckIcon className="w-4 h-4" />
                  Gebied geselecteerd: {selectedArea.width}px × {selectedArea.height}px
                  <span className="text-gray-400">(Positie: {selectedArea.x}, {selectedArea.y})</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Note Type Selection */}
              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Type</label>
                <div className="flex gap-2">
                  {[
                    { value: 'bug', label: '🐛 Bug', icon: BugAntIcon },
                    { value: 'improvement', label: '💡 Verbetering', icon: LightBulbIcon },
                    { value: 'general', label: '📝 Algemeen', icon: DocumentTextIcon }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNoteType(type.value as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        noteType === type.value
                          ? 'bg-[#8BAE5A] text-black border-[#8BAE5A]'
                          : 'bg-[#232D1A] text-white border-[#3A4D23] hover:border-[#8BAE5A]'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Prioriteit</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="low">Laag</option>
                  <option value="medium">Medium</option>
                  <option value="high">Hoog</option>
                  <option value="critical">Kritiek</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Beschrijving</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschrijf de bug, verbetering of notitie..."
                  rows={4}
                  className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !description.trim()}
                  className="px-6 py-2 bg-[#8BAE5A] text-black font-medium rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Overview */}
      {showNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">
                Mijn Test Notities
                {userRole === 'admin' && <span className="text-yellow-400 text-lg ml-2">(Admin Mode)</span>}
              </h2>
              <button
                onClick={() => setShowNotes(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nog geen notities gemaakt</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          note.type === 'bug' ? 'bg-red-500/20 text-red-400' :
                          note.type === 'improvement' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {note.type === 'bug' ? '🐛 Bug' : note.type === 'improvement' ? '💡 Verbetering' : '📝 Algemeen'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          note.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          note.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          note.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {note.priority === 'critical' ? 'Kritiek' :
                           note.priority === 'high' ? 'Hoog' :
                           note.priority === 'medium' ? 'Medium' : 'Laag'}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(note.created_at).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                    <p className="text-white mb-2">{note.description}</p>
                    <div className="text-sm text-gray-400">
                      <span>Pagina: {note.page_url}</span>
                      {note.element_selector && (
                        <span className="ml-4">Element: {note.element_selector}</span>
                      )}
                      {note.area_selection && (
                        <span className="ml-4">Gebied: {note.area_selection.width}px × {note.area_selection.height}px</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 