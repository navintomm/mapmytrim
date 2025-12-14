'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import {

    getSalonByOwner,
    subscribeSalon,
    updateSalon,
    subscribeQueue,
    subscribeStylists,
    subscribeServices,
    subscribeAppointments,
    subscribeToSalonFeedback,
    addStylist,
    deleteStylist,
    updateStylist,
    addService,
    deleteService,
    updateAppointment,
    cancelAppointment,
    updateUserLoyaltyPoints
} from '@/lib/firebase/firestore';
import { signOut } from '@/lib/firebase/auth';
import type { Salon, QueueItem, Stylist, Service, Appointment, Feedback } from '@/types';
import { Users, Clock, TrendingUp, UserCheck, Play, Pause, Hash, LogOut, Plus, Trash2, Scissors, DollarSign, Calendar, X, Settings, Check, XCircle, MessageSquare, UserPlus } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import emailjs from '@emailjs/browser';
import { emailJSConfig } from '@/config/emailjs';

import { CustomerList } from '@/components/dashboard/CustomerList';
import { AppointmentCalendar } from '@/components/dashboard/AppointmentCalendar';
import { RevenueChart } from '@/components/dashboard/RevenueChart';

type DashboardView = 'queue' | 'analytics' | 'stylists' | 'services' | 'appointments' | 'settings' | 'feedback' | 'customers' | 'calendar';

