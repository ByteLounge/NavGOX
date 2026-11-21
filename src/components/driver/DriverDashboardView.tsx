'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StorageService } from '@/lib/storage';
import { Booking, BookingStatus, Driver, DriverStatus, Vehicle } from '@/types';
import { BookingService } from '@/lib/booking-service';
import {
  Accessibility,
  AlertCircle,
  Briefcase,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Navigation,
  Phone,
  Power,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

export default function DriverDashboardView() {
  const { user } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [activeRide, setActiveRide] = useState<Booking | null>(null);
  const [completedRides, setCompletedRides] = useState<Booking[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const refreshData = () => {
    const drivers = StorageService.getDrivers();
    // Match current driver by user profile phone, email, or badge
    let currentDrv = drivers.find(
      (d) => d.email === user?.email || d.contact_number === user?.phone || d.full_name === user?.name
    );

    // Fallback: If logged in as someone else looking at driver portal, use first driver
    if (!currentDrv) {
      currentDrv = drivers[0];
    }

    setDriver(currentDrv);

    if (currentDrv) {
      const vehicles = StorageService.getVehicles();
      const veh = vehicles.find((v) => v.id === currentDrv?.assigned_vehicle_id);
      setAssignedVehicle(veh || null);

      const allBookings = StorageService.getBookings();
      // Active booking for this driver
      const active = allBookings.find(
        (b) =>
          b.assigned_driver_id === currentDrv?.id &&
          ['assigned', 'driver_accepted', 'driver_arriving', 'arrived_pickup', 'passenger_onboard', 'in_transit'].includes(
            b.status
          )
      );
      setActiveRide(active || null);

      // Past rides for this driver
      const past = allBookings.filter(
        (b) => b.assigned_driver_id === currentDrv?.id && ['completed', 'cancelled'].includes(b.status)
      );
      setCompletedRides(past);
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
  }, [user]);

  const handleStatusTransition = (nextStatus: BookingStatus) => {
    if (!activeRide || !driver) return;
    setActionLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      const res = BookingService.updateBookingStatus(
        activeRide.id,
        nextStatus,
        driver.full_name,
        driver.id
      );

      setActionLoading(false);
      if (res.success) {
        setStatusMessage(`Trip status advanced to: ${nextStatus.replace('_', ' ').toUpperCase()}`);
        refreshData();
      } else {
        setStatusMessage(res.error || 'Failed to update status.');
      }
    }, 300);
  };

  const handleToggleDriverStatus = (newStatus: DriverStatus) => {
    if (!driver) return;
    const updated = { ...driver, status: newStatus };
    StorageService.saveDriver(updated);
    setDriver(updated);
  };

  if (!driver) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading Driver Operations Profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Driver Status & Fleet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-sm">
            {driver.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{driver.full_name}</h2>
              <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                {driver.badge_number}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              License: <span className="font-mono">{driver.license_number}</span> • Rating: ★ {driver.rating}
            </div>
          </div>
        </div>

        {/* Assigned Vehicle & Availability Status Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {assignedVehicle && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Assigned Vehicle</div>
              <div className="font-bold text-slate-900">{assignedVehicle.name}</div>
              <div className="font-mono text-[11px] text-sky-600">{assignedVehicle.registration_number}</div>
            </div>
          )}

          <div className="flex rounded-xl bg-slate-100 p-1">
            {(['available', 'on_break', 'offline'] as DriverStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleToggleDriverStatus(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                  driver.status === st
                    ? st === 'available'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : st === 'on_break'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs font-semibold text-sky-800">
          {statusMessage}
        </div>
      )}

      {/* Active Trip Operations Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">Current Assigned Trip</h3>
          </div>
          {activeRide && (
            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              {activeRide.booking_reference}
            </span>
          )}
        </div>

        {activeRide ? (
          <div className="space-y-6">
            {/* Status Alert Banner */}
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
                  Live Dispatch Status
                </div>
                <div className="text-base font-extrabold text-sky-950 uppercase tracking-wide">
                  {activeRide.status.replace('_', ' ')}
                </div>
              </div>

              {/* Sequential Action Button */}
              <div>
                {activeRide.status === 'assigned' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusTransition('driver_accepted')}
                    className="w-full sm:w-auto rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-sm hover:bg-sky-700 transition"
                  >
                    Accept Trip Assignment
                  </button>
                )}

                {activeRide.status === 'driver_accepted' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusTransition('driver_arriving')}
                    className="w-full sm:w-auto rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-sm hover:bg-indigo-700 transition"
                  >
                    Start Journey to Pickup
                  </button>
                )}

                {activeRide.status === 'driver_arriving' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusTransition('arrived_pickup')}
                    className="w-full sm:w-auto rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-sm hover:bg-purple-700 transition"
                  >
                    Mark Arrived at Pickup
                  </button>
                )}

                {activeRide.status === 'arrived_pickup' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusTransition('passenger_onboard')}
                    className="w-full sm:w-auto rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-sm hover:bg-teal-700 transition"
                  >
                    Confirm Passenger Onboard
                  </button>
                )}

                {activeRide.status === 'passenger_onboard' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusTransition('in_transit')}
                    className="w-full sm:w-auto rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    Begin Transit to Destination
                  </button>
                )}

                {activeRide.status === 'in_transit' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusTransition('completed')}
                    className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-md hover:bg-slate-800 transition"
                  >
                    Complete Ride (Release Vehicle)
                  </button>
                )}
              </div>
            </div>

            {/* Pickup & Destination Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>Pickup Point</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {activeRide.pickup_location_name}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Special Notes: {activeRide.notes || 'None provided'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
                  <Navigation className="h-4 w-4" />
                  <span>Destination</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {activeRide.destination_location_name}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Campus road path only (Avoid airside movement areas)
                </div>
              </div>
            </div>

            {/* Passenger & Special Requirements */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Passenger Information
                </div>
                <a
                  href={`tel:${activeRide.passenger_phone}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call {activeRide.passenger_name}</span>
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Name</span>
                  <span className="font-semibold text-slate-900">{activeRide.passenger_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Role / Dept</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {activeRide.passenger_role} {activeRide.passenger_badge ? `(${activeRide.passenger_badge})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Passengers</span>
                  <span className="font-semibold text-slate-900">{activeRide.passenger_count} Pax</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Special Assistance</span>
                  <span className="font-semibold text-slate-900">
                    {activeRide.special_requirements.wheelchair_accessible
                      ? 'Wheelchair Ramp Required'
                      : activeRide.special_requirements.luggage_assistance
                      ? 'Heavy Luggage'
                      : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
            <Car className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">No Active Trips Assigned</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You are currently staged as <strong>{driver.status.replace('_', ' ')}</strong>. The IOCC Dispatch Desk will assign incoming campus ride requests here.
            </p>
          </div>
        )}
      </div>

      {/* Driver Past Trips Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Completed Trips ({completedRides.length})</h3>
        {completedRides.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Pickup</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Passenger</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono font-bold text-sky-700">{ride.booking_reference}</td>
                    <td className="p-3 font-medium text-slate-900">{ride.pickup_location_name}</td>
                    <td className="p-3 font-medium text-slate-900">{ride.destination_location_name}</td>
                    <td className="p-3 text-slate-600">{ride.passenger_name} ({ride.passenger_count} pax)</td>
                    <td className="p-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 capitalize">
                        {ride.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {ride.completed_at
                        ? new Date(ride.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No completed trips on record for this shift.
          </div>
        )}
      </div>
    </div>
  );
}
