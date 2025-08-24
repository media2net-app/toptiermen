'use client';

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { 
  ChartBarIcon, 
  UsersIcon, 
  GlobeAltIcon, 
  DevicePhoneMobileIcon,
  EyeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CogIcon
} from '@heroicons/react/24/outline';


// Interactive Netherlands Map Component with Leaflet
const NetherlandsMapComponent = ({ cities }: { cities: Array<{ city: string; users: number }> }) => {
  const [mounted, setMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  // Dutch cities coordinates
  const DUTCH_CITIES: { [key: string]: { lat: number; lng: number } } = {
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Rotterdam': { lat: 51.9225, lng: 4.4792 },
    'The Hague': { lat: 52.0705, lng: 4.3007 },
    'Utrecht': { lat: 52.0907, lng: 5.1214 },
    'Eindhoven': { lat: 51.4416, lng: 5.4697 },
    'Tilburg': { lat: 51.5719, lng: 5.0672 },
    'Groningen': { lat: 53.2194, lng: 6.5665 },
    'Almere': { lat: 52.3508, lng: 5.2647 },
    'Breda': { lat: 51.5719, lng: 4.7683 },
    'Nijmegen': { lat: 51.8425, lng: 5.8533 },
    'Enschede': { lat: 52.2215, lng: 6.8937 },
    'Haarlem': { lat: 52.3873, lng: 4.6462 },
    'Arnhem': { lat: 51.9851, lng: 5.8987 },
    'Amersfoort': { lat: 52.1561, lng: 5.3878 },
    'Zaanstad': { lat: 52.4389, lng: 4.8295 },
    'Apeldoorn': { lat: 52.2112, lng: 5.9699 },
    'Den Bosch': { lat: 51.6978, lng: 5.3037 },
    'Haarlemmermeer': { lat: 52.3000, lng: 4.6667 },
    'Zwolle': { lat: 52.5168, lng: 6.0830 },
    'Leiden': { lat: 52.1601, lng: 4.4970 },
    'Dordrecht': { lat: 51.8133, lng: 4.6697 },
    'Zoetermeer': { lat: 52.0607, lng: 4.4940 },
    'Maastricht': { lat: 50.8513, lng: 5.6909 },
    'Venlo': { lat: 51.3703, lng: 6.1724 },
    'Stramproy': { lat: 51.1947, lng: 5.7194 },
    'Unknown': { lat: 52.1326, lng: 5.2913 },
    '(not set)': { lat: 52.1326, lng: 5.2913 },
  };

  // Filter only Dutch cities and get their coordinates
  const dutchCities = cities
    .filter(city => DUTCH_CITIES[city.city])
    .map(city => ({
      ...city,
      coordinates: DUTCH_CITIES[city.city]
    }))
    .sort((a, b) => b.users - a.users);

  // Calculate marker colors and sizes based on user count
  const getMarkerColor = (users: number) => {
    if (users >= 20) return '#B6C948';
    if (users >= 10) return '#8BAE5A';
    if (users >= 5) return '#6B8E4A';
    return '#4A5F2F';
  };

  const getMarkerSize = (users: number) => {
    if (users >= 20) return 20;
    if (users >= 10) return 16;
    if (users >= 5) return 12;
    return 8;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    script.onload = () => {
      if (mapContainerRef.current && !mapRef.current) {
        initializeMap();
      }
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [mounted]);

  useEffect(() => {
    if (mapRef.current && dutchCities.length > 0) {
      updateMarkers();
    }
  }, [dutchCities]);

  const initializeMap = () => {
    if (!(window as any).L || !mapContainerRef.current) return;

    const L = (window as any).L;

    // Create map centered on Netherlands
    mapRef.current = L.map(mapContainerRef.current, {
      center: [52.1326, 5.2913], // Center of Netherlands
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
    });

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapRef.current);

    // Add zoom control
    L.control.zoom({
      position: 'bottomright'
    }).addTo(mapRef.current);

    setMapLoaded(true);
  };

  const updateMarkers = () => {
    if (!mapRef.current || !(window as any).L) return;

    const L = (window as any).L;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    dutchCities.forEach(city => {
      const size = getMarkerSize(city.users);
      const color = getMarkerColor(city.users);

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: ${size}px; 
          height: ${size}px; 
          background-color: ${color}; 
          border: 2px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
      });

      const marker = L.marker([city.coordinates.lat, city.coordinates.lng], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="text-align: center; min-width: 120px;">
            <h3 style="margin: 0 0 8px 0; color: #B6C948; font-weight: bold; font-size: 14px;">${city.city}</h3>
            <p style="margin: 0; color: #8BAE5A; font-size: 12px;">
              <strong>${city.users}</strong> bezoekers
            </p>
          </div>
        `);

      markersRef.current.push(marker);
    });
  };

  if (!mounted) {
    return (
      <div className="h-96 bg-[#232D1A] rounded-lg flex items-center justify-center">
        <div className="text-[#8BAE5A]">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
        <h3 className="text-lg font-semibold mb-4 text-white">Nederlandse Bezoekers Kaart</h3>
        <div className="h-96 rounded-lg overflow-hidden bg-gray-200 relative">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#232D1A] z-10">
              <div className="text-center">
                <MapPinIcon className="h-16 w-16 text-[#8BAE5A] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">Interactieve Kaart</h3>
                <p className="text-sm text-[#8BAE5A] mb-4">Kaart wordt geladen...</p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {dutchCities.slice(0, 6).map((city, index) => (
                    <div key={index} className="bg-[#181F17] p-3 rounded-lg">
                      <div className="text-sm font-medium text-white">{city.city}</div>
                      <div className="text-xs text-[#8BAE5A]">{city.users} bezoekers</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full"
            style={{ 
              background: '#181F17',
              zIndex: mapLoaded ? 1 : 0
            }}
          />
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-[#B6C948] border-2 border-white"></div>
            <span className="text-sm text-[#8BAE5A]">20+ bezoekers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#8BAE5A] border-2 border-white"></div>
            <span className="text-sm text-[#8BAE5A]">10-19 bezoekers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#6B8E4A] border-2 border-white"></div>
            <span className="text-sm text-[#8BAE5A]">5-9 bezoekers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#4A5F2F] border-2 border-white"></div>
            <span className="text-sm text-[#8BAE5A]">1-4 bezoekers</span>
          </div>
        </div>
      </div>

      {/* City list */}
      <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
        <h3 className="text-lg font-semibold mb-4 text-white">Top Nederlandse Steden</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dutchCities.slice(0, 12).map((city, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#181F17] rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4 text-[#8BAE5A]" />
                <span className="text-sm font-medium text-white">{city.city}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">{city.users}</div>
                <div className="text-xs text-[#8BAE5A]">bezoekers</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AnalyticsData {
  activeUsers?: number;
  totalUsers?: number;
  pageViews?: number;
  sessions?: number;
  sessionDuration?: number;
  bounceRate?: number;
  newUsers?: number;
  returningUsers?: number;
  sessionsPerUser?: number;
  pageViewsPerSession?: number;
  deviceBreakdown?: Array<{ device: string; users: number; percentage: number }>;
  browserBreakdown?: Array<{ browser: string; users: number; percentage: number }>;
  osBreakdown?: Array<{ os: string; users: number; percentage: number }>;
  channels?: Array<{ channel: string; sessions: number }>;
  sources?: Array<{ source: string; sessions: number }>;
  countries?: Array<{ country: string; users: number }>;
  cities?: Array<{ city: string; users: number }>;
  ageBreakdown?: Array<{ age: string; users: number; percentage: number }>;
  genderBreakdown?: Array<{ gender: string; users: number; percentage: number }>;
  browsers?: Array<{ browser: string; users: number; percentage: number }>;
  operatingSystems?: Array<{ os: string; users: number; percentage: number }>;
  devices?: Array<{ device: string; users: number; percentage: number }>;
  behavior?: Array<{ page: string; views: number; uniqueViews?: number; avgLoadTime?: number; exitRate?: number }>;
  conversions?: number;
  revenue?: number;
  transactions?: number;
  purchaseRate?: number;
  lastUpdated?: string;
}

interface PageData {
  page: string;
  views: number;
  uniqueViews?: number;
  avgLoadTime?: number;
  exitRate?: number;
}

const sections = [
  { id: 'overview', name: 'Overview', icon: ChartBarIcon, color: 'bg-blue-500' },
  { id: 'realtime', name: 'Real-time', icon: EyeIcon, color: 'bg-green-500' },
  { id: 'audience', name: 'Audience', icon: UsersIcon, color: 'bg-purple-500' },
  { id: 'acquisition', name: 'Acquisition', icon: ArrowTrendingUpIcon, color: 'bg-orange-500' },
  { id: 'behavior', name: 'Behavior', icon: ClockIcon, color: 'bg-indigo-500' },
  { id: 'conversions', name: 'Conversions', icon: CurrencyDollarIcon, color: 'bg-emerald-500' },
  { id: 'demographics', name: 'Demographics', icon: UsersIcon, color: 'bg-pink-500' },
  { id: 'geography', name: 'Geography', icon: MapPinIcon, color: 'bg-red-500' },
  { id: 'technology', name: 'Technology', icon: ComputerDesktopIcon, color: 'bg-gray-500' }
];

const timeRanges = [
  { id: '1d', name: '1 Day' },
  { id: '7d', name: '7 Days' },
  { id: '30d', name: '30 Days' },
  { id: '90d', name: '90 Days' }
];

export default function GoogleAnalyticsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add custom CSS for map styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-marker {
        background: transparent !important;
        border: none !important;
      }
      .leaflet-popup-content-wrapper {
        background: #232D1A !important;
        color: white !important;
        border: 1px solid #3A4D23 !important;
        border-radius: 8px !important;
      }
      .leaflet-popup-tip {
        background: #232D1A !important;
        border: 1px solid #3A4D23 !important;
      }
      .leaflet-control-zoom a {
        background: #232D1A !important;
        color: #8BAE5A !important;
        border: 1px solid #3A4D23 !important;
      }
      .leaflet-control-zoom a:hover {
        background: #3A4D23 !important;
        color: #B6C948 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchData = async (section: string, range: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/google-analytics?section=${section}&range=${range}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeSection, timeRange);
  }, [activeSection, timeRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderOverviewSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Active Users"
        value={data.activeUsers || 0}
        icon={UsersIcon}
        color="text-green-600"
        bgColor="bg-green-50"
        format="number"
      />
      <MetricCard
        title="Total Users"
        value={data.totalUsers || 0}
        icon={UsersIcon}
        color="text-blue-600"
        bgColor="bg-blue-50"
        format="number"
      />
      <MetricCard
        title="Page Views"
        value={data.pageViews || 0}
        icon={EyeIcon}
        color="text-purple-600"
        bgColor="bg-purple-50"
        format="number"
      />
      <MetricCard
        title="Sessions"
        value={data.sessions || 0}
        icon={ChartBarIcon}
        color="text-orange-600"
        bgColor="bg-orange-50"
        format="number"
      />
      <MetricCard
        title="New Users"
        value={data.newUsers || 0}
        icon={UsersIcon}
        color="text-emerald-600"
        bgColor="bg-emerald-50"
        format="number"
      />
      <MetricCard
        title="Returning Users"
        value={data.returningUsers || 0}
        icon={UsersIcon}
        color="text-indigo-600"
        bgColor="bg-indigo-50"
        format="number"
      />
      <MetricCard
        title="Avg Session Duration"
        value={data.sessionDuration || 0}
        icon={ClockIcon}
        color="text-pink-600"
        bgColor="bg-pink-50"
        format="duration"
      />
      <MetricCard
        title="Bounce Rate"
        value={data.bounceRate || 0}
        icon={ArrowTrendingUpIcon}
        color="text-red-600"
        bgColor="bg-red-50"
        format="percentage"
      />
    </div>
  );

  const renderRealtimeSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Live Active Users</h3>
            <p className="text-green-100">Real-time data updates every minute</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{data.activeUsers || 0}</div>
            <div className="text-green-100">users online now</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Last Updated</h4>
          <p className="text-lg font-semibold text-white">
            {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'}
          </p>
        </div>
        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Data Source</h4>
          <p className="text-lg font-semibold text-[#B6C948]">Google Analytics API</p>
        </div>
        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Time Range</h4>
          <p className="text-lg font-semibold text-white">Real-time</p>
        </div>
      </div>
    </div>
  );

  const renderAudienceSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Device Breakdown</h3>
          <div className="space-y-3">
            {data.deviceBreakdown?.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DevicePhoneMobileIcon className="h-4 w-4 text-[#8BAE5A]" />
                  <span className="text-sm font-medium text-white">{device.device}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatNumber(device.users)}</div>
                  <div className="text-xs text-[#8BAE5A]">{device.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Browser Breakdown</h3>
          <div className="space-y-3">
            {data.browserBreakdown?.map((browser, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{browser.browser}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatNumber(browser.users)}</div>
                  <div className="text-xs text-[#8BAE5A]">{browser.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Operating System</h3>
          <div className="space-y-3">
            {data.osBreakdown?.map((os, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{os.os}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatNumber(os.users)}</div>
                  <div className="text-xs text-[#8BAE5A]">{os.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAcquisitionSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Traffic Channels</h3>
          <div className="space-y-3">
            {data.channels?.map((channel, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{channel.channel}</span>
                <div className="text-sm font-semibold text-white">{formatNumber(channel.sessions)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Traffic Sources</h3>
          <div className="space-y-3">
            {data.sources?.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{source.source}</span>
                <div className="text-sm font-semibold text-white">{formatNumber(source.sessions)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBehaviorSection = () => (
    <div className="space-y-6">
      <div className="bg-[#232D1A] rounded-lg shadow-sm border border-[#3A4D23]">
        <div className="p-6 border-b border-[#3A4D23]">
          <h3 className="text-lg font-semibold text-white">Top Pages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#3A4D23]">
            <thead className="bg-[#181F17]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">Unique Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">Avg Load Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">Exit Rate</th>
              </tr>
            </thead>
            <tbody className="bg-[#232D1A] divide-y divide-[#3A4D23]">
              {data.behavior?.map((page: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{page.page}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8BAE5A]">{formatNumber(page.views)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8BAE5A]">{formatNumber(page.uniqueViews || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8BAE5A]">{page.avgLoadTime?.toFixed(2)}s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8BAE5A]">{page.exitRate?.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConversionsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Conversions"
        value={data.conversions || 0}
        icon={CurrencyDollarIcon}
        color="text-emerald-600"
        bgColor="bg-emerald-50"
        format="number"
      />
      <MetricCard
        title="Revenue"
        value={data.revenue || 0}
        icon={CurrencyDollarIcon}
        color="text-green-600"
        bgColor="bg-green-50"
        format="currency"
      />
      <MetricCard
        title="Transactions"
        value={data.transactions || 0}
        icon={CurrencyDollarIcon}
        color="text-blue-600"
        bgColor="bg-blue-50"
        format="number"
      />
      <MetricCard
        title="Purchase Rate"
        value={data.purchaseRate || 0}
        icon={ArrowTrendingUpIcon}
        color="text-purple-600"
        bgColor="bg-purple-50"
        format="percentage"
      />
    </div>
  );

  const renderDemographicsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Age Breakdown</h3>
          <div className="space-y-3">
            {data.ageBreakdown?.map((age, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{age.age}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatNumber(age.users)}</div>
                  <div className="text-xs text-[#8BAE5A]">{age.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Gender Breakdown</h3>
          <div className="space-y-3">
            {data.genderBreakdown?.map((gender, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{gender.gender}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatNumber(gender.users)}</div>
                  <div className="text-xs text-[#8BAE5A]">{gender.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeographySection = () => (
    <div className="space-y-6">
      {/* Netherlands Map */}
      {data.cities && data.cities.length > 0 && (
        <NetherlandsMapComponent cities={data.cities} />
      )}

      {/* Global Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Top Countries</h3>
          <div className="space-y-3">
            {data.countries?.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-4 w-4 text-[#8BAE5A]" />
                  <span className="text-sm font-medium text-white">{country.country}</span>
                </div>
                <div className="text-sm font-semibold text-white">{formatNumber(country.users)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Alle Steden</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.cities?.map((city, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-[#8BAE5A]" />
                  <span className="text-sm font-medium text-white">{city.city}</span>
                </div>
                <div className="text-sm font-semibold text-white">{formatNumber(city.users)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTechnologySection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Browsers</h3>
          <div className="space-y-3">
            {data.browsers?.map((browser, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{browser.browser}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatNumber(browser.users)}</div>
                  <div className="text-xs text-[#8BAE5A]">{browser.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Operating Systems</h3>
          <div className="space-y-3">
            {data.operatingSystems?.map((os, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{os.os}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatNumber(os.users)}</div>
                  <div className="text-xs text-[#8BAE5A]">{os.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
          <h3 className="text-lg font-semibold mb-4 text-white">Devices</h3>
          <div className="space-y-3">
            {data.devices?.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{device.device}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatNumber(device.users)}</div>
                  <div className="text-xs text-[#8BAE5A]">{device.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'realtime':
        return renderRealtimeSection();
      case 'audience':
        return renderAudienceSection();
      case 'acquisition':
        return renderAcquisitionSection();
      case 'behavior':
        return renderBehaviorSection();
      case 'conversions':
        return renderConversionsSection();
      case 'demographics':
        return renderDemographicsSection();
      case 'geography':
        return renderGeographySection();
      case 'technology':
        return renderTechnologySection();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <div className="min-h-screen bg-[#181F17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Google Analytics Dashboard</h1>
              <p className="mt-2 text-[#8BAE5A]">
                Comprehensive analytics data from Google Analytics API
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-[#8BAE5A]" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-[#3A4D23] bg-[#232D1A] text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6C948]"
                >
                  {timeRanges.map((range) => (
                    <option key={range.id} value={range.id} className="bg-[#232D1A]">
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-[#8BAE5A]">
                <CogIcon className="h-4 w-4" />
                <span>Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-[#232D1A] rounded-lg p-1 shadow-sm border border-[#3A4D23]">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? `${section.color} text-white`
                      : 'text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B6C948]"></div>
              <span className="ml-2 text-[#8BAE5A]">Loading analytics data...</span>
            </div>
          ) : error ? (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <div className="flex">
                <div className="text-red-300">
                  <p className="font-medium">Error loading analytics data</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            renderSectionContent()
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
  format: 'number' | 'percentage' | 'currency' | 'duration';
}

function MetricCard({ title, value, icon: Icon, color, bgColor, format }: MetricCardProps) {
  const formatValue = (val: number, formatType: string) => {
    switch (formatType) {
      case 'number':
        return val.toLocaleString();
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `€${val.toLocaleString()}`;
      case 'duration':
        const minutes = Math.floor(val / 60);
        const seconds = val % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      default:
        return val.toString();
    }
  };

  return (
    <div className="bg-[#232D1A] rounded-lg p-6 shadow-sm border border-[#3A4D23]">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${bgColor} rounded-lg p-3`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-[#8BAE5A]">{title}</p>
          <p className="text-2xl font-bold text-white">{formatValue(value, format)}</p>
        </div>
      </div>
    </div>
  );
}
