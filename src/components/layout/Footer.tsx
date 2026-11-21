'use client';

import React from 'react';
import Link from 'next/link';
import { Bus, Phone, ShieldCheck, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 text-xs py-8 pb-24 lg:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Platform Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                G
              </div>
              <div>
                <span className="text-white font-black tracking-tight">MANOHAR</span>{' '}
                <span className="text-amber-400 font-bold">AIRPORT</span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Official inter-campus ground transportation & transit management platform for Manohar International Airport (MOPA / GOX), Pernem, Goa. A GMR Airport.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-300">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Transit Operations Online • Sustainable Greenfield Aerodrome</span>
            </div>
          </div>

          {/* Col 2: Security & Airside Notice */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Airport Operations Notice</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Authorized ground vehicle routing only. Movement across aircraft movement areas, taxiways, and runways is strictly prohibited. Security passes issued by AAI / BCAS are mandatory for restricted operational zones.
            </p>
          </div>

          {/* Col 3: Direct Helplines */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Emergency & Helplines</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-sky-400" />
                <span>GMR IOCC: <strong className="text-white">+91 832 249 9000</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>CISF Control Room: <strong className="text-white">+91 832 249 9100</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Bus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Taxi Dispatch Desk: <strong className="text-white">+91 832 249 9010</strong></span>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Portals */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Authorized Portals</h4>
            <ul className="space-y-1 text-xs">
              <li><Link href="/dashboard" className="hover:text-white transition">Passenger Booking</Link></li>
              <li><Link href="/driver" className="hover:text-white transition">Driver Operations Desk</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">IOCC Dispatcher Dashboard</Link></li>
              <li><Link href="/help" className="hover:text-white transition">Campus Transit Guide</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>
            © 2026 Manohar International Airport, Mopa, Pernem, Goa. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0">
            Internal Campus Mobility Platform | GMR Goa International Airport Ltd (GGIAL)
          </div>
        </div>
      </div>
    </footer>
  );
}
