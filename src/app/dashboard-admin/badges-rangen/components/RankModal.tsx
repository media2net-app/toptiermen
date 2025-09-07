'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Rank {
  id: string;
  name: string;
  level: number;
  color: string;
  requirements: string;
  benefits: string;
}

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rank: Rank) => void;
  editingRank?: Rank | null;
  isReorderMode: boolean;
  ranks: Rank[];
  setRanks: (ranks: Rank[]) => void;
}

export default function RankModal({ isOpen, onClose, onSave, editingRank, isReorderMode }: RankModalProps) {
  const [rank, setRank] = useState<Rank>({
    id: '',
    name: '',
    level: 1,
    color: '#6B7280',
    requirements: '',
    benefits: ''
  });

  useEffect(() => {
    if (editingRank) {
      setRank(editingRank);
    } else {
      setRank({
        id: '',
        name: '',
        level: 1,
        color: '#6B7280',
        requirements: '',
        benefits: ''
      });
    }
  }, [editingRank, isOpen]);

  const handleSave = () => {
    if (!rank.name || !rank.requirements) {
      alert('Vul alle verplichte velden in');
      return;
    }
    onSave(rank);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingRank ? 'Rang Bewerken' : 'Nieuwe Rang Toevoegen'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="rankName" className="block text-sm font-medium text-gray-700 mb-1">
                Naam *
              </label>
              <input
                id="rankName"
                type="text"
                value={rank.name}
                onChange={(e) => setRank(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bijv. Novice, Warrior"
              />
            </div>
            <div>
              <label htmlFor="rankLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Niveau *
              </label>
              <input
                id="rankLevel"
                type="number"
                value={rank.level}
                onChange={(e) => setRank(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="rankColor" className="block text-sm font-medium text-gray-700 mb-1">
              Kleur
            </label>
            <div className="flex items-center gap-4">
              <input
                id="rankColor"
                type="color"
                value={rank.color}
                onChange={(e) => setRank(prev => ({ ...prev, color: e.target.value }))}
                className="h-12 w-24 border-none cursor-pointer rounded-md"
              />
              <input
                type="text"
                value={rank.color}
                onChange={(e) => setRank(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#6B7280"
              />
            </div>
          </div>

          <div>
            <label htmlFor="rankRequirements" className="block text-sm font-medium text-gray-700 mb-1">
              Vereisten *
            </label>
            <textarea
              id="rankRequirements"
              value={rank.requirements}
              onChange={(e) => setRank(prev => ({ ...prev, requirements: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Beschrijf de vereisten voor deze rang..."
            />
          </div>

          <div>
            <label htmlFor="rankBenefits" className="block text-sm font-medium text-gray-700 mb-1">
              Voordelen
            </label>
            <textarea
              id="rankBenefits"
              value={rank.benefits}
              onChange={(e) => setRank(prev => ({ ...prev, benefits: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Beschrijf de voordelen van deze rang..."
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {editingRank ? 'Wijzigingen Opslaan' : 'Rang Toevoegen'}
          </button>
        </div>
      </div>
    </div>
  );
} 