"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CloudArrowUpIcon, XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Alleen video bestanden zijn toegestaan');
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video bestand is te groot. Maximum 500MB toegestaan.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${folderPath}/${fileName}`;

      // 1. Vraag een presigned upload URL op
      // @ts-ignore: Supabase JS v2+ only
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUploadUrl(filePath, { upsert: true });

      if (error || !data?.signedUrl) {
        throw error || new Error('Kon geen upload URL ophalen');
      }

      // 2. Upload het bestand met echte progressie
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', data.signedUrl, true);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          // 3. Haal de public URL op
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
          onVideoUploaded(urlData.publicUrl);
          toast.success('Video succesvol geüpload!');
          setUploadProgress(100);
        } else {
          toast.error('Upload mislukt');
        }
        setIsUploading(false);
      };
      xhr.onerror = () => {
        toast.error('Upload mislukt');
        setIsUploading(false);
      };
      xhr.send(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload mislukt: ${error.message}`);
    }
  };

  const removeVideo = async () => {
    if (
      currentVideoUrl &&
      currentVideoUrl.includes('supabase.co/storage/v1/object/public/') &&
      currentVideoUrl.includes(`${bucketName}/`)
    ) {
      // Extract the path after the bucket name
      const match = currentVideoUrl.match(new RegExp(`${bucketName}/([^?]+)`));
      if (match && match[1]) {
        const filePath = decodeURIComponent(match[1]);
        const { error } = await supabase.storage.from(bucketName).remove([filePath]);
        if (error) {
          toast.error('Verwijderen uit storage mislukt: ' + error.message);
        } else {
          toast.success('Video verwijderd uit storage');
        }
      }
    }
    onVideoUploaded('');
    toast.info('Video verwijderd');
  };

  return (
    <div className="space-y-4">
      {/* Current Video Preview */}
      {currentVideoUrl && (
        <div className="relative">
          <video 
            src={currentVideoUrl} 
            controls 
            className="w-full rounded-xl border border-[#3A4D23] bg-[#181F17]"
            style={{ maxHeight: '200px' }}
          />
          <button
            onClick={removeVideo}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            title="Video verwijderen"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Section */}
      <div className="border-2 border-dashed border-[#3A4D23] rounded-xl p-6 text-center hover:border-[#8BAE5A] transition-colors">
        {isUploading ? (
          <div className="space-y-3">
            <div className="w-8 h-8 border-2 border-[#8BAE5A] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[#8BAE5A] font-semibold">Video uploaden...</p>
            <div className="w-full bg-[#181F17] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-[#B6C948] text-sm">{uploadProgress}%</p>
          </div>
        ) : (
          <div>
            <CloudArrowUpIcon className="w-12 h-12 text-[#8BAE5A] mx-auto mb-3" />
            <p className="text-[#8BAE5A] font-semibold mb-2">
              {currentVideoUrl ? 'Nieuwe video uploaden' : 'Video uploaden'}
            </p>
            <p className="text-[#B6C948] text-sm mb-4">
              Sleep een video bestand hierheen of klik om te selecteren
            </p>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="video-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="video-upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="w-5 h-5" />
              Video Kiezen
            </label>
            <p className="text-[#B6C948] text-xs mt-2">
              Max 500MB • MP4, MOV, AVI, etc.
            </p>
          </div>
        )}
      </div>

      {/* URL Input Fallback - Only show if no video is uploaded */}
      {!currentVideoUrl && (
        <div className="mt-4">
          <p className="text-[#8BAE5A] text-sm mb-2">Of voer een video URL in:</p>
          <input
            type="url"
            value={currentVideoUrl || ''}
            onChange={(e) => onVideoUploaded(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... of https://..."
            className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
          />
        </div>
      )}
    </div>
  );
} 