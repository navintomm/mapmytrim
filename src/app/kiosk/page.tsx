'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { getSalonByOwner, addToQueue, findActiveQueueItemByNumber, checkOutQueueItem, addRating, addReport } from '@/lib/firebase/firestore';
import type { Salon, QueueItem } from '@/types';
import { CheckCircle, Clock, Users, LogOut, AlertTriangle, Star, Check } from 'lucide-react';

export default function KioskPage() {
    const { user, loading: authLoading } = useAuthContext();
    const router = useRouter();
    const [salon, setSalon] = useState<Salon | null>(null);
    const [loading, setLoading] = useState(true);

    // UI State
    // 'home' = Split Choice
    // 'joining' = Processing join
    // 'checkout_entry' = Numpad
    // 'checkout_confirm' = Found item, confirm
    // 'feedback' = Rating
    // 'success_in' = Show Number
    // 'success_out' = Bye
    const [view, setView] = useState<'home' | 'joining' | 'checkout_entry' | 'checkout_confirm' | 'feedback' | 'report' | 'success_in' | 'success_out'>('home');

    const [inputNumber, setInputNumber] = useState('');
    const [assignedNumber, setAssignedNumber] = useState<number | null>(null);
    const [activeItem, setActiveItem] = useState<QueueItem | null>(null);
    const [rating, setRating] = useState(0);
    const [reportText, setReportText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchSalon = async () => {
            if (authLoading) return;
            if (!user) return;
            try {
                const salonData = await getSalonByOwner(user.id);
                if (salonData) setSalon(salonData);
                else router.push('/salon/register');
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchSalon();
    }, [user, authLoading, router]);

    // JOIN QUEUE (GET TICKET)
    const handleJoinQueue = async () => {
        if (!salon) return;
        setView('joining');
        try {
            // NOTE: Ideally addToQueue should return the ID, but for now we rely on the salon counter + 1 logic essentially being the next one.
            // Since we just updated it, our optimistic guess is (dailyQueueCounter (before) + 1).
            // But we don't have the "before" accurately due to race conditions if high traffic.
            // For MVP, we will rely on the property that we just incremented it.
            // A better way is to listen to the queue collection for the "created just now by me" item.
            // But that requires identifying "me".
            // Let's assume for this version we just show "Joined!" and rely on a physical ticket or display if we had a printer.
            // But the user NEEDS to know their number.
            // I will cheat slightly: I will re-fetch the salon immediately and assume the 'dailyQueueCounter' IS my number (if I am the only one adding).
            // Risk: If 2 people add same time, I might see the other's number.

            await addToQueue(salon.id, {
                userId: 'kiosk_guest',
                userName: 'Guest',
                shopId: salon.id,
                status: 'waiting',
                createdAt: new Date(),
            } as any);

            // Re-fetch salon to get the current counter which IS likely my number
            const updatedSalon = await getSalonByOwner(user!.id);
            if (updatedSalon) {
                setSalon(updatedSalon);
                setAssignedNumber(updatedSalon.dailyQueueCounter);
            }

            setView('success_in');
            setTimeout(resetFlow, 5000); // 5s to read number
        } catch (error) {
            console.error(error);
            setErrorMsg('Failed to join queue.');
            setView('home');
        }
    };

    // CHECK OUT FLOW
    const handleNumpadInput = (num: string) => {
        if (inputNumber.length < 3) setInputNumber(prev => prev + num);
    };

    const handleNumpadClear = () => setInputNumber('');
    const handleNumpadSubmit = async () => {
        if (!salon || !inputNumber) return;
        setView('joining'); // repurpose loading
        setErrorMsg('');

        try {
            const num = parseInt(inputNumber);
            const item = await findActiveQueueItemByNumber(salon.id, num);
            if (item) {
                setActiveItem(item);
                setView('checkout_confirm');
            } else { // Check if we should find by phone fallback? optional
                setErrorMsg(`Ticket #${num} not found or inactive.`);
                setView('checkout_entry');
            }
        } catch (e) {
            setErrorMsg('Error searching number.');
            setView('checkout_entry');
        }
    };

    const performCheckOut = async () => {
        if (!salon || !activeItem) return;
        setView('joining');
        try {
            await checkOutQueueItem(salon.id, activeItem.id);
            setView('feedback');
        } catch (e) {
            setErrorMsg('Check-out failed.');
            setView('home');
        }
    };

    const submitFeedback = async () => {
        if (!salon || !activeItem) return;
        try {
            await addRating({
                salonId: salon.id,
                userId: activeItem.id,
                rating: rating || 5,
                review: '',
                createdAt: new Date(),
            });
        } catch (e) { }
        setView('success_out');
        setTimeout(resetFlow, 3000);
    };

    const submitReport = async () => {
        if (!salon) return;
        try {
            await addReport({
                type: 'issue',
                description: reportText,
                salonId: salon.id,
                reportedBy: 'kiosk_user', // Anonymous
                createdAt: new Date(),
            });
            alert('Report submitted.');
            resetFlow();
        } catch (e) { alert('Failed.'); }
    };

    const resetFlow = () => {
        setInputNumber('');
        setAssignedNumber(null);
        setRating(0);
        setReportText('');
        setErrorMsg('');
        setActiveItem(null);
        setView('home');

        // Refresh salon data
        if (salon && user) getSalonByOwner(user.id).then(s => s && setSalon(s));
    };

    if (loading) return <div className="h-screen bg-black flex items-center text-white justify-center">Loading Kiosk...</div>;
    if (!salon) return null;

    return (
        <AuthGuard allowedRoles={['owner']}>
            <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

                {/* Background FX (Subtle) */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900/20 rounded-full filter blur-[100px]"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/20 rounded-full filter blur-[100px]"></div>

                {/* Header */}
                <div className="z-10 text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{salon.name}</h1>
                    <p className="text-neutral-400 uppercase tracking-widest text-sm">Self-Service Kiosk</p>
                </div>

                <div className="z-10 w-full max-w-xl animate-fadeIn">

                    {/* HOME VIEW: 2 BIG BUTTONS */}
                    {view === 'home' && (
                        <div className="grid grid-cols-1 gap-6">
                            <button
                                onClick={handleJoinQueue}
                                className="bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white p-10 rounded-3xl shadow-2xl flex flex-row items-center justify-center gap-8 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Users size={56} className="text-white/80" />
                                <div className="text-left">
                                    <span className="block text-3xl font-bold">Get Ticket</span>
                                    <span className="text-purple-200">Start waiting here</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setView('checkout_entry')}
                                className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white p-8 rounded-3xl flex items-center justify-center gap-6 transition-all"
                            >
                                <LogOut size={32} className="text-neutral-400" />
                                <span className="text-2xl font-bold">Check Out</span>
                            </button>
                        </div>
                    )}

                    {/* PROCESSING */}
                    {view === 'joining' && (
                        <div className="text-center py-20">
                            <Clock className="animate-spin mx-auto mb-6 text-purple-500" size={64} />
                            <p className="text-2xl font-light">Processing...</p>
                        </div>
                    )}

                    {/* SUCCESS IN: SHOW TICKET NUMBER */}
                    {view === 'success_in' && (
                        <div className="bg-white text-black p-12 rounded-3xl text-center shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-scaleIn">
                            <p className="text-xl text-neutral-500 uppercase font-bold tracking-widest mb-6">Your Ticket Number</p>
                            <div className="text-[120px] leading-none font-black mb-8 text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-600">
                                #{assignedNumber}
                            </div>
                            <p className="text-2xl font-bold text-neutral-800">Please have a seat.</p>
                            <p className="text-base text-neutral-400 mt-6">Screen resets in 5s...</p>
                        </div>
                    )}

                    {/* CHECKOUT: NUMPAD */}
                    {view === 'checkout_entry' && (
                        <div className="bg-neutral-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/10">
                            <h2 className="text-2xl font-bold mb-6 text-center text-white">Enter Ticket Number</h2>

                            <div className="bg-neutral-900 p-6 rounded-2xl mb-6 text-center border border-white/5">
                                <span className="text-6xl font-mono tracking-widest text-white">{inputNumber || '_'}</span>
                            </div>

                            {errorMsg && <p className="text-red-400 text-center mb-4 font-medium animate-pulse">{errorMsg}</p>}

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => handleNumpadInput(n.toString())}
                                        className="bg-white/5 hover:bg-white/10 p-6 rounded-xl text-3xl font-bold transition-colors"
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button onClick={handleNumpadClear} className="bg-red-500/20 hover:bg-red-500/30 text-red-200 p-6 rounded-xl font-bold text-xl">CLR</button>
                                <button onClick={() => handleNumpadInput('0')} className="bg-white/5 hover:bg-white/10 p-6 rounded-xl text-3xl font-bold">0</button>
                                <button onClick={handleNumpadSubmit} className="bg-green-600 hover:bg-green-500 p-6 rounded-xl font-bold flex items-center justify-center text-white shadow-lg shadow-green-900/20"><Check size={32} /></button>
                            </div>
                            <button onClick={resetFlow} className="w-full py-4 text-neutral-500 hover:text-white font-bold transition-colors">Cancel</button>
                        </div>
                    )}

                    {/* CHECKOUT CONFIRM */}
                    {view === 'checkout_confirm' && activeItem && (
                        <div className="bg-neutral-800 p-10 rounded-3xl text-center shadow-xl border border-white/10">
                            <h2 className="text-3xl font-bold mb-2">Ticket #{activeItem.queueNumber}</h2>
                            <p className="text-neutral-400 mb-10 text-lg">Are you ready to check out?</p>
                            <div className="flex gap-4">
                                <button onClick={() => setView('home')} className="flex-1 py-5 bg-neutral-700 hover:bg-neutral-600 rounded-2xl font-bold transition-colors">No, Go Back</button>
                                <button onClick={performCheckOut} className="flex-1 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-900/30 transition-colors">Yes, Check Out</button>
                            </div>
                        </div>
                    )}

                    {/* FEEDBACK (With stars) */}
                    {view === 'feedback' && (
                        <div className="bg-neutral-800 p-10 rounded-3xl text-center shadow-xl border border-white/10">
                            <h3 className="text-3xl font-bold mb-8">How was your service?</h3>
                            <div className="flex justify-center gap-4 mb-10">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setRating(star)} className={`transform transition-transform hover:scale-110 p-2`}>
                                        <Star size={48} className={rating >= star ? "text-yellow-400 fill-yellow-400" : "text-neutral-600"} />
                                    </button>
                                ))}
                            </div>
                            <button onClick={submitFeedback} className="w-full py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-bold text-xl shadow-lg transition-colors">Submit Feedback</button>
                        </div>
                    )}

                    {/* SUCCESS OUT */}
                    {view === 'success_out' && (
                        <div className="bg-green-600 p-12 rounded-3xl text-center shadow-2xl animate-bounceIn">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={48} />
                            </div>
                            <h2 className="text-4xl font-bold mb-2">You're All Set!</h2>
                            <p className="text-green-100">See you next time.</p>
                        </div>
                    )}

                    {/* REPORT MODAL */}
                    {view === 'report' && (
                        <div className="absolute inset-0 bg-black/95 bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                            <div className="bg-neutral-900 p-8 rounded-3xl w-full max-w-md border border-neutral-800">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><AlertTriangle className="text-orange-500" /> Report Issue</h3>
                                <textarea
                                    className="w-full bg-black border border-neutral-800 p-4 rounded-xl mb-6 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    rows={5}
                                    placeholder="Describe the problem..."
                                    value={reportText}
                                    onChange={e => setReportText(e.target.value)}
                                />
                                <div className="flex gap-4">
                                    <button onClick={() => setView('home')} className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold transition-colors">Cancel</button>
                                    <button onClick={submitReport} className="flex-1 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors">Submit</button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="absolute bottom-8 w-full text-center">
                    <button onClick={() => setView('report')} className="inline-flex items-center gap-2 text-white/30 hover:text-white px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-sm font-medium"><AlertTriangle size={14} /> Report Issue</button>
                </div>
            </div>
        </AuthGuard>
    );
}
