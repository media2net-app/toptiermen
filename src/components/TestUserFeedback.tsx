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
  const [screenshotData, setScreenshotData] = useState<string | null>(null);

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

  // Cleanup any leftover screenshot elements on component mount
  useEffect(() => {
    if (!isTestUser) return;

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
  }, [isTestUser]);

  const startScreenshotMode = () => {
    console.log('🎯 Starting mobile-friendly screenshot mode...');
    setIsScreenshotMode(true);
    setIsOpen(false);
    
    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
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
      cursor: ${isMobile ? 'default' : 'crosshair'};
      user-select: none;
      pointer-events: auto;
      touch-action: none;
    `;
    
    // Create mobile-friendly instructions
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
      font-size: ${isMobile ? '16px' : '14px'};
      z-index: 10000;
      pointer-events: none;
      text-align: center;
      max-width: 90vw;
    `;
    instructions.textContent = isMobile ? 'Raak en sleep om een gebied te selecteren' : 'Sleep om een gebied te selecteren';
    
    // Create mobile-friendly escape hint
    const escapeHint = document.createElement('div');
    escapeHint.style.cssText = `
      position: fixed;
      bottom: ${isMobile ? '60px' : '20px'};
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: ${isMobile ? '14px' : '12px'};
      z-index: 10000;
      pointer-events: none;
      text-align: center;
    `;
    escapeHint.textContent = isMobile ? 'Tik buiten selectie om te annuleren' : 'Druk ESC om te annuleren';
    
    // Create mobile toolbar
    let mobileToolbar: HTMLDivElement | null = null;
    if (isMobile) {
      mobileToolbar = document.createElement('div');
      mobileToolbar.className = 'screenshot-mobile-toolbar';
      mobileToolbar.setAttribute('data-screenshot-element', 'true');
      mobileToolbar.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        z-index: 10001;
        pointer-events: auto;
        display: flex;
        gap: 15px;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '✕ Annuleren';
      cancelBtn.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 15px;
        font-size: 14px;
        cursor: pointer;
      `;
      
      const fullScreenBtn = document.createElement('button');
      fullScreenBtn.textContent = '📱 Volledig scherm';
      fullScreenBtn.style.cssText = `
        background: rgba(0,122,255,0.8);
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 15px;
        font-size: 14px;
        cursor: pointer;
      `;
      
      const tapModeBtn = document.createElement('button');
      tapModeBtn.textContent = '👆 Tik element';
      tapModeBtn.style.cssText = `
        background: rgba(52,199,89,0.8);
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 15px;
        font-size: 14px;
        cursor: pointer;
      `;
      
      mobileToolbar.appendChild(cancelBtn);
      mobileToolbar.appendChild(fullScreenBtn);
      mobileToolbar.appendChild(tapModeBtn);
      
      // Event listeners for mobile toolbar
      cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stopScreenshotMode();
      });
      
      fullScreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        captureFullScreenshot();
      });
      
      tapModeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        enableTapToSelectMode();
      });
    }
    
    document.body.appendChild(overlay);
    document.body.appendChild(instructions);
    document.body.appendChild(escapeHint);
    if (mobileToolbar) {
      document.body.appendChild(mobileToolbar);
    }
    
    overlayRef.current = overlay;
    
    // Add event listeners - support both mouse and touch events
    const handlePointerStart = (clientX: number, clientY: number, eventType: string) => {
      console.log(`🎯 ${eventType} start:`, clientX, clientY);
      
      isSelectingRef.current = true;
      startPosRef.current = { x: clientX, y: clientY };
      
      // Create selection box
      const selectionBox = document.createElement('div');
      selectionBox.className = 'screenshot-selection-box';
      selectionBox.style.cssText = `
        position: fixed;
        left: ${clientX}px;
        top: ${clientY}px;
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

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handlePointerStart(e.clientX, e.clientY, 'Mouse');
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerStart(touch.clientX, touch.clientY, 'Touch');
      }
    };
    
    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!isSelectingRef.current || !startPosRef.current || !selectionBoxRef.current) return;
      
      const currentPos = { x: clientX, y: clientY };
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

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelectingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSelectingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
      }
    };
    
    const handlePointerEnd = (clientX: number, clientY: number, eventType: string) => {
      console.log(`🎯 ${eventType} end:`, clientX, clientY);
      if (!isSelectingRef.current || !startPosRef.current) return;
      
      isSelectingRef.current = false;
      
      const currentPos = { x: clientX, y: clientY };
      const startPos = startPosRef.current;
      
      const minX = Math.min(startPos.x, currentPos.x);
      const minY = Math.min(startPos.y, currentPos.y);
      const maxX = Math.max(startPos.x, currentPos.x);
      const maxY = Math.max(startPos.y, currentPos.y);
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      console.log('📐 Final selection:', { width, height });
      
      // Lower minimum size for mobile devices (finger selection is less precise)
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      const minSize = isMobileDevice ? 10 : 20;
      
      // Only accept selection if it's large enough
      if (width > minSize && height > minSize) {
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

    const handleMouseUp = (e: MouseEvent) => {
      if (!isSelectingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      handlePointerEnd(e.clientX, e.clientY, 'Mouse');
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSelectingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        handlePointerEnd(touch.clientX, touch.clientY, 'Touch');
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('🚪 ESC pressed, canceling screenshot mode');
        stopScreenshotMode();
      }
    };
    
    // Add event listeners - both mouse and touch
    overlay.addEventListener('mousedown', handleMouseDown);
    overlay.addEventListener('mousemove', handleMouseMove);
    overlay.addEventListener('mouseup', handleMouseUp);
    
    // Touch events for mobile support
    overlay.addEventListener('touchstart', handleTouchStart, { passive: false });
    overlay.addEventListener('touchmove', handleTouchMove, { passive: false });
    overlay.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Store cleanup function
    overlay.dataset.cleanup = 'true';
    overlay.dataset.mouseDown = handleMouseDown.toString();
    overlay.dataset.mouseMove = handleMouseMove.toString();
    overlay.dataset.mouseUp = handleMouseUp.toString();
    overlay.dataset.keyDown = handleKeyDown.toString();
  };

  const captureFullScreenshot = async () => {
    console.log('📱 Capturing full screenshot...');
    try {
      // Set full screen area
      setSelectedArea({ 
        x: 0, 
        y: 0, 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
      
      // Stop screenshot mode and open form
      stopScreenshotMode();
      setIsOpen(true);
      
      console.log('✅ Full screenshot area set');
    } catch (error) {
      console.error('❌ Error capturing full screenshot:', error);
    }
  };

  const enableTapToSelectMode = () => {
    console.log('👆 Enabling tap-to-select mode...');
    
    // Remove current overlay
    if (overlayRef.current) {
      overlayRef.current.remove();
    }
    
    // Update instructions
    const instructions = document.querySelector('.screenshot-overlay') || 
                        document.createElement('div');
    instructions.textContent = 'Tik op een element om het te selecteren';
    
    // Add element highlighting on hover/touch
    const highlightElement = (element: HTMLElement) => {
      element.style.outline = '3px solid #007AFF';
      element.style.outlineOffset = '2px';
    };
    
    const removeHighlight = (element: HTMLElement) => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    };
    
    // Add event listeners to all elements
    const elements = document.querySelectorAll('*:not([data-screenshot-element])');
    elements.forEach(el => {
      const element = el as HTMLElement;
      
      const handleTouch = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = element.getBoundingClientRect();
        setSelectedElement(element);
        setSelectedArea({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        });
        
        console.log('✅ Element selected via tap:', element.tagName);
        stopScreenshotMode();
        setIsOpen(true);
      };
      
      element.addEventListener('click', handleTouch);
      element.addEventListener('touchend', handleTouch);
      element.addEventListener('mouseenter', () => highlightElement(element));
      element.addEventListener('mouseleave', () => removeHighlight(element));
      element.addEventListener('touchstart', () => highlightElement(element));
    });
  };

  const stopScreenshotMode = () => {
    console.log('🛑 Stopping screenshot mode...');
    setIsScreenshotMode(false);
    
    // Remove overlay and all child elements
    const screenshotElements = document.querySelectorAll('.screenshot-overlay, .screenshot-selection-box, [data-screenshot-element]');
    screenshotElements.forEach(el => el.remove());
    
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
    const additionalElements = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
    additionalElements.forEach(element => {
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

  const captureScreenshot = async (): Promise<string | null> => {
    try {
      // Use html2canvas to capture the selected area or full page
      const html2canvas = (await import('html2canvas')).default;
      
      let targetElement: HTMLElement;
      
      if (selectedArea) {
        // Capture selected area
        const canvas = await html2canvas(document.body, {
          x: selectedArea.x,
          y: selectedArea.y,
          width: selectedArea.width,
          height: selectedArea.height,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        });
        return canvas.toDataURL('image/png');
      } else if (selectedElement) {
        // Capture selected element
        const canvas = await html2canvas(selectedElement, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        });
        return canvas.toDataURL('image/png');
      } else {
        // Capture full page
        const canvas = await html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        });
        return canvas.toDataURL('image/png');
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      toast.error('Fout bij maken van screenshot');
      return null;
    }
  };

  const uploadScreenshot = async (screenshotData: string): Promise<string | null> => {
    try {
      // Convert base64 to blob
      const base64Data = screenshotData.split(',')[1];
      const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
      
      // Create FormData
      const formData = new FormData();
      formData.append('screenshot', blob, 'screenshot.png');
      
      // Upload to API
      const response = await fetch('/api/upload-screenshot', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.url) {
        return result.url;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast.error('Fout bij uploaden van screenshot');
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Beschrijving is verplicht');
      return;
    }

    setIsSubmitting(true);

    try {
      // Capture screenshot if area or element is selected
      let screenshotUrl: string | null = null;
      
      if (selectedArea || selectedElement) {
        toast.loading('Screenshot maken...');
        const screenshotData = await captureScreenshot();
        
        if (screenshotData) {
          toast.loading('Screenshot uploaden...');
          screenshotUrl = await uploadScreenshot(screenshotData);
        }
        
        toast.dismiss();
      }

      const noteData = {
        test_user_id: user?.id || 'unknown',
        type: noteType,
        page_url: currentPage,
        element_selector: selectedElement ? getElementSelector(selectedElement) : undefined,
        area_selection: selectedArea,
        description: description.trim(),
        priority,
        screenshot_url: screenshotUrl
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

  // Only show for test users
  if (!isTestUser) return null;

  return (
    <>
      {/* Screenshot Button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startScreenshotMode();
        }}
        disabled={isScreenshotMode}
        className="fixed right-4 bottom-20 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Bug melden met screenshot (mobiel-vriendelijk)"
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
                }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setNoteType('bug');
                  }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setNoteType('improvement');
                  }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setNoteType('general');
                  }}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-[#232D1A] text-gray-300 hover:bg-[#3A4D23] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit();
                }}
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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowNotes(!showNotes);
        }}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowNotes(false);
              }}
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