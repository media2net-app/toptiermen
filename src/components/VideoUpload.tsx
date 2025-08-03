'use client';

import { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

interface VideoUploadProps {
  currentVideoUrl?: string;
  onVideoUploaded: (url: string) => void;
  className?: string;
}

// Create Supabase client for storage
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables not configured');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

export default function VideoUpload({
  currentVideoUrl,
  onVideoUploaded,
  className = ""
}: VideoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [uploadStartTime, setUploadStartTime] = useState<number>(0);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if Supabase is configured
    const checkSupabaseConfig = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setIsSupabaseConfigured(false);
          return;
        }

        // Test connection by trying to list buckets
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error('❌ Supabase storage test failed:', error);
          setIsSupabaseConfigured(false);
        } else {
          console.log('✅ Supabase storage configured successfully');
          setIsSupabaseConfigured(true);
        }
      } catch (error) {
        console.error('❌ Failed to check Supabase config:', error);
        setIsSupabaseConfigured(false);
      }
    };

    checkSupabaseConfig();
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      toast.error('Supabase Storage is niet geconfigureerd. Controleer je environment variables.');
      return;
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Ongeldig video formaat. Ondersteunde formaten: MP4, MOV, AVI, WEBM, MKV, QuickTime');
      return;
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error('Video bestand is te groot. Maximum grootte: 500MB');
      return;
    }

    await uploadVideo(file);
  };

  const uploadVideo = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSpeed(0);
    setTimeRemaining('');
    setUploadedBytes(0);
    const startTime = Date.now();
    setUploadStartTime(startTime);

    try {
      console.log('🔄 Starting video upload to Supabase Storage...');
      console.log('📁 File size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Generate unique filename
      const timestamp = new Date().toISOString().split('T')[0];
      const fileExt = file.name.split('.').pop();
      const randomSuffix = Math.random().toString(36).substring(2);
      const filename = `${timestamp}-${randomSuffix}.${fileExt}`;

      console.log('📁 Uploading to path: exercises/', filename);

      // Simple upload without Promise.race to avoid complications
      console.log('🔄 Starting Supabase upload...');
      const uploadPromise = supabase.storage
        .from('workout-videos')
        .upload(`exercises/${filename}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Simple progress tracking - just show upload is happening
      let uploadCompleted = false;
      let progressInterval: NodeJS.Timeout | null = null;
      let progress = 0;
      
      progressInterval = setInterval(() => {
        console.log('🔄 Progress interval tick, uploadCompleted:', uploadCompleted);
        if (uploadCompleted) {
          console.log('🔄 Progress interval detected upload completed, clearing...');
          if (progressInterval) clearInterval(progressInterval);
          return;
        }

        // Simple progress that goes up to 90%
        progress = Math.min(90, progress + 2);
        setUploadProgress(progress);
        
        // Calculate upload speed based on elapsed time
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = (file.size * (progress / 100)) / Math.max(elapsed, 1);
        setUploadSpeed(speed);
        setUploadedBytes(file.size * (progress / 100));
        
        if (progress >= 90) {
          console.log('🔄 Progress reached 90%, showing "Verwerken..."');
          setTimeRemaining('Verwerken...');
        } else {
          const remainingPercent = 90 - progress;
          const estimatedSeconds = (remainingPercent / 2) * 0.3; // 0.3 seconds per 2%
          if (estimatedSeconds > 0) {
            const minutes = Math.floor(estimatedSeconds / 60);
            const seconds = Math.floor(estimatedSeconds % 60);
            setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          }
        }

        // Fallback: if upload takes too long, assume it's stuck
        if (elapsed > 60) { // 1 minute timeout
          console.warn('⚠️ Upload taking too long, forcing completion');
          uploadCompleted = true;
          if (progressInterval) clearInterval(progressInterval);
          setUploadProgress(100);
          setTimeRemaining('Timeout - probeer opnieuw');
          setIsUploading(false);
        }
      }, 300);

      // Wait for upload to complete with timeout
      console.log('🔄 Waiting for upload to complete...');
      console.log('⏱️ Start time:', new Date().toISOString());
      
      let data: any, error: any;
      try {
        // Add a timeout to the upload promise
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout after 2 minutes')), 120000)
        );
        
        const result = await Promise.race([uploadPromise, timeoutPromise]) as any;
        data = result.data;
        error = result.error;
        console.log('✅ Upload promise resolved');
        console.log('📊 Upload result:', { data, error });
      } catch (promiseError) {
        console.error('❌ Upload promise failed:', promiseError);
        throw promiseError;
      }

      // Mark upload as completed and clear progress interval
      uploadCompleted = true;
      console.log('🔄 Clearing progress interval...');
      if (progressInterval) {
        clearInterval(progressInterval);
        console.log('✅ Progress interval cleared');
      } else {
        console.log('⚠️ Progress interval was null');
      }

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error(error.message || 'Upload failed');
      }

      if (!data?.path) {
        throw new Error('No file path returned from upload');
      }

      // Immediately show completion
      setUploadProgress(100);
      setTimeRemaining('Voltooid!');
      setUploadedBytes(file.size);

      console.log('✅ Video uploaded successfully:', data.path);
      console.log('⏱️ Total upload time:', ((Date.now() - startTime) / 1000).toFixed(2), 'seconds');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('workout-videos')
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;

      // Short delay to show completion, then finish
      setTimeout(() => {
        setUploadedVideoUrl(publicUrl);
        onVideoUploaded(publicUrl);
        toast.success('Video succesvol geüpload naar Supabase Storage!');
      }, 500);

    } catch (error: any) {
      console.error('❌ Video upload failed:', error);
      toast.error(`Upload mislukt: ${error.message || 'Onbekende fout'}`);
      setUploadProgress(0);
      setTimeRemaining('');
      setUploadSpeed(0);
      setUploadedBytes(0);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await uploadVideo(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Show configuration error if Supabase is not configured
  if (isSupabaseConfigured === false) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-500">
                Supabase Storage Niet Geconfigureerd
              </h3>
              <p className="text-red-400 mt-1">
                Video upload is niet beschikbaar. Controleer je <code className="bg-red-500/20 px-2 py-1 rounded text-red-300">NEXT_PUBLIC_SUPABASE_URL</code> en <code className="bg-red-500/20 px-2 py-1 rounded text-red-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking configuration
  if (isSupabaseConfigured === null) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#B6C948]"></div>
            <div>
              <h3 className="text-lg font-semibold text-[#8BAE5A]">
                Supabase Storage Controleren...
              </h3>
              <p className="text-[#B6C948] mt-1">
                Bezig met het controleren van de Supabase configuratie.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Video Display */}
      {(currentVideoUrl || uploadedVideoUrl) && (
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
            <h3 className="text-lg font-semibold text-[#8BAE5A]">
              Huidige Video
            </h3>
          </div>
          <video
            src={uploadedVideoUrl || currentVideoUrl}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: '300px' }}
          />
          <div className="mt-2 text-sm text-[#B6C948]">
            <a
              href={uploadedVideoUrl || currentVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8BAE5A] hover:text-[#B6C948] underline"
            >
              Open video in nieuwe tab
            </a>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isUploading 
            ? 'border-[#B6C948] bg-[#232D1A]/50' 
            : 'border-[#3A4D23] bg-[#232D1A]/30 hover:border-[#8BAE5A] hover:bg-[#232D1A]/50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto"></div>
            <div>
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">
                Video Uploaden...
              </h3>
              
              {/* Progress Bar */}
              <div className="w-full bg-[#0A0F0A] rounded-full h-3 mb-3">
                <div
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              {/* Progress Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#B6C948]">Voortgang:</span>
                  <span className="text-[#8BAE5A] font-semibold">{Math.round(uploadProgress)}%</span>
                </div>
                
                {uploadSpeed > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B6C948]">Snelheid:</span>
                    <span className="text-[#8BAE5A] font-semibold">
                      {(uploadSpeed / (1024 * 1024)).toFixed(1)} MB/s
                    </span>
                  </div>
                )}
                
                {uploadedBytes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B6C948]">Geüpload:</span>
                    <span className="text-[#8BAE5A] font-semibold">
                      {(uploadedBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                )}
                
                {timeRemaining && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B6C948]">
                      {timeRemaining === 'Verwerken...' ? 'Status:' : 'Resterende tijd:'}
                    </span>
                    <span className={`font-semibold ${
                      timeRemaining === 'Verwerken...' 
                        ? 'text-[#FFD700] animate-pulse' 
                        : timeRemaining === 'Voltooid!' 
                        ? 'text-[#8BAE5A]' 
                        : 'text-[#8BAE5A]'
                    }`}>
                      {timeRemaining}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CloudArrowUpIcon className="w-12 h-12 text-[#8BAE5A] mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">
                Video Uploaden
              </h3>
              <p className="text-[#B6C948] mb-4">
                Sleep een video bestand hierheen of klik om te selecteren
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Bestand Selecteren
              </button>
            </div>
            <div className="text-xs text-[#B6C948]/70">
              Ondersteunde formaten: MP4, MOV, AVI, WEBM, MKV, QuickTime<br />
              Maximum grootte: 500MB
            </div>
          </div>
        )}
      </div>

      {/* URL Input for Manual Entry */}
      <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
        <h3 className="text-lg font-semibold text-[#8BAE5A] mb-3">
          Of voer een video URL in
        </h3>
        <div className="flex space-x-2">
          <input
            type="url"
            placeholder="https://example.com/video.mp4"
            className="flex-1 bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-3 py-2 text-[#B6C948] placeholder-[#B6C948]/50 focus:outline-none focus:border-[#8BAE5A]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const url = input.value.trim();
                if (url) {
                  onVideoUploaded(url);
                  input.value = '';
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[type="url"]') as HTMLInputElement;
              const url = input.value.trim();
              if (url) {
                onVideoUploaded(url);
                input.value = '';
              }
            }}
            className="bg-[#3A4D23] hover:bg-[#232D1A] text-[#8BAE5A] font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
} 