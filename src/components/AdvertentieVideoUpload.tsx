import React, { useState, useRef, useEffect } from 'react';
import { CloudArrowUpIcon, PlayIcon, TrashIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  startVideoUploadLog, 
  logVideoUploadStep, 
  completeVideoUploadStep, 
  completeVideoUpload 
} from '@/lib/video-upload-logger';
import { getCDNVideoUrl, preloadVideo } from '@/lib/cdn-config';

interface AdvertentieVideoUploadProps {
  currentVideoUrl?: string;
  onVideoUploaded: (url: string) => void;
  onVideoUploadStart?: () => void;
  onVideoUploadError?: (error: string) => void;
  className?: string;
}

export default function AdvertentieVideoUpload({
  currentVideoUrl,
  onVideoUploaded,
  onVideoUploadStart,
  onVideoUploadError,
  className = ""
}: AdvertentieVideoUploadProps) {
  
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug function to check Supabase configuration
  const debugSupabaseConfig = () => {
    console.log('🔍 ===== ADVERTENTIE VIDEO UPLOAD DEBUG =====');
    console.log('🎬 Advertentie video upload configuration:', {
      bucket: 'advertenties'
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
      hasUpload: !!supabase?.storage?.from?.('advertenties')?.upload
    });
    console.log('📦 Supabase import:', {
      supabaseType: typeof supabase,
      storageType: typeof supabase?.storage
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleFileUpload(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/webm',
      'video/mkv',
      'video/quicktime',
      'video/wmv',
      'video/flv',
      'video/m4v'
    ];

    if (!allowedTypes.includes(file.type)) {
      const error = `Bestandstype niet ondersteund. Toegestane formaten: ${allowedTypes.join(', ')}`;
      console.error('❌', error);
      onVideoUploadError?.(error);
      toast.error(error);
      return;
    }

    // Validate file size (1GB limit)
    const maxSize = 1073741824; // 1GB
    if (file.size > maxSize) {
      const error = `Bestand is te groot. Maximum grootte: 1GB`;
      console.error('❌', error);
      onVideoUploadError?.(error);
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploaden...');
    setProcessingStatus('');
    setProcessingProgress(0);
    setUploadedBytes(0);
    setUploadSpeed(0);
    setTimeRemaining('');

    onVideoUploadStart?.();

    try {
      debugSupabaseConfig();

      // Start upload logging
      const uploadId = await startVideoUploadLog(file);

      console.log('🚀 Starting advertentie video upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: 'advertenties'
      });

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `advertenties/${timestamp}-${file.name}`;

      setCurrentStep('Uploaden naar Supabase Storage...');
      await logVideoUploadStep('upload_start', 'Starting upload to advertenties bucket');

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('advertenties')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        await logVideoUploadStep('upload_error', uploadError.message);
        throw new Error(`Upload mislukt: ${uploadError.message}`);
      }

      console.log('✅ Upload successful:', uploadData);
      await logVideoUploadStep('upload_success', 'File uploaded successfully');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('advertenties')
        .getPublicUrl(uniqueFileName);

      const publicUrl = urlData.publicUrl;
      console.log('🔗 Public URL:', publicUrl);

      setUploadedVideoUrl(publicUrl);
      setUploadStatus('Upload voltooid!');
      setProcessingProgress(100);

      // Preload video for better performance
      setCurrentStep('Video voorbereiden...');
      await logVideoUploadStep('preload_start', 'Preloading video for performance');
      
              try {
          await preloadVideo(publicUrl);
          await logVideoUploadStep('preload_success', 'Video preloaded successfully');
        } catch (preloadError) {
          console.warn('⚠️ Preload failed:', preloadError);
          await logVideoUploadStep('preload_warning', 'Video preload failed but upload successful');
        }

      // Performance data
      const performance = {
        uploadTime: Date.now() - timestamp,
        fileSize: file.size,
        fileName: file.name,
        bucket: 'advertenties'
      };

      setPerformanceData(performance);
      await completeVideoUpload(true);

      console.log('🎉 Advertentie video upload completed successfully!');
      toast.success('Advertentie video succesvol geüpload!');
      
      onVideoUploaded(publicUrl);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadStatus('Upload mislukt');
      setProcessingStatus('Er is een fout opgetreden');
      
      onVideoUploadError?.(error instanceof Error ? error.message : 'Onbekende fout');
      toast.error('Video upload mislukt');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!uploadedVideoUrl && !currentVideoUrl) return;

    try {
      // Extract filename from URL
      const url = uploadedVideoUrl || currentVideoUrl;
      if (!url) return;

      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      console.log('🗑️ Removing video:', fileName);

      // Remove from storage
      const { error: deleteError } = await supabase.storage
        .from('advertenties')
        .remove([fileName]);

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        toast.error('Fout bij het verwijderen van video');
        return;
      }

      console.log('✅ Video removed successfully');
      setUploadedVideoUrl(null);
      onVideoUploaded('');
      toast.success('Video verwijderd');

    } catch (error) {
      console.error('❌ Error removing video:', error);
      toast.error('Fout bij het verwijderen van video');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 text-xs text-yellow-300">
          <div className="font-semibold mb-1">🔍 Debug Info:</div>
          <div>Bucket: advertenties</div>
          <div>Max Size: 1GB</div>
          <div>Formats: MP4, MOV, AVI, WEBM, MKV, QuickTime, WMV, FLV, M4V</div>
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
                {isUploading ? 'Video Uploaden...' : 'Video Verwerken...'}
              </h3>
              <p className="text-[#B6C948] text-sm mb-2">{currentStep}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-[#232D1A] rounded-full h-2 mb-2">
                <div 
                  className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              
              <p className="text-[#8BAE5A] text-xs">
                {uploadStatus} {processingStatus && `• ${processingStatus}`}
              </p>
              
              {/* Upload Stats */}
              {uploadedBytes > 0 && (
                <div className="text-[#B6C948] text-xs space-y-1">
                  <div>Geüpload: {(uploadedBytes / 1024 / 1024).toFixed(1)} MB</div>
                  {uploadSpeed > 0 && (
                    <div>Snelheid: {(uploadSpeed / 1024 / 1024).toFixed(1)} MB/s</div>
                  )}
                  {timeRemaining && (
                    <div>Resterende tijd: {timeRemaining}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Advertentie Icon */}
            <div className="flex justify-center mb-4">
              <MegaphoneIcon className="w-12 h-12 text-[#8BAE5A]" />
            </div>
            
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Advertentie Video Upload</h3>
            <p className="text-gray-400 mb-4">
              Sleep een advertentie video bestand hierheen of klik om te selecteren
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Ondersteunde formaten: MP4, MOV, AVI, WEBM, MKV, QuickTime, WMV, FLV, M4V (max 1GB)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-[#8BAE5A] hover:bg-[#B6C948] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Advertentie Video Selecteren
            </button>
          </div>
        )}
      </div>

      {/* Current Video Display */}
      {(uploadedVideoUrl || currentVideoUrl) && !isUploading && (
        <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[#8BAE5A] font-semibold">Huidige Advertentie Video</h4>
            <button
              onClick={handleRemove}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Video verwijderen"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <video
              src={uploadedVideoUrl || currentVideoUrl}
              controls
              className="w-full rounded-lg"
              preload="metadata"
            />
          </div>
          
          <div className="mt-3 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <PlayIcon className="w-4 h-4" />
              <span>Video geladen en klaar voor gebruik</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Data (development only) */}
      {process.env.NODE_ENV === 'development' && performanceData && (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 text-xs text-blue-300">
          <div className="font-semibold mb-1">📊 Performance Data:</div>
          <div>Upload Time: {performanceData.uploadTime}ms</div>
          <div>File Size: {(performanceData.fileSize / 1024 / 1024).toFixed(2)} MB</div>
          <div>Bucket: {performanceData.bucket}</div>
        </div>
      )}
    </div>
  );
}
