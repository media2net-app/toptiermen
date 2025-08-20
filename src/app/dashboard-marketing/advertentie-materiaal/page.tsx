'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { createClient } from '@supabase/supabase-js';
import { 
  VideoCameraIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  DownloadIcon,
  TrashIcon,
  PlusIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface VideoFile {
  id: string;
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
  bucket_id: string;
  owner: string;
}

export default function AdvertentieMateriaalPage() {
  const { user } = useSupabaseAuth();
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch videos from the bucket
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.storage
        .from('advertenties')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error fetching videos:', error);
        setError('Fout bij het ophalen van video bestanden');
        return;
      }

      if (data) {
        // Filter for video files
        const videoFiles = data.filter(file => 
          file.metadata?.mimetype?.startsWith('video/') || 
          file.name.toLowerCase().match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/)
        );
        
        setVideos(videoFiles);
        console.log('Videos loaded:', videoFiles);
      }
    } catch (err) {
      console.error('Error in fetchVideos:', err);
      setError('Onverwachte fout bij het ophalen van video bestanden');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Alleen video bestanden zijn toegestaan');
      return;
    }

    // Validate file size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      setError('Bestand is te groot. Maximum grootte is 500MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const fileName = `${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('advertenties')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        setError(`Upload fout: ${error.message}`);
        return;
      }

      if (data) {
        console.log('Upload successful:', data);
        setUploadProgress(100);
        
        // Refresh the video list
        setTimeout(() => {
          fetchVideos();
          setUploadProgress(0);
        }, 1000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Onverwachte fout bij uploaden');
    } finally {
      setUploading(false);
    }
  };

  // Get video URL
  const getVideoUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('advertenties')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Delete video
  const deleteVideo = async (fileName: string) => {
    if (!confirm('Weet je zeker dat je deze video wilt verwijderen?')) return;

    try {
      const { error } = await supabase.storage
        .from('advertenties')
        .remove([fileName]);

      if (error) {
        console.error('Delete error:', error);
        setError('Fout bij verwijderen van video');
        return;
      }

      // Refresh the video list
      fetchVideos();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Onverwachte fout bij verwijderen');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Toegang vereist</h2>
          <p className="text-gray-400">Je moet ingelogd zijn om advertentie materiaal te bekijken.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advertentie Materiaal</h1>
          <p className="text-gray-400 mt-1">Beheer je video bestanden voor advertenties</p>
        </div>
        
        {/* Upload Button */}
        <div className="flex items-center space-x-4">
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-medium">
              {uploading ? (
                <>
                  <ClockIcon className="w-5 h-5 animate-spin" />
                  <span>Uploaden...</span>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  <span>Video Uploaden</span>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && uploadProgress > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Upload voortgang</span>
            <span className="text-sm text-gray-300">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadProgress === 100 && (
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            <span className="text-green-300">Video succesvol geüpload!</span>
          </div>
        </div>
      )}

      {/* Video Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ClockIcon className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Video's laden...</p>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <VideoCameraIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Geen video's gevonden</h3>
          <p className="text-gray-500">Upload je eerste video om te beginnen</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors">
              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-900">
                <video
                  className="w-full h-full object-cover"
                  src={getVideoUrl(video.name)}
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    // Video loaded
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayIcon className="w-12 h-12 text-white opacity-80" />
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 truncate" title={video.name}>
                  {video.name}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Grootte:</span>
                    <span>{formatFileSize(video.metadata?.size || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Type:</span>
                    <span>{video.metadata?.mimetype || 'video/mp4'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Geüpload:</span>
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => window.open(getVideoUrl(video.name), '_blank')}
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Bekijk video"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm">Bekijk</span>
                  </button>

                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = getVideoUrl(video.name);
                      link.download = video.name;
                      link.click();
                    }}
                    className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
                    title="Download video"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>

                  <button
                    onClick={() => deleteVideo(video.name)}
                    className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors"
                    title="Verwijder video"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="text-sm">Verwijder</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">{selectedVideo.name}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Sluiten</span>
                ×
              </button>
            </div>
            <div className="p-4">
              <video
                className="w-full h-auto max-h-[70vh]"
                src={getVideoUrl(selectedVideo.name)}
                controls
                autoPlay
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
