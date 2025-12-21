'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, Clock, Scissors, UserCheck } from 'lucide-react';
import type { Service, Stylist } from '@/types';
import { createAppointment, getSalonAppointments } from '@/lib/firebase/firestore';
import { getAuth } from 'firebase/auth';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    salonId: string;
    salonName: string;
    salonAddress: string;
    services: Service[];
    stylists?: Stylist[];
    userId: string;
    userName: string;
}

export function BookingModal({ isOpen, onClose, salonId, salonName, salonAddress, services, stylists = [], userId, userName }: BookingModalProps) {
    const router = useRouter();
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedStylistId, setSelectedStylistId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
            setError('Please select at least one service, date, and time');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const selectedStylist = stylists.find(s => s.id === selectedStylistId);

        try {
            // Check Availability
            const existingAppointments = await getSalonAppointments(salonId, selectedDate);

            // Simple Availability Logic:
            // 1. If specific stylist selected: Check if they are busy at this time.
            // 2. If 'Any' stylist selected: Check if ALL stylists are busy (count >= total stylists).
            // Note: This assumes 1 concurrent appointment per stylist.

            let isSlotTaken = false;

            if (selectedStylistId) {
                isSlotTaken = existingAppointments.some(appt =>
                    appt.time === selectedTime &&
                    (appt.stylistId === selectedStylistId || appt.stylistId === 'any' /* blocked by generic booking? maybe safely yes */)
                );
            } else {
                // "Any" logic: are there fewer bookings at this time than total stylists?
                // Only count valid stylists (not 'any' placeholder if it exists in list, though stylists prop usually implementation ones)
                const activeStylistsCount = stylists.length || 1; // Fallback to 1 if no stylists defined (e.g. solo owner)
                const bookingsAtTime = existingAppointments.filter(appt => appt.time === selectedTime).length;
                if (bookingsAtTime >= activeStylistsCount) {
                    isSlotTaken = true;
                }
            }

            if (isSlotTaken) {
                throw new Error('This time slot is no longer available. Please choose another.');
            }

            // Create appointments (Direct Booking)
            for (const service of selectedServices) {
                await createAppointment({
                    salonId,
                    userId,
                    userName,
                    serviceId: service.id,
                    serviceName: service.name,
                    date: selectedDate,
                    time: selectedTime,
                    status: 'booked', // Direct booking
                    createdAt: new Date(),
                    stylistId: selectedStylistId || 'any',
                    stylistName: selectedStylist?.name || 'Any Stylist',
                    price: service.price,
                    durationMin: service.durationMin || 30,
                    salonName: salonName,
                    salonAddress: salonAddress
                });
            }

            alert('Appointment successfully booked! sent to your email.');
            onClose();
            router.push('/profile');
        } catch (err: any) {
            console.error('❌ Appointment booking error:', err);
            setError(err.message || 'Failed to book appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header ... */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                        <p className="text-sm text-gray-500 mt-1">{salonName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>}

                    {/* Service Selection ... */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Scissors size={16} /> Select Service(s)
                        </label>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                            {services.map((service) => {
                                const isSelected = selectedServices.some(s => s.id === service.id);
                                return (
                                    <label key={service.id} className={`flex justify-between p-3 rounded-xl border-2 cursor-pointer ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-100'}`}>
                                        <div className="flex gap-3">
                                            <input type="checkbox" checked={isSelected} onChange={() => setSelectedServices(prev => isSelected ? prev.filter(s => s.id !== service.id) : [...prev, service])} className="mt-1" />
                                            <div>
                                                <h4 className="font-bold">{service.name}</h4>
                                                <p className="text-xs text-gray-500">{service.durationMin} mins</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-purple-600">₹{service.price}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stylist Selection */}
                    {stylists.length > 0 && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <UserCheck size={16} /> Select Stylist (Optional)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedStylistId('')}
                                    className={`p-2 rounded-lg text-sm border-2 transition-all ${!selectedStylistId ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-gray-100 text-gray-600'}`}
                                >
                                    Any Stylist
                                </button>
                                {stylists.filter(s => s.isOnDuty !== false).map(stylist => (
                                    <button
                                        key={stylist.id}
                                        type="button"
                                        onClick={() => setSelectedStylistId(stylist.id)}
                                        className={`p-2 rounded-lg text-sm border-2 transition-all ${selectedStylistId === stylist.id ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-gray-100 text-gray-600'}`}
                                    >
                                        {stylist.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date & Time ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                            <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full p-2 border rounded-lg" required>
                                <option value="">Select Time</option>
                                {Array.from({ length: 19 }).map((_, i) => {
                                    const h = Math.floor(i / 2) + 9;
                                    const m = (i % 2) * 30;
                                    const t = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                    return <option key={t} value={t}>{t}</option>
                                })}
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
                        {isSubmitting ? 'Booking...' : `Confirm Booking • ₹${selectedServices.reduce((sum, s) => sum + (s.price || 0), 0)}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

