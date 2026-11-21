'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StorageService } from '@/lib/storage';
import { AirportLocation } from '@/types';
import BookingCard from '@/components/booking/BookingCard';
import AirportMap from '@/components/map/AirportMap';
import {
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
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
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/70 px-3 py-1 text-xs font-semibold text-sky-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Official Manohar International Airport (MOPA / GOX) Ground Mobility</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
              Airport transportation, <span className="text-sky-400">made simple.</span>
            </h1>

            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Book a ride between designated locations within the Manohar International Airport campus. Exclusively for passengers, GMR employees, CISF personnel, cargo teams, and authorized ground handling staff.
            </p>

            {/* Quick Track Reference Search Form */}
            <div className="pt-2">
              <form onSubmit={handleRefLookup} className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchRef}
                    onChange={(e) => {
                      setSearchRef(e.target.value);
                      setRefError(null);
                    }}
                    placeholder="Have a Booking Reference? (e.g. MOPA-2026-00041)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-500 transition whitespace-nowrap"
                >
                  Track Ride
                </button>
              </form>
              {refError && <p className="mt-2 text-xs text-rose-400 font-medium">{refError}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Main Booking Card & Airport Map Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Col 1: Prominent Booking Form (7 cols) */}
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

          {/* Col 2: Interactive Airport Map (5 cols) */}
          <div id="campus-map" className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-sky-600" />
                  <h3 className="font-bold text-sm text-slate-900">MOPA Campus Ground Map</h3>
                </div>
                <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                  AAI / GOX Verified
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Official approved passenger pickup bays, cargo complex gates, and administration annexes. Click on any marker to select as pickup or destination.
              </p>

              <AirportMap
                locations={locations}
                pickupId={mapPickupId}
                destinationId={mapDestId}
                onSelectPickup={(id) => setMapPickupId(id)}
                onSelectDestination={(id) => setMapDestId(id)}
                height="380px"
              />

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-900">Airport Security Notice:</span> Schematic route reflects authorized internal perimeter roadways and excludes all airside active runways and taxiways.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Approved Areas Breakdown */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            21 Designated Airport Campus Locations
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Inter-campus transit is strictly restricted to approved points within Manohar International Airport
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700 font-bold mb-3">
              <Bus className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Passenger & Public Terminals</h3>
            <p className="text-xs text-slate-500 mt-1">
              Arrival kerbside, Departure gates, Main Terminal Building, GOX Village promenade, and Parking.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Airport Administration</h3>
            <p className="text-xs text-slate-500 mt-1">
              GMR Executive Office, Central Admin Building, and Air Traffic Control (ATC) Office.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 font-bold mb-3">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Cargo & Logistics</h3>
            <p className="text-xs text-slate-500 mt-1">
              Naka Cargo Gate, Naka Air Cargo Verification, Cargo Terminal Building, and Flight Kitchen.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-700 font-bold mb-3">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Maintenance & Emergency</h3>
            <p className="text-xs text-slate-500 mt-1">
              Main ARFF Fire Station, Satellite Fire Station, Airline Engineering GSE Maintenance, and TMT Workshop.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Hotline Strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900 p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Phone className="h-4 w-4" />
              <span>24/7 Ground Transport Helpline</span>
            </div>
            <h3 className="text-lg font-bold">Need Immediate Operations Assistance or Special Airside Escort?</h3>
            <p className="text-xs text-slate-400">
              Call the Integrated Operations Control Center (IOCC) or CISF Terminal Security Desk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+918322499000"
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-500 transition shadow-xs"
            >
              IOCC: +91 832 249 9000
            </a>
            <Link
              href="/help"
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              Transit Guidelines & FAQs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
