import React from 'react';
import { XMarkIcon, PlayIcon, PhotoIcon, LinkIcon, EyeIcon } from '@heroicons/react/24/outline';

interface AdDetailModalProps {
  ad: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdDetailModal({ ad, isOpen, onClose }: AdDetailModalProps) {
  if (!isOpen || !ad) return null;

  const formatCurrency = (amount: number) => {
    return `€${(amount / 100).toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1F2E] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#2D3748] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Advertentie Details</h2>
            <p className="text-gray-400 mt-1">{ad.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#2D3748] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Basis Informatie</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ad ID:</span>
                  <span className="text-white font-mono">{ad.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    ad.status === 'active' ? 'bg-green-900/20 text-green-400' :
                    ad.status === 'paused' ? 'bg-yellow-900/20 text-yellow-400' :
                    'bg-gray-900/20 text-gray-400'
                  }`}>
                    {ad.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Campagne:</span>
                  <span className="text-white">{ad.campaign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ad Set:</span>
                  <span className="text-white">{ad.adSet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{ad.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aangemaakt:</span>
                  <span className="text-white">{new Date(ad.createdAt).toLocaleDateString('nl-NL')}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#2D3748] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Impressies:</span>
                  <span className="text-white">{ad.impressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bereik:</span>
                  <span className="text-white">{ad.reach.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Klikken:</span>
                  <span className="text-white">{ad.clicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CTR:</span>
                  <span className="text-white">{formatPercentage(ad.ctr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CPC:</span>
                  <span className="text-white">{formatCurrency(ad.cpc)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uitgegeven:</span>
                  <span className="text-white">{formatCurrency(ad.spent)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Details */}
          <div className="bg-[#2D3748] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <EyeIcon className="w-5 h-5 mr-2" />
              Creatieve Details
            </h3>
            <div className="space-y-4">
              {/* Title & Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Primaire Tekst (Title)</label>
                  <div className="bg-[#1A1F2E] rounded p-3 text-white text-sm">
                    {ad.title || 'Geen titel ingesteld'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Beschrijving (Body)</label>
                  <div className="bg-[#1A1F2E] rounded p-3 text-white text-sm">
                    {ad.body || 'Geen beschrijving ingesteld'}
                  </div>
                </div>
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link URL
                </label>
                <div className="bg-[#1A1F2E] rounded p-3">
                  <a
                    href={ad.link_url || 'https://platform.toptiermen.eu/prelaunch'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all"
                  >
                    {ad.link_url || 'https://platform.toptiermen.eu/prelaunch'}
                  </a>
                </div>
              </div>

              {/* Video/Image */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                  {ad.type === 'Video' ? (
                    <PlayIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <PhotoIcon className="w-4 h-4 mr-2" />
                  )}
                  {ad.type === 'Video' ? 'Video' : 'Afbeelding'}
                </label>
                <div className="bg-[#1A1F2E] rounded p-3">
                  {ad.type === 'Video' ? (
                    <div className="space-y-2">
                      <div className="text-white text-sm">
                        <strong>Video ID:</strong> {ad.video_id || 'Geen video ID'}
                      </div>
                      <div className="text-white text-sm">
                        <strong>Video Naam:</strong> {ad.videoName || 'Onbekende video'}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-white text-sm">
                        <strong>Afbeelding URL:</strong>
                      </div>
                      {ad.image_url ? (
                        <img
                          src={ad.image_url}
                          alt="Ad creative"
                          className="max-w-full h-auto rounded"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm">Geen afbeelding URL</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Creative ID */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Creative ID</label>
                <div className="bg-[#1A1F2E] rounded p-3">
                  <span className="text-white font-mono text-sm">
                    {ad.creative_id || 'Geen creative ID'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Creative Data (for debugging) */}
          {ad.raw_creative && (
            <div className="bg-[#2D3748] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Raw Creative Data</h3>
              <div className="bg-[#1A1F2E] rounded p-3 overflow-x-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(ad.raw_creative, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Raw Ad Data (for debugging) */}
          <div className="bg-[#2D3748] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Raw Ad Data</h3>
            <div className="bg-[#1A1F2E] rounded p-3 overflow-x-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(ad, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2D3748] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
