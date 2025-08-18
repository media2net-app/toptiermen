'use client';

import { useEffect, useRef } from 'react';

interface UserLocation {
  country: string;
  users: number;
  coordinates: [number, number]; // [latitude, longitude]
}

interface WorldMapProps {
  userLocations: UserLocation[];
}

export default function WorldMap({ userLocations }: WorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (mapRef.current && userLocations) {
      updateMarkers();
    }
  }, [userLocations]);

  const initializeMap = () => {
    if (!mapContainerRef.current || !(window as any).L) return;

    const L = (window as any).L;

    // Create map with dark theme
    mapRef.current = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: false,
      keyboard: false,
    });

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapRef.current);

    // Add custom CSS for dark theme
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-container {
        background: #181F17 !important;
      }
      .leaflet-control-zoom a {
        background-color: #232D1A !important;
        border-color: #3A4D23 !important;
        color: #8BAE5A !important;
      }
      .leaflet-control-zoom a:hover {
        background-color: #B6C948 !important;
        color: #181F17 !important;
      }
      .leaflet-popup-content-wrapper {
        background-color: #232D1A !important;
        color: #8BAE5A !important;
        border: 1px solid #3A4D23 !important;
      }
      .leaflet-popup-tip {
        background-color: #232D1A !important;
        border: 1px solid #3A4D23 !important;
      }
    `;
    document.head.appendChild(style);

    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapRef.current || !(window as any).L) return;

    const L = (window as any).L;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    userLocations.forEach(location => {
      const [lat, lng] = location.coordinates;
      
      // Create custom icon based on user count
      const userCount = location.users;
      const iconSize = Math.max(20, Math.min(40, 20 + userCount * 2));
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            background: radial-gradient(circle, #B6C948 0%, #8BAE5A 70%, #3A4D23 100%);
            border: 2px solid #181F17;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #181F17;
            font-weight: bold;
            font-size: ${Math.max(10, iconSize * 0.4)}px;
            box-shadow: 0 2px 8px rgba(182, 201, 72, 0.3);
            animation: pulse 2s infinite;
          ">
            ${userCount}
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          </style>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
        popupAnchor: [0, -iconSize / 2]
      });

      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="text-align: center;">
            <h3 style="margin: 0 0 8px 0; color: #B6C948; font-weight: bold;">${location.country}</h3>
            <p style="margin: 0; color: #8BAE5A;">
              <strong>${location.users}</strong> actieve gebruikers
            </p>
          </div>
        `);

      markersRef.current.push(marker);
    });
  };

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="h-96 w-full rounded-lg"
        style={{ 
          background: '#181F17',
          border: '1px solid #3A4D23'
        }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[#232D1A] p-3 rounded-lg border border-[#3A4D23] text-white text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-[#B6C948] rounded-full"></div>
          <span className="text-[#8BAE5A]">Gebruikers per locatie</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
          <span className="text-[#8BAE5A] text-xs">Klein = weinig gebruikers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#B6C948] rounded-full"></div>
          <span className="text-[#8BAE5A] text-xs">Groot = veel gebruikers</span>
        </div>
      </div>
    </div>
  );
}
