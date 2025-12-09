'use client';

import React from 'react';
import type { Salon } from '@/types/salon';
import { MapPin, Navigation } from 'lucide-react';

interface SalonMapProps {
  salons: Salon[];
  userLocation: { lat: number; lng: number } | null;
  onSalonClick: (salon: Salon) => void;
}

export const SalonMap: React.FC<SalonMapProps> = ({
  salons,
  onSalonClick,
}) => {
  return (
    <div className="w-full h-full bg-gray-100 rounded-3xl overflow-hidden relative group shadow-inner">
      {/* Static Map Background Image - Using Ernakulam Map */}
      <img
        src="/images/ernakulam-map.png"
        alt="Ernakulam Map View"
        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/40 pointer-events-none" />

      {/* Region Label Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-purple-100 flex items-center gap-2">
          <MapPin className="text-red-500 fill-red-100" size={20} />
          <div>
            <h3 className="font-bold text-gray-900 border-b border-gray-200 leading-tight">Ernakulam District</h3>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Kerala, India</p>
          </div>
        </div>
      </div>

      {/* Decorative 'User Location' Pulse (Center of visual map) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 bg-blue-500/10 rounded-full animate-ping absolute"></div>
        <div className="w-24 h-24 bg-blue-500/20 rounded-full animate-pulse absolute"></div>
        <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg relative z-10"></div>
      </div>

      {/* Simulated Salon Pins */}
      <div className="absolute inset-0">
        {salons.map((salon, index) => {
          // Simulate positions for visual variety (deterministic based on index)
          // valid range: top 20-80%, left 20-80% to keep inside view
          const top = 30 + (index * 13 + index * index) % 50;
          const left = 20 + (index * 17 + index * 5) % 60;

          return (
            <button
              key={salon.id}
              onClick={() => onSalonClick(salon)}
              style={{ top: `${top}%`, left: `${left}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-full hover:z-50 hover:scale-110 transition-all duration-300 group/pin"
            >
              <div className="relative flex flex-col items-center">
                <div className="relative">
                  <MapPin
                    size={40}
                    className="text-purple-600 fill-white drop-shadow-xl filter"
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white">
                    {index + 1}
                  </div>
                </div>

                <div className="opacity-0 group-hover/pin:opacity-100 absolute bottom-full mb-2 bg-white px-3 py-2 rounded-xl shadow-xl transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  <p className="font-bold text-sm text-gray-800">{salon.name}</p>
                  <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                    <Navigation size={10} />
                    View Details
                  </p>
                  {/* Arrow tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                </div>

                <div className="w-8 h-2 bg-black/20 rounded-[100%] blur-sm mt-[-4px]"></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Controls (Visual Only) */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <div className="bg-white p-3 rounded-xl shadow-lg text-gray-600 hover:text-purple-600 transition-colors cursor-pointer">
          <Navigation size={24} />
        </div>
      </div>
    </div>
  );
};