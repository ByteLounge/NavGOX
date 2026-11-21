'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { StorageService } from '@/lib/storage';
import { AirportLocation, Booking } from '@/types';
import BookingCard from '@/components/booking/BookingCard';
import ActiveBookingCard from '@/components/booking/ActiveBookingCard';
import AirportMap from '@/components/map/AirportMap';
import {
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock,
  Compass,
  History,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [locations, setLocations] = useState<AirportLocation[]>([]);
  const [myActiveBookings, setMyActiveBookings] = useState<Booking[]>([]);
  const [myPastBookings, setMyPastBookings] = useState<Booking[]>([]);
  const [mapPickupId, setMapPickupId] = useState<string>('loc-01');
  const [mapDestId, setMapDestId] = useState<string>('loc-04');

  const refreshData = () => {
    const locs = StorageService.getLocations(role);
    setLocations(locs);

    if (user) {
      const all = StorageService.getBookings();
      // If employee/passenger, show their own bookings. If admin/dispatcher, show active operations bookings.
      const userBookings =
        role === 'admin' || role === 'dispatcher'
          ? all
          : all.filter((b) => b.passenger_id === user.id);

      const active = userBookings.filter((b) =>
        ['requested', 'searching', 'assigned', 'driver_accepted', 'driver_arriving', 'arrived_pickup', 'passenger_onboard', 'in_transit'].includes(
          b.status
        )
      );
      const past = userBookings.filter((b) => ['completed', 'cancelled', 'rejected'].includes(b.status));

      setMyActiveBookings(active);
      setMyPastBookings(past.slice(0, 5));
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = StorageService.subscribe(() => {
      refreshData();
    });
    return () => {
      unsub();
    };
  }, [user, role]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-400/20 px-3 py-0.5 text-xs font-semibold text-sky-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Manohar International Airport (MOPA / GOX)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Airport transportation, made simple.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            Book a ride between locations within Manohar International Airport. Authorized ground vehicle transport connecting terminals, GOX village, ATC, and operational facilities.
          </p>

          {user && (
            <div className="pt-2 text-xs text-sky-300 flex items-center gap-2">
              <span>Logged in as: <strong>{user.name}</strong></span>
              <span className="rounded bg-sky-900/60 px-2 py-0.5 text-[10px] uppercase font-bold text-sky-200 border border-sky-700/50">
                {user.role}
              </span>
              {user.department && (
                <span className="text-slate-400 hidden sm:inline">• {user.department}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Rides Alert (if any) */}
      {myActiveBookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">
                Active Rides in Progress ({myActiveBookings.length})
              </h2>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              View all trips →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActiveBookings.map((b) => (
              <ActiveBookingCard key={b.id} booking={b} onUpdate={refreshData} />
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Booking Card & Campus Map */}
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

        {/* Airport Campus Map & Recent Trips (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">Campus Ground Network</h3>
              </div>
              <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                Aerodrome Chart
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Interactive map of approved transit bays and staff security checkposts.
            </p>

            <AirportMap
              locations={locations}
              pickupId={mapPickupId}
              destinationId={mapDestId}
              onSelectPickup={(id) => setMapPickupId(id)}
              onSelectDestination={(id) => setMapDestId(id)}
              height="350px"
            />
          </div>

          {/* Recent Trip History Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-500" />
                <h3 className="font-bold text-sm text-slate-900">Recent Completed Trips</h3>
              </div>
              <Link href="/history" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                View All
              </Link>
            </div>

            {myPastBookings.length > 0 ? (
              <div className="space-y-2">
                {myPastBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 text-xs hover:bg-slate-50 transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {bk.pickup_location_name} → {bk.destination_location_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {bk.booking_reference} • {new Date(bk.requested_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        bk.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {bk.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                No past trips yet. Submit a ride request above to begin.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
