"use client";
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { CloudArrowUpIcon, XMarkIcon, PlayIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface VideoUploadProps {
  currentVideoUrl?: string;
  onVideoUploaded: (url: string) => void;
  bucketName?: string;
  folderPath?: string;
}

export default function VideoUpload({
  currentVideoUrl,
  onVideoUploaded,
  bucketName = 'workout-videos',
  folderPath = 'exercises'
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatus('');
    setUploadedBytes(0);
    setTotalBytes(0);
    setRetryCount(0);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('video/')) {
      return 'Alleen video bestanden zijn toegestaan';
    }

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      return 'Video bestand is te groot. Maximum 500MB toegestaan.';
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'Video bestand is leeg';
    }

    return null;
  };

  const uploadWithRetry = async (file: File, maxRetries = 3): Promise<string> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🚀 Upload attempt ${attempt}/${maxRetries} for ${file.name}`);
        
        // Create new abort controller for this attempt
        abortControllerRef.current = new AbortController();
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `${timestamp}-${randomId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${folderPath}/${fileName}`;

        console.log('📁 File path:', filePath);

        // Update status
        setUploadStatus(attempt > 1 ? `Opnieuw proberen (${attempt}/${maxRetries})...` : 'Uploaden naar server...');
        setUploadProgress(10);

        // Upload to Supabase with timeout
        const uploadPromise = supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        // Add timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Upload timeout - probeer opnieuw')), 300000); // 5 minutes
        });

        const { data: uploadData, error: uploadError } = await Promise.race([
          uploadPromise,
          timeoutPromise
        ]) as any;

        if (uploadError) {
          // Handle specific Supabase errors
          if (uploadError.message.includes('File size limit exceeded')) {
            throw new Error('Bestand is te groot (max 500MB)');
          } else if (uploadError.message.includes('Invalid file type')) {
            throw new Error('Ongeldig bestandstype - alleen video bestanden toegestaan');
          } else if (uploadError.message.includes('Bucket not found')) {
            throw new Error('Storage bucket niet gevonden - neem contact op met support');
          } else {
            throw new Error(`Upload mislukt: ${uploadError.message}`);
          }
        }

        console.log('✅ Upload successful');
        setUploadProgress(80);
        setUploadStatus('Video verwerken...');

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error('Kon geen publieke URL genereren');
        }

        console.log('🔗 Public URL generated:', urlData.publicUrl);
        setUploadProgress(100);
        setUploadStatus('Voltooid!');
        setUploadedBytes(file.size);

        // Success - return the URL
        return urlData.publicUrl;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ Upload attempt ${attempt} failed:`, lastError.message);

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        setUploadStatus(`Wachten voor nieuwe poging... (${waitTime/1000}s)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError || new Error('Upload mislukt na alle pogingen');
  };

  const handleFileUpload = async (file: File) => {
    // Validate file first
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Reset state
    resetUploadState();
    setIsUploading(true);
    setTotalBytes(file.size);

    try {
      console.log('🎬 Starting video upload:', {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });

      const publicUrl = await uploadWithRetry(file);
      
      console.log('🎉 Upload completed successfully!');
      
      // Call the callback
      onVideoUploaded(publicUrl);
      toast.success('Video succesvol geüpload!');

      // Reset after a short delay to show completion
      setTimeout(() => {
        resetUploadState();
      }, 2000);

    } catch (error) {
      console.error('💥 Upload failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Upload mislukt';
      toast.error(errorMessage);
      
      resetUploadState();
    }
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    await handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const removeVideo = async () => {
    if (!currentVideoUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentVideoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${folderPath}/${fileName}`;

      console.log('🗑️ Removing video:', filePath);

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('❌ Error removing video:', error);
        toast.error('Fout bij verwijderen video');
        return;
      }

      console.log('✅ Video removed successfully');
      onVideoUploaded('');
      toast.success('Video verwijderd');

    } catch (error) {
      console.error('💥 Error in removeVideo:', error);
      toast.error('Fout bij verwijderen video');
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetUploadState();
    toast.info('Upload geannuleerd');
  };

  return (
    <div className="space-y-4">
      {/* Current Video Display */}
      {currentVideoUrl && (
        <div className="relative bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8BAE5A] font-semibold">Huidige Video</span>
            <button
              onClick={removeVideo}
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={currentVideoUrl}
              className="w-full h-full object-cover"
              controls
            />
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div 
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-[#8BAE5A] bg-[#8BAE5A]/5' 
            : 'border-[#3A4D23] hover:border-[#8BAE5A]'
        }`}
      >
        <CloudArrowUpIcon className={`w-12 h-12 mx-auto mb-4 transition-colors ${
          isDragOver ? 'text-[#8BAE5A]' : 'text-[#8BAE5A]'
        }`} />
        <h3 className="text-[#8BAE5A] font-semibold mb-2">
          {isDragOver ? 'Video hier neerzetten' : 'Video uploaden'}
        </h3>
        <p className="text-[#B6C948] text-sm mb-4">
          {isDragOver 
            ? 'Laat los om video te uploaden' 
            : 'Sleep een video bestand hierheen of klik om te selecteren'
          }
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileInputChange}
          disabled={isUploading}
          className="hidden"
          id="video-upload"
        />

        <label
          htmlFor="video-upload"
          className="inline-flex items-center px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlayIcon className="w-5 h-5 mr-2" />
          {isUploading ? 'Uploaden...' : 'Video Kiezen'}
        </label>

        <p className="text-[#B6C948] text-xs mt-2">
          Max 500MB • MP4, MOV, AVI, etc.
        </p>

        {/* Enhanced Upload Progress */}
        {isUploading && (
          <div className="mt-6 p-4 bg-[#181F17] rounded-xl border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8BAE5A] font-semibold text-sm">{uploadStatus}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#B6C948] text-sm font-mono">{Math.round(uploadProgress)}%</span>
                {uploadProgress < 100 && (
                  <button
                    onClick={handleCancelUpload}
                    className="text-[#FF6B6B] hover:text-[#FF5252] text-xs underline"
                  >
                    Annuleren
                  </button>
                )}
              </div>
            </div>
            
            <div className="w-full bg-[#3A4D23] rounded-full h-3 mb-3 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-[#B6C948]">
              <span>{formatFileSize(totalBytes)}</span>
              <span className="flex items-center gap-1">
                {uploadProgress >= 100 ? (
                  <>
                    <CheckIcon className="w-3 h-3 text-[#8BAE5A]" />
                    <span>Voltooid</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 border-2 border-[#8BAE5A] border-t-transparent rounded-full animate-spin" />
                    <span>Bezig...</span>
                  </>
                )}
              </span>
            </div>
            
            {uploadProgress >= 100 && (
              <div className="mt-3 p-3 bg-[#8BAE5A]/10 border border-[#8BAE5A] rounded-lg">
                <div className="flex items-center justify-center gap-2 text-[#8BAE5A] text-sm">
                  <CheckIcon className="w-4 h-4" />
                  <span>Video succesvol geüpload!</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alternative URL Input */}
      <div>
        <label className="block text-[#8BAE5A] font-semibold mb-2">
          Of voer een video URL in:
        </label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          defaultValue={currentVideoUrl || ''}
          onChange={(e) => onVideoUploaded(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
        />
      </div>
    </div>
  );
} 