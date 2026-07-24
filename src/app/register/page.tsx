'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useDemoMode } from '@/lib/providers/DemoModeProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useDemoMode();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', boxShadow: '0 8px 24px rgba(14,165,233,0.4)' }}>
            <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>MediVision AI</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create Your Healthcare Account</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl p-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
          <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Register</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Sharma" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none min-h-[44px]"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none min-h-[44px]"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none min-h-[44px]"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={showPassword ? 'Hide password' : 'Show password'}>
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
              className="btn-primary w-full py-3 min-h-[44px]" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>Sign In</Link>
          </p>
        </motion.div>

        <p className="text-center text-xs mt-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          By registering, you agree to our Terms of Service. MediVision AI provides AI-assisted clinical screening for informational purposes only.
        </p>
      </div>
    </div>
  );
}
