'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { Bus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [role, setRole] = useState<UserRole>('staff');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [department, setDepartment] = useState('Airport Operations');
  const [error, setError] = useState<string | null>(null);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please fill in required fields.');
      return;
    }

    const profile = register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role,
      badge_number: badgeNumber.trim(),
      department: department.trim(),
      is_active: true,
    });

    router.push(profile.role === 'driver' ? '/driver' : '/dashboard');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
          <Bus className="h-6 w-6 text-sky-400" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Airport Staff & Driver Registration
        </h1>
        <p className="text-xs text-slate-500">
          Create an account for Manohar International Airport campus transit
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kulkarni"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Airport Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mopa.aero"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98220 00000"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900 focus:border-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold capitalize text-slate-900 focus:border-sky-500"
              >
                <option value="staff">Airport Staff</option>
                <option value="driver">Campus Driver</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Airport Pass / Badge ID
              </label>
              <input
                type="text"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                placeholder="e.g. GGIAL-8902"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono uppercase text-slate-900 focus:border-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Department / Team
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Terminal Operations, CISF Security, Campus Transport"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-slate-800 transition"
          >
            Complete Registration
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
