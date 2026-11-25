'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Bus, Car, Compass, History } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  const isDriver = role === 'driver';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="grid h-16 grid-cols-4 items-center px-2">
        {isDriver ? (
          <Link
            href="/driver"
            className={`flex flex-col items-center justify-center gap-1 text-xs font-medium ${
              pathname === '/driver' ? 'text-sky-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Car className="h-5 w-5" />
            <span>Pickups</span>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center gap-1 text-xs font-medium ${
              pathname === '/dashboard' || pathname === '/' ? 'text-sky-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Bus className="h-5 w-5" />
            <span>Request</span>
          </Link>
        )}

        <Link
          href="/#campus-map"
          className={`flex flex-col items-center justify-center gap-1 text-xs font-medium ${
            pathname === '/#campus-map' ? 'text-sky-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span>Map</span>
        </Link>

        <Link
          href="/history"
          className={`flex flex-col items-center justify-center gap-1 text-xs font-medium ${
            pathname === '/history' ? 'text-sky-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <History className="h-5 w-5" />
          <span>{isDriver ? 'Trips' : 'Rides'}</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-1 text-xs font-medium ${
            pathname === '/profile' ? 'text-sky-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
            ID
          </div>
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
}
