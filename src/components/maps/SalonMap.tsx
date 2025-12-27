'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Salon } from '@/types/salon';
import { Navigation, Clock, Users, Star } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle map re-centering
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Create a custom marker icon for the user
const createUserIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-indigo-500/30 rounded-full animate-ping"></div>
      <div class="relative w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-lg"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-user-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Create a custom marker icon using SVG for salons
const createCustomIcon = (queueCount: number, isSelected: boolean = false) => {
  const color = isSelected ? '#4f46e5' : '#7c3aed';
  const html = `
    <div class="relative flex flex-col items-center">
      <div class="transform hover:scale-110 transition-transform duration-200">
        <svg width="36" height="46" viewBox="0 0 36 46" class="filter drop-shadow-md">
          <path fill="${color}" stroke="#ffffff" stroke-width="2" d="M18,0 C8,0 0,8 0,18 C0,28 18,46 18,46 S36,28 36,18 C36,8 28,0 18,0 Z" />
          <circle cx="18" cy="18" r="9" fill="#ffffff" />
          <text x="18" y="22" text-anchor="middle" font-size="11" fill="${color}" font-weight="900">${queueCount}</text>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-salon-marker',
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -40],
  });
};

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
  }, []);

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [9.9312, 76.2673]; // Default to Kochi

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-50 rounded-3xl animate-pulse flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="font-semibold text-sm">Preparing map view...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0" style={{ minHeight: '500px' }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', minHeight: '500px', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
          >
            <Popup className="custom-popup">
              <div className="p-1 font-bold text-indigo-600 text-xs">You are here 📍</div>
            </Popup>
          </Marker>
        )}

        {/* Salon Markers */}
        {salons.map((salon) => {
          if (!salon.geoLocation) return null;

          const estimatedWait = salon.queueCount * (salon.averageServiceTime || 20);

          return (
            <Marker
              key={salon.id}
              position={[salon.geoLocation.latitude, salon.geoLocation.longitude]}
              icon={createCustomIcon(salon.queueCount || 0)}
            >
              <Popup className="salon-popup">
                <div className="w-64 p-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white">
                    <h3 className="font-bold text-lg leading-tight mb-1">{salon.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] opacity-90">
                      <Star size={10} fill="currentColor" />
                      <span>{salon.rating || '4.5'} • Premium Service</span>
                    </div>
                  </div>

                  <div className="p-3 space-y-3 bg-white">
                    <div className="flex items-start gap-2 text-slate-600">
                      <Navigation size={14} className="mt-0.5 shrink-0" />
                      <p className="text-xs">{salon.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
                        <Users size={14} className="text-indigo-500" />
                        <div>
                          <p className="text-[10px] text-slate-500">Waiting</p>
                          <p className="text-xs font-bold">{salon.queueCount || 0}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
                        <Clock size={14} className="text-purple-500" />
                        <div>
                          <p className="text-[10px] text-slate-500">Wait</p>
                          <p className="text-xs font-bold text-indigo-600">{estimatedWait}m</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSalonClick(salon)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95"
                    >
                      <span>Book Appointment</span>
                      <Navigation size={14} />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Global CSS for Leaflet Popups to make them look premium */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 1rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-content {
          margin: 0;
          width: 256px !important;
        }
        .leaflet-popup-tip-container {
          margin-top: -1px;
        }
        .custom-salon-marker {
          background: none;
          border: none;
        }
      `}</style>
    </div>
  );
};