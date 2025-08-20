'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  FireIcon,
  CalendarIcon,
  PencilIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import CampaignSetup from './campaign-setup';
import { VideosService, VideoFile } from '@/lib/videos-service';

export default function AdvertentieMateriaalPage() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCampaignSetup, setShowCampaignSetup] = useState(false);
  const [campaignVideo, setCampaignVideo] = useState<VideoFile | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoFile | null>(null);
  const [editingName, setEditingName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Helper function to determine target audience based on video name
  const getTargetAudienceFromName = (videoName: string): string => {
    const name = videoName.toLowerCase();
    
    if (name.includes('zakelijk')) {
      return 'Ondernemers 30-50, zakelijk, Nederland, LinkedIn';
    } else if (name.includes('jeugd')) {
      return 'Jongeren 18-25, fitness, social media, Nederland';
    } else if (name.includes('vader')) {
      return 'Vaders 30-45, gezin, fitness, Nederland';
    } else if (name.includes('het_merk') || name.includes('hetmerk')) {
      return 'Mannen 25-45, fitness, lifestyle, Nederland';
    } else {
      return 'Algemene doelgroep, fitness, Nederland';
    }
  };

  // Fetch videos from storage bucket
  const fetchVideos = async () => {
    console.log('🔍 Fetching videos from storage bucket...');
    setLoading(true);
    setError(null);

    try {
      const videosData = await VideosService.getVideos();
      console.log('✅ Fetched videos:', videosData.length);
      
      setVideos(videosData);
    } catch (err) {
      console.error('❌ Error fetching videos:', err);
      setError('Kan geen video\'s ophalen uit de storage bucket');
    } finally {
      setLoading(false);
    }
  };

  // Load videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  // Filter videos based on search and status
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.original_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || video.campaign_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle video deletion
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Weet je zeker dat je deze video wilt verwijderen?')) return;

    try {
      await VideosService.deleteVideo(videoId);
      console.log('✅ Video deleted:', videoId);
      await fetchVideos();
    } catch (err) {
      console.error('❌ Error deleting video:', err);
      setError('Fout bij het verwijderen van video');
    }
  };

  // Handle target audience update
  const saveTargetAudience = async (videoId: string, targetAudience: string) => {
    try {
      await VideosService.updateVideo(videoId, { target_audience: targetAudience });
      console.log('✅ Target audience saved for video:', videoId, targetAudience);
      await fetchVideos(); // Refresh to get updated data
    } catch (err) {
      console.error('❌ Error saving target audience:', err);
      setError('Fout bij het opslaan van doelgroep');
    }
  };

  // Handle campaign status toggle
  const toggleCampaignStatus = async (videoId: string) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;
      
      const newStatus = video.campaign_status === 'active' ? 'inactive' : 'active';
      await VideosService.updateVideo(videoId, { campaign_status: newStatus });
      console.log('✅ Campaign status toggled for video:', videoId);
      await fetchVideos(); // Refresh to get updated data
    } catch (err) {
      console.error('❌ Error toggling campaign status:', err);
      setError('Fout bij het wijzigen van campagne status');
    }
  };

  // Handle video name editing
  const startEditingName = (video: VideoFile) => {
    setEditingVideo(video);
    setEditingName(video.name);
  };

  const saveVideoName = async () => {
    if (!editingVideo || !editingName.trim()) return;

    try {
      await VideosService.updateVideo(editingVideo.id, { name: editingName.trim() });
      console.log('✅ Video name updated:', editingVideo.id, editingName);
      await fetchVideos(); // Refresh to get updated data
      setEditingVideo(null);
      setEditingName('');
    } catch (err) {
      console.error('❌ Error updating video name:', err);
      setError('Fout bij het bijwerken van video naam');
    }
  };

  const cancelEditingName = () => {
    setEditingVideo(null);
    setEditingName('');
  };

  // Get video URL with fallback
  const getVideoUrl = (video: VideoFile): string => {
    return video.public_url || '/videos/advertenties/placeholder.mp4';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Video's laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Advertentie Materiaal</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Beheer je video advertenties</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek video's..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A] text-sm"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] text-sm"
          >
            <option value="all">Alle Statussen</option>
            <option value="active">Actief</option>
            <option value="inactive">Inactief</option>
          </select>

          <div className="text-sm text-gray-400 flex items-center justify-center sm:justify-start">
            {filteredVideos.length} van {videos.length} video's
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {filteredVideos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg overflow-hidden"
          >
            {/* Video Preview */}
            <div className="relative bg-gray-900" style={{ aspectRatio: '9/16' }}>
              <video
                data-video-id={video.id}
                src={video.public_url || ''}
                className="w-full h-full object-contain"
                preload="metadata"
                controls
                crossOrigin="anonymous"
                onLoadedMetadata={(e) => {
                  console.log('🎬 Video metadata loaded:', video.name);
                }}
                onLoadStart={() => {
                  console.log('🔄 Video loading started:', video.name);
                }}
                onCanPlay={() => {
                  console.log('✅ Video can play:', video.name);
                }}
                onError={(e) => {
                  console.error('❌ Video error:', video.name, e);
                  console.log('🔗 Video URL:', video.public_url);
                  // Show error message in video container
                  const videoElement = e.target as HTMLVideoElement;
                  const container = videoElement.parentElement;
                  if (container) {
                    container.innerHTML = `
                      <div class="flex items-center justify-center h-full text-red-400 text-sm p-4">
                        <div class="text-center">
                          <div class="mb-2">⚠️</div>
                          <div>Video niet beschikbaar</div>
                          <div class="text-xs text-gray-500 mt-1">${video.name}</div>
                        </div>
                      </div>
                    `;
                  }
                }}
              />
            </div>

            {/* Video Info */}
            <div className="p-3 sm:p-4 space-y-3">
              {/* Video Name */}
              <div className="flex items-center justify-between">
                {editingVideo?.id === video.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveVideoName();
                        if (e.key === 'Escape') cancelEditingName();
                      }}
                      className="flex-1 px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={saveVideoName}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEditingName}
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 flex-1">
                    <h3 className="text-sm font-medium text-white truncate">
                      {video.name}
                    </h3>
                    <button
                      onClick={() => startEditingName(video)}
                      className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      title="Bewerk naam"
                    >
                      <PencilIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Campaign Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Campagne Status:</span>
                <button
                  onClick={() => toggleCampaignStatus(video.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm cursor-pointer hover:scale-105 transition-all duration-200 ${
                    video.campaign_status === 'active' 
                      ? 'bg-green-600 bg-opacity-90 text-white hover:bg-green-500' 
                      : 'bg-gray-600 bg-opacity-90 text-gray-200 hover:bg-gray-500'
                  }`}
                  title={`Klik om status te wijzigen naar ${video.campaign_status === 'active' ? 'inactief' : 'actief'}`}
                >
                  {video.campaign_status === 'active' ? '🟢 Actief' : '⚪ Inactief'}
                </button>
              </div>

              {/* Action Buttons - Mobile Optimized */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    console.log('🔗 Playing video in thumbnail:', video.name);
                    const videoElement = document.querySelector(`[data-video-id="${video.id}"]`) as HTMLVideoElement;
                    if (videoElement) {
                      videoElement.play();
                    }
                  }}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 text-xs font-medium"
                  title="Afspelen"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="hidden sm:inline">Afspelen</span>
                </button>
                
                <button
                  onClick={() => window.open(getVideoUrl(video), '_blank')}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 hover:scale-105 text-xs font-medium"
                  title="Bekijk"
                >
                  <EyeIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">Bekijk</span>
                </button>
                
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = getVideoUrl(video);
                    link.download = video.original_name;
                    link.click();
                  }}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 text-xs font-medium"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover:scale-105 text-xs font-medium"
                  title="Verwijder"
                >
                  <TrashIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">Verwijder</span>
                </button>
              </div>

              {/* Campaign Setup Button */}
              <div className="mt-3">
                <button
                  onClick={() => {
                    setCampaignVideo(video);
                    setShowCampaignSetup(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm font-medium"
                  title="Campagne opzetten voor deze video"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="hidden sm:inline">Campagne Opzetten</span>
                  <span className="sm:hidden">Campagne</span>
                </button>
              </div>

              {/* Target Audience Input */}
              <div className="mt-3 space-y-2">
                <label className="block text-xs font-medium text-gray-300">
                  🎯 Doelgroep
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Bijv: Mannen 25-45, fitness, Nederland"
                    defaultValue={video.target_audience || ''}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = (e.target as HTMLInputElement).value;
                        if (target.trim()) {
                          saveTargetAudience(video.id, target.trim());
                          (e.target as HTMLInputElement).blur();
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const target = e.target.value;
                      if (target.trim() && target !== video.target_audience) {
                        saveTargetAudience(video.id, target.trim());
                      }
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const target = input.value.trim();
                      if (target) {
                        saveTargetAudience(video.id, target);
                        input.blur();
                      }
                    }}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex-shrink-0"
                    title="Doelgroep opslaan"
                  >
                    💾
                  </button>
                </div>
                {video.target_audience && (
                  <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                    <strong>Huidige:</strong> {video.target_audience}
                  </div>
                )}
              </div>

              {/* Video Details */}
              <div className="text-xs text-gray-400 space-y-1">
                <div className="truncate">Bestand: {video.original_name}</div>
                <div>Grootte: {(video.file_size / 1024 / 1024).toFixed(1)} MB</div>
                <div>Toegevoegd: {new Date(video.created_at).toLocaleDateString('nl-NL')}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && !loading && (
        <div className="text-center py-12">
          <VideoCameraIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Geen video's gevonden</h3>
          <p className="text-gray-500 text-sm sm:text-base">
            {searchTerm || filterStatus !== 'all' 
              ? 'Probeer je zoekopdracht of filters aan te passen.'
              : 'Upload je eerste video om te beginnen.'
            }
          </p>
        </div>
      )}

      {/* Campaign Setup Modal */}
      {showCampaignSetup && campaignVideo && (
        <CampaignSetup
          selectedVideo={{
            id: campaignVideo.id,
            name: campaignVideo.name,
            campaignStatus: campaignVideo.campaign_status
          }}
          onClose={() => {
            setShowCampaignSetup(false);
            setCampaignVideo(null);
          }}
          onSave={(campaign) => {
            console.log('🎯 Campaign saved:', campaign);
            alert(`Campagne "${campaign.name}" succesvol opgezet!\n\nBudget: €${campaign.budget.amount} ${campaign.budget.type === 'DAILY' ? 'per dag' : 'totaal'}\nTargeting: ${campaign.targeting.ageMin}-${campaign.targeting.ageMax} jaar, ${campaign.targeting.gender}\nLocaties: ${campaign.targeting.locations.join(', ')}`);
            setShowCampaignSetup(false);
            setCampaignVideo(null);
          }}
        />
      )}
    </div>
  );
}
