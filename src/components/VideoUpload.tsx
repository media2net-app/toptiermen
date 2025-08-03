'use client';

import { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface VideoUploadProps {
  currentVideoUrl?: string;
  onVideoUploaded: (url: string) => void;
  className?: string;
}

export default function VideoUpload({
  currentVideoUrl,
  onVideoUploaded,
  className = ""
}: VideoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isBlobConfigured, setIsBlobConfigured] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if Vercel Blob is configured via API
    const checkBlobConfig = async () => {
      try {
        const response = await fetch('/api/blob-config');
        const data = await response.json();
        
        console.log('🔍 Blob config check via API:', data);
        
        setIsBlobConfigured(data.isConfigured);
      } catch (error) {
        console.error('❌ Failed to check blob config:', error);
        setIsBlobConfigured(false);
      }
    };

    checkBlobConfig();
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if Blob is configured
    if (!isBlobConfigured) {
      toast.error('Vercel Blob is niet geconfigureerd. Voeg BLOB_READ_WRITE_TOKEN toe aan je environment variables.');
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

    try {
      console.log('🔄 Starting video upload...');

      // Start with 10% progress immediately
      setUploadProgress(10);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) return prev; // Stop at 85% until upload completes
          return prev + Math.random() * 3;
        });
      }, 150);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload using our server-side API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 360000); // 6 minutes timeout

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Clear progress interval
      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Set to 100% when upload completes
      setUploadProgress(100);

      console.log('✅ Video uploaded successfully:', data.url);

      // Small delay to show 100% completion
      setTimeout(() => {
        setUploadedVideoUrl(data.url);
        onVideoUploaded(data.url);
        toast.success('Video succesvol geüpload!');
      }, 500);

    } catch (error: any) {
      console.error('❌ Video upload failed:', error);
      
      if (error.name === 'AbortError') {
        toast.error('Upload geannuleerd: Timeout na 6 minuten');
      } else {
        toast.error(`Upload mislukt: ${error.message || 'Onbekende fout'}`);
      }
      
      setUploadProgress(0);
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

  // Show configuration error if Blob is not configured
  if (isBlobConfigured === false) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-500">
                Vercel Blob Niet Geconfigureerd
              </h3>
              <p className="text-red-400 mt-1">
                Video upload is niet beschikbaar. Voeg de <code className="bg-red-500/20 px-2 py-1 rounded text-red-300">BLOB_READ_WRITE_TOKEN</code> toe aan je environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking configuration
  if (isBlobConfigured === null) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-[#3A4D23] border-t-[#8BAE5A] rounded-full animate-spin"></div>
            <div>
              <h3 className="text-lg font-semibold text-[#8BAE5A]">
                Video Upload Configuratie Controleren...
              </h3>
              <p className="text-[#B6C948] mt-1">
                Bezig met het controleren van Vercel Blob configuratie.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Video Upload Area */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#3A4D23] rounded-xl p-6 text-center transition-all duration-200 bg-[#181F17] hover:border-[#8BAE5A] hover:bg-[#232D1A] cursor-pointer"
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-[#3A4D23] border-t-[#8BAE5A] rounded-full animate-spin"></div>
            <div className="space-y-2">
              <h3 className="text-[#8BAE5A] font-semibold">Video wordt geüpload...</h3>
              <div className="w-full bg-[#232D1A] rounded-full h-2">
                <div 
                  className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-[#B6C948] text-sm">{uploadProgress.toFixed(2)}% voltooid</p>
            </div>
          </div>
        ) : uploadedVideoUrl ? (
          <div className="space-y-4">
            <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500" />
            <h3 className="text-[#8BAE5A] font-semibold">Video succesvol geüpload!</h3>
            <p className="text-[#B6C948] text-sm">Klik hier om een nieuwe video te uploaden</p>
          </div>
        ) : (
          <div className="space-y-4">
            <CloudArrowUpIcon className="w-12 h-12 mx-auto text-[#8BAE5A]" />
            <div>
              <h3 className="text-[#8BAE5A] font-semibold mb-2">Video Upload</h3>
              <p className="text-[#B6C948] text-sm mb-4">
                Sleep een video bestand hierheen of klik om te selecteren
              </p>
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
                <p className="text-[#B6C948] text-xs">
                  📹 Ondersteunde formaten: MP4, MOV, AVI, WEBM, MKV, QuickTime
                </p>
                <p className="text-[#B6C948] text-xs">
                  📏 Maximum grootte: 500MB
                </p>
                <p className="text-[#B6C948] text-xs">
                  ⚡ Vercel Blob - Snelle upload met CDN
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Alternative URL Input */}
      <div>
        <label className="block text-[#8BAE5A] font-semibold mb-2">
          Of voer een video URL in:
        </label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          defaultValue={currentVideoUrl || ''}
          onChange={(e) => {
            if (e.target.value.trim()) {
              onVideoUploaded(e.target.value);
            }
          }}
          className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
        />
      </div>

      {/* Uploaded Video Preview - Only show if we have a URL and it's not empty */}
      {uploadedVideoUrl && uploadedVideoUrl.trim() && (
        <div className="space-y-2">
          <h4 className="text-[#8BAE5A] font-semibold">Geüploade Video:</h4>
          <video
            src={uploadedVideoUrl}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: '300px' }}
          />
          <p className="text-[#B6C948] text-xs break-all">
            URL: {uploadedVideoUrl}
          </p>
        </div>
      )}
    </div>
  );
} 