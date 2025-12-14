'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Salon } from '@/types/salon';
import { Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface SalonMapProps {
  salons: Salon[];
  userLocation: { lat: number; lng: number } | null;
  onSalonClick: (salon: Salon) => void;
}

export const SalonMap: React.FC<SalonMapProps> = ({
  salons,
  userLocation,
  onSalonClick,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Fix Leaflet's default icon paths which are broken in Webpack
    (async () => {
      const L = (await import('leaflet')).default;
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      L.Marker.prototype.options.icon = DefaultIcon;
    })();
  }, []);

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [9.9312, 76.2673]; // Default to Kochi/Ernakulam

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-3xl animate-pulse flex items-center justify-center text-gray-400">
        Loading Map...
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-inner relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        // @ts-ignore - Leaflet types issue with dynamic import
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker (if available) */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Salon Markers */}
        {salons.map((salon) => {
          if (!salon.geoLocation) return null;

          return (
            <Marker
              key={salon.id}
              position={[salon.geoLocation.latitude, salon.geoLocation.longitude]}

            >
              <Popup>
                <div className="min-w-[150px]">
                  <h3 className="font-bold text-gray-900 mb-1">{salon.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">{salon.address}</p>
                  <button
                    onClick={() => onSalonClick(salon)}
                    className="w-full flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold py-1.5 rounded-lg hover:shadow-md transition-all"
                  >
                    <Navigation size={12} />
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};