export default function SalonDashboardPage() {
    const { user } = useAuthContext();
    const router = useRouter();
    const [salon, setSalon] = useState<Salon | null>(null);
    const [loading, setLoading] = useState(true);
    const [cooldown, setCooldown] = useState(0);
    // Staff State
    const [newStylist, setNewStylist] = useState<{ name: string, role: string, photoURL: string }>({ name: '', role: 'Stylist', photoURL: '' });
    const [isAddingStylist, setIsAddingStylist] = useState(false);
    const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [activeView, setActiveView] = useState<DashboardView>('queue');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');



    // Service Form State
    const [newService, setNewService] = useState({ name: '', duration: 30, price: 0 });
    const [isAddingService, setIsAddingService] = useState(false);
    const [showServiceTemplates, setShowServiceTemplates] = useState(false);

    // Predefined service templates
    // Predefined service templates (INR Rates)
    const serviceTemplates = [
        { name: 'Haircut', duration: 30, price: 250 },
        { name: 'Beard Trim', duration: 15, price: 150 },
        { name: 'Hair Spa', duration: 60, price: 800 },
        { name: 'Massage', duration: 45, price: 600 },
        { name: 'Facial', duration: 45, price: 500 },
        { name: 'Detan', duration: 30, price: 400 },
        { name: 'Dandruff Treatment', duration: 40, price: 650 },
        { name: 'Hair Styling', duration: 25, price: 300 },
        { name: 'Hair Coloring', duration: 90, price: 1500 },
        { name: 'Shave', duration: 20, price: 100 },
        { name: 'Head Massage', duration: 20, price: 200 },
        { name: 'Pedicure', duration: 40, price: 500 },
        { name: 'Manicure', duration: 30, price: 400 },
        { name: 'Waxing', duration: 30, price: 450 },
        { name: 'Threading', duration: 15, price: 50 },
    ];

    useEffect(() => {
        // Optimistic load
        const cachedSalon = localStorage.getItem('mapmytrim_salon_dashboard');
        if (cachedSalon) {
            setSalon(JSON.parse(cachedSalon));
            setLoading(false);
        }

        let unsubscribeSalonFunc: () => void;
        let unsubscribeQueueFunc: () => void;
        let unsubscribeStylistsFunc: () => void;
        let unsubscribeServicesFunc: () => void;
        let unsubscribeAppointmentsFunc: () => void;
        let unsubscribeFeedbackFunc: () => void;

        const fetchSalon = async () => {
            if (!user) return;
            try {
                const salonData = await getSalonByOwner(user.id);
                if (salonData) {
                    setSalon(salonData);
                    localStorage.setItem('mapmytrim_salon_dashboard', JSON.stringify(salonData));

                    // Subscribe Salon
                    unsubscribeSalonFunc = subscribeSalon(salonData.id, (updatedSalon) => {
                        if (updatedSalon) {
                            setSalon(updatedSalon);
                            localStorage.setItem('mapmytrim_salon_dashboard', JSON.stringify(updatedSalon));
                        }
                    });

                    // Subscribe Queue Items
                    unsubscribeQueueFunc = subscribeQueue(salonData.id, (items) => {
                        setQueueItems(items);
                    });

                    // Subscribe Stylists
                    unsubscribeStylistsFunc = subscribeStylists(salonData.id, (items) => {
                        setStylists(items);
                    });

                    // Subscribe Services
                    unsubscribeServicesFunc = subscribeServices(salonData.id, (items) => {
                        setServices(items);
                    });

                    // Subscribe Appointments
                    unsubscribeAppointmentsFunc = subscribeAppointments(salonData.id, (items) => {
                        setAppointments(items);
                    });

                    // Subscribe Feedback
                    unsubscribeFeedbackFunc = subscribeToSalonFeedback(salonData.id, (items) => {
                        setFeedback(items);
                    });

                } else {
                    router.push('/salon/register');
                }
            } catch (error) {
                console.error('Error fetching salon:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSalon();

        return () => {
            if (unsubscribeSalonFunc) unsubscribeSalonFunc();
            if (unsubscribeQueueFunc) unsubscribeQueueFunc();
            if (unsubscribeStylistsFunc) unsubscribeStylistsFunc();
            if (unsubscribeServicesFunc) unsubscribeServicesFunc();
            if (unsubscribeAppointmentsFunc) unsubscribeAppointmentsFunc();
            if (unsubscribeFeedbackFunc) unsubscribeFeedbackFunc();
        };
    }, [user, router]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (cooldown > 0) {
            timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleQueueChange = async (change: number) => {
        if (!salon || cooldown > 0) return;
        // Optimistic update
        const newCount = Math.max(0, salon.queueCount + change);
        const updatedSalon = { ...salon, queueCount: newCount };
        setSalon(updatedSalon);
        localStorage.setItem('mapmytrim_salon_dashboard', JSON.stringify(updatedSalon));
        setCooldown(2);

        try {
            await updateSalon(salon.id, { queueCount: newCount });
        } catch (error) { console.error('Failed to update queue:', error); }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Stylist Handlers
    const handleAddStylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!salon || !newStylist.name.trim()) return;
        setIsAddingStylist(true);
        try {
            await addStylist(salon.id, {
                name: newStylist.name,
                role: newStylist.role || 'Stylist',
                isOnDuty: true,
                lastSeen: new Date(),
                photoURL: newStylist.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStylist.name}`
            });
            setNewStylist({ name: '', role: 'Stylist', photoURL: '' });
        } catch (error) {
            console.error("Failed to add stylist", error);
        } finally {
            setIsAddingStylist(false);
        }
    };

    const handleToggleDuty = async (stylist: Stylist) => {
        if (!salon) return;
        try {
            await updateStylist(salon.id, stylist.id, { isOnDuty: !stylist.isOnDuty });
        } catch (error) {
            console.error("Failed to toggle duty", error);
        }
    };

    const handleDeleteStylist = async (stylist: Stylist) => {
        if (!salon) return;
        if (!confirm(`Are you sure you want to remove ${stylist.name}?`)) return;
        try {
            await deleteStylist(salon.id, stylist.id, stylist.isOnDuty);
        } catch (error) {
            console.error("Failed to delete stylist", error);
        }
    };

    // Service Handlers
    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!salon || !newService.name.trim()) return;
        setIsAddingService(true);
        try {
            await addService(salon.id, {
                name: newService.name,
                durationMin: newService.duration,
                price: newService.price
            });
            setNewService({ name: '', duration: 30, price: 0 });
        } catch (error) {
            console.error("Failed to add service", error);
        } finally {
            setIsAddingService(false);
        }
    };

    const handleDeleteService = async (service: Service) => {
        if (!salon) return;
        if (!confirm(`Delete service ${service.name}?`)) return;
        try {
            await deleteService(salon.id, service.id);
        } catch (error) {
            console.error("Failed to delete service", error);
        }
    };


    const dummyData = [
        { name: '9am', customers: 2 },
        { name: '11am', customers: 5 },
        { name: '1pm', customers: 8 },
        { name: '3pm', customers: 6 },
        { name: '5pm', customers: 9 },
        { name: '7pm', customers: 4 },
    ];

    if (loading) return <div className="flex items-center justify-center min-h-screen text-purple-600">Loading Dashboard...</div>;
    if (!salon) return null;

    return (
        <AuthGuard allowedRoles={['owner']}>
            <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">

                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
                            <div className="w-8 h-8 relative rounded-lg overflow-hidden shadow-sm">
                                <img
                                    src="/images/logo.jpg"
                                    alt="MapMyTrim Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            MapMyTrim
                        </h1>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Owner Dashboard</p>
                    </div>
                    <nav className="mt-6 px-4 space-y-2 flex-1">
                        <button
                            onClick={() => setActiveView('queue')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'queue' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Users size={20} /> Queue
                        </button>
                        <button
                            onClick={() => setActiveView('services')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'services' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Scissors size={20} /> Services
                        </button>
                        <button
                            onClick={() => setActiveView('appointments')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'appointments' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Calendar size={20} /> Appointments
                        </button>
                        <button
                            onClick={() => setActiveView('stylists')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'stylists' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <UserCheck size={20} /> Stylists
                        </button>
                        <button
                            onClick={() => setActiveView('customers')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'customers' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Users size={20} /> Clients
                        </button>
                        <button
                            onClick={() => setActiveView('calendar')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'calendar' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Calendar size={20} /> Calendar
                        </button>
                        <button
                            onClick={() => setActiveView('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'settings' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Settings size={20} /> Settings
                        </button>
                        <button
                            onClick={() => setActiveView('feedback')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'feedback' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <MessageSquare size={20} /> Feedback
                        </button>
                        <button
                            onClick={() => setActiveView('analytics')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeView === 'analytics' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <TrendingUp size={20} /> Analytics
                        </button>
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                        >
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{salon.name}</h2>
                                <p className="text-gray-500 font-medium capitalize mt-1">{activeView} Overview</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.push('/kiosk')}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
                                >
                                    Launch Kiosk
                                </button>
                            </div>
                        </div>

                        {/* VIEW: QUEUE */}
                        {activeView === 'queue' && (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* LIVE COUNTER CARD */}
                                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 text-purple-600 pointer-events-none">
                                            <Users size={200} />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-8 flex items-center gap-2">
                                                <Clock size={20} className="text-purple-600" /> Current Status
                                            </h3>
                                            <div className="flex items-baseline gap-4">
                                                <span className="text-8xl font-black text-gray-900 tracking-tighter">{salon.queueCount}</span>
                                                <span className="text-2xl font-medium text-gray-400">Waiting</span>
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-gray-500">
                                                <span>Est. Wait Time:</span>
                                                <span className="font-bold text-purple-600 text-lg">
                                                    {Math.max(0, salon.queueCount * salon.averageServiceTime - (salon.onDutyCount * 10))} min
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-gray-100 flex gap-4">
                                            <button
                                                onClick={() => handleQueueChange(-1)}
                                                disabled={salon.queueCount === 0 || cooldown > 0}
                                                className="h-16 w-24 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-3xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => handleQueueChange(1)}
                                                disabled={cooldown > 0}
                                                className="h-16 flex-1 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-2xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-70 shadow-xl"
                                            >
                                                + Manual Entry
                                            </button>
                                        </div>
                                    </div>

                                    {/* UP NEXT LIST (New) */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Hash size={20} className="text-indigo-500" /> Up Next
                                        </h3>
                                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                            {queueItems.length > 0 ? (
                                                queueItems.map((item, idx) => (
                                                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                                                                #{item.queueNumber}
                                                            </div>
                                                            <div>
                                                                <span className="block font-bold text-gray-900">{item.userName || 'Guest'}</span>
                                                                <span className="text-xs text-gray-400">
                                                                    {item.serviceName ? (
                                                                        <span className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded mr-1">
                                                                            {item.serviceName}
                                                                        </span>
                                                                    ) : null}
                                                                    {idx === 0 ? 'Next in line' : `${idx * 15} min wait`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 text-gray-400">
                                                    <p>Queue is empty.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* VIEW: SERVICES */}
                        {activeView === 'services' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Scissors size={20} className="text-pink-500" /> Service Menu
                                    </h3>

                                    {/* Add Service Section */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-gray-700">Quick Add Services</h4>
                                            <button
                                                type="button"
                                                onClick={() => setShowServiceTemplates(!showServiceTemplates)}
                                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                            >
                                                {showServiceTemplates ? 'Hide Templates' : 'Show Templates'}
                                            </button>
                                        </div>

                                        {showServiceTemplates && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-2xl">
                                                {serviceTemplates.map((template, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={async () => {
                                                            if (!salon) return;
                                                            try {
                                                                await addService(salon.id, {
                                                                    name: template.name,
                                                                    durationMin: template.duration,
                                                                    price: template.price
                                                                });
                                                            } catch (error) {
                                                                console.error("Failed to add service", error);
                                                            }
                                                        }}
                                                        className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Scissors size={14} className="text-purple-600" />
                                                            <span className="font-bold text-sm text-gray-900">{template.name}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                                            <span>{template.duration} min</span>
                                                            <span className="font-bold text-purple-600">₹{template.price}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Custom Service Form */}
                                        <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border-2 border-gray-200 rounded-2xl">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Service Name</label>
                                                <input
                                                    type="text"
                                                    value={newService.name}
                                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                                    placeholder="e.g. Premium Haircut"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (min)</label>
                                                <input
                                                    type="number"
                                                    value={newService.duration}
                                                    onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={newService.price}
                                                        onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) || 0 })}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!newService.name.trim() || isAddingService}
                                                        className="px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Service List */}
                                    <div className="space-y-3">
                                        {services.map((service) => (
                                            <div key={service.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
                                                        <Scissors size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{service.name}</h4>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1"><Clock size={14} /> {service.durationMin} mins</span>
                                                            <span className="flex items-center gap-1"><DollarSign size={14} /> ₹{service.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteService(service)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        {services.length === 0 && (
                                            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                                No services menu created yet. Add your standard services!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* VIEW: STYLISTS (STAFF MANAGEMENT) */}
                        {activeView === 'stylists' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <UserCheck size={20} className="text-blue-500" /> Staff Management
                                    </h3>

                                    {/* Add Stylist Form */}
                                    <form onSubmit={handleAddStylist} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-2xl">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stylist Name</label>
                                            <input
                                                type="text"
                                                value={newStylist.name}
                                                onChange={(e) => setNewStylist({ ...newStylist, name: e.target.value })}
                                                placeholder="e.g. John Doe"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                                            <select
                                                value={newStylist.role}
                                                onChange={(e) => setNewStylist({ ...newStylist, role: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                            >
                                                <option value="Stylist">Stylist</option>
                                                <option value="Barber">Barber</option>
                                                <option value="Colorist">Colorist</option>
                                                <option value="Receptionist">Receptionist</option>
                                                <option value="Expert">Expert</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="submit"
                                                disabled={!newStylist.name.trim() || isAddingStylist}
                                                className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <Plus size={20} /> Add Staff
                                            </button>
                                        </div>
                                    </form>

                                    {/* Stylist List */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {salon.stylists?.map((stylist) => (
                                            <div key={stylist.id} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group relative">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                                                        <img src={stylist.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stylist.name}`} alt={stylist.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{stylist.name}</h4>
                                                        <p className="text-xs text-gray-500 uppercase font-semibold">{stylist.role || 'Stylist'}</p>
                                                        <div className={`mt-1 text-xs px-2 py-0.5 rounded-full inline-block ${stylist.isOnDuty ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {stylist.isOnDuty ? 'On Duty' : 'Off Duty'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            const updatedStylists = salon.stylists?.map(s => s.id === stylist.id ? { ...s, isOnDuty: !s.isOnDuty } : s);
                                                            if (updatedStylists) {
                                                                setSalon({ ...salon, stylists: updatedStylists });
                                                                await updateSalon(salon.id, { stylists: updatedStylists });
                                                            }
                                                        }}
                                                        className="p-1.5 bg-gray-100 hover:bg-white border hover:border-gray-200 rounded-lg text-gray-600 shadow-sm"
                                                        title="Toggle Duty"
                                                    >
                                                        <Settings size={14} />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('Remove this stylist?')) return;
                                                            const updatedStylists = salon.stylists?.filter(s => s.id !== stylist.id);
                                                            if (updatedStylists) {
                                                                setSalon({ ...salon, stylists: updatedStylists });
                                                                await updateSalon(salon.id, { stylists: updatedStylists });
                                                            }
                                                        }}
                                                        className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 shadow-sm"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!salon.stylists || salon.stylists.length === 0) && (
                                            <div className="col-span-full py-10 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                                                <UserPlus size={48} className="mx-auto mb-3 opacity-20" />
                                                <p>No staff added yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: APPOINTMENTS */}
                        {activeView === 'appointments' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Calendar size={20} className="text-indigo-500" /> Upcoming Appointments
                                    </h3>

                                    {/* Appointments List */}
                                    <div className="space-y-3">
                                        {appointments.filter(a => a.status === 'booked').length > 0 ? (
                                            appointments.filter(a => a.status === 'booked').map((appointment) => (
                                                <div key={appointment.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                            <Calendar size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{appointment.userName}</h4>
                                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={14} /> {appointment.date} at {appointment.time}
                                                                </span>
                                                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                                                                    {appointment.serviceName}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${appointment.status === 'booked' ? 'bg-green-100 text-green-700' :
                                                            appointment.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {appointment.status.toUpperCase()}
                                                        </span>
                                                        {appointment.status === 'booked' && (
                                                            <>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await updateAppointment(appointment.id, { status: 'completed' });
                                                                            // Award Loyalty Points (e.g., 10 points)
                                                                            if (appointment.userId) {
                                                                                await updateUserLoyaltyPoints(appointment.userId, 10);
                                                                                console.log(`Awarded 10 points to ${appointment.userId}`);
                                                                            }
                                                                        } catch (error) {
                                                                            console.error('Failed to mark complete:', error);
                                                                        }
                                                                    }}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Mark as Completed & Award Points"
                                                                >
                                                                    <Check size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm('Cancel this appointment?')) {
                                                                            try {
                                                                                await cancelAppointment(appointment.id);
                                                                                // Email notification would go here, but we lack user email in this view context
                                                                            } catch (error) {
                                                                                console.error('Failed to cancel:', error);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Cancel Appointment"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                                <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                                                <p>No upcoming appointments.</p>
                                                <p className="text-xs mt-1">Customers will book through the app.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: STYLISTS */}
                        {activeView === 'stylists' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <UserCheck size={20} className="text-blue-500" /> Manage Team
                                    </h3>

                                    {/* Add Stylist Form */}
                                    <form onSubmit={handleAddStylist} className="flex gap-4 mb-8">
                                        <input
                                            type="text"
                                            value={newStylist.name}
                                            onChange={(e) => setNewStylist(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Enter Stylist Name"
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newStylist.name.trim() || isAddingStylist}
                                            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Plus size={20} /> Add
                                        </button>
                                    </form>

                                    {/* Stylist List */}
                                    <div className="space-y-3">
                                        {stylists.map((stylist) => (
                                            <div key={stylist.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-purple-200 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${stylist.isOnDuty ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                        {stylist.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{stylist.name}</h4>
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stylist.isOnDuty ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {stylist.isOnDuty ? 'On Duty' : 'Off Duty'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleDuty(stylist)}
                                                        className={`p-2 rounded-lg transition-colors ${stylist.isOnDuty ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                        title={stylist.isOnDuty ? "Set Off Duty" : "Set On Duty"}
                                                    >
                                                        {stylist.isOnDuty ? <Pause size={20} /> : <Play size={20} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStylist(stylist)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Stylist"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {stylists.length === 0 && (
                                            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                                No stylists added yet. Add your team members above!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: FEEDBACK */}
                        {activeView === 'feedback' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <MessageSquare size={20} className="text-blue-500" /> Customer Feedback
                                    </h3>

                                    <div className="space-y-4">
                                        {feedback.length > 0 ? (
                                            feedback.map((item) => (
                                                <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${item.type === 'complaint' ? 'bg-red-100 text-red-700' :
                                                                item.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {item.type}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                                            </span>
                                                        </div>
                                                        {item.replySent ? (
                                                            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                                                                <Check size={12} /> Replied
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-medium text-orange-500">Pending Reply</span>
                                                        )}
                                                    </div>

                                                    <h4 className="font-bold text-gray-900 mb-1">{item.subject}</h4>
                                                    <p className="text-gray-600 text-sm mb-3 whitespace-pre-wrap">{item.message}</p>

                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                        <div className="text-xs text-gray-500">
                                                            From: <span className="font-medium text-gray-700">{item.userName}</span>
                                                        </div>

                                                        {!item.replySent && replyingTo !== item.id && (
                                                            <button
                                                                onClick={() => {
                                                                    setReplyingTo(item.id);
                                                                    setReplyText('');
                                                                }}
                                                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                                            >
                                                                Reply via Email
                                                            </button>
                                                        )}

                                                        {replyingTo === item.id && (
                                                            <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100 animate-fadeIn w-full">
                                                                <textarea
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-2"
                                                                    rows={3}
                                                                    placeholder="Type your reply here..."
                                                                    autoFocus
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setReplyingTo(null)}
                                                                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (!replyText.trim()) return;

                                                                            const feedbackId = item.id;
                                                                            const message = replyText;

                                                                            import('@/lib/firebase/functions').then(async ({ replyToFeedback }) => {
                                                                                try {
                                                                                    await replyToFeedback({ feedbackId, replyMessage: message });
                                                                                    alert('Reply sent successfully!');
                                                                                    setReplyingTo(null);
                                                                                    // Ideally refresh data here
                                                                                } catch (error) {
                                                                                    console.error('Failed to reply:', error);
                                                                                    alert('Failed to send reply. Please try again.');
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors"
                                                                    >
                                                                        Send Reply
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {item.replySent && item.replyMessage && (
                                                        <div className="mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-sm">
                                                            <p className="text-xs font-bold text-indigo-800 mb-1">Your Reply:</p>
                                                            <p className="text-indigo-700">{item.replyMessage}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                                <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                                                <p>No feedback received yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* VIEW: SETTINGS */}
                        {activeView === 'settings' && (
                            <div className="grid grid-cols-1 gap-6">
                                {/* Feature Toggles */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Settings size={20} className="text-purple-500" /> Salon Settings
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Accept Queue Bookings */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h4 className="font-bold text-gray-900">Accept Queue Bookings</h4>
                                                <p className="text-sm text-gray-500">Allow customers to join your queue</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={salon.acceptsBookings !== false}
                                                    onChange={async (e) => {
                                                        const newValue = e.target.checked;
                                                        setSalon({ ...salon, acceptsBookings: newValue });
                                                        try {
                                                            await updateSalon(salon.id, { acceptsBookings: newValue });
                                                        } catch (error) {
                                                            console.error('Failed to update setting:', error);
                                                        }
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>

                                        {/* Accept Appointments */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h4 className="font-bold text-gray-900">Accept Appointments</h4>
                                                <p className="text-sm text-gray-500">Allow customers to book future appointments</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={salon.acceptsAppointments === true}
                                                    onChange={async (e) => {
                                                        const newValue = e.target.checked;
                                                        setSalon({ ...salon, acceptsAppointments: newValue });
                                                        try {
                                                            await updateSalon(salon.id, { acceptsAppointments: newValue });
                                                        } catch (error) {
                                                            console.error('Failed to update setting:', error);
                                                        }
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>

                                        {/* Salon Branding (Logo) */}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <h4 className="font-bold text-gray-900 mb-2">Salon Logo</h4>
                                            <p className="text-sm text-gray-500 mb-3">Enter a URL for your salon's logo.</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="https://example.com/logo.png"
                                                    value={salon.logo || ''}
                                                    onChange={(e) => setSalon({ ...salon, logo: e.target.value })}
                                                    onBlur={async (e) => {
                                                        const newVal = e.target.value;
                                                        try {
                                                            await updateSalon(salon.id, { logo: newVal });
                                                        } catch (error) {
                                                            console.error('Failed to update logo:', error);
                                                        }
                                                    }}
                                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                {salon.logo && (
                                                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1">
                                                        <img src={salon.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Average Service Time */}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <label className="block font-bold text-gray-900 mb-2">Average Service Time (minutes)</label>
                                            <input
                                                type="number"
                                                value={salon.averageServiceTime}
                                                onChange={async (e) => {
                                                    const newValue = parseInt(e.target.value) || 30;
                                                    setSalon({ ...salon, averageServiceTime: newValue });
                                                }}
                                                onBlur={async (e) => {
                                                    const newValue = parseInt(e.target.value) || 30;
                                                    try {
                                                        await updateSalon(salon.id, { averageServiceTime: newValue });
                                                    } catch (error) {
                                                        console.error('Failed to update setting:', error);
                                                    }
                                                }}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* VIEW: CUSTOMERS (CRM) */}
                        {activeView === 'customers' && (
                            <CustomerList appointments={appointments} />
                        )}

                        {/* VIEW: CALENDAR */}
                        {activeView === 'calendar' && (
                            <AppointmentCalendar appointments={appointments} timings={salon.timings} />
                        )}

                        {/* VIEW: ANALYTICS */}
                        {activeView === 'analytics' && (
                            <div className="space-y-6">
                                <RevenueChart appointments={appointments} />

                                {/* Legacy Queue Chart if needed, or purely Revenue now? Let's keep the queue chart as secondary below if desired, or just replace it. 
                                    The prompt asked for Revenue Analytics. Let's prioritize RevenueChart. 
                                    I will keep the old Traffic Trends chart below the Revenue Chart for completeness. */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-gray-500 font-medium">Daily Visits</span>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{salon.dailyQueueCounter}</p>
                                        </div>
                                        <TrendingUp className="text-green-500" size={32} />
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-gray-500 font-medium">Stylists Active</span>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{salon.onDutyCount}</p>
                                        </div>
                                        <UserCheck className="text-blue-500" size={32} />
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6">Traffic Trends</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={dummyData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="customers"
                                                    stroke="#8b5cf6"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
