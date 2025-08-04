'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import VideoUpload from '@/components/VideoUpload';
import PDFUpload from '@/components/PDFUpload';
import { toast } from 'react-hot-toast';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exerciseData: any) => void;
  exercise?: any; // For editing
}

const muscleGroups = [
  'Borst', 'Rug', 'Benen', 'Schouders', 'Armen', 'Core'
];

const equipmentTypes = [
  'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Resistance Band', 'Cable Machine', 'Leg Press Machine', 'Lat Pulldown Machine', 'Leg Extension Machine', 'Leg Curl Machine', 'Calf Machine', 'Pull-up Bar', 'Dip Bars'
];

export default function ExerciseModal({ isOpen, onClose, onSave, exercise }: ExerciseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    primary_muscle: '',
    secondary_muscles: [] as string[],
    equipment: '',
    video_url: '',
    instructions: '',
    worksheet_url: '' as string | null
  });

  const [newSecondaryMuscle, setNewSecondaryMuscle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name || '',
        primary_muscle: exercise.primary_muscle || '',
        secondary_muscles: exercise.secondary_muscles || [],
        equipment: exercise.equipment || '',
        video_url: exercise.video_url || '',
        instructions: exercise.instructions || '',
        worksheet_url: exercise.worksheet_url || null
      });
    } else {
      setFormData({
        name: '',
        primary_muscle: '',
        secondary_muscles: [],
        equipment: '',
        video_url: '',
        instructions: '',
        worksheet_url: null
      });
    }
  }, [exercise, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 ===== EXERCISE MODAL SUBMIT =====');
    console.log('📋 Form data:', formData);
    console.log('📋 Is uploading:', isUploading);
    
    if (!formData.name || !formData.primary_muscle || !formData.equipment || !formData.instructions) {
      console.log('❌ Validation failed - missing required fields');
      toast.error('Vul alle verplichte velden in');
      return;
    }

    // Prevent submission if upload is in progress
    if (isUploading) {
      console.log('❌ Upload in progress - preventing submission');
      toast.error('Wacht tot de video upload is voltooid');
      return;
    }

    console.log('✅ Validation passed - calling onSave');
    console.log('💾 Final exercise data to save:', formData);
    onSave(formData);
  };

  const handleVideoUploaded = (url: string) => {
    console.log('🎯 ===== VIDEO UPLOADED CALLBACK IN EXERCISE MODAL =====');
    console.log('📱 Received URL:', url);
    console.log('📱 Previous video_url:', formData.video_url);
    
    setFormData(prev => ({ ...prev, video_url: url }));
    setIsUploading(false);
    toast.success('Video succesvol geüpload!');
    console.log('✅ Exercise modal state updated with new video URL');
  };

  const handleVideoUploadStart = () => {
    console.log('🚀 Video upload started in exercise modal');
    setIsUploading(true);
  };

  const handleVideoUploadError = (error: string) => {
    console.error('❌ Video upload error in exercise modal:', error);
    setIsUploading(false);
    toast.error(`Video upload mislukt: ${error}`);
  };

  const addSecondaryMuscle = () => {
    if (newSecondaryMuscle.trim() && !formData.secondary_muscles.includes(newSecondaryMuscle.trim())) {
      setFormData({
        ...formData,
        secondary_muscles: [...formData.secondary_muscles, newSecondaryMuscle.trim()]
      });
      setNewSecondaryMuscle('');
    }
  };

  const removeSecondaryMuscle = (muscle: string) => {
    setFormData({
      ...formData,
      secondary_muscles: formData.secondary_muscles.filter(m => m !== muscle)
    });
  };

  if (!isOpen) {
    console.log('🚫 ExerciseModal: Modal is closed');
    return null;
  }

  console.log('✅ ExerciseModal: Modal is open, exercise:', exercise);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-[#232D1A] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#3A4D23]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#8BAE5A]">
            {exercise ? 'Bewerk Oefening' : 'Nieuwe Oefening'}
            {isUploading && (
              <span className="ml-2 text-sm text-[#B6C948]">
                (Video uploaden...)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`p-2 rounded-xl transition-colors duration-200 ${
              isUploading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#181F17]'
            }`}
            title={isUploading ? 'Wacht tot upload voltooid is' : 'Sluiten'}
          >
            <XMarkIcon className="w-6 h-6 text-[#B6C948]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Naam */}
          <div>
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Naam *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
              placeholder="Bijv. Bench Press"
              disabled={isUploading}
            />
          </div>

          {/* Primaire Spiergroep */}
          <div>
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Primaire Spiergroep *
            </label>
            <select
              value={formData.primary_muscle}
              onChange={(e) => setFormData({ ...formData, primary_muscle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              disabled={isUploading}
            >
              <option value="">Selecteer spiergroep</option>
              {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Secundaire Spiergroepen */}
          <div>
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Secundaire Spiergroepen
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSecondaryMuscle}
                onChange={(e) => setNewSecondaryMuscle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaryMuscle())}
                className="flex-1 px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                placeholder="Voeg spiergroep toe"
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={addSecondaryMuscle}
                disabled={isUploading}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isUploading
                    ? 'bg-[#3A4D23] text-[#8BAE5A] opacity-50 cursor-not-allowed'
                    : 'bg-[#8BAE5A] text-[#181F17] hover:bg-[#B6C948]'
                }`}
              >
                Toevoegen
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.secondary_muscles.map((muscle, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-[#8BAE5A]/20 text-[#8BAE5A] flex items-center gap-2"
                >
                  {muscle}
                  <button
                    type="button"
                    onClick={() => removeSecondaryMuscle(muscle)}
                    disabled={isUploading}
                    className={`hover:text-red-400 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Materiaal */}
          <div>
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Materiaal *
            </label>
            <select
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              disabled={isUploading}
            >
              <option value="">Selecteer materiaal</option>
              {equipmentTypes.map(equipment => (
                <option key={equipment} value={equipment}>{equipment}</option>
              ))}
            </select>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Oefening Video
            </label>
            <VideoUpload
              currentVideoUrl={formData.video_url}
              onVideoUploaded={handleVideoUploaded}
              onVideoUploadStart={handleVideoUploadStart}
              onVideoUploadError={handleVideoUploadError}
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Werkblad (PDF)
            </label>
            <PDFUpload
              currentPDFUrl={formData.worksheet_url}
              onPDFUploaded={(url) => setFormData({ ...formData, worksheet_url: url })}
            />
          </div>

          {/* Instructies */}
          <div>
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Instructies *
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948] resize-none"
              placeholder="Beschrijf hoe de oefening uitgevoerd moet worden..."
              disabled={isUploading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isUploading
                  ? 'bg-[#3A4D23] text-[#8BAE5A] opacity-50 cursor-not-allowed'
                  : 'bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A]'
              }`}
            >
              {isUploading ? 'Wachten...' : 'Annuleren'}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isUploading
                  ? 'bg-[#3A4D23] text-[#8BAE5A] opacity-50 cursor-not-allowed'
                  : 'bg-[#8BAE5A] text-[#181F17] hover:bg-[#B6C948]'
              }`}
            >
              {isUploading ? 'Uploaden...' : (exercise ? 'Bijwerken' : 'Toevoegen')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 