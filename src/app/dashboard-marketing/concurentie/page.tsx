'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
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
  BuildingStorefrontIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  LinkIcon,
  HeartIcon,
  EyeSlashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import CompetitorModal from '@/components/marketing/CompetitorModal';
import CompetitorAdModal from '@/components/marketing/CompetitorAdModal';

// Types
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

export default function CompetitionPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [competitorAds, setCompetitorAds] = useState<CompetitorAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStrength, setFilterStrength] = useState('all');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [selectedAd, setSelectedAd] = useState<CompetitorAd | null>(null);
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [viewMode, setViewMode] = useState<'competitors' | 'ads'>('competitors');
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [editingAd, setEditingAd] = useState<CompetitorAd | null>(null);
  const [importingFacebookAds, setImportingFacebookAds] = useState(false);
  const [facebookImportStatus, setFacebookImportStatus] = useState<string>('');

  // Mock data
  useEffect(() => {
    const mockCompetitors: Competitor[] = [
      {
        id: "1",
        name: "De Nieuwe Lichting",
        industry: "Fitness & Persoonlijke Ontwikkeling",
        website: "https://denieuwelichting.nl",
        socialMedia: {
          facebook: "https://facebook.com/denieuwelichting",
          instagram: "https://instagram.com/denieuwelichting"
        },
        contactInfo: {
          email: "info@denieuwelichting.nl"
        },
        status: "active",
        strength: "high",
        notes: "Controversiële maar effectieve marketing strategie. Focus op mannelijke empowerment.",
        createdAt: "2025-01-15T10:00:00Z",
        lastUpdated: "2025-07-27T10:30:00Z"
      },
      {
        id: "2",
        name: "FitnessPro Nederland",
        industry: "Fitness & Wellness",
        website: "https://fitnesspro.nl",
        socialMedia: {
          facebook: "https://facebook.com/fitnesspro",
          instagram: "https://instagram.com/fitnesspro",
          linkedin: "https://linkedin.com/company/fitnesspro"
        },
        contactInfo: {
          email: "info@fitnesspro.nl",
          phone: "+31 20 123 4567"
        },
        status: "active",
        strength: "high",
        notes: "Sterke aanwezigheid in de Nederlandse fitness markt. Focus op premium personal training.",
        createdAt: "2025-01-15T10:00:00Z",
        lastUpdated: "2025-07-27T09:15:00Z"
      },
      {
        id: "3",
        name: "MindfulLife Coaching",
        industry: "Personal Development",
        website: "https://mindfullife.nl",
        socialMedia: {
          instagram: "https://instagram.com/mindfullife",
          linkedin: "https://linkedin.com/company/mindfullife"
        },
        contactInfo: {
          email: "hello@mindfullife.nl"
        },
        status: "monitoring",
        strength: "medium",
        notes: "Nieuwe speler in de markt. Focus op mindfulness en life coaching.",
        createdAt: "2025-03-20T14:00:00Z",
        lastUpdated: "2025-07-25T16:45:00Z"
      }
    ];

    const mockAds: CompetitorAd[] = [
      {
        id: "1",
        competitorId: "1",
        title: "BEHEERSTE KRACHT!",
        platform: "Facebook, Instagram, Messenger",
        type: "image",
        content: "Dit is de reden dat de huidige generatie jongens zo zwak is. Er is geen maatstaf. Daardoor blijven jochies jochies en worden ze nooit mannen. Kom er in 1 minuut achter of je aantrekkelijk bent voor vrouwen en...",
        imageUrl: "/images/ads/nieuwe-lichting-gym.jpg",
        performance: "excellent",
        estimatedReach: 75000,
        estimatedEngagement: 2250,
        estimatedSpend: 1200,
        targetAudience: "Mannen 18-35, fitness geïnteresseerd",
        messaging: "Controversieel, empowerment, mannelijkheid",
        creativeElements: ["Gym setting", "Push-ups", "Phone overlay", "Orange branding"],
        callToAction: "BEHEERSTE KRACHT!",
        strengths: ["Controversiële boodschap", "Duidelijke CTA", "Sterke visuele impact"],
        weaknesses: ["Polariserende content", "Mogelijk offensief"],
        insights: "Controversiële content genereert 3x meer engagement dan traditionele ads.",
        dateObserved: "2025-10-28",
        createdAt: "2025-10-28T08:00:00Z"
      },
      {
        id: "2",
        competitorId: "1",
        title: "BEHEERSTE KRACHT!",
        platform: "Facebook, Instagram, Messenger",
        type: "image",
        content: "Dit is de reden dat de huidige generatie jongens zo zwak is. Er is geen maatstaf. Daardoor blijven jochies jochies en worden ze nooit mannen. Kom er in 1 minuut achter of je aantrekkelijk bent voor vrouwen en...",
        imageUrl: "/images/ads/nieuwe-lichting-forest.jpg",
        performance: "good",
        estimatedReach: 62000,
        estimatedEngagement: 1860,
        estimatedSpend: 950,
        targetAudience: "Mannen 18-35, outdoor activiteiten",
        messaging: "Natuurlijke setting, empowerment, mannelijkheid",
        creativeElements: ["Forest setting", "Nature", "Phone screen", "Orange branding"],
        callToAction: "BEHEERSTE KRACHT!",
        strengths: ["Natuurlijke setting", "Duidelijke branding", "Sterke CTA"],
        weaknesses: ["Zelfde copy als andere ads", "Minder impactvol"],
        insights: "Outdoor settings presteren 25% beter dan indoor settings voor deze doelgroep.",
        dateObserved: "2025-10-25",
        createdAt: "2025-10-25T14:30:00Z"
      },
      {
        id: "3",
        competitorId: "2",
        title: "Transform Your Body in 12 Weeks",
        platform: "Facebook, Instagram",
        type: "video",
        content: "Ontdek hoe je in slechts 12 weken je droomlichaam kunt bereiken met onze bewezen methode. Start vandaag nog!",
        videoUrl: "https://example.com/fitnesspro-video.mp4",
        performance: "excellent",
        estimatedReach: 50000,
        estimatedEngagement: 1600,
        estimatedSpend: 800,
        targetAudience: "Mannen 25-45, fitness geïnteresseerd",
        messaging: "Transformatie, resultaten, snel effect",
        creativeElements: ["Voor/na foto's", "Video testimonials", "Progress tracking"],
        callToAction: "Start Gratis Proefperiode",
        strengths: ["Sterke visuele impact", "Duidelijke resultaten", "Social proof"],
        weaknesses: ["Geen prijsinformatie", "Te veel focus op snelheid"],
        insights: "Video content presteert 40% beter dan statische afbeeldingen voor fitness ads.",
        dateObserved: "2025-07-20",
        createdAt: "2025-07-20T08:00:00Z"
      },
      {
        id: "4",
        competitorId: "2",
        title: "Free Fitness Assessment",
        platform: "Instagram",
        type: "carousel",
        content: "Krijg een gratis fitness assessment en persoonlijk trainingsplan. Geen verplichtingen, direct resultaat!",
        imageUrl: "/images/ads/fitnesspro-carousel.jpg",
        performance: "good",
        estimatedReach: 28000,
        estimatedEngagement: 980,
        estimatedSpend: 450,
        targetAudience: "Mannen 18-35, fitness beginners",
        messaging: "Gratis aanbod, persoonlijke begeleiding",
        creativeElements: ["Carousel", "Before/after", "Testimonials", "Free offer"],
        callToAction: "Gratis Assessment",
        strengths: ["Gratis aanbod", "Duidelijke waarde propositie", "Lage drempel"],
        weaknesses: ["Lage conversie rate", "Veel tire-kickers"],
        insights: "Gratis aanbiedingen genereren 60% meer leads maar hebben lagere conversie.",
        dateObserved: "2025-07-22",
        createdAt: "2025-07-22T14:30:00Z"
      },
      {
        id: "5",
        competitorId: "3",
        title: "Find Your Inner Peace",
        platform: "Facebook, Instagram",
        type: "image",
        content: "Leer mediteren en vind innerlijke rust in slechts 10 minuten per dag. Start je mindfulness reis vandaag.",
        imageUrl: "/images/ads/mindfullife-meditation.jpg",
        performance: "excellent",
        estimatedReach: 18000,
        estimatedEngagement: 720,
        estimatedSpend: 320,
        targetAudience: "Vrouwen 30-50, stress management",
        messaging: "Rust, mindfulness, persoonlijke groei",
        creativeElements: ["Calming visuals", "Testimonials", "Peaceful setting"],
        callToAction: "Start Vandaag",
        strengths: ["Hoge CTR", "Duidelijke boodschap", "Rustgevende visuals"],
        weaknesses: ["Beperkte reach", "Kleine target audience"],
        insights: "Meditatie content heeft hoge engagement in stressvolle tijden.",
        dateObserved: "2025-07-25",
        createdAt: "2025-07-25T11:20:00Z"
      }
    ];

    setCompetitors(mockCompetitors);
    setCompetitorAds(mockAds);
    setLoading(false);
  }, []);

  const handleAddCompetitor = () => {
    setEditingCompetitor(null);
    setShowCompetitorModal(true);
  };

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setShowCompetitorModal(true);
  };

  const handleDeleteCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
    setCompetitorAds(competitorAds.filter(ad => ad.competitorId !== id));
  };

  const handleSaveCompetitor = (competitorData: Omit<Competitor, 'id' | 'createdAt' | 'lastUpdated'>) => {
    if (editingCompetitor) {
      // Update existing competitor
      setCompetitors(prev => prev.map(c => 
        c.id === editingCompetitor.id 
          ? { ...c, ...competitorData, lastUpdated: new Date().toISOString() }
          : c
      ));
    } else {
      // Add new competitor
      const newCompetitor: Competitor = {
        ...competitorData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      setCompetitors(prev => [...prev, newCompetitor]);
    }
    setShowCompetitorModal(false);
  };

  const handleAddAd = (competitorId: string) => {
    setEditingAd(null);
    setSelectedCompetitor(competitors.find(c => c.id === competitorId) || null);
    setShowAdModal(true);
  };

  const handleEditAd = (ad: CompetitorAd) => {
    setEditingAd(ad);
    setShowAdModal(true);
  };

  const handleDeleteAd = (id: string) => {
    setCompetitorAds(competitorAds.filter(ad => ad.id !== id));
  };

  const handleSaveAd = (adData: Omit<CompetitorAd, 'id' | 'createdAt'>) => {
    if (editingAd) {
      // Update existing ad
      setCompetitorAds(prev => prev.map(ad => 
        ad.id === editingAd.id 
          ? { ...ad, ...adData }
          : ad
      ));
    } else {
      // Add new ad
      const newAd: CompetitorAd = {
        ...adData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setCompetitorAds(prev => [...prev, newAd]);
    }
    setShowAdModal(false);
  };

  const handleImportFacebookAds = async (competitorId: string) => {
    const competitor = competitors.find(c => c.id === competitorId);
    if (!competitor) return;

    setImportingFacebookAds(true);
    setFacebookImportStatus('Zoeken naar Facebook advertenties...');

    try {
      const response = await fetch(`/api/marketing/facebook-ads?competitor=${encodeURIComponent(competitor.name)}&country=NL`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const newAds = result.data.map((facebookAd: any) => ({
          ...facebookAd,
          id: `fb_${Date.now()}_${Math.random()}`,
          competitorId,
          createdAt: new Date().toISOString()
        }));

        setCompetitorAds(prev => [...prev, ...newAds]);
        setFacebookImportStatus(`✅ ${newAds.length} Facebook advertenties geïmporteerd`);
      } else {
        setFacebookImportStatus('❌ Geen Facebook advertenties gevonden voor deze concurent');
      }
    } catch (error) {
      console.error('Error importing Facebook ads:', error);
      setFacebookImportStatus('❌ Fout bij importeren van Facebook advertenties');
    } finally {
      setTimeout(() => {
        setImportingFacebookAds(false);
        setFacebookImportStatus('');
      }, 3000);
    }
  };

  const handleCompetitorClick = (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    setViewMode('ads');
  };

  const handleAdClick = (ad: CompetitorAd) => {
    setSelectedAd(ad);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'inactive': return 'text-red-400 bg-red-400/10';
      case 'monitoring': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-400 bg-green-400/10';
      case 'good': return 'text-blue-400 bg-blue-400/10';
      case 'average': return 'text-yellow-400 bg-yellow-400/10';
      case 'poor': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || competitor.status === filterStatus;
    const matchesStrength = filterStrength === 'all' || competitor.strength === filterStrength;
    return matchesSearch && matchesStatus && matchesStrength;
  });

  const filteredAds = competitorAds.filter(ad => {
    const competitor = competitors.find(c => c.id === ad.competitorId);
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competitor?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompetitor = !selectedCompetitor || ad.competitorId === selectedCompetitor.id;
    return matchesSearch && matchesCompetitor;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Concurentie Analyse</h1>
              <p className="text-gray-400">Monitor je concurrenten en hun best presterende advertenties</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('competitors')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'competitors' 
                    ? 'bg-[#3A4D23] text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Concurenten
              </button>
              <button
                onClick={() => setViewMode('ads')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'ads' 
                    ? 'bg-[#3A4D23] text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Advertenties
              </button>
              {viewMode === 'competitors' && (
                <button
                  onClick={handleAddCompetitor}
                  className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Concurent Toevoegen
                </button>
              )}
              {viewMode === 'ads' && (
                <button
                  onClick={() => handleAddAd('')}
                  className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Ad Toevoegen
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek concurent of advertentie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
            </div>
            {viewMode === 'competitors' && (
              <>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="all">Alle Statussen</option>
                  <option value="active">Actief</option>
                  <option value="inactive">Inactief</option>
                  <option value="monitoring">Monitoring</option>
                </select>
                <select
                  value={filterStrength}
                  onChange={(e) => setFilterStrength(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="all">Alle Sterktes</option>
                  <option value="high">Hoog</option>
                  <option value="medium">Medium</option>
                  <option value="low">Laag</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'competitors' ? (
            <motion.div
              key="competitors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCompetitors.map((competitor) => (
                <motion.div
                  key={competitor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{competitor.name}</h3>
                        <p className="text-gray-400 text-sm">{competitor.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competitor.status)}`}>
                        {competitor.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(competitor.strength)}`}>
                        {competitor.strength}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <GlobeAltIcon className="w-4 h-4" />
                      <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {competitor.website.replace('https://', '')}
                      </a>
                    </div>
                    {competitor.contactInfo.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>{competitor.contactInfo.email}</span>
                      </div>
                    )}
                    {competitor.contactInfo.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{competitor.contactInfo.phone}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{competitor.notes}</p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleCompetitorClick(competitor)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Bekijk Advertenties ({competitorAds.filter(ad => ad.competitorId === competitor.id).length})
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleImportFacebookAds(competitor.id)}
                        disabled={importingFacebookAds}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Importeer Facebook advertenties"
                      >
                        <GlobeAltIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCompetitor(competitor)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCompetitor(competitor.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="ads"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {selectedCompetitor && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Advertenties van {selectedCompetitor.name}</h3>
                      <p className="text-gray-400 text-sm">{selectedCompetitor.industry}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCompetitor(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Launch Date Header */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Gelanceerd: oktober 2023</h3>
                </div>

                {/* Ad Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAds.map((ad) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Ad Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-900">Actief</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Bibliotheek-ID: {ad.id.padStart(15, '0')}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-2">
                          Uitgevoerd vanaf: {new Date(ad.createdAt).toLocaleDateString('nl-NL', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </div>

                        {/* Platform Icons */}
                        <div className="flex items-center gap-2 mb-3">
                          {ad.platform.includes('Facebook') && (
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">f</span>
                            </div>
                          )}
                          {ad.platform.includes('Instagram') && (
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                              <span className="text-white text-xs">📷</span>
                            </div>
                          )}
                          {ad.platform.includes('Messenger') && (
                            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                              <span className="text-white text-xs">💬</span>
                            </div>
                          )}
                        </div>

                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Overzichtsdetails bekijken
                        </button>
                      </div>

                      {/* Ad Content */}
                      <div className="p-4">
                        {/* Brand Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <FireIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{competitors.find(c => c.id === ad.competitorId)?.name}</span>
                            <span className="text-xs text-gray-500 ml-2">• Gesponsord</span>
                          </div>
                        </div>

                        {/* Ad Copy */}
                        <div className="text-sm text-gray-900 mb-4 leading-relaxed">
                          {ad.content}
                        </div>

                        {/* Ad Image/Video Preview */}
                        <div className="mb-4">
                          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            {ad.imageUrl ? (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <FireIcon className="w-8 h-8 text-white" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-700">{ad.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">Ad Preview</p>
                                </div>
                              </div>
                            ) : ad.videoUrl ? (
                              <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <span className="text-white text-2xl">▶</span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-700">Video Ad</p>
                                  <p className="text-xs text-gray-500 mt-1">Click to play</p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="w-16 h-16 bg-gray-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                                  <EyeIcon className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-sm font-medium text-gray-700">Ad Content</p>
                                <p className="text-xs text-gray-500 mt-1">No preview available</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Call to Action */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="text-sm font-medium text-blue-900">{ad.callToAction}</div>
                          {ad.competitorId === "1" && (
                            <div className="text-xs text-blue-700 mt-1">
                              Beheerste Kracht - Ads
                            </div>
                          )}
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 mb-4">
                          <div>
                            <div className="font-medium">Reach</div>
                            <div>{ad.estimatedReach.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="font-medium">Spend</div>
                            <div>€{ad.estimatedSpend}</div>
                          </div>
                          <div>
                            <div className="font-medium">CTR</div>
                            <div>{((ad.estimatedEngagement / ad.estimatedReach) * 100).toFixed(1)}%</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleAdClick(ad)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Advertentiegegevens bekijken
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAd(ad)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Facebook Import Status */}
        {facebookImportStatus && (
          <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg z-50">
            <p className="text-white text-sm">{facebookImportStatus}</p>
          </div>
        )}

        {/* Empty State */}
        {filteredCompetitors.length === 0 && viewMode === 'competitors' && (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Geen Concurenten Gevonden</h3>
            <p className="text-gray-400 mb-6">Voeg je eerste concurent toe om te beginnen met monitoren</p>
            <button
              onClick={handleAddCompetitor}
              className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="w-5 h-5" />
              Concurent Toevoegen
            </button>
          </div>
        )}

        {filteredAds.length === 0 && viewMode === 'ads' && (
          <div className="text-center py-12">
            <EyeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Geen Advertenties Gevonden</h3>
            <p className="text-gray-400 mb-6">Voeg advertenties toe van je concurenten om te analyseren</p>
            <button
              onClick={() => handleAddAd('')}
              className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="w-5 h-5" />
              Advertentie Toevoegen
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CompetitorModal
        isOpen={showCompetitorModal}
        onClose={() => setShowCompetitorModal(false)}
        competitor={editingCompetitor}
        onSave={handleSaveCompetitor}
      />

      <CompetitorAdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        ad={editingAd}
        competitors={competitors}
        onSave={handleSaveAd}
      />
    </div>
  );
} 