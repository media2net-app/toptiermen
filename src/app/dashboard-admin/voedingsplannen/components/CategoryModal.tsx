'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Category {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: Category | null;
}

export default function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  // Initialize form data when modal opens or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || ''
        });
      } else {
        setFormData({
          name: '',
          description: ''
        });
      }
      setError('');
    }
  }, [isOpen, category]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [field]: value
      };
      
      // Auto-generate a value from name when name changes (for consistency)
      if (field === 'name' && value) {
        const generatedValue = value
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .replace(/_{2,}/g, '_') // Replace multiple underscores with single
          .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        
        // For categories, we use the name as the value since it's simpler
        updatedData.value = value;
      }
      
      return updatedData;
    });
  };

  const handleSave = async () => {
    if (!formData.name) {
      setError('Naam is verplicht');
      return;
    }

    // Validate that name is unique and follows naming convention
    if (!formData.name.match(/^[a-zA-Z\s]+$/)) {
      setError('Naam mag alleen letters en spaties bevatten');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (category) {
        // Update existing category
        const response = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: category.id,
            ...formData,
            updated_at: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update category');
        }
      } else {
        // Create new category
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create category');
        }
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-lg border border-[#3A4D23]/40 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]/40">
          <h2 className="text-xl font-semibold text-white">
            {category ? 'Bewerk Categorie' : 'Nieuwe Categorie'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Naam */}
          <div>
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Naam *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Bijv. Granen, Eiwitten, Groente"
              className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              De naam van de categorie (alleen letters en spaties)
            </p>
          </div>


          {/* Beschrijving */}
          <div>
            <label className="block text-[#8BAE5A] font-semibold mb-2">
              Beschrijving
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optionele beschrijving van deze categorie"
              rows={3}
              className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#3A4D23]/40">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-[#8BAE5A] border border-[#3A4D23] rounded-lg hover:bg-[#3A4D23]/40 transition-colors disabled:opacity-50"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.name}
            className="flex items-center gap-2 px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#232D1A] border-t-transparent rounded-full animate-spin"></div>
                {category ? 'Bijwerken...' : 'Aanmaken...'}
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                {category ? '✓ Bijwerken' : '✓ Opslaan'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
