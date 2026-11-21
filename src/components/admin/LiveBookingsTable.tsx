'use client';

import React, { useState } from 'react';
import { Booking, BookingStatus, Driver, Vehicle } from '@/types';
import { BookingService } from '@/lib/booking-service';
import { useAuth } from '@/lib/auth-context';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Filter,
  MoreVertical,
  Search,
  X,
  XCircle,
} from 'lucide-react';

interface LiveBookingsTableProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onRefresh: () => void;
}

export default function LiveBookingsTable({
  bookings,
  vehicles,
  drivers,
  onRefresh,
}: LiveBookingsTableProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = b.booking_reference.toLowerCase().includes(q);
      const matchName = b.passenger_name.toLowerCase().includes(q);
      const matchPickup = b.pickup_location_name.toLowerCase().includes(q);
      const matchDest = b.destination_location_name.toLowerCase().includes(q);
      return matchRef || matchName || matchPickup || matchDest;
    }
    return true;
  });

  const handleQuickStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    if (!user) return;
    BookingService.updateBookingStatus(
      bookingId,
      newStatus,
      user.name,
      user.id
    );
    onRefresh();
  };

  const handleCancelSubmit = () => {
    if (!cancelModalBooking || !user || !cancelReason.trim()) return;
    BookingService.cancelBooking(
      cancelModalBooking.id,
      cancelReason.trim(),
      user.name,
      user.id
    );
    setCancelModalBooking(null);
    setCancelReason('');
    onRefresh();
  };

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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, passenger, or location..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Status:
          </span>
          {['all', 'requested', 'assigned', 'in_transit', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
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

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="p-3">Reference</th>
              <th className="p-3">Passenger</th>
              <th className="p-3">Route (Pickup → Drop)</th>
              <th className="p-3">Vehicle & Driver</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-mono font-bold text-sky-700">
                    {b.booking_reference}
                    <div className="text-[10px] text-slate-400 font-sans">
                      {new Date(b.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{b.passenger_name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      {b.passenger_role} • {b.passenger_count} pax
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-800">{b.pickup_location_name}</div>
                    <div className="text-slate-400">↓</div>
                    <div className="font-medium text-slate-800">{b.destination_location_name}</div>
                  </td>
                  <td className="p-3">
                    {b.assigned_vehicle && b.assigned_driver ? (
                      <div>
                        <div className="font-semibold text-slate-900">{b.assigned_driver.full_name}</div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {b.assigned_vehicle.registration_number}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        statusColors[b.status] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {b.status === 'in_transit' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(b.id, 'completed')}
                          className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                        >
                          Complete
                        </button>
                      )}

                      {!['completed', 'cancelled', 'rejected'].includes(b.status) && (
                        <button
                          type="button"
                          onClick={() => setCancelModalBooking(b)}
                          className="rounded border border-rose-200 px-2 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-slate-400">
                  No bookings matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cancel Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="h-5 w-5" />
                <span>Cancel Booking {cancelModalBooking.booking_reference}</span>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              Provide an official cancellation reason for IOCC audit logging:
            </p>

            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Passenger no-show after 15 minutes, flight diverted, or technical rescheduling."
              className="mt-3 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={!cancelReason.trim()}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
