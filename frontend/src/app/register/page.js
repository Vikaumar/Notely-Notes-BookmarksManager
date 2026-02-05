'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated && !authLoading) {
    router.push('/notes');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      addToast('Account created!', 'success');
      router.push('/notes');
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-semibold">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#gradient)" />
              <path d="M10 12h12M10 16h8M10 20h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span>Notely</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h1 className="text-xl font-semibold text-center mb-1">Create an account</h1>
          <p className="text-sm text-zinc-500 text-center mb-6">Get started for free</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 pr-10 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {formData.password.length > 0 && formData.password.length < 6 && (
                <p className="text-xs text-zinc-500 mt-1.5">At least 6 characters required</p>
              )}
              {formData.password.length >= 6 && (
                <p className="text-xs text-green-500 mt-1.5 flex items-center gap-1">
                  <FiCheck size={12} /> Password looks good
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-zinc-600 text-center mt-4">
            By signing up, you agree to our Terms & Privacy Policy
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
