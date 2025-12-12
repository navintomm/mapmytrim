import React from 'react';
import type { Salon } from '@/types/salon';
import { formatWaitTime } from '@/lib/utils/time';
import { Clock, Users, Scissors, MapPin, Phone, User as UserIcon } from 'lucide-react';

interface SalonDetailsProps {
  salon: Salon;
  stylists?: Array<{ id: string; name: string; isOnDuty: boolean }>;
}

export const SalonDetails: React.FC<SalonDetailsProps> = ({ salon, stylists = [] }) => {
  const estimatedWait = salon.queueCount * (salon.averageServiceTime || 20);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header Section */}
      <div className="p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
            <Scissors size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{salon.name}</h1>
            <div className="flex flex-col gap-2 mt-2 w-full max-w-md">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-purple-100/50 hover:bg-white/80 transition-all cursor-pointer group/location shadow-sm">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600 group-hover/location:scale-110 transition-transform">
                  <MapPin size={18} />
                </div>
                <span className="font-semibold text-gray-800 tracking-wide">{salon.address}</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-purple-100/50 hover:bg-white/80 transition-all cursor-pointer group/phone shadow-sm">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 group-hover/phone:scale-110 transition-transform">
                  <Phone size={18} />
                </div>
                <span className="font-semibold text-gray-800 tracking-wide">{salon.contact}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100/50 group hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2 text-blue-600 font-medium text-sm">
              <Users size={18} />
              <span>Stylists</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {salon.onDutyCount || 0}
              <span className="text-xs font-normal text-gray-500 ml-1">Active</span>
            </p>
          </div>

          {salon.acceptsBookings !== false && (
            <>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100/50 group hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2 text-orange-600 font-medium text-sm">
                  <Users size={18} />
                  <span>Queue</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {salon.queueCount || 0}
                  <span className="text-xs font-normal text-gray-500 ml-1">Waiting</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-green-50 border border-green-100/50 col-span-2 md:col-span-1 group hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2 text-green-600 font-medium text-sm">
                  <Clock size={18} />
                  <span>Est. Wait</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatWaitTime(estimatedWait)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Stylists Info - Only show if shop is OPEN (onDutyCount > 0) */}
        {salon.onDutyCount > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserIcon size={20} className="text-gray-400" />
                Stylist Availability
              </h3>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {stylists.filter(s => s.isOnDuty !== false).length} Online
              </span>
            </div>

            {stylists.length > 0 ? (
              <div className="grid gap-3">
                {stylists.filter(s => s.isOnDuty !== false).map((stylist) => (
                  <div
                    key={stylist.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                        {stylist.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{stylist.name}</p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Available Now
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {stylists.filter(s => s.isOnDuty === false).length > 0 && (
                  <details className="mt-4 group/details">
                    <summary className="text-sm text-gray-500 font-medium cursor-pointer hover:text-gray-700 select-none flex items-center gap-2">
                      <span className="group-open/details:rotate-90 transition-transform">▸</span>
                      Show Off-Duty Stylists ({stylists.filter(s => s.isOnDuty === false).length})
                    </summary>
                    <div className="grid gap-2 mt-3 pl-4 border-l-2 border-gray-100">
                      {stylists.filter(s => s.isOnDuty === false).map((stylist) => (
                        <div
                          key={stylist.id}
                          className="flex items-center gap-3 p-2 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                            {stylist.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-600">{stylist.name}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">No stylists found for this salon.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <h4 className="text-gray-900 font-medium mb-1">Salon is Currently Closed</h4>
            <p className="text-gray-500 text-sm">
              Stylist availability is hidden while the shop is closed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
