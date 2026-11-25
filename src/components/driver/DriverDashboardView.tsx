'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StorageService } from '@/lib/storage';
import { AirportLocation, Booking, BookingStatus, Driver, DriverStatus, Vehicle } from '@/types';
import { BookingService } from '@/lib/booking-service';
import AirportMap from '@/components/map/AirportMap';
import {
  Accessibility,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Users,
} from 'lucide-react';

export default function DriverDashboardView() {
  const { user } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [activeRide, setActiveRide] = useState<Booking | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [completedRides, setCompletedRides] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<AirportLocation[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const refreshData = useCallback(() => {
    const drivers = StorageService.getDrivers();
    let currentDrv = drivers.find(
      (d) =>
        (user?.email && d.email.toLowerCase() === user.email.toLowerCase()) ||
        (user?.phone && d.contact_number === user.phone) ||
        (user?.name && d.full_name === user.name)
    );

    if (!currentDrv) {
      currentDrv = drivers[0];
    }

    setDriver(currentDrv || null);
    setLocations(StorageService.getLocations());

    if (currentDrv) {
      const vehicles = StorageService.getVehicles();
      const veh = vehicles.find((v) => v.id === currentDrv?.assigned_vehicle_id);
      setAssignedVehicle(veh || null);

      const allBookings = StorageService.getBookings();

      const active = allBookings.find(
        (b) =>
          b.assigned_driver_id === currentDrv?.id &&
          ['driver_accepted', 'in_transit'].includes(b.status)
      );
      setActiveRide(active || null);

      const openRequests = allBookings.filter((b) => b.status === 'requested');
      setPendingRequests(openRequests);

      const past = allBookings.filter(
        (b) =>
          b.assigned_driver_id === currentDrv?.id &&
          ['completed', 'cancelled'].includes(b.status)
      );
      setCompletedRides(past);
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

  const handleAcceptRequest = (bookingId: string) => {
    if (!driver) return;
    setActionLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      const res = BookingService.acceptBooking(bookingId, driver.id);
      setActionLoading(false);
      if (res.success) {
        setStatusMessage({ text: 'Pickup accepted! Head to the pickup location.' });
        refreshData();
      } else {
        setStatusMessage({ text: res.error || 'Could not accept pickup request.', isError: true });
      }
    }, 200);
  };

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
        setStatusMessage({
          text:
            nextStatus === 'in_transit'
              ? 'Staff picked up! Heading to drop-off location.'
              : 'Staff dropped off! You are now available for the next pickup.',
        });
        refreshData();
      } else {
        setStatusMessage({ text: res.error || 'Failed to update status.', isError: true });
      }
    }, 200);
  };

  const handleToggleDriverStatus = (newStatus: DriverStatus) => {
    if (!driver || activeRide) return;
    const updated = { ...driver, status: newStatus };
    StorageService.saveDriver(updated);
    setDriver(updated);
  };

  if (!driver) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 text-xs">
        Loading Driver Operations Profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Driver Profile & Availability Header */}
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
              License: <span className="font-mono">{driver.license_number}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {assignedVehicle && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Your Vehicle</div>
              <div className="font-bold text-slate-900">{assignedVehicle.name}</div>
              <div className="font-mono text-[11px] text-sky-600">
                {assignedVehicle.registration_number} • Max {assignedVehicle.passenger_capacity} pax
                {assignedVehicle.accessibility_features ? ' • Ramp' : ''}
              </div>
            </div>
          )}

          <div className="flex rounded-xl bg-slate-100 p-1">
            {(['available', 'on_break', 'offline'] as DriverStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                disabled={Boolean(activeRide)}
                onClick={() => handleToggleDriverStatus(st)}
                title={activeRide ? 'Complete your active ride before changing duty status' : ''}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition disabled:opacity-60 ${
                  driver.status === st || (activeRide && st === 'available')
                    ? activeRide
                      ? 'bg-sky-600 text-white shadow-xs'
                      : st === 'available'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : st === 'on_break'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {activeRide && st === 'available' ? 'On Trip' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3.5 text-xs font-semibold ${
            statusMessage.isError
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-sky-200 bg-sky-50 text-sky-800'
          }`}
        >
          {statusMessage.isError ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Active Trip Section (when driver has accepted a staff pickup) */}
      {activeRide && (
        <div className="rounded-2xl border-2 border-sky-500 bg-white p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {activeRide.status === 'driver_accepted'
                    ? 'Step 1: Go Pick Up Staff'
                    : 'Step 2: Drop Off Staff at Destination'}
                </h3>
                <p className="text-xs text-slate-500">
                  Ref: <span className="font-mono font-bold text-sky-700">{activeRide.booking_reference}</span>
                </p>
              </div>
            </div>

            <div>
              {activeRide.status === 'driver_accepted' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('in_transit')}
                  className="w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-emerald-700 transition"
                >
                  Confirm Staff Picked Up
                </button>
              )}

              {activeRide.status === 'in_transit' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('completed')}
                  className="w-full sm:w-auto rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-slate-800 transition"
                >
                  Confirm Dropped Off (Complete)
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-1">
                <MapPin className="h-4 w-4" />
                <span>Pickup Point</span>
              </div>
              <div className="text-base font-bold text-slate-900">
                {activeRide.pickup_location_name}
              </div>
              {activeRide.notes && (
                <div className="mt-2 text-xs text-slate-700 bg-white/80 rounded-lg p-2 border border-sky-100">
                  Note: <span className="font-medium">{activeRide.notes}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Navigation className="h-4 w-4" />
                <span>Drop-off Destination</span>
              </div>
              <div className="text-base font-bold text-slate-900">
                {activeRide.destination_location_name}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Use approved campus perimeter roadways inside airport premises
              </div>
            </div>
          </div>

          {/* Staff Member Contact & Ride Details */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Airport Staff Details
              </div>
              <a
                href={`tel:${activeRide.staff_phone}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-700 transition"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call {activeRide.staff_name}</span>
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Staff Name</span>
                <span className="font-semibold text-slate-900">{activeRide.staff_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Department / Badge</span>
                <span className="font-semibold text-slate-900">
                  {activeRide.staff_badge || activeRide.staff_department || 'Airport Staff'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Riders</span>
                <span className="font-semibold text-slate-900">{activeRide.passenger_count} Pax</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Requirements</span>
                <span className="font-semibold text-slate-900">
                  {activeRide.special_requirements.wheelchair_accessible
                    ? 'Wheelchair Ramp'
                    : activeRide.special_requirements.luggage_assistance
                    ? 'Equipment / Gear'
                    : 'Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* Route Map Preview */}
          <AirportMap
            locations={locations}
            pickupId={activeRide.pickup_location_id}
            destinationId={activeRide.destination_location_id}
            height="240px"
            interactive={false}
          />
        </div>
      )}

      {/* Open Staff Pickup Requests Queue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">
              Pending Staff Pickup Requests ({pendingRequests.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Accept a request to pick up & drop off staff
          </span>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const capacityOk =
                !assignedVehicle || assignedVehicle.passenger_capacity >= req.passenger_count;
              const accessOk =
                !req.special_requirements.wheelchair_accessible ||
                Boolean(assignedVehicle?.accessibility_features);
              const driverReady =
                !activeRide &&
                driver.status === 'available' &&
                assignedVehicle?.status === 'available';
              const canAccept = capacityOk && accessOk && driverReady;

              return (
                <div
                  key={req.id}
                  className="rounded-xl border border-slate-200 p-4 space-y-3 hover:border-sky-300 transition bg-slate-50/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-700">
                      {req.booking_reference}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                      {req.booking_type === 'scheduled' && req.scheduled_at
                        ? `Scheduled • ${new Date(req.scheduled_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : 'Pickup Now'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-[10px]">
                        A
                      </span>
                      <span className="font-bold text-slate-900">{req.pickup_location_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        B
                      </span>
                      <span className="font-bold text-slate-900">{req.destination_location_name}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1">
                    <span className="font-semibold text-slate-800">{req.staff_name}</span>
                    {req.staff_department && (
                      <span className="text-slate-400 truncate max-w-[180px]">
                        • {req.staff_department}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded bg-white border border-slate-200 px-1.5 py-0.5 font-bold">
                      <Users className="h-3 w-3 text-slate-500" />
                      {req.passenger_count} pax
                    </span>
                    {req.special_requirements.luggage_assistance && (
                      <span className="inline-flex items-center gap-1 rounded bg-sky-50 text-sky-800 px-1.5 py-0.5 font-semibold">
                        <Briefcase className="h-3 w-3" />
                        Gear
                      </span>
                    )}
                    {req.special_requirements.wheelchair_accessible && (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-50 text-purple-800 px-1.5 py-0.5 font-semibold">
                        <Accessibility className="h-3 w-3" />
                        Ramp
                      </span>
                    )}
                  </div>

                  {req.notes && (
                    <div className="text-[11px] text-slate-500 italic bg-white rounded-lg px-2.5 py-1.5 border border-slate-100">
                      &ldquo;{req.notes}&rdquo;
                    </div>
                  )}

                  {!capacityOk && (
                    <div className="text-[11px] text-rose-600 font-semibold">
                      Exceeds your vehicle capacity ({assignedVehicle?.passenger_capacity} max)
                    </div>
                  )}
                  {!accessOk && (
                    <div className="text-[11px] text-rose-600 font-semibold">
                      Requires wheelchair ramp vehicle
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!canAccept || actionLoading}
                    onClick={() => handleAcceptRequest(req.id)}
                    className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    {activeRide
                      ? 'Finish Current Trip First'
                      : driver.status !== 'available'
                      ? 'Set Status to Available'
                      : 'Accept & Pick Up'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
            <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-xs">No Pending Pickup Requests</p>
            <p className="text-[11px] text-slate-400 mt-1">
              New ride requests from airport staff will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Driver Shift History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Recent Completed Trips ({completedRides.length})
        </h3>
        {completedRides.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Pickup</th>
                  <th className="p-3">Drop-off</th>
                  <th className="p-3">Staff Member</th>
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
                    <td className="p-3 text-slate-600">
                      {ride.staff_name} ({ride.passenger_count} pax)
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 capitalize">
                        {ride.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {ride.completed_at
                        ? new Date(ride.completed_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
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
