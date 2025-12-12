'use client';

import { useAuthContext } from '@/context/AuthContext';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
    const { user, loading } = useAuthContext();
    const [firebaseUser, setFirebaseUser] = useState<any>(null);

    useEffect(() => {
        const auth = getAuth();
        setFirebaseUser(auth.currentUser);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Authentication Debug</h1>

                {/* AuthContext Status */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">AuthContext Status</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 w-32">Loading:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {loading ? '⏳ Loading...' : '✅ Ready'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 w-32">User:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {user ? '✅ Logged In' : '❌ Not Logged In'}
                            </span>
                        </div>
                        {user && (
                            <>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700 w-32">Name:</span>
                                    <span className="text-gray-900">{user.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700 w-32">Email:</span>
                                    <span className="text-gray-900">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700 w-32">Role:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700 w-32">User ID:</span>
                                    <span className="text-gray-600 text-sm font-mono">{user.id}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Firebase Auth Status */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Firebase Auth Status</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-700 w-32">Firebase User:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${firebaseUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {firebaseUser ? '✅ Authenticated' : '❌ Not Authenticated'}
                            </span>
                        </div>
                        {firebaseUser && (
                            <>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700 w-32">Email:</span>
                                    <span className="text-gray-900">{firebaseUser.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700 w-32">Email Verified:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${firebaseUser.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {firebaseUser.emailVerified ? '✅ Verified' : '⚠️ Not Verified'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-700 w-32">UID:</span>
                                    <span className="text-gray-600 text-sm font-mono">{firebaseUser.uid}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Access Status */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Page Access Status</h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg border-2 border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">/salon/register</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.role === 'owner' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {user?.role === 'owner' ? '✅ Allowed' : '❌ Denied'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Requires: owner role</p>
                        </div>

                        <div className="p-4 rounded-lg border-2 border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">/salon/dashboard</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.role === 'owner' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {user?.role === 'owner' ? '✅ Allowed' : '❌ Denied'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Requires: owner role</p>
                        </div>

                        <div className="p-4 rounded-lg border-2 border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-700">/home</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {user ? '✅ Allowed' : '❌ Denied'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Requires: any authenticated user</p>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className={`rounded-xl shadow-lg p-6 ${user?.role === 'owner' ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'
                    }`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Recommendations</h2>
                    {!user && (
                        <div className="space-y-3">
                            <p className="text-gray-700">❌ You are not logged in.</p>
                            <p className="text-gray-700 font-semibold">Action Required:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>Go to <a href="/login" className="text-purple-600 hover:underline font-semibold">/login</a> to sign in</li>
                                <li>Or go to <a href="/register" className="text-purple-600 hover:underline font-semibold">/register</a> to create an account</li>
                            </ul>
                        </div>
                    )}
                    {user && user.role !== 'owner' && (
                        <div className="space-y-3">
                            <p className="text-gray-700">⚠️ You are logged in as <strong>{user.role}</strong>, but need <strong>owner</strong> role.</p>
                            <p className="text-gray-700 font-semibold">Options:</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>Contact admin to change your role to 'owner'</li>
                                <li>Or create a new account with 'owner' role at <a href="/register" className="text-purple-600 hover:underline font-semibold">/register</a></li>
                                <li>Or manually update your role in Firestore Database</li>
                            </ul>
                        </div>
                    )}
                    {user?.role === 'owner' && (
                        <div className="space-y-3">
                            <p className="text-green-700 font-semibold">✅ Everything looks good!</p>
                            <p className="text-gray-700">You have the correct role to access salon pages.</p>
                            <div className="mt-4">
                                <a
                                    href="/salon/register"
                                    className="inline-block px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                                >
                                    Go to Salon Registration →
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 flex gap-4">
                    <a
                        href="/home"
                        className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
                    >
                        Go to Home
                    </a>
                    <a
                        href="/login"
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Login Page
                    </a>
                    <a
                        href="/register"
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                    >
                        Register Page
                    </a>
                </div>
            </div>
        </div>
    );
}
