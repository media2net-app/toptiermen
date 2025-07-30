"use client";
import { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: Implement new video upload method here
    console.log('📹 Selected video file:', file.name, file.size);
    toast.info('Video upload implementatie komt binnenkort...');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeVideo = () => {
    if (!currentVideoUrl) return;
    
    // TODO: Implement video removal logic here
    onVideoUploaded('');
    toast.success('Video verwijderd');
  };

  return (
    <div className={`space-y-4 ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Current Video Display */}
      {currentVideoUrl && (
        <div 
          className="relative bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8BAE5A] font-semibold">Huidige Video</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeVideo();
              }}
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
        onClick={(e) => e.stopPropagation()}
        className="border-2 border-dashed border-[#3A4D23] hover:border-[#8BAE5A] rounded-xl p-6 text-center transition-all duration-200"
      >
        <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-[#8BAE5A]" />
        <h3 className="text-[#8BAE5A] font-semibold mb-2">Video uploaden</h3>
        <p className="text-[#B6C948] text-sm mb-4">
          Klik om een video bestand te selecteren
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id="video-upload"
        />

        <label
          htmlFor="video-upload"
          className="inline-flex items-center px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors cursor-pointer disabled:opacity-50"
        >
          <PlayIcon className="w-5 h-5 mr-2" />
          {isUploading ? 'Uploaden...' : 'Video Kiezen'}
        </label>

        <p className="text-[#B6C948] text-xs mt-2">
          Nieuwe upload methode wordt geïmplementeerd
        </p>

        {/* Progress Indicator */}
        {isUploading && (
          <div className="mt-4 p-3 bg-[#181F17] rounded-lg border border-[#3A4D23]">
            <div className="w-full bg-[#3A4D23] rounded-full h-2 mb-2">
              <div
                className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[#B6C948] text-sm">{Math.round(uploadProgress)}%</span>
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