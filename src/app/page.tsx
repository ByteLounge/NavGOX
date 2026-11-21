'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StorageService } from '@/lib/storage';
import { AirportLocation } from '@/types';
import BookingCard from '@/components/booking/BookingCard';
import AirportMap from '@/components/map/AirportMap';
import AirportGallery from '@/components/home/AirportGallery';
import {
  Accessibility,
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Palmtree,
  Phone,
  Plane,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [locations, setLocations] = useState<AirportLocation[]>([]);
  const [searchRef, setSearchRef] = useState('');
  const [refError, setRefError] = useState<string | null>(null);
  const [mapPickupId, setMapPickupId] = useState<string>('loc-01');
  const [mapDestId, setMapDestId] = useState<string>('loc-04');

  useEffect(() => {
    setLocations(StorageService.getLocations());
    const unsub = StorageService.subscribe(() => {
      setLocations(StorageService.getLocations());
    });
    return () => {
      unsub();
    };
  }, []);

  const handleRefLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef.trim()) return;
    const cleanRef = searchRef.trim();
    const b = StorageService.getBookingById(cleanRef);
    if (b) {
      router.push(`/booking/${b.id}`);
    } else {
      setRefError(`No active trip found with reference "${cleanRef}". Please verify the code.`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section with Official MIA Goa Airport Branding & Photography */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800">
        {/* Subtle Airport Terminal Architectural Backdrop Image with Gradients */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity filter blur-[1px] scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-sky-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Manohar International Airport • Goa (GOX)</span>
                <span className="text-amber-500/60">•</span>
                <span className="text-amber-200">A GMR Airport</span>
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Airport transportation,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-300 to-sky-400">
                  made simple.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Seamless campus ground mobility connecting passenger arrivals, departures, GOX Village forecourt, GMR corporate offices, CISF security base, and airside logistics.
              </p>

              {/* Quick Trip Reference Tracker */}
              <div className="pt-2 max-w-lg">
                <form onSubmit={handleRefLookup} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchRef}
                      onChange={(e) => {
                        setSearchRef(e.target.value);
                        setRefError(null);
                      }}
                      placeholder="Have a Booking Reference? (e.g. MOPA-2026-00041)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/95 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-hidden transition shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition whitespace-nowrap"
                  >
                    Track Ride
                  </button>
                </form>
                {refError && <p className="mt-2 text-xs text-rose-400 font-semibold">{refError}</p>}
              </div>
            </div>

            {/* Right Quick Badges (4 cols) */}
            <div className="lg:col-span-4 hidden lg:grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md space-y-1">
                <div className="text-2xl font-black text-amber-400">21</div>
                <div className="text-xs font-bold text-white">Approved Locations</div>
                <p className="text-[10px] text-slate-400">Terminals, bays, cargo & security</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md space-y-1">
                <div className="text-2xl font-black text-emerald-400">100%</div>
                <div className="text-xs font-bold text-white">Electric & Low-Floor</div>
                <p className="text-[10px] text-slate-400">Zero-emission campus transit</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md space-y-1">
                <div className="text-2xl font-black text-sky-400">&lt; 3m</div>
                <div className="text-xs font-bold text-white">Average Dispatch</div>
                <p className="text-[10px] text-slate-400">IOCC automated allocation</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md space-y-1">
                <div className="text-2xl font-black text-purple-400">24/7</div>
                <div className="text-xs font-bold text-white">Operations Ready</div>
                <p className="text-[10px] text-slate-400">CISF & AAI security compliant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section: Booking Form & Operational Overview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Booking Card (7 cols) */}
          <div className="lg:col-span-7">
            <BookingCard
              locations={locations}
              initialPickupId={mapPickupId}
              initialDestinationId={mapDestId}
              onLocationsChange={(p, d) => {
                setMapPickupId(p);
                setMapDestId(d);
              }}
            />
          </div>

          {/* Quick Info & Transit Standards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual Card 1: GOX Village & Forecourt Preview */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-44 w-full bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"
                  alt="GOX Village Forecourt Promenade"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-md">
                    Passenger Forecourt
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">GOX Village Promenade</h3>
                  <p className="text-[11px] text-slate-300">Shuttle & Buggy Dropoff at outdoor retail courtyard</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Connecting Arrivals to Thalassa Express, Dhaba@GOX & Parking P1</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Frequent 3-minute circular loop with luggage assistance</span>
                </div>
              </div>
            </div>

            {/* Visual Card 2: Campus Security Protocol */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-400" />
                  <h4 className="font-bold text-sm">Security & Airside Protocol</h4>
                </div>
                <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  AAI / CISF Standard
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Taxis and shuttles operate strictly via designated internal perimeter roadways. Airside areas (Runway 10/28 and aircraft taxiways) are non-vehicular corridors protected by CISF automated checkpoint gates.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                <div className="rounded-lg bg-slate-800/80 p-2.5">
                  <div className="font-bold text-white">Passenger Routes</div>
                  <div>Terminal 1, GOX Village, P1–P4 bays</div>
                </div>
                <div className="rounded-lg bg-slate-800/80 p-2.5">
                  <div className="font-bold text-white">Restricted Zones</div>
                  <div>ATC Tower, Cargo, ARFF Station</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULL-WIDTH HORIZONTAL AERODROME MAP SECTION (Occupies Entire Horizontal Box) */}
      <section id="campus-map" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Horizontal Map Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs font-bold text-sky-700">
              <Compass className="h-3.5 w-3.5 text-sky-600" />
              <span>Full-Width Aerodrome Navigation Map</span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Manohar International Airport Campus Network
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              High-resolution satellite view with surveyed ground transit corridors, pickup points, and approved building gates across the 2,132-acre airport campus.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              <span>Interactive Horizontal Viewer</span>
            </span>
          </div>
        </div>

        {/* Large Horizontal Map Box */}
        <div className="w-full">
          <AirportMap
            locations={locations}
            pickupId={mapPickupId}
            destinationId={mapDestId}
            onSelectPickup={(id) => setMapPickupId(id)}
            onSelectDestination={(id) => setMapDestId(id)}
            height="540px"
          />
        </div>
      </section>

      {/* Campus Transit & Aerodrome Facilities Photography Gallery */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AirportGallery />
      </section>

      {/* 24/7 Operations Hotline Strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Phone className="h-4 w-4" />
              <span>24/7 Ground Transport Helpline & IOCC Command</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Need Operational Ground Assistance or Wheelchair Escort?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Connect directly with the Integrated Operations Control Center (IOCC) or the CISF Terminal Security Desk for real-time dispatch support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+918322499000"
              className="rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow-md"
            >
              IOCC: +91 832 249 9000
            </a>
            <Link
              href="/help"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-xs font-bold text-white hover:bg-slate-700 transition backdrop-blur-md"
            >
              Transit Guidelines & FAQs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
