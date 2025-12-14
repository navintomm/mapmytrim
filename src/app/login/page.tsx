'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { signInWithEmail, signUpWithEmail } from '@/lib/firebase/auth';
import Image from 'next/image';
import { createUser } from '@/lib/firebase/firestore';
import { Mail, Lock, User, Phone, ArrowRight, Scissors } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { emailJSConfig } from '@/config/emailjs';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer' as 'customer' | 'owner',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Quick check: If already logged in, redirect immediately
  useEffect(() => {
    const cached = localStorage.getItem('mapmytrim_user');
    if (cached) {
      try {
        const user = JSON.parse(cached);
        router.push(user.role === 'owner' ? '/salon/dashboard' : '/home');
      } catch (e) {
        localStorage.removeItem('mapmytrim_user');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        console.log('🚀 Starting signup process...', {
          email: formData.email,
          role: formData.role,
          name: formData.name,
        });

        // Step 1: Create Firebase Auth account
        console.log('📧 Creating Firebase Auth account...');
        const result = await signUpWithEmail(formData.email, formData.password);
        console.log('✅ Firebase Auth account created:', result.user.uid);

        // Step 2: Create Firestore user document
        console.log('📝 Creating Firestore user document...');
        await createUser(result.user.uid, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          createdAt: new Date(),
        });
        console.log('✅ Firestore user document created');

        // Step 3: Store in localStorage for quick access
        const userData = {
          id: result.user.uid,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        };
        localStorage.setItem('mapmytrim_user', JSON.stringify(userData));
        console.log('✅ User data cached in localStorage');

        // Step 3.5: Send Welcome Email via EmailJS (Universal Template)
        try {
          console.log('📧 Sending welcome email...');
          await emailjs.send(
            emailJSConfig.serviceId,
            emailJSConfig.templateId,
            {
              to_email: formData.email,
              email_subject: 'Welcome to MapMyTrim! ✂️',
              email_title: `Welcome, ${formData.name}!`,
              email_body: `We are thrilled to have you on board. Discover top-rated salons, join queues remotely, and book appointments effortlessly.`,
              // Optional details (can be empty if not needed)
              details_label_1: 'Account Type',
              details_value_1: formData.role === 'customer' ? 'Customer' : 'Salon Owner',
              details_label_2: 'Date',
              details_value_2: new Date().toLocaleDateString(),
              details_label_3: '',
              details_value_3: '',
            },
            emailJSConfig.publicKey
          );
          console.log('✅ Welcome email sent successfully!');
        } catch (emailErr) {
          console.error('⚠️ Failed to send welcome email (non-fatal):', emailErr);
        }

        // Step 4: Redirect based on role
        const redirectPath = formData.role === 'owner' ? '/salon/dashboard' : '/home';
        console.log('🔄 Redirecting to:', redirectPath);
        router.push(redirectPath);
      } else {
        console.log('🔐 Starting login process...', { email: formData.email });

        await signInWithEmail(formData.email, formData.password);
        console.log('✅ Login successful');

        // For login, wait for auth state to update localStorage
        setTimeout(() => {
          const cached = localStorage.getItem('mapmytrim_user');
          if (cached) {
            const user = JSON.parse(cached);
            const redirectPath = user.role === 'owner' ? '/salon/dashboard' : '/home';
            console.log('🔄 Redirecting to:', redirectPath);
            router.push(redirectPath);
          } else {
            console.warn('⚠️ No cached user found after login');
          }
        }, 1000); // Increased timeout to 1 second
      }
    } catch (err: any) {
      console.error('❌ Authentication error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);

      // Display user-friendly error messages
      let errorMessage = 'Authentication failed';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 p-4">
      {/* Blurred Background Image Placeholder - using a gradient overlay for now to match request without asset */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20 filter blur-sm"></div>

      {/* Animated Orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all duration-300 hover:shadow-pink-500/20">
        <div className="p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-28 h-28 mx-auto mb-6 rounded-full bg-white p-1 shadow-xl transform hover:scale-105 transition-transform duration-300 overflow-hidden border-4 border-white/30 backdrop-blur-sm">
              <Image
                src="/images/logo.jpg"
                alt="MapMyTrim Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-100 mb-2 drop-shadow-sm">
              MapMyTrim
            </h1>
            <p className="text-white/80 font-medium text-sm tracking-wide">
              Smart Queue Management for Salons ✨
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex gap-2 mb-8 bg-black/10 p-1.5 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${mode === 'login'
                ? 'bg-white text-purple-700 shadow-lg'
                : 'text-white/70 hover:text-white'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${mode === 'signup'
                ? 'bg-white text-purple-700 shadow-lg'
                : 'text-white/70 hover:text-white'
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <>
                <div className="flex gap-2 mb-4">
                  {['customer', 'owner'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r as 'customer' | 'owner' })}
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold border ${formData.role === r
                        ? 'bg-white text-purple-600 border-white'
                        : 'bg-transparent text-white/70 border-white/30 hover:border-white/60'
                        } transition-all`}
                    >
                      {r === 'customer' ? 'Customer' : 'Salon Owner'}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/20 transition-all duration-300 text-center"
                    placeholder={formData.role === 'owner' ? "Business Name" : "Full Name"}
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full px-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/20 transition-all duration-300 text-center"
                    placeholder="Phone Number"
                    required
                  />
                </div>
              </>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/20 transition-all duration-300 text-center"
                placeholder="Email Address"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/60 group-focus-within:text-white transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white/20 transition-all duration-300 text-center"
                placeholder="Password"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-white text-sm text-center font-medium animate-pulse backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 shadow-lg shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              {submitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/80">
              {mode === 'login' ? "New here? " : 'Already a member? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-bold text-white hover:text-pink-200 transition-colors underline decoration-2 underline-offset-4 decoration-pink-400/50"
              >
                {mode === 'login' ? 'Create an account' : 'Log in'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}