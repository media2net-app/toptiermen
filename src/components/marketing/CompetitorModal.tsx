'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Competitor {
  id: string;
  name: string;
  industry: string;
  website: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
  };
  status: 'active' | 'inactive' | 'monitoring';
  strength: 'high' | 'medium' | 'low';
  notes: string;
  createdAt: string;
  lastUpdated: string;
}

interface CompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitor?: Competitor | null;
  onSave: (competitor: Omit<Competitor, 'id' | 'createdAt' | 'lastUpdated'>) => void;
}

export default function CompetitorModal({ isOpen, onClose, competitor, onSave }: CompetitorModalProps) {
  const [formData, setFormData] = useState<Omit<Competitor, 'id' | 'createdAt' | 'lastUpdated'>>({
    name: '',
    industry: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: ''
    },
    contactInfo: {
      email: '',
      phone: ''
    },
    status: 'active',
    strength: 'medium',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (competitor) {
      setFormData({
        name: competitor.name,
        industry: competitor.industry,
        website: competitor.website,
        socialMedia: {
          facebook: competitor.socialMedia.facebook || '',
          instagram: competitor.socialMedia.instagram || '',
          linkedin: competitor.socialMedia.linkedin || '',
          twitter: competitor.socialMedia.twitter || ''
        },
        contactInfo: {
          email: competitor.contactInfo.email || '',
          phone: competitor.contactInfo.phone || ''
        },
        status: competitor.status,
        strength: competitor.strength,
        notes: competitor.notes
      });
    } else {
      setFormData({
        name: '',
        industry: '',
        website: '',
        socialMedia: {
          facebook: '',
          instagram: '',
          linkedin: '',
          twitter: ''
        },
        contactInfo: {
          email: '',
          phone: ''
        },
        status: 'active',
        strength: 'medium',
        notes: ''
      });
    }
    setErrors({});
  }, [competitor, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }

    if (!formData.industry.trim()) {
      newErrors.industry = 'Industrie is verplicht';
    }

    if (!formData.website.trim()) {
      newErrors.website = 'Website is verplicht';
    } else if (!formData.website.startsWith('http://') && !formData.website.startsWith('https://')) {
      newErrors.website = 'Website moet beginnen met http:// of https://';
    }

    if (formData.contactInfo.email && !/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
      newErrors.email = 'Ongeldig e-mailadres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {competitor ? 'Bewerk Concurent' : 'Concurent Toevoegen'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {competitor ? 'Update de informatie van deze concurent' : 'Voeg een nieuwe concurent toe om te monitoren'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Basis Informatie</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Naam *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Concurent naam"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Industrie *
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                        errors.industry ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Bijv. Fitness, E-commerce, etc."
                    />
                    {errors.industry && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {errors.industry}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website *
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                        errors.website ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="https://www.example.com"
                    />
                  </div>
                  {errors.website && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      {errors.website}
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Strength */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Status & Analyse</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      <option value="active">Actief</option>
                      <option value="inactive">Inactief</option>
                      <option value="monitoring">Monitoring</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Concurrentie Sterkte
                    </label>
                    <select
                      value={formData.strength}
                      onChange={(e) => handleInputChange('strength', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      <option value="low">Laag</option>
                      <option value="medium">Medium</option>
                      <option value="high">Hoog</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Social Media</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Contact Informatie</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => handleContactInfoChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                          errors.email ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="info@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Telefoon
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.contactInfo.phone}
                        onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                        placeholder="+31 20 123 4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Notities</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Observaties & Notities
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    placeholder="Voeg observaties, sterke punten, zwakke punten, of andere notities toe..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1E40AF] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {competitor ? 'Bijwerken' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 