"use client";
import { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, PlayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
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

    // Video upload is temporarily disabled
    console.log('📹 Video upload is temporarily disabled');
    toast.info('Video upload is momenteel niet beschikbaar vanwege systeem updates.');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Video Upload Disabled Placeholder */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="border-2 border-dashed border-[#3A4D23] rounded-xl p-6 text-center transition-all duration-200 bg-[#181F17]"
      >
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
        <h3 className="text-[#8BAE5A] font-semibold mb-2">Video Upload Tijdelijk Uitgeschakeld</h3>
        <p className="text-[#B6C948] text-sm mb-4">
          Op dit moment is video upload niet mogelijk gezien we het systeem aan het updaten zijn
        </p>
        <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
          <p className="text-[#B6C948] text-xs">
            🚧 Video upload functionaliteit wordt momenteel geüpdatet voor betere prestaties en stabiliteit
          </p>
        </div>
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