'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: ('customer' | 'owner' | 'admin')[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const { user, loading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (allowedRoles && !allowedRoles.includes(user.role)) {
                // Redirect to appropriate home based on role if access denied
                if (user.role === 'owner') {
                    router.push('/salon/dashboard');
                } else {
                    router.push('/home');
                }
            }
        }
    }, [user, loading, allowedRoles, router]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
            </div>
        );
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null; // or a customized "Access Denied" page
    }

    return <>{children}</>;
}
