'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StorageService } from '@/lib/storage';
import { Booking, BookingStatus } from '@/types';
import BookingTimeline from '@/components/booking/BookingTimeline';
import AirportMap from '@/components/map/AirportMap';
import { useAuth } from '@/lib/auth-context';
import { BookingService } from '@/lib/booking-service';
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Navigation,
  Phone,
  Shield,
  ShieldAlert,
  User,
  Users,
  X,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetailPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const refreshBooking = () => {
    const b = StorageService.getBookingById(unwrappedParams.id);
    setBooking(b || null);
  };

  useEffect(() => {
    refreshBooking();
    const unsub = StorageService.subscribe(() => {
      refreshBooking();
    });
    return () => {
      unsub();
    };
  }, [unwrappedParams.id]);

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <Car className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="text-lg font-bold text-slate-800">Booking Reference Not Found</h2>
        <p className="text-xs text-slate-500">
          We could not find booking record <strong>{unwrappedParams.id}</strong>.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const canCancel = ['requested', 'searching', 'assigned', 'driver_accepted', 'driver_arriving'].includes(
    booking.status
  );

  const handleCancelSubmit = () => {
    if (!user) return;
    if (!cancelReason.trim()) {
      setCancelError('Please select or specify a reason for cancellation.');
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
      refreshBooking();
    } else {
      setCancelError(res.error || 'Failed to cancel booking.');
    }
  };

  const allLocations = StorageService.getAllLocationsAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Breadcrumb & Reference Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-xl font-extrabold text-slate-900 tracking-wider">
                {booking.booking_reference}
              </h1>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800 uppercase tracking-wider">
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Requested on {new Date(booking.requested_at).toLocaleDateString()} at{' '}
              {new Date(booking.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {canCancel && (
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition self-start sm:self-auto"
          >
            Cancel Booking Request
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Step Timeline & Vehicle Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Timeline Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-5">
              Live Transit Progress Workflow
            </h2>
            <BookingTimeline
              status={booking.status}
              requestedAt={booking.requested_at}
              assignedAt={booking.assigned_at}
              startedAt={booking.started_at}
              completedAt={booking.completed_at}
              cancelledAt={booking.cancelled_at}
            />
          </div>

          {/* Assigned Driver & Vehicle Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Vehicle & Operator Assigned
            </h2>

            {booking.assigned_vehicle && booking.assigned_driver ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-lg">
                      {booking.assigned_driver.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-base text-slate-900">
                        {booking.assigned_driver.full_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Airport Driver ID: <span className="font-mono font-semibold">{booking.assigned_driver.badge_number}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${booking.assigned_driver.contact_number}`}
                    className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 transition"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Driver</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vehicle Model</span>
                    <span className="font-bold text-slate-900">{booking.assigned_vehicle.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registration Number</span>
                    <span className="font-mono font-bold text-sky-700">{booking.assigned_vehicle.registration_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category</span>
                    <span className="font-medium text-slate-800">{booking.assigned_vehicle.vehicle_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Accessibility</span>
                    <span className="font-medium text-slate-800">
                      {booking.assigned_vehicle.accessibility_features ? 'Wheelchair Equipped' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center text-xs text-amber-800">
                <Clock className="mx-auto h-8 w-8 text-amber-600 mb-2 animate-spin" />
                <p className="font-bold">Allocating Nearest Available Shuttle</p>
                <p className="mt-1 text-slate-600 max-w-sm mx-auto">
                  The IOCC Dispatch Controller or automated scheduling engine is matching a vehicle compatible with your passenger count ({booking.passenger_count} pax).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Route Map & Trip Specifications (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Map Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-sky-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Approved Internal Ground Path
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Schematic Route</span>
            </div>

            <AirportMap
              locations={allLocations}
              pickupId={booking.pickup_location_id}
              destinationId={booking.destination_location_id}
              height="280px"
              interactive={false}
            />

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-xs">
                  A
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pickup Bay</div>
                  <div className="text-xs font-bold text-slate-900">{booking.pickup_location_name}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                  B
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Destination</div>
                  <div className="text-xs font-bold text-slate-900">{booking.destination_location_name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Specifications Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Booking Specifications
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Passenger Name</span>
                <span className="font-semibold text-slate-900">{booking.passenger_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Passenger Role</span>
                <span className="font-semibold text-slate-900 capitalize">{booking.passenger_role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Passenger Count</span>
                <span className="font-semibold text-slate-900">{booking.passenger_count} Persons</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Booking Mode</span>
                <span className="font-semibold text-slate-900 uppercase">{booking.booking_type}</span>
              </div>
              {booking.notes && (
                <div className="py-1">
                  <span className="text-slate-500 block text-[11px]">Instructions / Landmark:</span>
                  <span className="font-medium text-slate-800 italic">"{booking.notes}"</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="h-5 w-5" />
                <span>Cancel {booking.booking_reference}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              Please choose a reason for cancelling this trip request:
            </p>

            {cancelError && (
              <div className="mt-2 text-xs font-medium text-rose-600">{cancelError}</div>
            )}

            <div className="mt-3 space-y-1.5">
              {[
                'Flight timing or terminal gate changed',
                'No longer required / alternative transport found',
                'Selected incorrect pickup or destination',
                'Driver taking too long to arrive',
                'Other operational reason',
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
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
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
