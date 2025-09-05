'use client';

import { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';

export default function SneakPreviewPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    const video = document.getElementById('preview-video') as HTMLVideoElement;
    if (video) {
      video.play();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="pt-12 pb-8 text-center">
          <div className="max-w-4xl mx-auto px-6">
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4">
                <span className="text-2xl font-bold text-white">TTM</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Top Tier Men
              </h1>
              <div className="inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-green-300 font-medium">EXCLUSIEVE SNEAK PREVIEW</span>
              </div>
            </div>

            {/* Exclusive Access Message */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                🎬 Eerste Blik op het Platform
              </h2>
              <div className="bg-gradient-to-r from-green-600/10 to-transparent border border-green-500/30 rounded-lg p-6 text-left max-w-2xl mx-auto">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Exclusieve Pre-Launch Toegang</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Je behoort tot een <strong className="text-green-400">selectieve groep</strong> van pre-launch leden die als eerste een kijkje mogen nemen achter de schermen van het Top Tier Men platform. Deze sneak preview is alleen beschikbaar voor uitgenodigde leden.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="relative">
            {/* Video Container */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video
                id="preview-video"
                className="w-full aspect-video"
                controls={isPlaying}
                poster="/platform-preview-poster.jpg"
                onLoadedData={() => setVideoLoaded(true)}
                onPlay={() => setIsPlaying(true)}
                preload="metadata"
              >
                <source src="/platform-preview.mp4" type="video/mp4" />
                <p className="text-white p-8 text-center">
                  Je browser ondersteunt geen video afspelen. 
                  <a href="/platform-preview.mp4" className="text-green-400 underline ml-1">
                    Download de video hier.
                  </a>
                </p>
              </video>

              {/* Custom Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <button
                    onClick={handlePlayVideo}
                    className="group relative"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl scale-150 group-hover:scale-175 transition-transform duration-300"></div>
                    
                    {/* Play Button */}
                    <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all duration-300">
                      <PlayIcon className="w-10 h-10 text-white ml-1" />
                    </div>
                  </button>
                </div>
              )}

              {/* Video Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Platform Preview - Top Tier Men
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Korte inzage in Academy, Voedingsplannen, Trainingen & Brotherhood
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-medium">EXCLUSIEF</div>
                    <div className="text-gray-400 text-xs">Pre-Launch Preview</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Loading State */}
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Video wordt geladen...</p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">📚</div>
              <h4 className="text-white font-semibold mb-2">Academy</h4>
              <p className="text-gray-400 text-sm">Complete trainings voor persoonlijke ontwikkeling en succes</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🍽️</div>
              <h4 className="text-white font-semibold mb-2">Voedingsplannen</h4>
              <p className="text-gray-400 text-sm">Gepersonaliseerde voeding afgestemd op jouw doelen</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🤝</div>
              <h4 className="text-white font-semibold mb-2">Brotherhood</h4>
              <p className="text-gray-400 text-sm">Exclusieve community van gelijkgestemde top performers</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Binnenkort Beschikbaar
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Als pre-launch lid krijg je als eerste toegang tot het volledige platform. 
                Houd je email in de gaten voor exclusieve updates en je persoonlijke toegangscode.
              </p>
              <div className="inline-flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Je bent op de VIP lijst</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-8 text-center">
            <p className="text-gray-400 text-sm mb-4">
              © 2024 Top Tier Men - Exclusieve Broederschap voor Top Performers
            </p>
            <p className="text-gray-500 text-xs">
              Deze preview is vertrouwelijk en alleen bedoeld voor uitgenodigde pre-launch leden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
