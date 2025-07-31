"use client";
import { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, PlayIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabase';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    await uploadVideo(file);
  };

  const uploadVideo = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `video_${timestamp}.${fileExtension}`;
      const filePath = `exercises/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('workout-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(error.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('workout-videos')
        .getPublicUrl(filePath);

      const videoUrl = urlData.publicUrl;
      setUploadedVideoUrl(videoUrl);
      onVideoUploaded(videoUrl);

      toast.success('Video succesvol geüpload!');
      setUploadProgress(100);

    } catch (error: any) {
      console.error('Video upload failed:', error);
      toast.error(`Upload mislukt: ${error.message}`);
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
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
              <p className="text-[#B6C948] text-sm">{uploadProgress}% voltooid</p>
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
          onChange={(e) => onVideoUploaded(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
        />
      </div>

      {/* Uploaded Video Preview */}
      {uploadedVideoUrl && (
        <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
          <h4 className="text-[#8BAE5A] font-semibold mb-2">Geüploade Video:</h4>
          <video 
            controls 
            className="w-full rounded-lg"
            src={uploadedVideoUrl}
          >
            Je browser ondersteunt geen video afspelen.
          </video>
        </div>
      )}
    </div>
  );
} 