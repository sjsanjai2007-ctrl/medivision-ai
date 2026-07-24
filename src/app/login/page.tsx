'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useDemoMode } from '@/lib/providers/DemoModeProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login, enableDemoMode } = useDemoMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    enableDemoMode();
    await new Promise((r) => setTimeout(r, 400));
    router.push('/');
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8"
      style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', boxShadow: '0 8px 24px rgba(14,165,233,0.4)' }}>
            <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>MediVision AI</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>AI-Assisted Clinical Screening</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl p-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
          <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="btn-primary w-full py-3" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--border-subtle)' }} /></div>
            <div className="relative flex justify-center"><span className="px-3 text-xs" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>or</span></div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDemoLogin} disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#d97706' }}>
            ⚡ Continue in Demo Mode
          </motion.button>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>Register</Link>
          </p>
        </motion.div>

        <p className="text-center text-xs mt-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          By signing in, you agree to our Terms of Service. MediVision AI provides AI-assisted clinical screening for informational purposes only.
        </p>
      </div>
    </div>
  );
}
