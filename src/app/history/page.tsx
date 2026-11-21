'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { StorageService } from '@/lib/storage';
import { Booking, BookingStatus } from '@/types';
import {
  Calendar,
  Car,
  ChevronRight,
  Filter,
  History,
  MapPin,
  Search,
  User,
} from 'lucide-react';

export default function BookingHistoryPage() {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const refreshData = () => {
    const all = StorageService.getBookings();
    if (user) {
      if (role === 'admin' || role === 'dispatcher') {
        setBookings(all);
      } else {
        setBookings(all.filter((b) => b.passenger_id === user.id));
      }
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

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = b.booking_reference.toLowerCase().includes(q);
      const matchPickup = b.pickup_location_name.toLowerCase().includes(q);
      const matchDest = b.destination_location_name.toLowerCase().includes(q);
      return matchRef || matchPickup || matchDest;
    }
    return true;
  });

  const statusColors: Record<BookingStatus, string> = {
    requested: 'bg-amber-100 text-amber-800',
    searching: 'bg-amber-100 text-amber-800',
    assigned: 'bg-sky-100 text-sky-800',
    driver_accepted: 'bg-sky-100 text-sky-800',
    driver_arriving: 'bg-indigo-100 text-indigo-800',
    arrived_pickup: 'bg-purple-100 text-purple-800',
    passenger_onboard: 'bg-teal-100 text-teal-800',
    in_transit: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-rose-100 text-rose-800',
    rejected: 'bg-rose-100 text-rose-800',
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Booking History & Trip Records
          </h1>
          <p className="text-xs text-slate-500">
            {role === 'admin' || role === 'dispatcher'
              ? 'All campus transportation bookings across MOPA airport'
              : 'Your requested and completed campus journeys'}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs self-start sm:self-auto"
        >
          Book New Ride
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, pickup, or destination..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'in_transit', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Cards */}
      <div className="space-y-3">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((bk) => (
            <div
              key={bk.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {bk.booking_reference}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {new Date(bk.requested_at).toLocaleDateString()} at{' '}
                    {new Date(bk.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <span
                  className={`self-start sm:self-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    statusColors[bk.status]
                  }`}
                >
                  {bk.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Transit Route
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {bk.pickup_location_name} → {bk.destination_location_name}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Assigned Vehicle & Driver
                  </span>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {bk.assigned_vehicle && bk.assigned_driver
                      ? `${bk.assigned_driver.full_name} (${bk.assigned_vehicle.registration_number})`
                      : 'Unassigned / Released'}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                  <div className="text-right sm:block hidden">
                    <span className="text-[10px] text-slate-400 block">Passengers</span>
                    <span className="font-bold text-slate-800">{bk.passenger_count} pax</span>
                  </div>

                  <Link
                    href={`/booking/${bk.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-xs text-slate-400">
            <History className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No Booking Records Found</p>
            <p className="mt-1">Try adjusting your search query or status filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
