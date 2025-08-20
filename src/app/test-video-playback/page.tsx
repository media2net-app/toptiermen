'use client';

import { useState, useEffect } from 'react';

interface VideoFile {
  id: string;
  name: string;
  public_url: string;
  size: number;
  type: string;
}

export default function TestVideoPlayback() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/list-advertentie-videos');
        const data = await response.json();
        
        if (data.success) {
          setVideos(data.videos);
        } else {
          setError(data.error || 'Failed to fetch videos');
        }
      } catch (err) {
        setError('Error fetching videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Video Playback Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2 truncate">{video.name}</h3>
              
              <div className="aspect-video bg-black rounded mb-4">
                <video
                  src={video.public_url}
                  className="w-full h-full object-cover rounded"
                  controls
                  preload="metadata"
                  crossOrigin="anonymous"
                  onLoadedMetadata={() => {
                    console.log('✅ Video loaded:', video.name);
                  }}
                  onError={(e) => {
                    console.error('❌ Video error:', video.name, e);
                  }}
                />
              </div>
              
              <div className="text-gray-300 text-sm">
                <p>Size: {(video.size / 1024 / 1024).toFixed(1)} MB</p>
                <p>Type: {video.type}</p>
                <p className="truncate">URL: {video.public_url}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-white">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <p>Total videos: {videos.length}</p>
          <p>Check browser console for video loading status</p>
        </div>
      </div>
    </div>
  );
}
