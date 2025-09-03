"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getVideoDuration, formatDuration } from '@/utils/videoDurationExtractor';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AdminButton } from '@/components/admin';

interface Lesson {
  id: string;
  title: string;
  video_url: string | null;
  duration: string;
  module_title?: string;
}

interface VideoDurationExtractorProps {
  lessons: Lesson[];
  onUpdate?: () => void;
}

export default function VideoDurationExtractor({ lessons, onUpdate }: VideoDurationExtractorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    processed: number;
    updated: number;
    errors: number;
    details: Array<{
      lessonId: string;
      title: string;
      status: 'success' | 'error' | 'skipped';
      oldDuration: string;
      newDuration?: string;
      error?: string;
    }>;
  }>({
    processed: 0,
    updated: 0,
    errors: 0,
    details: []
  });

  const videoLessons = lessons.filter(lesson => 
    lesson.video_url && lesson.video_url.trim() !== ''
  );

  const extractAllDurations = async () => {
    if (!videoLessons.length) {
      alert('Geen video lessen gevonden om te verwerken');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults({
      processed: 0,
      updated: 0,
      errors: 0,
      details: []
    });

    const newResults = {
      processed: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    };

    for (let i = 0; i < videoLessons.length; i++) {
      const lesson = videoLessons[i];
      
      try {
        console.log(`🎥 Processing ${i + 1}/${videoLessons.length}: ${lesson.title}`);
        
        // Extract video duration
        const durationInfo = await getVideoDuration(lesson.video_url!);
        
        if (durationInfo) {
          const newDuration = durationInfo.formatted;
          
          // Only update if duration is different
          if (newDuration !== lesson.duration) {
            // Update in database
            const { error: updateError } = await supabase
              .from('academy_lessons')
              .update({
                duration: newDuration,
                updated_at: new Date().toISOString()
              })
              .eq('id', lesson.id);

            if (updateError) {
              throw updateError;
            }

            newResults.details.push({
              lessonId: lesson.id,
              title: lesson.title,
              status: 'success',
              oldDuration: lesson.duration,
              newDuration: newDuration
            });
            
            newResults.updated++;
            console.log(`✅ Updated: ${lesson.title} - ${lesson.duration} → ${newDuration}`);
          } else {
            newResults.details.push({
              lessonId: lesson.id,
              title: lesson.title,
              status: 'skipped',
              oldDuration: lesson.duration,
              newDuration: newDuration
            });
            
            console.log(`⏭️ Skipped: ${lesson.title} - duration unchanged (${newDuration})`);
          }
        } else {
          throw new Error('Could not extract video duration');
        }
        
      } catch (error: any) {
        console.error(`❌ Error processing ${lesson.title}:`, error);
        
        newResults.details.push({
          lessonId: lesson.id,
          title: lesson.title,
          status: 'error',
          oldDuration: lesson.duration,
          error: error.message
        });
        
        newResults.errors++;
      }
      
      newResults.processed++;
      setProgress(Math.round((newResults.processed / videoLessons.length) * 100));
      setResults({ ...newResults });
    }

    setIsProcessing(false);
    
    if (onUpdate) {
      onUpdate();
    }
    
    console.log('🎉 Video duration extraction completed!');
    console.log(`📊 Results: ${newResults.updated} updated, ${newResults.errors} errors`);
  };

  const resetResults = () => {
    setResults({
      processed: 0,
      updated: 0,
      errors: 0,
      details: []
    });
    setProgress(0);
  };

  return (
    <div className="bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23]">
      <div className="flex items-center gap-3 mb-6">
        <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
        <h3 className="text-xl font-bold text-[#8BAE5A]">Video Duur Extractor</h3>
      </div>

      <div className="space-y-4">
        <p className="text-[#B6C948]">
          Automatisch de werkelijke video durations extraheren en bijwerken.
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>📊 Totaal lessen: {lessons.length}</span>
          <span>🎥 Video lessen: {videoLessons.length}</span>
        </div>

        {!isProcessing && results.processed === 0 && (
          <AdminButton
            onClick={extractAllDurations}
            variant="primary"
            disabled={videoLessons.length === 0}
          >
            <ClockIcon className="w-5 h-5 mr-2" />
            Start Duur Extractie
          </AdminButton>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8BAE5A]"></div>
              <span className="text-[#8BAE5A] font-semibold">
                Verwerking... {progress}%
              </span>
            </div>
            
            <div className="w-full bg-[#181F17] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-400">
              {results.processed}/{videoLessons.length} lessen verwerkt
            </p>
          </div>
        )}

        {!isProcessing && results.processed > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-[#181F17] rounded-lg p-3">
                <div className="text-2xl font-bold text-[#8BAE5A]">{results.updated}</div>
                <div className="text-sm text-gray-400">Bijgewerkt</div>
              </div>
              <div className="bg-[#181F17] rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{results.details.filter(d => d.status === 'skipped').length}</div>
                <div className="text-sm text-gray-400">Overgeslagen</div>
              </div>
              <div className="bg-[#181F17] rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">{results.errors}</div>
                <div className="text-sm text-gray-400">Errors</div>
              </div>
            </div>

            <div className="flex gap-3">
              <AdminButton
                onClick={resetResults}
                variant="secondary"
                size="sm"
              >
                Reset
              </AdminButton>
              <AdminButton
                onClick={extractAllDurations}
                variant="primary"
                size="sm"
              >
                Opnieuw Uitvoeren
              </AdminButton>
            </div>
          </div>
        )}

        {results.details.length > 0 && (
          <div className="mt-6">
            <h4 className="text-[#8BAE5A] font-semibold mb-3">Gedetailleerde Resultaten:</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {results.details.map((detail, index) => (
                <div 
                  key={detail.lessonId} 
                  className="flex items-center gap-3 p-3 bg-[#181F17] rounded-lg text-sm"
                >
                  {detail.status === 'success' && (
                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                  {detail.status === 'skipped' && (
                    <ClockIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  )}
                  {detail.status === 'error' && (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1">
                    <div className="text-[#8BAE5A] font-medium">{detail.title}</div>
                    {detail.status === 'success' && (
                      <div className="text-gray-400">
                        {detail.oldDuration} → {detail.newDuration}
                      </div>
                    )}
                    {detail.status === 'skipped' && (
                      <div className="text-gray-400">
                        Ongewijzigd: {detail.oldDuration}
                      </div>
                    )}
                    {detail.status === 'error' && (
                      <div className="text-red-400">
                        Error: {detail.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
