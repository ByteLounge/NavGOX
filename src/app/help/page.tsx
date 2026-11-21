'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          Campus Transportation Guide & Emergency Contacts
        </h1>
        <p className="text-xs text-slate-500">
          Operational guidelines for Manohar International Airport (MOPA / GOX), Pernem, Goa
        </p>
      </div>

      {/* Emergency Helpline Strip */}
      <div className="rounded-2xl bg-slate-900 p-6 text-white space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
          <Phone className="h-4 w-4" />
          <span>24/7 Ground Operations Helplines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-800/80 p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              GMR IOCC Control Center
            </span>
            <div className="text-base font-bold text-white mt-1">+91 832 249 9000</div>
            <div className="text-[11px] text-slate-400 mt-1">Integrated operations & shuttle routing</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-800/80 p-4">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">
              CISF Airport Security Control
            </span>
            <div className="text-base font-bold text-white mt-1">+91 832 249 9100</div>
            <div className="text-[11px] text-slate-400 mt-1">Perimeter sentries & security clearance</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-800/80 p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              Taxi Dispatch Desk
            </span>
            <div className="text-base font-bold text-white mt-1">+91 832 249 9010</div>
            <div className="text-[11px] text-slate-400 mt-1">Kerbside and buggy staging bay</div>
          </div>
        </div>
      </div>

      {/* Security Protocol & Airside Restrictions Notice */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <ShieldAlert className="h-5 w-5 text-amber-700" />
          <span>Restricted Operational Zones & Security Pass Regulations</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Manohar International Airport is an active civil aerodrome operated under Directorate General of Civil Aviation (DGCA) and Bureau of Civil Aviation Security (BCAS) regulations. Ground vehicles operate strictly along designated landside perimeter roadways. Under no circumstances may any shuttle or buggy traverse runway 09/27 or aircraft apron movement areas.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-amber-900">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>Public passengers may book between Arrival, Departure, Main Terminal, GOX Village, and Parking.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>Operational points (ATC, Cargo Gates, Fire Station, Maintenance) require verified AAI/GMR staff pass.</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              How do I request a campus shuttle between terminals?
            </h3>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Open the Dashboard, select your current airport pickup location from the approved list, choose your destination within the campus, and tap "BOOK A RIDE". A unique reference (e.g. MOPA-2026-00041) will be issued and the nearest available vehicle will be dispatched.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Can I use this service to travel to Panaji, Calangute, or outside the airport?
            </h3>
            <p className="text-slate-600 mt-1 leading-relaxed">
              No. NavGOX is exclusively an internal airport campus transportation system for Manohar International Airport. For travelling outside the airport campus into Goa, please proceed to the commercial taxi counters in the public arrival forecourt.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Is wheelchair and special accessibility assistance available?
            </h3>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Yes. When creating a booking, check "Wheelchair Dock". The system automatically allocates an accessible electric buggy or shuttle equipped with hydraulic ramps and low-floor anchorage.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              How does the airport employee booking differ from passenger booking?
            </h3>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Airport employees, CISF staff, and airline technical crews can book transport to administration complexes, cargo gates, maintenance hangars, and fire stations that are hidden from public passenger accounts for security compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
