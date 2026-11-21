'use client';

import React from 'react';
import Image from 'next/image';
import {
  Building2,
  Bus,
  Compass,
  Flame,
  Leaf,
  Palmtree,
  Plane,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

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
    title: 'Main Passenger Terminal',
    subtitle: 'Integrated Passenger Terminal & Aerodrome Concourse',
    badge: 'Wave Architecture',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description:
      'Curved roof design inspired by the dynamic waves of the Arabian Sea. Features natural skylights, azulejos art walls, and 14 contact passenger boarding bridges.',
    imageUrl:
      'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80',
    metrics: [
      { label: 'Passenger Capacity', value: '4.4M / year' },
      { label: 'Boarding Gates', value: '14 Aerobridges' },
      { label: 'Transit Time', value: 'Sub-5 min' },
    ],
  },
  {
    id: 'forecourt',
    title: 'GOX Village & Forecourt',
    subtitle: 'Curated Open-Air Promenade & Food Courtyard',
    badge: 'Goan Hospitality',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description:
      'Lush tropical garden promenade in front of the terminal. Features iconic Goan dining including Thalassa Express, Dhaba@GOX, Artjuna, and Susegado Microbrewery.',
    imageUrl:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    metrics: [
      { label: 'Operating Hours', value: '06:00 - 02:00' },
      { label: 'Retail & Dining', value: '25+ Outlets' },
      { label: 'Distance to Curbside', value: '50 Meters' },
    ],
  },
  {
    id: 'eco-fleet',
    title: 'Zero-Emission Campus Mobility',
    subtitle: 'Electric Buggies & Accessible Low-Floor Shuttles',
    badge: '100% Eco-Mobility',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    description:
      'Green transit fleet deployed across passenger curbsides, parking blocks P1-P4, staff offices, and airside logistics zones. Equipped with wheelchair docking.',
    imageUrl:
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    metrics: [
      { label: 'Fleet Type', value: 'Electric & Hybrid' },
      { label: 'Accessibility', value: 'Hydraulic Ramps' },
      { label: 'Dispatch SLA', value: '< 3 Minutes' },
    ],
  },
  {
    id: 'logistics',
    title: 'Cargo Logistics & Emergency ARFF',
    subtitle: 'Air Traffic Control, Customs & Category 9 ARFF',
    badge: 'Airport Operations',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description:
      'Dedicated airside cargo apron, AAI Control Tower, CISF security command, in-flight kitchen, and Category 9 Aircraft Rescue and Fire Fighting (ARFF) stations.',
    imageUrl:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    metrics: [
      { label: 'ARFF Category', value: 'Category 9' },
      { label: 'Runway Length', value: '3,500 Meters' },
      { label: 'Security Standard', value: 'CISF 24/7' },
    ],
  },
];

export default function AirportGallery() {
  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Manohar International Airport • Goa (GOX)</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Airport Campus & Transit Facilities
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
            Explore the sustainable, award-winning infrastructure of MOPA Airport connecting passengers, airlines, GMR operations, and cargo services.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>Campus Transit Active</span>
          <span className="text-slate-300">•</span>
          <span>A GMR Airport</span>
        </div>
      </div>

      {/* 4 Responsive Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1"
          >
            {/* Image Box */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Badge */}
              <div className="absolute top-3 left-3">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>

              {/* Title on Image */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-base font-bold text-white leading-snug drop-shadow-sm">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-300 truncate">{item.subtitle}</p>
              </div>
            </div>

            {/* Description Body */}
            <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>

              {/* Mini Metrics */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                {item.metrics.map((m, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="text-[11px] font-extrabold text-slate-900">{m.value}</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-tight">{m.label}</div>
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
