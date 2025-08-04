import React, { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface VideoUploadProps {
  currentVideoUrl?: string;
  onVideoUploaded: (url: string) => void;
  onVideoUploadStart?: () => void;
  onVideoUploadError?: (error: string) => void;
  className?: string;
}

export default function VideoUpload({
  currentVideoUrl,
  onVideoUploaded,
  onVideoUploadStart,
  onVideoUploadError,
  className = ""
}: VideoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug function to check Supabase configuration
  const debugSupabaseConfig = () => {
    console.log('🔍 ===== SUPABASE CONFIG DEBUG =====');
    console.log('🔧 Environment variables:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
    });
    console.log('🔗 Supabase client:', {
      hasSupabase: !!supabase,
      hasStorage: !!supabase?.storage,
      hasFrom: !!supabase?.storage?.from,
      hasUpload: !!supabase?.storage?.from?.('test')?.upload
    });
    console.log('📦 Supabase import:', {
      supabaseType: typeof supabase,
      storageType: typeof supabase?.storage
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    // Debug Supabase config before upload
    debugSupabaseConfig();
    
    await uploadVideo(file);
  };

  const startProcessingSteps = (urlData: any, file: File, startTime: number) => {
    console.log('🔄 Starting processing steps...');
    
    // Set processing state
    setIsUploading(false);
    setIsProcessing(true);
    setUploadStatus('Upload voltooid!');
    setUploadProgress(100);
    setProcessingStatus('Video verwerken...');
    setProcessingProgress(0);
    
    // Fast processing simulation - only 800ms total
    const processingSteps = [
      { name: 'Video verwerken...', progress: 33 },
      { name: 'URL genereren...', progress: 66 },
      { name: 'Voltooid!', progress: 100 }
    ];
    
    let currentStep = 0;
    const processingInterval = setInterval(() => {
      const step = processingSteps[currentStep];
      if (!step) {
        clearInterval(processingInterval);
        console.log('🔄 Processing steps complete, clearing interval');
        return;
      }
      
      setProcessingProgress(step.progress);
      setProcessingStatus(step.name);
      
      console.log('⚙️ Processing step:', step.name, step.progress + '%');
      
      currentStep++;
    }, 200); // Much faster interval
    
    // Complete processing quickly
    setTimeout(() => {
      console.log('✅ ===== PROCESSING COMPLETE =====');
      const totalDuration = Date.now() - startTime;
      console.log('⏱️ Total time:', totalDuration + 'ms');
      
      clearInterval(processingInterval);
      setProcessingStatus('Voltooid!');
      setProcessingProgress(100);
      setUploadedBytes(file.size);
      setTimeRemaining('');
      setUploadedVideoUrl(urlData.publicUrl);
      onVideoUploaded(urlData.publicUrl);
      toast.success('Video succesvol geüpload!');
      
      // Final cleanup after processing is complete
      setTimeout(() => {
        setIsProcessing(false);
        console.log('🧹 Processing cleanup complete');
      }, 1000); // Keep processing state visible for 1 second after completion
    }, 800); // Much faster total processing time
  };

  const uploadVideo = async (file: File) => {
    console.log('🚀 ===== VIDEO UPLOAD START =====');
    console.log('📋 File details:', {
      name: file.name,
      size: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // Call upload start callback
    if (onVideoUploadStart) {
      onVideoUploadStart();
    }

    setIsUploading(true);
    setIsProcessing(false);
    setUploadProgress(0);
    setProcessingProgress(0);
    setUploadSpeed(0);
    setUploadedBytes(0);
    setTimeRemaining('');
    setUploadStatus('Voorbereiden...');
    setProcessingStatus('');

    const startTime = Date.now();
    console.log('⏱️ Upload start time:', new Date(startTime).toISOString());

    try {
      console.log('🔄 Starting video upload to Supabase Storage...');
      console.log('📁 File size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

      // Generate unique filename
      const timestamp = new Date().toISOString().split('T')[0];
      const fileExt = file.name.split('.').pop();
      const randomSuffix = Math.random().toString(36).substring(2);
      const filename = `${timestamp}-${randomSuffix}.${fileExt}`;
      const filePath = `exercises/${filename}`;

      console.log('📁 Generated file path:', filePath);
      console.log('🔧 Upload configuration:', {
        bucket: 'workout-videos',
        path: filePath,
        cacheControl: '3600',
        upsert: false
      });

      // Start progress tracking
      console.log('📊 Starting progress tracking...');
      setUploadStatus('Uploaden...');
      setUploadProgress(5);

      // Simulate progress during upload (0-100%)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(100, prev + Math.random() * 3);
          
          // Calculate speed and time
          const elapsed = (Date.now() - startTime) / 1000;
          const uploaded = (file.size * newProgress) / 100;
          const speed = uploaded / Math.max(elapsed, 1);
          
          setUploadedBytes(uploaded);
          setUploadSpeed(speed);
          
          // Calculate remaining time
          const remaining = file.size - uploaded;
          const remainingTime = remaining / Math.max(speed, 1);
          
          if (remainingTime > 60) {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = Math.floor(remainingTime % 60);
            setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')} resterend`);
          } else {
            setTimeRemaining(`${Math.floor(remainingTime)}s resterend`);
          }
          
          console.log('📈 Upload progress:', {
            progress: newProgress.toFixed(1) + '%',
            uploaded: (uploaded / (1024 * 1024)).toFixed(1) + ' MB',
            speed: (speed / (1024 * 1024)).toFixed(1) + ' MB/s',
            elapsed: elapsed.toFixed(1) + 's',
            remaining: timeRemaining
          });
          
          // When upload reaches 100%, just stop the progress interval
          // The actual processing will start after the upload completes
          if (newProgress >= 100) {
            console.log('🔄 Upload progress complete, stopping interval...');
            clearInterval(progressInterval);
          }
          
          return newProgress;
        });
      }, 300);

      // Upload to Supabase Storage (same pattern as PDFUpload)
      console.log('🚀 Starting Supabase upload...');
      console.log('🔗 Supabase client check:', {
        hasSupabase: !!supabase,
        hasStorage: !!supabase?.storage,
        hasFrom: !!supabase?.storage?.from
      });

      // Skip bucket check - try direct upload instead
      console.log('🚀 Attempting direct upload to workout-videos bucket...');

      const uploadStartTime = Date.now();
      const { data, error } = await supabase.storage
        .from('workout-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      const uploadDuration = Date.now() - uploadStartTime;
      console.log('⏱️ Upload duration:', uploadDuration + 'ms');

      // Clear progress interval
      clearInterval(progressInterval);
      console.log('🧹 Upload progress interval cleared');

      if (error) {
        console.error('❌ ===== UPLOAD ERROR =====');
        console.error('🚨 Error details:', {
          message: error.message,
          name: error.name
        });
        console.error('📁 Upload context:', {
          bucket: 'workout-videos',
          path: filePath,
          fileSize: file.size,
          fileType: file.type,
          uploadDuration
        });
        
        // Call error callback
        if (onVideoUploadError) {
          onVideoUploadError(error.message);
        }
        
        throw error;
      }

      if (!data?.path) {
        console.error('❌ ===== NO PATH ERROR =====');
        console.error('🚨 Upload succeeded but no path returned');
        console.error('📊 Upload result:', data);
        
        const errorMsg = 'No file path returned from upload';
        if (onVideoUploadError) {
          onVideoUploadError(errorMsg);
        }
        
        throw new Error(errorMsg);
      }

      console.log('✅ ===== UPLOAD SUCCESS =====');
      console.log('📁 Upload result:', {
        path: data.path,
        id: data.id,
        fullPath: data.fullPath
      });
      
      // Get public URL immediately
      console.log('🔗 Getting public URL...');
      const { data: urlData } = supabase.storage
        .from('workout-videos')
        .getPublicUrl(data.path);

      console.log('🌐 Public URL result:', {
        publicUrl: urlData.publicUrl,
        path: data.path
      });

      // Start processing steps with the correct parameters
      startProcessingSteps(urlData, file, startTime);

    } catch (error: any) {
      console.error('❌ ===== UPLOAD FAILED =====');
      console.error('🚨 Final error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      console.error('📊 Final state:', {
        progress: uploadProgress,
        status: uploadStatus,
        uploadedBytes,
        timeRemaining
      });
      
      // Call error callback if provided
      if (onVideoUploadError) {
        onVideoUploadError(error.message || 'Onbekende fout');
      } else {
        toast.error(`Upload mislukt: ${error.message || 'Onbekende fout'}`);
      }
      
      setUploadProgress(0);
      setProcessingProgress(0);
      setUploadStatus('Fout opgetreden');
      setProcessingStatus('Fout opgetreden');
      setTimeRemaining('');
    } finally {
      console.log('🧹 ===== UPLOAD CLEANUP =====');
      // Only reset upload state, don't reset processing state
      setIsUploading(false);
      setUploadSpeed(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      console.log('✅ Upload process finished');
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

  const handleRemove = async () => {
    if (!currentVideoUrl) return;
    
    try {
      console.log('🗑️ Removing video:', currentVideoUrl);
      
      // Extract path from public URL
      const path = currentVideoUrl.split('/workout-videos/')[1];
      if (!path) {
        console.error('❌ Could not extract path from URL:', currentVideoUrl);
        toast.error('Ongeldige video URL');
        return;
      }
      
      console.log('📁 Removing file from storage:', path);
      
      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('workout-videos')
        .remove([decodeURIComponent(path)]);
      
      if (storageError) {
        console.error('❌ Storage removal failed:', storageError);
        toast.error('Verwijderen uit storage mislukt');
        return;
      }
      
      console.log('✅ Video removed from storage successfully');
      
      // Update local state
      setUploadedVideoUrl(null);
      onVideoUploaded('');
      
      toast.success('Video succesvol verwijderd');
      console.log('✅ Video removal complete');
      
    } catch (error: any) {
      console.error('❌ Failed to remove video:', error);
      toast.error('Verwijderen mislukt: ' + error.message);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Video Display */}
      {(currentVideoUrl || uploadedVideoUrl) && (
        <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
          <div className="flex items-center gap-3 mb-3">
            <PlayIcon className="w-6 h-6 text-[#8BAE5A]" />
            <div className="flex-1">
              <p className="text-[#8BAE5A] font-semibold">Video geüpload</p>
              <p className="text-[#B6C948] text-sm">
                {currentVideoUrl || uploadedVideoUrl}
              </p>
            </div>
            <button 
              onClick={handleRemove} 
              className="p-2 rounded hover:bg-[#232D1A] transition" 
              title="Verwijder video"
            >
              <TrashIcon className="w-5 h-5 text-red-400" />
            </button>
          </div>
          <video 
            src={currentVideoUrl || uploadedVideoUrl || ''} 
            controls 
            className="w-full rounded-lg"
            preload="metadata"
          />
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
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
          onClick={(e) => e.stopPropagation()}
        />

        {(isUploading || isProcessing) ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto"></div>
            <div>
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">
                {isUploading ? uploadStatus : processingStatus}
              </h3>
              
              {/* Upload Progress Bar */}
              {isUploading && (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#B6C948]">Upload:</span>
                      <span className="text-[#8BAE5A] font-semibold">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-[#0A0F0A] rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Upload Details */}
                  <div className="space-y-2 text-sm mb-4">
                    {uploadedBytes > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#B6C948]">Geüpload:</span>
                        <span className="text-[#8BAE5A] font-semibold">
                          {(uploadedBytes / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                    )}
                    
                    {uploadSpeed > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#B6C948]">Snelheid:</span>
                        <span className="text-[#8BAE5A] font-semibold">
                          {(uploadSpeed / (1024 * 1024)).toFixed(1)} MB/s
                        </span>
                      </div>
                    )}
                    
                    {timeRemaining && (
                      <div className="flex justify-between">
                        <span className="text-[#B6C948]">Tijd:</span>
                        <span className="text-[#8BAE5A] font-semibold">{timeRemaining}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Processing Progress Bar */}
              {isProcessing && (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#B6C948]">Verwerken:</span>
                      <span className="text-[#8BAE5A] font-semibold">{Math.round(processingProgress)}%</span>
                    </div>
                    <div className="w-full bg-[#0A0F0A] rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] h-3 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-[#B6C948] mb-2">
                    {processingStatus}
                  </div>
                  
                  <div className="text-xs text-[#B6C948]/70">
                    Stap {Math.ceil(processingProgress / 25)} van 4: {processingStatus}
                  </div>
                </>
              )}
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Bestand Selecteren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 