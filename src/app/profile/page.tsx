'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  Building2,
  CheckCircle2,
  LogOut,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, role, logout } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Please sign in to view your airport profile.</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          Airport Transit ID & Profile
        </h1>
        <p className="text-xs text-slate-500">
          User details and campus pickup/drop-off role
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white font-extrabold text-xl shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <div className="text-xs text-slate-500">{user.department || 'Airport Staff'}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" />
            <span>Reset Session</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Mail className="h-3 w-3" /> Official Email
            </span>
            <div className="font-semibold text-slate-900 font-mono">{user.email}</div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Phone className="h-3 w-3" /> Contact Phone
            </span>
            <div className="font-semibold text-slate-900 font-mono">{user.phone}</div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Shield className="h-3 w-3" /> Airport Access Badge
            </span>
            <div className="font-semibold text-slate-900 font-mono">
              {user.badge_number || 'Staff Pass'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Department
            </span>
            <div className="font-semibold text-slate-900">
              {user.department || 'Manohar International Airport (MOPA)'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 space-y-2 text-xs">
          <h4 className="font-bold text-sky-950 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
            <span>Role Capabilities</span>
          </h4>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {role === 'driver'
              ? 'Campus Driver: View incoming pickup requests from airport staff, accept rides, confirm staff pickup, and complete drop-offs across all 21 airport premises stops.'
              : 'Airport Staff: Request immediate or scheduled pickups and drop-offs between any of the 21 terminals, offices, cargo gates, maintenance bays, and security checkpoints within the airport premises.'}
          </p>
        </div>
      </div>
    </div>
  );
}
