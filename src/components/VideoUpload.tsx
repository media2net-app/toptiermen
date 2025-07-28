"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { CloudArrowUpIcon, XMarkIcon, PlayIcon, CheckIcon } from '@heroicons/react/24/outline';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Simulate upload progress
  useEffect(() => {
    if (isUploading && uploadProgress < 90) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          console.log('📈 Progress update:', { 
            previous: prev, 
            new: newProgress, 
            isUploading 
          });
          if (newProgress < 90) {
            return newProgress;
          }
          return prev;
        });
      }, 500);

      return () => {
        console.log('🛑 Clearing progress interval');
        clearInterval(interval);
      };
    }
  }, [isUploading, uploadProgress]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateAndUploadFile = async (file: File) => {
    console.log('🚀 Starting video upload process...', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      bucketName,
      folderPath 
    });

    // Validate file type
    if (!file.type.startsWith('video/')) {
      console.error('❌ Invalid file type:', file.type);
      toast.error('Alleen video bestanden zijn toegestaan');
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      console.error('❌ File too large:', file.size, 'bytes');
      toast.error('Video bestand is te groot. Maximum 500MB toegestaan.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Voorbereiden...');
    setUploadedBytes(0);
    setTotalBytes(file.size);

    console.log('🔄 Initial state set:', { 
      isUploading: true, 
      progress: 0, 
      status: 'Voorbereiden...',
      uploadedBytes: 0,
      totalBytes: file.size 
    });

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${folderPath}/${fileName}`;

      console.log('📁 Generated file path:', { fileName, filePath });

      setUploadStatus('Uploaden naar server...');
      setUploadProgress(10);

      console.log('⬆️ Starting Supabase upload...');
      
      // Direct upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('📤 Upload response:', { uploadData, uploadError });

      if (uploadError) {
        console.error('❌ Upload failed:', uploadError);
        throw new Error(`Upload mislukt: ${uploadError.message}`);
      }

      console.log('✅ Upload successful, getting public URL...');
      setUploadProgress(95);
      setUploadStatus('Video verwerken...');
      setUploadedBytes(file.size);

      console.log('📊 Progress set to 95%:', { 
        progress: 95, 
        status: 'Video verwerken...',
        uploadedBytes: file.size 
      });

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('🔗 Public URL data:', urlData);

      if (!urlData?.publicUrl) {
        console.error('❌ No public URL returned');
        throw new Error('Kon geen publieke URL genereren voor de video');
      }

      setUploadProgress(100);
      setUploadStatus('Voltooid!');
      setUploadedBytes(file.size);

      console.log('📊 Progress set to 100%:', { 
        progress: 100, 
        status: 'Voltooid!',
        uploadedBytes: file.size 
      });

      console.log('🎉 Upload process completed successfully!', { 
        publicUrl: urlData.publicUrl,
        finalProgress: 100 
      });

      onVideoUploaded(urlData.publicUrl);
      toast.success('Video succesvol geüpload!');

      // Reset after a short delay
      setTimeout(() => {
        console.log('🔄 Resetting upload state...');
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
        setUploadedBytes(0);
        setTotalBytes(0);
      }, 2000);

    } catch (error) {
      console.error('💥 Upload process failed:', error);
      console.error('📊 Error details:', {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        currentProgress: uploadProgress,
        currentStatus: uploadStatus
      });
      
      toast.error(error instanceof Error ? error.message : 'Video upload mislukt');
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
      setUploadedBytes(0);
      setTotalBytes(0);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await validateAndUploadFile(file);
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
      await validateAndUploadFile(files[0]);
    }
  };

  const removeVideo = async () => {
    if (!currentVideoUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentVideoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${folderPath}/${fileName}`;

      // Remove from storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error removing video:', error);
        toast.error('Kon video niet verwijderen');
        return;
      }

      onVideoUploaded('');
      toast.success('Video verwijderd');
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error('Kon video niet verwijderen');
    }
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
          onChange={handleFileUpload}
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#8BAE5A] font-semibold text-sm">{uploadStatus}</span>
              <span className="text-[#B6C948] text-sm font-mono">{Math.round(uploadProgress)}%</span>
            </div>
            
            <div className="w-full bg-[#3A4D23] rounded-full h-3 mb-3">
              <div
                className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-[#B6C948]">
              <span>{formatFileSize(uploadedBytes)} / {formatFileSize(totalBytes)}</span>
              <span>{uploadProgress >= 100 ? '✓' : '⏳'}</span>
            </div>
            
            {uploadProgress >= 100 && (
              <div className="mt-3 p-2 bg-[#8BAE5A]/10 border border-[#8BAE5A] rounded-lg">
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