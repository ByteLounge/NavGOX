'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Booking, BookingStatus } from '@/types';
import {
  AlertTriangle,
  ChevronRight,
  Phone,
  X,
} from 'lucide-react';
import { BookingService } from '@/lib/booking-service';
import { useAuth } from '@/lib/auth-context';

interface ActiveBookingCardProps {
  booking: Booking;
  onUpdate?: () => void;
}

const statusBadgeStyles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  requested: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800', label: 'Waiting for Driver' },
  driver_accepted: { bg: 'bg-sky-100 border-sky-200', text: 'text-sky-800', label: 'Driver En Route' },
  in_transit: { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-800', label: 'Picked Up • In Transit' },
  completed: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'Dropped Off' },
  cancelled: { bg: 'bg-rose-100 border-rose-200', text: 'text-rose-800', label: 'Cancelled' },
};

export default function ActiveBookingCard({ booking, onUpdate }: ActiveBookingCardProps) {
  const { user } = useAuth();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const badge = statusBadgeStyles[booking.status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    label: booking.status,
  };

  const canCancel = ['requested', 'driver_accepted'].includes(booking.status);

  const handleCancelConfirm = () => {
    if (!user) return;
    if (!cancelReason.trim()) {
      setCancelError('Please select a reason for cancellation.');
      return;
    }

    const res = BookingService.cancelBooking(
      booking.id,
      cancelReason.trim(),
      user.name,
      user.id
    );

    if (res.success) {
      setIsCancelModalOpen(false);
      onUpdate?.();
    } else {
      setCancelError(res.error || 'Failed to cancel ride request.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
            {booking.booking_reference}
          </span>
          <span className="text-[11px] text-slate-400">
            • {new Date(booking.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          {badge.label}
        </span>
      </div>

      <div className="mt-3.5 space-y-2">
        <div className="flex items-start gap-2.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-[10px]">
            A
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pickup</div>
            <div className="text-xs font-bold text-slate-900">{booking.pickup_location_name}</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
            B
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Drop-off</div>
            <div className="text-xs font-bold text-slate-900">{booking.destination_location_name}</div>
          </div>
        </div>
      </div>

      {booking.assigned_vehicle && booking.assigned_driver ? (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs">
                {booking.assigned_driver.full_name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {booking.assigned_driver.full_name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {booking.assigned_vehicle.name} ({booking.assigned_vehicle.registration_number})
                </div>
              </div>
            </div>

            <a
              href={`tel:${booking.assigned_driver.contact_number}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition"
              title="Call Driver"
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800 font-medium">
          Waiting for an available campus driver to accept your pickup request...
        </div>
      )}

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
        <Link
          href={`/booking/${booking.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
        >
          <span>Live Status & Route</span>
          <ChevronRight className="h-4 w-4" />
        </Link>

        {canCancel && (
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            Cancel Ride
          </button>
        )}
      </div>

      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="h-5 w-5" />
                <span>Cancel Request {booking.booking_reference}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Cancelling will release any assigned driver back to available pickup duty. Choose a reason:
            </p>

            {cancelError && (
              <div className="mt-2 text-xs font-medium text-rose-600">{cancelError}</div>
            )}

            <div className="mt-3 space-y-1.5">
              {[
                'Shift / duty assignment changed',
                'No longer need campus transport',
                'Selected wrong pickup or drop-off location',
                'Taking another available vehicle',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setCancelReason(reason)}
                  className={`w-full rounded-lg border p-2 text-left text-xs transition ${
                    cancelReason === reason
                      ? 'border-sky-500 bg-sky-50 text-sky-900 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
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
