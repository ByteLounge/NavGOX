'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  description: string;
  imageUrl: string;
  metrics: { label: string; value: string }[];
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'terminal',
    title: 'Terminal & Forecourt Zones',
    subtitle: 'Arrival, Departure, Main Terminal & GOX Village',
    badge: 'Terminal Stops',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description:
      'Direct staff pickup and drop-off points across Arrival kerbside bays, Departure gates, Terminal central lobby, and Parking blocks.',
    imageUrl:
      'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80',
    metrics: [
      { label: 'Curbside Bays', value: 'Arrival & Dep' },
      { label: 'Service', value: '24/7 Staff' },
      { label: 'Transit Time', value: 'Sub-5 min' },
    ],
  },
  {
    id: 'admin-atc',
    title: 'Admin, ATC & CISF Sector',
    subtitle: 'GMR Headquarters, Admin Annex, ATC Tower & CISF',
    badge: 'Operations & HQ',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description:
      'Seamless point-to-point transport connecting corporate offices, Air Traffic Control, security barracks, and the staff canteen.',
    imageUrl:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    metrics: [
      { label: 'Key Stops', value: 'ATC, GMR, CISF' },
      { label: 'Gate Sentries', value: 'Gate 1 & 2' },
      { label: 'Staff Welfare', value: 'Canteen' },
    ],
  },
  {
    id: 'eco-fleet',
    title: 'Campus Driver Fleet',
    subtitle: 'Electric Buggies, Shuttles & Utility Vans',
    badge: 'Driver Fleet',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    description:
      'Certified airport drivers operating low-floor accessible shuttles, eco-buggies, and utility vans across all 21 premises stops.',
    imageUrl:
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    metrics: [
      { label: 'Fleet Type', value: 'Electric & Van' },
      { label: 'Accessibility', value: 'Ramp Ready' },
      { label: 'Max Capacity', value: 'Up to 14 Pax' },
    ],
  },
  {
    id: 'logistics',
    title: 'Cargo, Engineering & ARFF',
    subtitle: 'Cargo Building, Flight Kitchen, Hangars & Fire Stations',
    badge: 'Airside Perimeter',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description:
      'Reliable shift rides to Naka Cargo gates, cold-chain warehouses, airline engineering hangars, TMT workshop, and ARFF fire stations.',
    imageUrl:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    metrics: [
      { label: 'Cargo Stops', value: '3 Checkpoints' },
      { label: 'ARFF Bases', value: 'Main & Sat' },
      { label: 'Maintenance', value: 'GSE & TMT' },
    ],
  },
];

export default function AirportGallery() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Manohar International Airport • Goa (GOX)</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Airport Premises Zones & Campus Fleet
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
            Point-to-point pickup and drop-off coverage for airport staff across every terminal, office, cargo gate, and technical facility.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>21 Airport Stops Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1"
          >
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute top-3 left-3">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-base font-bold text-white leading-snug drop-shadow-sm">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-300 truncate">{item.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                {item.metrics.map((m, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="text-[11px] font-extrabold text-slate-900">{m.value}</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-tight">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
