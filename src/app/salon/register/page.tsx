'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { registerSalon } from '@/lib/firebase/firestore';
import { MapPin, Scissors, Clock, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/maps/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function SalonRegisterPage() {
    const { user } = useAuthContext();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        contact: '',
        chairs: 3,
        openTime: '09:00',
        closeTime: '21:00',
        gstNumber: '',
        businessLicenseNumber: '',
        businessLicenseType: 'trade_license' as 'trade_license' | 'gst' | 'shop_act' | 'other',
        ownerIdProof: '',
        acceptsBookings: true,
        acceptsAppointments: false,
    });

    const steps = [
        { num: 1, title: 'Basic Info', icon: <Scissors size={20} /> },
        { num: 2, title: 'Location', icon: <MapPin size={20} /> },
        { num: 3, title: 'Operations', icon: <Clock size={20} /> },
    ];

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Create a unique Salon ID (could use user ID or random)
            // Using user.uid + '_salon' for 1-to-1 mapping for simplicity or random.
            // Let's use a random ID or just user ID if one owner = one salon
            const salonId = `salon_${user.id}_${Date.now()}`;

            await registerSalon(salonId, {
                ownerId: user.id,
                name: formData.name,
                address: formData.address,
                geoLocation: {
                    latitude: parseFloat(formData.latitude) || 0,
                    longitude: parseFloat(formData.longitude) || 0,
                },
                contact: formData.contact,
                chairs: Number(formData.chairs),
                timings: {
                    open: formData.openTime,
                    close: formData.closeTime,
                    offDays: [],
                },
                gstNumber: formData.gstNumber,
                businessLicenseNumber: formData.businessLicenseNumber,
                businessLicenseType: formData.businessLicenseType,
                ownerIdProof: formData.ownerIdProof,
                isApproved: false,
                onDutyCount: 0,
                queueCount: 0,
                averageServiceTime: 30, // Default
                acceptsBookings: formData.acceptsBookings,
                acceptsAppointments: formData.acceptsAppointments,
                dailyQueueCounter: 0,
                lastResetDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                createdAt: new Date(),
            } as any); // Casting for now to match strict types if needed

            router.push('/salon/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to register salon. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <AuthGuard allowedRoles={['owner']}>
            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-3xl">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900">Register Your Salon</h2>
                        <p className="mt-2 text-sm text-gray-600">Join MapMyTrim and digitize your queue.</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex justify-between items-center mb-12 relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-purple-600 -z-10 rounded-full transition-all duration-300"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((s) => (
                            <div key={s.num} className={`flex flex-col items-center bg-gray-50 px-2`}>
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.num
                                        ? 'bg-purple-600 border-purple-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {step > s.num ? <CheckCircle size={20} /> : s.icon}
                                </div>
                                <span className={`mt-2 text-xs font-semibold ${step >= s.num ? 'text-purple-600' : 'text-gray-400'}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                        <div className="p-8">

                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Salon Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            placeholder="e.g. Luxe Cuts Studio"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                        <input
                                            type="tel"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">GST Number (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.gstNumber}
                                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            placeholder="GSTIN123456"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Business License Number (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.businessLicenseNumber}
                                            onChange={(e) => setFormData({ ...formData, businessLicenseNumber: e.target.value })}
                                            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            placeholder="License/Registration Number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">License Type (Optional)</label>
                                        <select
                                            value={formData.businessLicenseType}
                                            onChange={(e) => setFormData({ ...formData, businessLicenseType: e.target.value as any })}
                                            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                        >
                                            <option value="trade_license">Trade License</option>
                                            <option value="gst">GST Registration</option>
                                            <option value="shop_act">Shop Act License</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Owner ID Proof (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.ownerIdProof}
                                            onChange={(e) => setFormData({ ...formData, ownerIdProof: e.target.value })}
                                            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            placeholder="Aadhaar/PAN Number"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Location */}
                            {step === 2 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Location Details</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={3}
                                            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            placeholder="Shop No, Street, Area, City..."
                                        />
                                    </div>

                                    {/* Map Picker */}
                                    <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/50">
                                        <LocationPicker
                                            initialLat={parseFloat(formData.latitude) || undefined}
                                            initialLng={parseFloat(formData.longitude) || undefined}
                                            onLocationSelect={(lat: number, lng: number) => setFormData({ ...formData, latitude: lat.toString(), longitude: lng.toString() })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                            <input
                                                type="number"
                                                value={formData.latitude}
                                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                                placeholder="e.g. 9.9312"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                            <input
                                                type="number"
                                                value={formData.longitude}
                                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                                placeholder="e.g. 76.2673"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        * You can set location by clicking on the map OR typing coordinates manually.
                                    </p>
                                </div>
                            )}

                            {/* Step 3: Operations */}
                            {step === 3 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Operational Details</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Number of Chairs</label>
                                        <input
                                            type="number"
                                            value={formData.chairs}
                                            onChange={(e) => setFormData({ ...formData, chairs: Number(e.target.value) })}
                                            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            min={1}
                                            max={20}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                                            <input
                                                type="time"
                                                value={formData.openTime}
                                                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                                                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                                            <input
                                                type="time"
                                                value={formData.closeTime}
                                                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                                                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                                        <input
                                            type="checkbox"
                                            id="acceptsBookings"
                                            checked={formData.acceptsBookings}
                                            onChange={(e) => setFormData({ ...formData, acceptsBookings: e.target.checked })}
                                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                                        />
                                        <label htmlFor="acceptsBookings" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                            Enable Booking & Queue Facility
                                            <p className="text-xs text-gray-500 font-normal mt-0.5">Uncheck if you only want to list your salon without queue management.</p>
                                        </label>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer Buttons */}
                        <div className="bg-gray-50 px-8 py-5 flex justify-between items-center border-t border-gray-100">
                            {step > 1 ? (
                                <button
                                    onClick={prevStep}
                                    className="px-6 py-2.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Back
                                </button>
                            ) : (
                                <div></div> // Spacer
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all transform hover:-translate-y-0.5"
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-200 hover:from-purple-500 hover:to-indigo-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? 'Submitting...' : 'Complete Registration'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
