'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { submitFeedback } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import type { FeedbackType } from '@/types';
import { MessageSquare, Lightbulb, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    salonId: string;
    salonName: string;
}

export function FeedbackModal({ isOpen, onClose, salonId, salonName }: FeedbackModalProps) {
    const { user } = useAuth();
    const [type, setType] = useState<FeedbackType>('feedback');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const feedbackTypes: { value: FeedbackType; label: string; icon: React.ReactNode; color: string }[] = [
        { value: 'suggestion', label: 'Suggestion', icon: <Lightbulb size={20} />, color: 'text-blue-600' },
        { value: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} />, color: 'text-green-600' },
        { value: 'complaint', label: 'Complaint', icon: <AlertCircle size={20} />, color: 'text-red-600' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to submit feedback');
            return;
        }

        if (!subject.trim() || !message.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await submitFeedback({
                salonId,
                salonName,
                userId: user.id,
                userName: user.name || user.email || 'Anonymous',
                userEmail: user.email || '',
                type,
                subject: subject.trim(),
                message: message.trim(),
                status: 'new',
                createdAt: new Date(),
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                // Reset form
                setType('feedback');
                setSubject('');
                setMessage('');
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            console.error('Error submitting feedback:', err);
            setError(err.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Send Feedback">
            {success ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                    <p className="text-gray-600">Your feedback has been sent to {salonName}.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {feedbackTypes.map((ft) => (
                                <button
                                    key={ft.value}
                                    type="button"
                                    onClick={() => setType(ft.value)}
                                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${type === ft.value
                                            ? 'border-purple-600 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className={ft.color}>{ft.icon}</span>
                                    <span className="text-sm font-medium">{ft.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                        </label>
                        <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Brief summary of your feedback"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            placeholder="Please provide details..."
                            required
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={submitting}
                        >
                            {submitting ? 'Sending...' : 'Send Feedback'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
