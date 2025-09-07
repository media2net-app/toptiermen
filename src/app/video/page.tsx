'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PublicVideoModal from '@/components/PublicVideoModal';

export default function PublicVideoPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    title: string;
    url: string;
    description: string;
  } | null>(null);

  const publicVideos = [
    {
      id: 1,
      title: "Welkom bij Top Tier Men",
      description: "Ontdek wat Top Tier Men voor jou kan betekenen",
      url: "/welkom-v2.MP4",
      thumbnail: "/logo_white-full.svg"
    },
    {
      id: 2,
      title: "Test Gebruiker Video",
      description: "Speciale video voor test gebruikers",
      url: "/testgebruikers-v2.mp4",
      thumbnail: "/logo_white-full.svg"
    }
  ];

  const openVideo = (video: typeof publicVideos[0]) => {
    setSelectedVideo({
      title: video.title,
      url: video.url,
      description: video.description
    });
    setShowVideoModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0F0A] text-white">
      {/* Header */}
      <header className="bg-[#181F17] border-b border-[#3A4D23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo_white-full.svg" 
                alt="Top Tier Men Logo" 
                className="h-8 sm:h-12 w-auto"
              />
            </div>
            <div className="text-sm text-[#8BAE5A]">
              Publieke Video's
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Top Tier Men Video's
          </h1>
          <p className="text-xl text-[#8BAE5A] max-w-3xl mx-auto">
            Bekijk onze video's en ontdek wat Top Tier Men voor jou kan betekenen. 
            Deze video's zijn beschikbaar voor alle bezoekers.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#181F17] rounded-xl overflow-hidden border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300 group cursor-pointer"
              onClick={() => openVideo(video)}
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-black">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#8BAE5A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <PlayIcon className="w-8 h-8 text-[#181F17] ml-1" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-medium">Klik om af te spelen</p>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#8BAE5A] transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {video.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-[#181F17] rounded-xl p-8 border border-[#3A4D23] max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Interesse in meer?
            </h2>
            <p className="text-[#8BAE5A] mb-6">
              Schrijf je in voor de wachtlijst en krijg toegang tot alle content en functionaliteiten.
            </p>
            <a
              href="/prelaunch"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all duration-200"
            >
              Schrijf je in voor de wachtlijst
            </a>
          </div>
        </div>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <PublicVideoModal
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
          videoTitle={selectedVideo.title}
          videoUrl={selectedVideo.url}
          description={selectedVideo.description}
        />
      )}
    </div>
  );
}
