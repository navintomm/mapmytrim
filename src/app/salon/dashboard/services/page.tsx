'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';
import { getServices, addService, updateService, deleteService } from '@/lib/firebase/firestore';
import type { Service } from '@/types';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export default function ServicesManagementPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        durationMin: 30,
        price: 0,
        description: '',
    });

    // Get salon ID from user (assuming user has salonId or we fetch it)
    const [salonId, setSalonId] = useState<string>('');

    useEffect(() => {
        if (user) {
            // Find salon owned by this user
            import('@/lib/firebase/firestore').then(({ getSalons }) => {
                getSalons().then((salons) => {
                    const ownedSalon = salons.find(s => s.ownerId === user.id);
                    if (ownedSalon) {
                        setSalonId(ownedSalon.id);
                    }
                });
            });
        }
    }, [user]);

    useEffect(() => {
        if (salonId) {
            loadServices();
        }
    }, [salonId]);

    const loadServices = async () => {
        setLoading(true);
        try {
            const data = await getServices(salonId);
            setServices(data);
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingService) {
                // Update existing service
                await updateService(salonId, editingService.id, formData);
            } else {
                // Add new service
                await addService(salonId, formData);
            }
            await loadServices();
            resetForm();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Failed to save service');
        }
    };

    const handleDelete = async (serviceId: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                await deleteService(salonId, serviceId);
                await loadServices();
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('Failed to delete service');
            }
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            durationMin: service.durationMin,
            price: service.price,
            description: service.description || '',
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            durationMin: 30,
            price: 0,
            description: '',
        });
        setEditingService(null);
        setShowAddModal(false);
    };

    if (!salonId) {
        return (
            <AuthGuard allowedRoles={['owner']}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-600">Loading salon information...</p>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard allowedRoles={['owner']}>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
                            <p className="text-gray-600 mt-1">Manage the services you offer to customers</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
                        >
                            <Plus size={20} />
                            Add Service
                        </button>
                    </div>

                    {/* Services List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Services Yet</h3>
                            <p className="text-gray-600 mb-6">Add your first service to start accepting bookings</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                            >
                                <Plus size={20} />
                                Add Your First Service
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                                            <p className="text-gray-600 mt-1">{service.description || 'No description'}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-sm text-gray-500">
                                                    ⏱️ {service.durationMin} minutes
                                                </span>
                                                <span className="text-lg font-bold text-purple-600">
                                                    ${service.price}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add/Edit Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {editingService ? 'Edit Service' : 'Add New Service'}
                                    </h2>
                                    <button
                                        onClick={resetForm}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="e.g., Haircut, Beard Trim"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Duration (mins) *
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.durationMin}
                                                onChange={(e) => setFormData({ ...formData, durationMin: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                min="5"
                                                step="5"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price ($) *
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                min="0"
                                                step="1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                            rows={3}
                                            placeholder="Brief description of the service"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Save size={20} />
                                            {editingService ? 'Update' : 'Add'} Service
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
