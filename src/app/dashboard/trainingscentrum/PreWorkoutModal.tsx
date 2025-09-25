'use client';

import { useState } from 'react';
import { 
  XMarkIcon, 
  PlayIcon, 
  CheckIcon,
  FireIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface PreWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemaId: string;
  dayNumber: number;
  schemaName: string;
  focusArea: string;
  estimatedDuration: string;
  user?: any;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export default function PreWorkoutModal({
  isOpen,
  onClose,
  schemaId,
  dayNumber,
  schemaName,
  focusArea,
  estimatedDuration,
  user: userProp
}: PreWorkoutModalProps) {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [selectedMode, setSelectedMode] = useState<'interactive' | 'quick'>('interactive');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'warmup', label: 'Warm-up doen (5 min)', checked: false },
    { id: 'water', label: 'Water klaar', checked: false },
    { id: 'space', label: 'Ruimte vrij', checked: false },
    { id: 'music', label: 'Motiverende muziek', checked: false }
  ]);
  const [isStarting, setIsStarting] = useState(false);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const startWorkout = async () => {
    if (!user?.id) return;

    setIsStarting(true);

    try {
      console.log('Starting workout session:', {
        userId: user.id,
        schemaId: schemaId,
        dayNumber: dayNumber,
        mode: selectedMode
      });

      // Start workout session
      const response = await fetch('/api/workout-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          schemaId: schemaId,
          dayNumber: dayNumber,
          mode: selectedMode
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error('Failed to start workout session');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Navigate to appropriate page based on mode
        if (selectedMode === 'interactive') {
          // For interactive mode, navigate to the actual workout page with sessionId
          console.log('🎯 Interactive workout started');
          onClose();
          router.push(`/dashboard/trainingscentrum/workout/${schemaId}/${dayNumber}?sessionId=${data.session.id}`);
        } else {
          // For quick mode, complete immediately and go back
          await completeQuickWorkout(data.session.id);
        }
      }
    } catch (error) {
      console.error('Error starting workout:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const completeQuickWorkout = async (sessionId: string) => {
    try {
      console.log('🏁 Completing quick workout:', sessionId);
      
      const response = await fetch('/api/workout-sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          userId: userProp?.id || user?.id,
          schemaId: schemaId,
          dayNumber: dayNumber,
          rating: 5,
          notes: 'Quick completion'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quick workout completed:', data);
        
        onClose();
        // Show success message and redirect
        router.push('/dashboard/mijn-trainingen');
        // Force a hard refresh to show updated completion status
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        console.error('❌ Error completing quick workout:', response.status);
      }
    } catch (error) {
      console.error('❌ Error completing quick workout:', error);
    }
  };

  const checkedItems = checklist.filter(item => item.checked).length;
  const totalItems = checklist.length;

  console.log('🎭 Modal render state:', { isOpen, schemaId, dayNumber, schemaName });
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-2xl p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mr-4">
              <FireIcon className="w-8 h-8 text-[#181F17]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Start Training</h2>
              <p className="text-[#8BAE5A]">Dag {dayNumber}</p>
            </div>
          </div>
        </div>

        {/* Training Info */}
        <div className="bg-[#0F1419]/50 rounded-xl p-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{schemaName}</h3>
            <p className="text-[#8BAE5A] text-sm">{focusArea}</p>
          </div>
        </div>

        {/* Training Mode Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Kies je training mode:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedMode('interactive')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMode === 'interactive'
                  ? 'border-[#8BAE5A] bg-[#232D1A]'
                  : 'border-[#3A4D23] bg-[#181F17] hover:border-[#5A6D43]'
              }`}
            >
              <div className="flex items-center mb-2">
                <PlayIcon className="w-6 h-6 text-[#8BAE5A] mr-2" />
                <span className="font-semibold text-white">Interactive Training</span>
              </div>
              <p className="text-sm text-gray-400">
                Timer-based training met oefening tracking en real-time feedback
              </p>
            </button>

            <button
              onClick={() => setSelectedMode('quick')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMode === 'quick'
                  ? 'border-[#8BAE5A] bg-[#232D1A]'
                  : 'border-[#3A4D23] bg-[#181F17] hover:border-[#5A6D43]'
              }`}
            >
              <div className="flex items-center mb-2">
                <CheckIcon className="w-6 h-6 text-[#8BAE5A] mr-2" />
                <span className="font-semibold text-white">Quick Complete</span>
              </div>
              <p className="text-sm text-gray-400">
                Direct voltooien zonder tracking - voor ervaren trainers
              </p>
            </button>
          </div>
        </div>

        {/* Pre-Workout Checklist */}
        {selectedMode === 'interactive' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Pre-Workout Checklist ({checkedItems}/{totalItems})
            </h3>
            <div className="space-y-3">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-center w-full p-3 rounded-lg bg-[#0F1419]/50 hover:bg-[#0F1419]/70 transition-colors"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                    item.checked
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]'
                      : 'border-[#3A4D23]'
                  }`}>
                    {item.checked && <CheckIcon className="w-3 h-3 text-[#181F17]" />}
                  </div>
                  <span className={`text-sm ${item.checked ? 'text-[#8BAE5A]' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warning for Quick Mode */}
        {selectedMode === 'quick' && (
          <div className="mb-6 p-4 bg-[#f0a14f]/10 border border-[#f0a14f]/30 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-[#f0a14f] mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[#f0a14f] font-semibold text-sm">Quick Mode</p>
                <p className="text-gray-400 text-sm mt-1">
                  Je training wordt direct als voltooid gemarkeerd zonder gedetailleerde tracking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={startWorkout}
            disabled={isStarting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold rounded-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#181F17] mr-2"></div>
                Starten...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <StarIcon className="w-5 h-5 mr-2" />
                {selectedMode === 'interactive' ? 'Start Interactive Training' : 'Quick Complete'}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 