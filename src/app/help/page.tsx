'use client';

import React from 'react';
import {
  CheckCircle2,
  Phone,
  ShieldAlert,
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          Airport Staff & Driver Transit Guide
        </h1>
        <p className="text-xs text-slate-500">
          Operational guidelines and contacts for Manohar International Airport (MOPA / GOX)
        </p>
      </div>

      {/* Helpline Strip */}
      <div className="rounded-2xl bg-slate-900 p-6 text-white space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
          <Phone className="h-4 w-4" />
          <span>24/7 Campus Transport & Security Helplines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-800/80 p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Operations Control
            </span>
            <div className="text-base font-bold text-white mt-1">+91 832 249 9000</div>
            <div className="text-[11px] text-slate-400 mt-1">Campus transport support</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-800/80 p-4">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">
              CISF Security Control
            </span>
            <div className="text-base font-bold text-white mt-1">+91 832 249 9100</div>
            <div className="text-[11px] text-slate-400 mt-1">Perimeter gates & sentries</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-800/80 p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              Driver Staging Desk
            </span>
            <div className="text-base font-bold text-white mt-1">+91 832 249 9010</div>
            <div className="text-[11px] text-slate-400 mt-1">Vehicle & shift coordination</div>
          </div>
        </div>
      </div>

      {/* Premises Rules */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <ShieldAlert className="h-5 w-5 text-amber-700" />
          <span>Airport Premises Roadway Guidelines</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          All staff rides operate strictly inside the Manohar International Airport campus along approved perimeter roadways. Drivers must never enter active runway 10/28 or aircraft taxiway corridors.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-amber-900">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>Airport staff can request pickups and drop-offs across all 21 airport campus locations.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>Drivers pick up requests directly from the Driver Desk and update pickup/drop-off status in real time.</span>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              How do airport staff request a pickup?
            </h3>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Open Request Ride, choose your Pickup Location and desired Drop-off Location inside the airport premises, set the number of staff riding, and click &quot;REQUEST PICKUP&quot;.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              How do drivers pick up and drop off staff?
            </h3>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Drivers open the Driver Desk to see pending staff pickup requests. Tap &quot;Accept &amp; Pick Up&quot;, tap &quot;Confirm Staff Picked Up&quot; when boarding, and tap &quot;Confirm Dropped Off (Complete)&quot; at the destination.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Can this service be used for travel outside airport premises?
            </h3>
            <p className="text-slate-600 mt-1 leading-relaxed">
              No. NavGOX operates exclusively within Manohar International Airport (MOPA / GOX) premises for airport staff and campus drivers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
