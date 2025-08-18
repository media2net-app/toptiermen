"use client";

import React, { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon, PlayIcon, TrashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface AcademyVideoUploadProps {
  currentVideoUrl?: string;
  onVideoUploaded: (url: string) => void;
  onVideoUploadStart?: () => void;
  onVideoUploadError?: (error: string) => void;
  className?: string;
  moduleId?: string;
  lessonId?: string;
}

export default function AcademyVideoUpload({
  currentVideoUrl,
  onVideoUploaded,
  onVideoUploadStart,
  onVideoUploadError,
  className = "",
  moduleId,
  lessonId
}: AcademyVideoUploadProps) {
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
    console.log('🔍 ===== ACADEMY VIDEO UPLOAD DEBUG =====');
    console.log('🎓 Academy video upload configuration:', {
      moduleId,
      lessonId,
      bucket: 'academy-videos'
    });
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
      hasUpload: !!supabase?.storage?.from?.('academy-videos')?.upload
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

    // Validate file size (1GB limit for academy videos)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (file.size > maxSize) {
      toast.error('Academy video bestand is te groot. Maximum grootte: 1GB');
      return;
    }

    // Debug Supabase config before upload
    debugSupabaseConfig();
    
    await uploadVideo(file);
  };

  const startProcessingSteps = (urlData: any, file: File, startTime: number) => {
    console.log('🔄 Starting academy video processing steps...');
    
    // Set processing state
    setIsUploading(false);
    setIsProcessing(true);
    setUploadStatus('Upload voltooid!');
    setUploadProgress(100);
    setProcessingStatus('Academy video verwerken...');
    setProcessingProgress(0);
    
    // Immediate processing - no artificial delays
    console.log('⚡ Starting immediate academy video processing...');
    
    // Complete processing immediately
    setTimeout(() => {
      // Processing complete
      setIsProcessing(false);
      setProcessingProgress(100);
      setProcessingStatus('Academy video gereed!');
      
      // Set the uploaded video URL
      const videoUrl = urlData.publicUrl;
      setUploadedVideoUrl(videoUrl);
      
      // Call the callback
      onVideoUploaded(videoUrl);
      
      const totalDuration = Date.now() - startTime;
      console.log('✅ ===== ACADEMY VIDEO UPLOAD COMPLETE =====');
      console.log('📊 Final stats:', {
        totalDuration: totalDuration + 'ms',
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        videoUrl: videoUrl
      });
      
      toast.success('Academy video succesvol geüpload!');
    }, 100); // Only 100ms for immediate completion
  };

  const uploadVideo = async (file: File) => {
    console.log('🚀 ===== ACADEMY VIDEO UPLOAD START =====');
    console.log('📋 Academy video file details:', {
      name: file.name,
      size: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
      moduleId,
      lessonId
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
    setUploadStatus('Academy video voorbereiden...');
    setProcessingStatus('');

    const startTime = Date.now();
    console.log('⏱️ Academy video upload start time:', new Date(startTime).toISOString());

    try {
      console.log('🔄 Starting academy video upload to Supabase Storage...');
      console.log('📁 Academy video file size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

      // Generate unique filename for academy videos
      const timestamp = new Date().toISOString().split('T')[0];
      const fileExt = file.name.split('.').pop();
      const randomSuffix = Math.random().toString(36).substring(2);
      const filename = `${timestamp}-${randomSuffix}.${fileExt}`;
      
      // Create organized folder structure for academy videos
      let filePath = `academy/${filename}`;
      if (moduleId) {
        filePath = `academy/module-${moduleId}/${filename}`;
      }
      if (lessonId) {
        filePath = `academy/module-${moduleId}/lesson-${lessonId}/${filename}`;
      }

      console.log('📁 Generated academy video file path:', filePath);
      console.log('🔧 Academy video upload configuration:', {
        bucket: 'academy-videos',
        path: filePath,
        cacheControl: '3600',
        upsert: false
      });

      // Start progress tracking
      console.log('📊 Starting academy video progress tracking...');
      setUploadStatus('Academy video uploaden...');
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
          
          console.log('📈 Academy video upload progress:', {
            progress: newProgress.toFixed(1) + '%',
            uploaded: (uploaded / (1024 * 1024)).toFixed(1) + ' MB',
            speed: (speed / (1024 * 1024)).toFixed(1) + ' MB/s',
            elapsed: elapsed.toFixed(1) + 's',
            remaining: timeRemaining
          });
          
          // When upload reaches 100%, just stop the progress interval
          // The actual processing will start after the upload completes
          if (newProgress >= 100) {
            console.log('🔄 Academy video upload progress complete, stopping interval...');
            clearInterval(progressInterval);
          }
          
          return newProgress;
        });
      }, 300);

      // Upload to Supabase Storage - ACADEMY VIDEOS BUCKET
      console.log('🚀 Starting Supabase academy video upload...');
      console.log('🔗 Supabase client check:', {
        hasSupabase: !!supabase,
        hasStorage: !!supabase?.storage,
        hasFrom: !!supabase?.storage?.from
      });

      // Upload to academy-videos bucket
      console.log('🎓 Attempting direct upload to academy-videos bucket...');

      const uploadStartTime = Date.now();
      const { data, error } = await supabase.storage
        .from('academy-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Explicitly set content type for better performance
        });

      const uploadDuration = Date.now() - uploadStartTime;
      console.log('⏱️ Academy video upload duration:', uploadDuration + 'ms');

      // Clear progress interval
      clearInterval(progressInterval);
      console.log('🧹 Academy video upload progress interval cleared');

      if (error) {
        console.error('❌ ===== ACADEMY VIDEO UPLOAD ERROR =====');
        console.error('🚨 Error details:', {
          message: error.message,
          name: error.name
        });
        console.error('📁 Academy video upload context:', {
          bucket: 'academy-videos',
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
        console.error('❌ ===== ACADEMY VIDEO NO PATH ERROR =====');
        console.error('🚨 Academy video upload succeeded but no path returned');
        console.error('📊 Academy video upload result:', data);
        
        const errorMsg = 'No file path returned from academy video upload';
        if (onVideoUploadError) {
          onVideoUploadError(errorMsg);
        }
        
        throw new Error(errorMsg);
      }

      console.log('✅ ===== ACADEMY VIDEO UPLOAD SUCCESS =====');
      console.log('📁 Academy video upload result:', {
        path: data.path,
        id: data.id,
        fullPath: data.fullPath
      });
      
      // Get public URL immediately
      console.log('🔗 Getting academy video public URL...');
      const { data: urlData } = supabase.storage
        .from('academy-videos')
        .getPublicUrl(data.path);

      console.log('🔗 Academy video public URL data:', urlData);

      if (!urlData?.publicUrl) {
        console.error('❌ ===== ACADEMY VIDEO NO URL ERROR =====');
        console.error('🚨 Failed to get academy video public URL');
        console.error('📊 URL data:', urlData);
        
        const errorMsg = 'Failed to get academy video public URL';
        if (onVideoUploadError) {
          onVideoUploadError(errorMsg);
        }
        
        throw new Error(errorMsg);
      }

      console.log('🔗 Academy video public URL:', urlData.publicUrl);

      // Start processing steps
      startProcessingSteps(urlData, file, startTime);

    } catch (error) {
      console.error('❌ ===== ACADEMY VIDEO UPLOAD EXCEPTION =====');
      console.error('🚨 Unexpected error during academy video upload:', error);
      
      // Reset state
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
      setProcessingProgress(0);
      setUploadStatus('');
      setProcessingStatus('');
      
      // Call error callback
      if (onVideoUploadError) {
        onVideoUploadError(error instanceof Error ? error.message : 'Unknown error');
      }
      
      toast.error('Fout bij uploaden van academy video');
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      await uploadVideo(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleRemove = async () => {
    if (uploadedVideoUrl) {
      // Extract path from URL for deletion
      const urlParts = uploadedVideoUrl.split('/');
      const path = urlParts.slice(-2).join('/'); // Get last two parts as path
      
      try {
        const { error } = await supabase.storage
          .from('academy-videos')
          .remove([path]);
        
        if (error) {
          console.error('Error removing academy video:', error);
          toast.error('Fout bij verwijderen van academy video');
        } else {
          console.log('✅ Academy video removed successfully');
          setUploadedVideoUrl(null);
          onVideoUploaded('');
          toast.success('Academy video verwijderd');
        }
      } catch (error) {
        console.error('Error removing academy video:', error);
        toast.error('Fout bij verwijderen van academy video');
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Academy Video Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isUploading || isProcessing
            ? 'border-[#8BAE5A] bg-[#232D1A]'
            : 'border-gray-600 hover:border-[#8BAE5A] bg-[#181F17]'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Academy Icon */}
        <div className="flex justify-center mb-4">
          <AcademicCapIcon className="w-12 h-12 text-[#8BAE5A]" />
        </div>

        {/* Upload Content */}
        {!uploadedVideoUrl && !currentVideoUrl && (
          <div>
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Academy Video Upload</h3>
            <p className="text-gray-400 mb-4">
              Sleep een academy video bestand hierheen of klik om te selecteren
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Ondersteunde formaten: MP4, MOV, AVI, WEBM, MKV, QuickTime (max 1GB)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isProcessing}
              className="bg-[#8BAE5A] hover:bg-[#B6C948] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Academy Video Selecteren
            </button>
          </div>
        )}

        {/* Current Video Display */}
        {(uploadedVideoUrl || currentVideoUrl) && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <PlayIcon className="w-8 h-8 text-[#8BAE5A]" />
              <h3 className="text-lg font-semibold text-white">Academy Video Gereed</h3>
            </div>
            
            <div className="bg-[#232D1A] rounded-lg p-4">
              <video
                src={uploadedVideoUrl || currentVideoUrl}
                controls
                className="w-full max-w-md mx-auto rounded"
                preload="metadata"
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isProcessing}
                className="bg-[#8BAE5A] hover:bg-[#B6C948] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Nieuwe Academy Video
              </button>
              <button
                onClick={handleRemove}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <TrashIcon className="w-4 h-4 inline mr-2" />
                Verwijderen
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{uploadStatus}</span>
              <span>{uploadProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{(uploadedBytes / (1024 * 1024)).toFixed(1)} MB</span>
              <span>{(uploadSpeed / (1024 * 1024)).toFixed(1)} MB/s</span>
              <span>{timeRemaining}</span>
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{processingStatus}</span>
              <span>{processingProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
} 