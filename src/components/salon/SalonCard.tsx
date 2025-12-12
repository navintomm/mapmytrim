import React from 'react';
import { MapPin } from 'lucide-react';
import { formatDistance } from '@/lib/utils/distance';
import { formatWaitTime } from '@/lib/utils/time';
import type { Salon } from '@/types/salon';

interface SalonCardProps {
  salon: Salon;
  onClick: () => void;
}

export const SalonCard: React.FC<SalonCardProps> = ({ salon, onClick }) => {
  const estimatedWait = salon.queueCount * (salon.averageServiceTime || 20);

  return (
    <div
      onClick={onClick}
      className="glass-effect rounded-3xl p-6 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 relative overflow-hidden group"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                ✂️
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{salon.name}</h3>
                {salon.distance !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={18} className="text-purple-600 fill-purple-100" />
                    <span className="font-bold text-purple-600">{formatDistance(salon.distance)}</span>
                    <span className="text-gray-500">away</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2 ml-1">
              <MapPin size={16} className="text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-800 font-semibold tracking-wide">{salon.address}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="relative overflow-hidden rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
            <div className="absolute top-0 right-0 text-6xl opacity-10 transform translate-x-4 -translate-y-2">👨‍💼</div>
            <div className="relative z-10">
              <div className="text-3xl mb-1">👨‍💼</div>
              <p className="text-xs text-gray-700 font-semibold mb-1">Stylists</p>
              <p className="text-3xl font-black text-gray-900">{salon.onDutyCount || 0}</p>
              <p className="text-xs text-gray-600 mt-1">on duty</p>
            </div>
          </div>

          {salon.acceptsBookings !== false && (
            <>
              <div className="relative overflow-hidden rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
                <div className="absolute top-0 right-0 text-6xl opacity-10 transform translate-x-4 -translate-y-2">👥</div>
                <div className="relative z-10">
                  <div className="text-3xl mb-1">👥</div>
                  <p className="text-xs text-gray-700 font-semibold mb-1">Queue</p>
                  <p className="text-3xl font-black text-gray-900">{salon.queueCount || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">waiting</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)' }}>
                <div className="absolute top-0 right-0 text-6xl opacity-10 transform translate-x-4 -translate-y-2">⏱️</div>
                <div className="relative z-10">
                  <div className="text-3xl mb-1">⏱️</div>
                  <p className="text-xs text-gray-700 font-semibold mb-1">Wait</p>
                  <p className="text-2xl font-black text-gray-900">
                    {formatWaitTime(estimatedWait)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">estimated</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-5 flex justify-center">
          {salon.onDutyCount > 0 ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' }}>
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></span>
              <span className="text-green-900">✨ OPEN NOW ✨</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' }}>
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-red-900">Closed</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-5 border-t-2 border-gray-200/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('🔘 Button clicked directly');
              onClick();
            }}
            className="w-full py-4 rounded-2xl font-extrabold text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg flex items-center justify-center gap-3 group"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">✂️</span>
            <span>{salon.acceptsBookings !== false ? 'View Details & Book Now' : 'View Details'}</span>
            <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};