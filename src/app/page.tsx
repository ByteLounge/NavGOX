'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StorageService } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import { AirportLocation } from '@/types';
import BookingCard from '@/components/booking/BookingCard';
import AirportMap from '@/components/map/AirportMap';
import AirportGallery from '@/components/home/AirportGallery';
import {
  Car,
  CheckCircle2,
  Compass,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { role } = useAuth();
  const [locations, setLocations] = useState<AirportLocation[]>([]);
  const [searchRef, setSearchRef] = useState('');
  const [refError, setRefError] = useState<string | null>(null);
  const [mapPickupId, setMapPickupId] = useState<string>('loc-08');
  const [mapDestId, setMapDestId] = useState<string>('loc-07');

  useEffect(() => {
    const sync = () => setLocations(StorageService.getLocations());
    const timer = setTimeout(sync, 0);
    const unsub = StorageService.subscribe(sync);
    return () => {
      clearTimeout(timer);
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
      setRefError(`No trip found with reference "${cleanRef}". Please verify the code.`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800">
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
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Manohar International Airport • Goa (GOX)</span>
                <span className="text-amber-500/60">•</span>
                <span className="text-amber-200">Staff & Driver Mobility</span>
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Airport staff transit,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-300 to-sky-400">
                  made simple.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Direct pickup and drop-off inside MOPA airport premises. Airport staff request a ride between any of the 21 campus stops, and available campus drivers accept, pick up, and drop them off.
              </p>

              {/* Quick Trip Reference Tracker & Driver Shortcut */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-2xl">
                <form onSubmit={handleRefLookup} className="flex flex-1 flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchRef}
                      onChange={(e) => {
                        setSearchRef(e.target.value);
                        setRefError(null);
                      }}
                      placeholder="Track Ride Ref (e.g. MOPA-2026-00041)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/95 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-hidden transition shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition whitespace-nowrap"
                  >
                    Track Ride
                  </button>
                </form>

                {role === 'driver' && (
                  <Link
                    href="/driver"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/20 px-4 py-3 text-xs font-bold text-sky-200 hover:bg-sky-500/30 transition whitespace-nowrap"
                  >
                    <Car className="h-4 w-4" />
                    <span>Open Driver Desk</span>
                  </Link>
                )}
              </div>
              {refError && <p className="text-xs text-rose-400 font-semibold">{refError}</p>}
            </div>

            <div className="lg:col-span-4 hidden lg:grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md space-y-1">
                <div className="text-2xl font-black text-amber-400">21</div>
                <div className="text-xs font-bold text-white">Airport Stops</div>
                <p className="text-[10px] text-slate-400">Terminals, offices, cargo & gates</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md space-y-1">
                <div className="text-2xl font-black text-emerald-400">2 Roles</div>
                <div className="text-xs font-bold text-white">Staff & Drivers</div>
                <p className="text-[10px] text-slate-400">Direct request-to-pickup flow</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md space-y-1">
                <div className="text-2xl font-black text-sky-400">3 Steps</div>
                <div className="text-xs font-bold text-white">Driver Workflow</div>
                <p className="text-[10px] text-slate-400">Accept → Pick Up → Drop Off</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md space-y-1">
                <div className="text-2xl font-black text-purple-400">24/7</div>
                <div className="text-xs font-bold text-white">Premises Transit</div>
                <p className="text-[10px] text-slate-400">Perimeter road compliant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section: Pickup Request Card + Simple 2-Party Process Summary */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

          <div className="lg:col-span-5 space-y-6">
            {/* Simple How It Works Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">How Staff Transit Works</h3>
                <span className="rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-[10px] font-bold text-sky-700">
                  Direct Staff ↔ Driver
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Airport Staff Requests Pickup</div>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      Pick your current airport building and your desired drop-off location within the premises.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Available Driver Accepts & Picks Up</div>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      Drivers see open staff requests on the Driver Desk, accept the ride, and drive to your pickup spot.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Safe Drop-off at Destination</div>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      Driver confirms pickup and marks dropped off once you reach your destination inside the airport.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>All 21 terminals, offices, cargo & technical stops enabled for staff</span>
              </div>
            </div>

            {/* Campus Roadway Protocol */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-400" />
                  <h4 className="font-bold text-sm">Airport Premises Perimeter Rules</h4>
                </div>
                <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  MOPA / GOX
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Drivers operate strictly along designated internal airport perimeter roads connecting terminals, GMR/Admin offices, ATC, CISF, Cargo gates, and ARFF stations—avoiding active runway 10/28 corridors.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                <div className="rounded-lg bg-slate-800/80 p-2.5">
                  <div className="font-bold text-white flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-sky-400" /> Terminal & Admin
                  </div>
                  <div>Arrival, Dep, GMR, ATC</div>
                </div>
                <div className="rounded-lg bg-slate-800/80 p-2.5">
                  <div className="font-bold text-white flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-400" /> Cargo & Ops
                  </div>
                  <div>Naka, GSE, TMT, ARFF</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Airport Map */}
      <section id="campus-map" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs font-bold text-sky-700">
              <Compass className="h-3.5 w-3.5 text-sky-600" />
              <span>Airport Premises Interactive Map</span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Manohar International Airport Campus Stops
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Click any stop on the map or bottom strip to set your Pickup and Drop-off locations.
            </p>
          </div>
        </div>

        <div className="w-full">
          <AirportMap
            locations={locations}
            pickupId={mapPickupId}
            destinationId={mapDestId}
            onSelectPickup={(id) => setMapPickupId(id)}
            onSelectDestination={(id) => setMapDestId(id)}
            height="520px"
          />
        </div>
      </section>

      {/* Campus Zones & Fleet Gallery */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AirportGallery />
      </section>

      {/* 24/7 Operations Hotline Strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Phone className="h-4 w-4" />
              <span>24/7 Campus Transport Support</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Need Immediate Campus Pickup Support?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Call the airport operations desk or CISF control room for urgent operational vehicle assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+918322499000"
              className="rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow-md"
            >
              Ops Desk: +91 832 249 9000
            </a>
            <Link
              href="/help"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-xs font-bold text-white hover:bg-slate-700 transition backdrop-blur-md"
            >
              Contacts & Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
