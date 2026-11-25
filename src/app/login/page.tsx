'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DEMO_USERS } from '@/lib/constants';
import { UserRole } from '@/types';
import { Bus, Lock, Mail, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchPersona } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your airport email address.');
      return;
    }

    const signedIn = login(email.trim());
    if (signedIn) {
      router.push(signedIn.role === 'driver' ? '/driver' : '/dashboard');
    } else {
      setError('Invalid credentials.');
    }
  };

  const handlePersonaLogin = (id: string, targetRole: UserRole) => {
    switchPersona(id);
    router.push(targetRole === 'driver' ? '/driver' : '/dashboard');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
          <Bus className="h-6 w-6 text-sky-400" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Sign In to NavGOX
        </h1>
        <p className="text-xs text-slate-500">
          Manohar International Airport (MOPA / GOX) Staff & Driver Transit
        </p>
      </div>

      {/* 1-Click Staff / Driver Persona Shortcuts */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-sky-600" />
            <span>1-Click Staff & Driver Sign In</span>
          </span>
          <span className="text-[10px] text-sky-700 font-semibold">Instant Access</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {DEMO_USERS.map((demo) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => handlePersonaLogin(demo.id, demo.role)}
              className="flex items-center justify-between rounded-xl bg-white border border-sky-200/80 p-2.5 text-left text-xs hover:border-sky-400 hover:bg-sky-50/50 transition"
            >
              <div>
                <div className="font-bold text-slate-900 capitalize">
                  {demo.role}: <span className="font-normal">{demo.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{demo.email}</div>
              </div>
              <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                Log In
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Email Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Airport Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mopa.aero"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-slate-800 transition"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          New airport staff member or driver?{' '}
          <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-700">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
