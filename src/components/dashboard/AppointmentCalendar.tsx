'use client';

import React, { useState } from 'react';
import { Appointment, Salon } from '@/types';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface AppointmentCalendarProps {
    appointments: Appointment[];
    timings?: Salon['timings']; // Need to import this correctly
}

export function AppointmentCalendar({ appointments, timings }: AppointmentCalendarProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const d = new Date();
        // Start on Sunday? Let's start on Monday for business. Or Today.
        // Let's stick to simple "Start of week (Sunday)"
        const day = d.getDay();
        const diff = d.getDate() - day; // adjust when day is sunday
        return new Date(d.setDate(diff));
    });

    const changeWeek = (offset: number) => {
        const next = new Date(currentWeekStart);
        next.setDate(next.getDate() + (offset * 7));
        setCurrentWeekStart(next);
    };

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    // Parse timings or default
    const openTime = timings?.open || '09:00';
    const closeTime = timings?.close || '20:00';
    const startHour = parseInt(openTime.split(':')[0]);
    const endHour = parseInt(closeTime.split(':')[0]);
    const hours = Array.from({ length: endHour - startHour + 1 }).map((_, i) => startHour + i);

    const getAppointmentsForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]; // Simple YYYY-MM-DD
        return appointments.filter(a => a.date === dateStr && a.status !== 'cancelled')
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Clock size={20} className="text-purple-600" /> Schedule
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-medium text-sm w-32 text-center">
                        {currentWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' - '}
                        {weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button onClick={() => changeWeek(1)} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto">
                <div className="flex min-w-[800px]">
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50 sticky left-0 z-10">
                        <div className="h-10 border-b border-gray-100"></div> {/* Header spacer */}
                        {hours.map(h => (
                            <div key={h} className="h-20 text-xs text-gray-400 text-center pt-2 border-b border-gray-50" style={{ height: '80px' }}>
                                {h}:00
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {weekDays.map((day, idx) => {
                        const dayAppts = getAppointmentsForDay(day);
                        const isToday = new Date().toDateString() === day.toDateString();

                        return (
                            <div key={idx} className="flex-1 min-w-[120px] border-r border-gray-100 relative">
                                {/* Day Header */}
                                <div className={`h-10 border-b border-gray-100 flex items-center justify-center font-bold text-sm sticky top-0 bg-white z-10 ${isToday ? 'bg-purple-50 text-purple-600' : 'text-gray-700'}`}>
                                    {day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                </div>

                                {/* Slots */}
                                <div className="relative">
                                    {/* Grid Lines */}
                                    {hours.map(h => (
                                        <div key={h} className="h-20 border-b border-gray-50" style={{ height: '80px' }}></div>
                                    ))}

                                    {/* Appointments Overlay */}
                                    {dayAppts.map(appt => {
                                        // Calculate position
                                        const [hStr, mStr] = appt.time.split(':');
                                        const h = parseInt(hStr);
                                        const m = parseInt(mStr);
                                        if (h < startHour || h > endHour) return null; // Out of view

                                        const top = (h - startHour) * 80 + (m / 60) * 80; // 80px per hour
                                        const duration = appt.durationMin || 30;
                                        const height = (duration / 60) * 80;

                                        return (
                                            <div
                                                key={appt.id}
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                                className="absolute left-1 right-1 rounded-lg bg-indigo-100 border-l-4 border-indigo-500 p-1 text-[10px] overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm z-10"
                                                title={`${appt.time} - ${appt.userName} (${duration} min)`}
                                            >
                                                <div className="font-bold text-indigo-900 truncate">{appt.userName}</div>
                                                <div className="text-indigo-700 truncate">{appt.serviceName}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
