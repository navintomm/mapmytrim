'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, Clock, Scissors } from 'lucide-react';
import type { Service } from '@/types';
import { createAppointment } from '@/lib/firebase/firestore';
import emailjs from '@emailjs/browser';
import { emailJSConfig } from '@/config/emailjs';
import { getAuth } from 'firebase/auth';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    salonId: string;
    salonName: string;
    services: Service[];
    userId: string;
    userName: string;
}

export function BookingModal({ isOpen, onClose, salonId, salonName, services, userId, userName }: BookingModalProps) {
    const router = useRouter();
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Generate time slots (9 AM to 6 PM, every 30 mins)
    const timeSlots = [];
    for (let hour = 9; hour <= 18; hour++) {
        for (let min of [0, 30]) {
            if (hour === 18 && min === 30) break; // Stop at 6:00 PM
            const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            timeSlots.push(time);
        }
    }

    // Get min date (today) and max date (30 days from now)
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
            setError('Please select at least one service, date, and time');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Create a separate appointment for each selected service
            console.log(`📅 Creating ${selectedServices.length} appointment(s)...`);

            for (const service of selectedServices) {
                await createAppointment({
                    salonId,
                    userId,
                    userName,
                    serviceId: service.id,
                    serviceName: service.name,
                    date: selectedDate,
                    time: selectedTime,
                    status: 'booked',
                    createdAt: new Date(),
                });
                console.log(`✅ Appointment created for ${service.name}`);
            }

            console.log('✅ All appointments created successfully');

            // Send confirmation email via EmailJS
            try {
                const auth = getAuth();
                const userEmail = auth.currentUser?.email;

                if (userEmail) {
                    await emailjs.send(
                        emailJSConfig.serviceId,
                        emailJSConfig.templateId,
                        {
                            to_email: userEmail,
                            email_subject: `Booking Confirmed: ${salonName} 📅`,
                            email_title: 'Appointment Confirmed',
                            email_body: `Hi ${userName}, your appointment at ${salonName} has been successfully booked.`,

                            // Details
                            details_label_1: 'Service(s)',
                            details_value_1: selectedServices.map(s => s.name).join(', '),
                            details_label_2: 'Date & Time',
                            details_value_2: `${selectedDate} at ${selectedTime}`,
                            details_label_3: 'Total Price',
                            details_value_3: `$${selectedServices.reduce((sum, s) => sum + s.price, 0)}`,
                        },
                        emailJSConfig.publicKey
                    );
                    console.log('📧 Confirmation email sent successfully');
                } else {
                    console.warn('⚠️ User email not found, skipping email notification');
                }
            } catch (emailError) {
                console.error('⚠️ Email sending failed (non-critical):', emailError);
                // Don't fail the booking if email fails
            }

            // Success - redirect to profile
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                        <p className="text-sm text-gray-500 mt-1">{salonName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Service Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Scissors size={16} /> Select Service(s)
                        </label>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {services.map((service) => {
                                const isSelected = selectedServices.some(s => s.id === service.id);

                                return (
                                    <label
                                        key={service.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {
                                                    setSelectedServices(prev => {
                                                        if (isSelected) {
                                                            return prev.filter(s => s.id !== service.id);
                                                        } else {
                                                            return [...prev, service];
                                                        }
                                                    });
                                                }}
                                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{service.name}</h4>
                                                <p className="text-sm text-gray-500">{service.durationMin} mins</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-purple-600">${service.price}</span>
                                    </label>
                                );
                            })}
                            {services.length === 0 && (
                                <p className="text-center text-gray-400 py-4">No services available</p>
                            )}
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Calendar size={16} /> Select Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={today}
                            max={maxDate}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    {/* Time Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Clock size={16} /> Select Time
                        </label>
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedTime === time
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || selectedServices.length === 0 || !selectedDate || !selectedTime}
                        className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    );
}
