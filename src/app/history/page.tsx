'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { StorageService } from '@/lib/storage';
import { Booking, BookingStatus } from '@/types';
import { ChevronRight, History, Search } from 'lucide-react';

export default function BookingHistoryPage() {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const refreshData = useCallback(() => {
    const all = StorageService.getBookings();
    if (!user) return;

    if (role === 'driver') {
      const drivers = StorageService.getDrivers();
      const drv = drivers.find(
        (d) =>
          d.email.toLowerCase() === user.email.toLowerCase() ||
          d.contact_number === user.phone ||
          d.full_name === user.name
      );
      setBookings(drv ? all.filter((b) => b.assigned_driver_id === drv.id) : []);
    } else {
      setBookings(all.filter((b) => b.staff_id === user.id));
    }
  }, [user, role]);

  useEffect(() => {
    const timer = setTimeout(refreshData, 0);
    const unsub = StorageService.subscribe(refreshData);
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [refreshData]);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.booking_reference.toLowerCase().includes(q) ||
        b.pickup_location_name.toLowerCase().includes(q) ||
        b.destination_location_name.toLowerCase().includes(q) ||
        b.staff_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusColors: Record<BookingStatus, string> = {
    requested: 'bg-amber-100 text-amber-800',
    driver_accepted: 'bg-sky-100 text-sky-800',
    in_transit: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-rose-100 text-rose-800',
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            {role === 'driver' ? 'Driver Trip History' : 'My Campus Ride History'}
          </h1>
          <p className="text-xs text-slate-500">
            {role === 'driver'
              ? 'Staff pickups and drop-offs handled by you inside airport premises'
              : 'Your requested, active, and completed rides across airport premises'}
          </p>
        </div>

        <Link
          href={role === 'driver' ? '/driver' : '/dashboard'}
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs self-start sm:self-auto"
        >
          {role === 'driver' ? 'Open Driver Desk' : 'Request New Pickup'}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, pickup, or drop-off..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'requested', 'driver_accepted', 'in_transit', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

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
                    {new Date(bk.requested_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
                    Pickup → Drop-off
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {bk.pickup_location_name} → {bk.destination_location_name}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {role === 'driver' ? 'Staff Member' : 'Driver & Vehicle'}
                  </span>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {role === 'driver'
                      ? `${bk.staff_name} (${bk.staff_badge || 'Staff'})`
                      : bk.assigned_vehicle && bk.assigned_driver
                      ? `${bk.assigned_driver.full_name} (${bk.assigned_vehicle.registration_number})`
                      : 'Waiting for Driver'}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                  <div className="text-right sm:block hidden">
                    <span className="text-[10px] text-slate-400 block">Riders</span>
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
            <p className="font-semibold text-slate-700">No Ride Records Found</p>
            <p className="mt-1">Try adjusting your search query or status filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
