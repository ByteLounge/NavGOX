'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { StorageService } from '@/lib/storage';
import { AirportLocation, Booking } from '@/types';
import BookingCard from '@/components/booking/BookingCard';
import ActiveBookingCard from '@/components/booking/ActiveBookingCard';
import AirportMap from '@/components/map/AirportMap';
import AirportGallery from '@/components/home/AirportGallery';
import {
  Car,
  Compass,
  History,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [locations, setLocations] = useState<AirportLocation[]>([]);
  const [myActiveBookings, setMyActiveBookings] = useState<Booking[]>([]);
  const [myPastBookings, setMyPastBookings] = useState<Booking[]>([]);
  const [mapPickupId, setMapPickupId] = useState<string>('loc-08');
  const [mapDestId, setMapDestId] = useState<string>('loc-07');

  const refreshData = useCallback(() => {
    setLocations(StorageService.getLocations());

    if (user) {
      const all = StorageService.getBookings();
      const userBookings = all.filter((b) => b.staff_id === user.id);

      const active = userBookings.filter((b) =>
        ['requested', 'driver_accepted', 'in_transit'].includes(b.status)
      );
      const past = userBookings.filter((b) =>
        ['completed', 'cancelled'].includes(b.status)
      );

      setMyActiveBookings(active);
      setMyPastBookings(past.slice(0, 5));
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(refreshData, 0);
    const unsub = StorageService.subscribe(refreshData);
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [refreshData]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Staff Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80')`,
          }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Manohar International Airport (MOPA / GOX)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Staff Pickup & Drop-off
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Request a campus driver to pick you up and drop you off at any location inside the airport premises.
            </p>

            {user && (
              <div className="pt-1 text-xs text-sky-300 flex flex-wrap items-center gap-2">
                <span>
                  Signed in: <strong>{user.name}</strong>
                </span>
                <span className="rounded bg-sky-900/60 px-2 py-0.5 text-[10px] uppercase font-bold text-sky-200 border border-sky-700/50">
                  {user.role}
                </span>
                {user.department && (
                  <span className="text-slate-400 hidden sm:inline">• {user.department}</span>
                )}
              </div>
            )}
          </div>

          {role === 'driver' && (
            <Link
              href="/driver"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-amber-400 transition self-start"
            >
              <Car className="h-4 w-4" />
              <span>Go to Driver Desk</span>
            </Link>
          )}
        </div>
      </div>

      {/* Active Rides in Progress */}
      {myActiveBookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-extrabold text-slate-900">
                Active Rides ({myActiveBookings.length})
              </h2>
            </div>
            <Link href="/history" className="text-xs font-bold text-sky-600 hover:text-sky-700">
              View all rides →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActiveBookings.map((b) => (
              <ActiveBookingCard key={b.id} booking={b} onUpdate={refreshData} />
            ))}
          </div>
        </div>
      )}

      {/* Primary Section: Pickup Request Card + Recent Rides */}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-600" />
                <h3 className="font-bold text-sm text-slate-900">Recent Completed Rides</h3>
              </div>
              <Link href="/history" className="text-xs font-bold text-sky-600 hover:text-sky-700">
                View All
              </Link>
            </div>

            {myPastBookings.length > 0 ? (
              <div className="space-y-2">
                {myPastBookings.map((bk) => (
                  <Link
                    key={bk.id}
                    href={`/booking/${bk.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs hover:bg-slate-50 transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {bk.pickup_location_name} → {bk.destination_location_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {bk.booking_reference} • {new Date(bk.requested_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        bk.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {bk.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No past rides yet. Request a pickup to begin.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-sky-500/5 p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Airport Premises Coverage</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Every active stop—from Arrival & Terminal to ATC, GMR, CISF, Cargo Gates, Maintenance, and Fire Stations—is available for direct staff pickup and drop-off.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Airport Map */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs font-bold text-sky-700">
              <Compass className="h-3.5 w-3.5 text-sky-600" />
              <span>Aerodrome Navigation Map</span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              Airport Campus Pickup & Drop-off Points
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Click any stop below or on the map to set your pickup or drop-off location.
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

      <AirportGallery />
    </div>
  );
}
