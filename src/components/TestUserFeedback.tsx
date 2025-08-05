'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  BugAntIcon, 
  LightBulbIcon, 
  XMarkIcon, 
  DocumentTextIcon,
  CameraIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CursorArrowRaysIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

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
  const { user } = useSupabaseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [noteType, setNoteType] = useState<'bug' | 'improvement' | 'general'>('bug');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState<FeedbackNote[]>([]);
  const [showNotes, setShowNotes] = useState(false);

  // Screenshot mode refs
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const selectionBoxRef = useRef<HTMLDivElement | null>(null);
  const isSelectingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch existing notes when component mounts
  useEffect(() => {
    if (user?.id && isTestUser) {
      fetchNotes();
    }
  }, [user?.id, isTestUser]);

  // Cleanup function to remove any leftover screenshot elements when component unmounts
  useEffect(() => {
    return () => {
      if (isScreenshotMode) {
        stopScreenshotMode();
      }
    };
  }, [isScreenshotMode]);

  const fetchNotes = async () => {
    try {
      // Try to fetch from database first
      const response = await fetch(`/api/test-notes-working?test_user_id=${user?.id}`);
      const result = await response.json();
      
      if (result.success && result.notes) {
        setNotes(result.notes);
        return;
      }
    } catch (error) {
      console.warn('Database fetch failed, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    try {
      const localNotes = JSON.parse(localStorage.getItem('test_notes') || '[]');
      setNotes(localNotes);
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
      setNotes([]);
    }
  };

  // Only show for test users
  if (!isTestUser) return null;

  // Cleanup any leftover screenshot elements on component mount
  useEffect(() => {
    const cleanupScreenshotElements = () => {
      const allElements = document.querySelectorAll('div');
      allElements.forEach(element => {
        const style = element.style;
        if (style.position === 'fixed' && 
            (element.textContent === 'Sleep om een gebied te selecteren' || 
             element.textContent === 'Druk ESC om te annuleren')) {
          console.log('🧹 Cleaning up leftover screenshot element:', element.textContent);
          element.remove();
        }
      });
    };

    // Cleanup on mount
    cleanupScreenshotElements();

    // Also cleanup when window gains focus (in case user navigated away and back)
    const handleFocus = () => {
      cleanupScreenshotElements();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const startScreenshotMode = () => {
    console.log('🎯 Starting macOS-style screenshot mode...');
    setIsScreenshotMode(true);
    setIsOpen(false);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'screenshot-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 9999;
      cursor: crosshair;
      user-select: none;
      pointer-events: auto;
    `;
    
    // Create instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      z-index: 10000;
      pointer-events: none;
    `;
    instructions.textContent = 'Sleep om een gebied te selecteren';
    
    // Create escape hint
    const escapeHint = document.createElement('div');
    escapeHint.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
    `;
    escapeHint.textContent = 'Druk ESC om te annuleren';
    
    document.body.appendChild(overlay);
    document.body.appendChild(instructions);
    document.body.appendChild(escapeHint);
    
    overlayRef.current = overlay;
    
    // Add event listeners
    const handleMouseDown = (e: MouseEvent) => {
      console.log('🎯 Mouse down:', e.clientX, e.clientY);
      e.preventDefault();
      e.stopPropagation();
      
      isSelectingRef.current = true;
      startPosRef.current = { x: e.clientX, y: e.clientY };
      
      // Create selection box
      const selectionBox = document.createElement('div');
      selectionBox.className = 'screenshot-selection-box';
      selectionBox.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 1px;
        height: 1px;
        border: 2px solid #007AFF;
        background: rgba(0, 122, 255, 0.1);
        z-index: 10000;
        pointer-events: none;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5);
        border-radius: 2px;
      `;
      
      document.body.appendChild(selectionBox);
      selectionBoxRef.current = selectionBox;
      
      console.log('✅ Selection box created');
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelectingRef.current || !startPosRef.current || !selectionBoxRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const currentPos = { x: e.clientX, y: e.clientY };
      const startPos = startPosRef.current;
      
      const minX = Math.min(startPos.x, currentPos.x);
      const minY = Math.min(startPos.y, currentPos.y);
      const maxX = Math.max(startPos.x, currentPos.x);
      const maxY = Math.max(startPos.y, currentPos.y);
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      selectionBoxRef.current.style.left = `${minX}px`;
      selectionBoxRef.current.style.top = `${minY}px`;
      selectionBoxRef.current.style.width = `${width}px`;
      selectionBoxRef.current.style.height = `${height}px`;
      
      console.log('📐 Selection box updated:', { width, height });
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      console.log('🎯 Mouse up:', e.clientX, e.clientY);
      if (!isSelectingRef.current || !startPosRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      isSelectingRef.current = false;
      
      const currentPos = { x: e.clientX, y: e.clientY };
      const startPos = startPosRef.current;
      
      const minX = Math.min(startPos.x, currentPos.x);
      const minY = Math.min(startPos.y, currentPos.y);
      const maxX = Math.max(startPos.x, currentPos.x);
      const maxY = Math.max(startPos.y, currentPos.y);
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      console.log('📐 Final selection:', { width, height });
      
      // Only accept selection if it's large enough
      if (width > 20 && height > 20) {
        setSelectedArea({ x: minX, y: minY, width, height });
        console.log('✅ Valid selection made, opening form');
        stopScreenshotMode();
        setIsOpen(true);
      } else {
        console.log('❌ Selection too small, removing');
        if (selectionBoxRef.current) {
          selectionBoxRef.current.remove();
          selectionBoxRef.current = null;
        }
      }
      
      startPosRef.current = null;
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('🚪 ESC pressed, canceling screenshot mode');
        stopScreenshotMode();
      }
    };
    
    // Add event listeners
    overlay.addEventListener('mousedown', handleMouseDown);
    overlay.addEventListener('mousemove', handleMouseMove);
    overlay.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    
    // Store cleanup function
    overlay.dataset.cleanup = 'true';
    overlay.dataset.mouseDown = handleMouseDown.toString();
    overlay.dataset.mouseMove = handleMouseMove.toString();
    overlay.dataset.mouseUp = handleMouseUp.toString();
    overlay.dataset.keyDown = handleKeyDown.toString();
  };

  const stopScreenshotMode = () => {
    console.log('🛑 Stopping screenshot mode...');
    setIsScreenshotMode(false);
    
    // Remove overlay
    if (overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }
    
    // Remove selection box
    if (selectionBoxRef.current) {
      selectionBoxRef.current.remove();
      selectionBoxRef.current = null;
    }
    
    // Remove all screenshot-related elements
    const allElements = document.querySelectorAll('div');
    allElements.forEach(element => {
      const style = element.style;
      if (style.position === 'fixed' && 
          (element.textContent === 'Sleep om een gebied te selecteren' || 
           element.textContent === 'Druk ESC om te annuleren')) {
        console.log('🧹 Removing screenshot element:', element.textContent);
        element.remove();
      }
    });
    
    // Also remove any elements with specific styles that match our screenshot elements
    const screenshotElements = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
    screenshotElements.forEach(element => {
      if (element.textContent === 'Sleep om een gebied te selecteren' || 
          element.textContent === 'Druk ESC om te annuleren') {
        console.log('🧹 Removing screenshot element by style:', element.textContent);
        element.remove();
      }
    });
    
    // Reset state
    isSelectingRef.current = false;
    startPosRef.current = null;
  };

  const getElementSelector = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ').join('.')}`;
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
        test_user_id: user?.id || 'unknown',
        type: noteType,
        page_url: currentPage,
        element_selector: selectedElement ? getElementSelector(selectedElement) : undefined,
        area_selection: selectedArea,
        description: description.trim(),
        priority,
        screenshot_url: undefined // TODO: Implement actual screenshot capture
      };

      console.log('📝 Submitting note:', noteData);

      // Try to save to database first
      try {
        const response = await fetch('/api/test-notes-working', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(noteData),
        });

        const result = await response.json();

        if (response.ok) {
          // Successfully saved to database
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

          toast.success('Notitie succesvol opgeslagen in database');
        } else {
          throw new Error(result.error || 'Failed to save note');
        }
      } catch (error) {
        console.warn('Database save failed, falling back to localStorage:', error);
        
        // Fallback to localStorage
        const localNote: FeedbackNote = {
          id: `local-${Date.now()}`,
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
          created_at: new Date().toISOString()
        };

        const existingNotes = JSON.parse(localStorage.getItem('test_notes') || '[]');
        const updatedNotes = [localNote, ...existingNotes];
        localStorage.setItem('test_notes', JSON.stringify(updatedNotes));
        
        setNotes(prev => [localNote, ...prev]);
        
        if (onNoteCreated) {
          onNoteCreated(localNote);
        }

        console.log('Test note created:', localNote);
        toast.success('Notitie opgeslagen in lokale opslag');
      }

      // Reset form
      setDescription('');
      setSelectedElement(null);
      setSelectedArea(null);
      setIsOpen(false);

    } catch (error) {
      console.error('Error submitting note:', error);
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
      {/* Screenshot Button */}
      <button
        ref={buttonRef}
        onClick={startScreenshotMode}
        disabled={isScreenshotMode}
        className="fixed right-4 bottom-20 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Screenshot maken (macOS-style)"
      >
        <CameraIcon className="w-6 h-6" />
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#8BAE5A]">Test Gebruiker Feedback</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Type Selection */}
            <div className="mb-4">
              <label className="block text-[#8BAE5A] font-semibold mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setNoteType('bug')}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    noteType === 'bug'
                      ? 'bg-red-600 text-white'
                      : 'bg-[#232D1A] text-gray-300 hover:bg-[#3A4D23]'
                  }`}
                >
                  <BugAntIcon className="w-4 h-4 inline mr-1" />
                  Bug
                </button>
                <button
                  onClick={() => setNoteType('improvement')}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    noteType === 'improvement'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#232D1A] text-gray-300 hover:bg-[#3A4D23]'
                  }`}
                >
                  <LightBulbIcon className="w-4 h-4 inline mr-1" />
                  Verbetering
                </button>
                <button
                  onClick={() => setNoteType('general')}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    noteType === 'general'
                      ? 'bg-gray-600 text-white'
                      : 'bg-[#232D1A] text-gray-300 hover:bg-[#3A4D23]'
                  }`}
                >
                  <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                  Algemeen
                </button>
              </div>
            </div>

            {/* Selected Area Info */}
            {selectedArea && (
              <div className="mb-4 p-3 bg-[#232D1A] rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Square3Stack3DIcon className="w-4 h-4 text-[#8BAE5A]" />
                  <span className="text-[#8BAE5A] font-medium">Geselecteerd Gebied</span>
                </div>
                <div className="text-sm text-gray-300">
                  Positie: ({selectedArea.x}, {selectedArea.y})<br />
                  Grootte: {selectedArea.width} × {selectedArea.height} pixels
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-4">
              <label className="block text-[#8BAE5A] font-semibold mb-2">Beschrijving</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschrijf het probleem of de verbetering..."
                className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948] resize-none"
                rows={4}
                required
              />
            </div>

            {/* Priority */}
            <div className="mb-6">
              <label className="block text-[#8BAE5A] font-semibold mb-2">Prioriteit</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="low">Laag</option>
                <option value="medium">Medium</option>
                <option value="high">Hoog</option>
                <option value="critical">Kritiek</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 rounded-xl bg-[#232D1A] text-gray-300 hover:bg-[#3A4D23] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !description.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-[#8BAE5A] text-white hover:bg-[#B6C948] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Opslaan...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Opslaan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List Button */}
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="fixed right-4 bottom-32 z-50 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Bekijk notities"
      >
        <DocumentTextIcon className="w-6 h-6" />
      </button>

      {/* Notes List */}
      {showNotes && (
        <div className="fixed right-4 bottom-40 z-50 bg-[#181F17] border border-[#3A4D23] rounded-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#8BAE5A]">Notities ({notes.length})</h3>
            <button
              onClick={() => setShowNotes(false)}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {notes.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Geen notities</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-[#232D1A] rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {note.type === 'bug' && <BugAntIcon className="w-4 h-4 text-red-400" />}
                    {note.type === 'improvement' && <LightBulbIcon className="w-4 h-4 text-blue-400" />}
                    {note.type === 'general' && <DocumentTextIcon className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm font-medium text-white">{note.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      note.priority === 'critical' ? 'bg-red-600 text-white' :
                      note.priority === 'high' ? 'bg-orange-600 text-white' :
                      note.priority === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {note.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{note.description}</p>
                  <div className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
} 