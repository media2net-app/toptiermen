'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  StarIcon,
  FireIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface CompetitorAd {
  id: string;
  competitorId: string;
  title: string;
  platform: string;
  type: 'image' | 'video' | 'carousel' | 'story' | 'text';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  estimatedReach: number;
  estimatedEngagement: number;
  estimatedSpend: number;
  targetAudience: string;
  messaging: string;
  creativeElements: string[];
  callToAction: string;
  strengths: string[];
  weaknesses: string[];
  insights: string;
  dateObserved: string;
  createdAt: string;
}

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

interface CompetitorAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad?: CompetitorAd | null;
  competitors: Competitor[];
  onSave: (ad: Omit<CompetitorAd, 'id' | 'createdAt'>) => void;
}

export default function CompetitorAdModal({ isOpen, onClose, ad, competitors, onSave }: CompetitorAdModalProps) {
  const [formData, setFormData] = useState<Omit<CompetitorAd, 'id' | 'createdAt'>>({
    competitorId: '',
    title: '',
    platform: '',
    type: 'image',
    content: '',
    imageUrl: '',
    videoUrl: '',
    performance: 'good' as const,
    estimatedReach: 0,
    estimatedEngagement: 0,
    estimatedSpend: 0,
    targetAudience: '',
    messaging: '',
    creativeElements: [] as string[],
    callToAction: '',
    strengths: [] as string[],
    weaknesses: [] as string[],
    insights: '',
    dateObserved: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCreativeElement, setNewCreativeElement] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');

  useEffect(() => {
    if (ad) {
      setFormData({
        competitorId: ad.competitorId,
        title: ad.title,
        platform: ad.platform,
        type: ad.type,
        content: ad.content,
        imageUrl: ad.imageUrl || '',
        videoUrl: ad.videoUrl || '',
        performance: ad.performance,
        estimatedReach: ad.estimatedReach,
        estimatedEngagement: ad.estimatedEngagement,
        estimatedSpend: ad.estimatedSpend,
        targetAudience: ad.targetAudience,
        messaging: ad.messaging,
        creativeElements: ad.creativeElements,
        callToAction: ad.callToAction,
        strengths: ad.strengths,
        weaknesses: ad.weaknesses,
        insights: ad.insights,
        dateObserved: ad.dateObserved
      });
    } else {
      setFormData({
        competitorId: '',
        title: '',
        platform: '',
        type: 'image',
        content: '',
        imageUrl: '',
        videoUrl: '',
        performance: 'good',
        estimatedReach: 0,
        estimatedEngagement: 0,
        estimatedSpend: 0,
        targetAudience: '',
        messaging: '',
        creativeElements: [],
        callToAction: '',
        strengths: [],
        weaknesses: [],
        insights: '',
        dateObserved: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [ad, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.competitorId) {
      newErrors.competitorId = 'Concurent is verplicht';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Titel is verplicht';
    }

    if (!formData.platform.trim()) {
      newErrors.platform = 'Platform is verplicht';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is verplicht';
    }

    if (!formData.targetAudience.trim()) {
      newErrors.targetAudience = 'Doelgroep is verplicht';
    }

    if (!formData.callToAction.trim()) {
      newErrors.callToAction = 'Call-to-action is verplicht';
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

  const handleInputChange = (field: string, value: string | number) => {
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

  const addCreativeElement = () => {
    if (newCreativeElement.trim() && !formData.creativeElements.includes(newCreativeElement.trim())) {
      setFormData(prev => ({
        ...prev,
        creativeElements: [...prev.creativeElements, newCreativeElement.trim()]
      }));
      setNewCreativeElement('');
    }
  };

  const removeCreativeElement = (element: string) => {
    setFormData(prev => ({
      ...prev,
      creativeElements: prev.creativeElements.filter(e => e !== element)
    }));
  };

  const addStrength = () => {
    if (newStrength.trim() && !formData.strengths.includes(newStrength.trim())) {
      setFormData(prev => ({
        ...prev,
        strengths: [...prev.strengths, newStrength.trim()]
      }));
      setNewStrength('');
    }
  };

  const removeStrength = (strength: string) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.filter(s => s !== strength)
    }));
  };

  const addWeakness = () => {
    if (newWeakness.trim() && !formData.weaknesses.includes(newWeakness.trim())) {
      setFormData(prev => ({
        ...prev,
        weaknesses: [...prev.weaknesses, newWeakness.trim()]
      }));
      setNewWeakness('');
    }
  };

  const removeWeakness = (weakness: string) => {
    setFormData(prev => ({
      ...prev,
      weaknesses: prev.weaknesses.filter(w => w !== weakness)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <EyeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {ad ? 'Bewerk Advertentie' : 'Advertentie Toevoegen'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {ad ? 'Update de informatie van deze advertentie' : 'Voeg een nieuwe advertentie toe van een concurent'}
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
                      Concurent *
                    </label>
                    <select
                      value={formData.competitorId}
                      onChange={(e) => handleInputChange('competitorId', e.target.value)}
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                        errors.competitorId ? 'border-red-500' : 'border-gray-600'
                      }`}
                    >
                      <option value="">Selecteer concurent</option>
                      {competitors.map(competitor => (
                        <option key={competitor.id} value={competitor.id}>
                          {competitor.name}
                        </option>
                      ))}
                    </select>
                    {errors.competitorId && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {errors.competitorId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Platform *
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => handleInputChange('platform', e.target.value)}
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                        errors.platform ? 'border-red-500' : 'border-gray-600'
                      }`}
                    >
                      <option value="">Selecteer platform</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Twitter">Twitter</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="YouTube">YouTube</option>
                    </select>
                    {errors.platform && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {errors.platform}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                        errors.title ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Advertentie titel"
                    />
                    {errors.title && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      <option value="image">Afbeelding</option>
                      <option value="video">Video</option>
                      <option value="carousel">Carousel</option>
                      <option value="story">Story</option>
                      <option value="text">Tekst</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                      errors.content ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Beschrijf de content van de advertentie..."
                  />
                  {errors.content && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      {errors.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Media URLs */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Media</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Afbeelding URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Prestatie Metrics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Geschatte Reach
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedReach}
                      onChange={(e) => handleInputChange('estimatedReach', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Geschatte Engagement
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedEngagement}
                      onChange={(e) => handleInputChange('estimatedEngagement', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Geschatte Uitgave (€)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedSpend}
                      onChange={(e) => handleInputChange('estimatedSpend', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prestatie
                    </label>
                    <select
                      value={formData.performance}
                      onChange={(e) => handleInputChange('performance', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    >
                      <option value="excellent">Uitstekend</option>
                      <option value="good">Goed</option>
                      <option value="average">Gemiddeld</option>
                      <option value="poor">Slecht</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Target and Messaging */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Doelgroep & Messaging</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Doelgroep *
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                        errors.targetAudience ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Bijv. Mannen 25-45, fitness geïnteresseerd"
                    />
                    {errors.targetAudience && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {errors.targetAudience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Call-to-Action *
                    </label>
                    <input
                      type="text"
                      value={formData.callToAction}
                      onChange={(e) => handleInputChange('callToAction', e.target.value)}
                      className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] ${
                        errors.callToAction ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Bijv. Start Gratis Proefperiode"
                    />
                    {errors.callToAction && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {errors.callToAction}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Messaging
                  </label>
                  <input
                    type="text"
                    value={formData.messaging}
                    onChange={(e) => handleInputChange('messaging', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    placeholder="Bijv. Transformatie, resultaten, snel effect"
                  />
                </div>
              </div>

              {/* Creative Elements */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Creatieve Elementen</h3>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCreativeElement}
                    onChange={(e) => setNewCreativeElement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCreativeElement())}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    placeholder="Voeg creatief element toe..."
                  />
                  <button
                    type="button"
                    onClick={addCreativeElement}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Toevoegen
                  </button>
                </div>

                {formData.creativeElements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.creativeElements.map((element, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                      >
                        {element}
                        <button
                          type="button"
                          onClick={() => removeCreativeElement(element)}
                          className="hover:text-red-300"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    Sterke Punten
                  </h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="Voeg sterk punt toe..."
                    />
                    <button
                      type="button"
                      onClick={addStrength}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {formData.strengths.length > 0 && (
                    <div className="space-y-2">
                      {formData.strengths.map((strength, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-600/20 border border-green-600/30 rounded-lg"
                        >
                          <span className="text-green-300">{strength}</span>
                          <button
                            type="button"
                            onClick={() => removeStrength(strength)}
                            className="text-green-400 hover:text-red-400"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <XCircleIcon className="w-5 h-5 text-red-400" />
                    Zwakke Punten
                  </h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newWeakness}
                      onChange={(e) => setNewWeakness(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWeakness())}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                      placeholder="Voeg zwak punt toe..."
                    />
                    <button
                      type="button"
                      onClick={addWeakness}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {formData.weaknesses.length > 0 && (
                    <div className="space-y-2">
                      {formData.weaknesses.map((weakness, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-red-600/20 border border-red-600/30 rounded-lg"
                        >
                          <span className="text-red-300">{weakness}</span>
                          <button
                            type="button"
                            onClick={() => removeWeakness(weakness)}
                            className="text-red-400 hover:text-green-400"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Insights and Date */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Analyse</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Datum Geobserveerd
                    </label>
                    <input
                      type="date"
                      value={formData.dateObserved}
                      onChange={(e) => handleInputChange('dateObserved', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Inzichten & Analyse
                  </label>
                  <textarea
                    value={formData.insights}
                    onChange={(e) => handleInputChange('insights', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                    placeholder="Voeg je inzichten en analyse toe over waarom deze advertentie wel/niet werkt..."
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
                  {ad ? 'Bijwerken' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 