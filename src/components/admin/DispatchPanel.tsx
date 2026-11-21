'use client';

import React, { useState } from 'react';
import { Booking, Driver, Vehicle } from '@/types';
import { BookingService } from '@/lib/booking-service';
import { useAuth } from '@/lib/auth-context';
import {
  Accessibility,
  AlertCircle,
  Briefcase,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';

interface DispatchPanelProps {
  unassignedBookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onAssignmentComplete: () => void;
}

export default function DispatchPanel({
  unassignedBookings,
  vehicles,
  drivers,
  onAssignmentComplete,
}: DispatchPanelProps) {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    unassignedBookings[0] || null
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

  // Available vehicles (status: available and capacity sufficient)
  const availableVehicles = vehicles.filter((v) => v.status === 'available');
  // Available drivers (status: available)
  const availableDrivers = drivers.filter((d) => d.status === 'available');

  const handleSelectBooking = (bk: Booking) => {
    setSelectedBooking(bk);
    setAssignmentError(null);
    setAssignmentSuccess(null);

    // Auto-preselect first compatible vehicle and driver
    const matchVeh = availableVehicles.find((v) => {
      if (v.passenger_capacity < bk.passenger_count) return false;
      if (bk.special_requirements.wheelchair_accessible && !v.accessibility_features) return false;
      return true;
    });

    if (matchVeh) {
      setSelectedVehicleId(matchVeh.id);
      if (matchVeh.assigned_driver_id) {
        setSelectedDriverId(matchVeh.assigned_driver_id);
      } else if (availableDrivers.length > 0) {
        setSelectedDriverId(availableDrivers[0].id);
      }
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    if (!selectedVehicleId) {
      setAssignmentError('Please select a suitable available vehicle.');
      return;
    }
    if (!selectedDriverId) {
      setAssignmentError('Please select an available driver.');
      return;
    }

    setAssignmentError(null);
    const res = BookingService.assignVehicleAndDriver(
      selectedBooking.id,
      selectedVehicleId,
      selectedDriverId,
      user?.name || 'Operations Dispatcher',
      user?.id || 'usr-dispatcher-1'
    );

    if (res.success) {
      setAssignmentSuccess(`Successfully assigned to ${selectedBooking.booking_reference}`);
      setSelectedVehicleId('');
      setSelectedDriverId('');
      onAssignmentComplete();
    } else {
      setAssignmentError(res.error || 'Failed to assign vehicle.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Col 1: Pending Requests Queue (4 cols) */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-bold text-slate-900 text-sm">
              Pending Queue ({unassignedBookings.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Needs Vehicle Assignment</span>
        </div>

        {unassignedBookings.length > 0 ? (
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {unassignedBookings.map((bk) => {
              const isSelected = selectedBooking?.id === bk.id;
              return (
                <button
                  key={bk.id}
                  type="button"
                  onClick={() => handleSelectBooking(bk)}
                  className={`w-full text-left rounded-xl border p-3.5 transition ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {bk.booking_reference}
                    </span>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                      {bk.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {bk.pickup_location_name} → {bk.destination_location_name}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      <span>{bk.passenger_name} ({bk.passenger_count} pax)</span>
                    </div>
                    {bk.special_requirements.wheelchair_accessible && (
                      <span className="rounded bg-sky-100 text-sky-800 text-[10px] font-semibold px-1.5 py-0.2">
                        Wheelchair
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-700">All Requests Dispatched</p>
            <p className="mt-1">No pending unassigned trip requests at this time.</p>
          </div>
        )}
      </div>

      {/* Col 2: Allocation & Assignment Workspace (7 cols) */}
      <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {selectedBooking ? (
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Dispatch Assignment for {selectedBooking.booking_reference}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedBooking.passenger_name} • {selectedBooking.passenger_role.toUpperCase()} •{' '}
                  {selectedBooking.passenger_count} Passengers
                </p>
              </div>

              {selectedBooking.special_requirements.wheelchair_accessible && (
                <div className="flex items-center gap-1 rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-800">
                  <Accessibility className="h-4 w-4" />
                  <span>Ramp Required</span>
                </div>
              )}
            </div>

            {assignmentError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{assignmentError}</span>
              </div>
            )}

            {assignmentSuccess && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{assignmentSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Available Vehicle ({availableVehicles.length} Available)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableVehicles.map((veh) => {
                    const isWheelchairMatch =
                      !selectedBooking.special_requirements.wheelchair_accessible ||
                      veh.accessibility_features;
                    const isCapacityMatch = veh.passenger_capacity >= selectedBooking.passenger_count;
                    const isEligible = isWheelchairMatch && isCapacityMatch;

                    return (
                      <button
                        key={veh.id}
                        type="button"
                        onClick={() => {
                          setSelectedVehicleId(veh.id);
                          if (veh.assigned_driver_id) {
                            setSelectedDriverId(veh.assigned_driver_id);
                          }
                        }}
                        className={`rounded-xl border p-3 text-left transition ${
                          selectedVehicleId === veh.id
                            ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-100'
                            : !isEligible
                            ? 'border-slate-100 bg-slate-50 opacity-60'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{veh.name}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {veh.registration_number}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-600 flex items-center justify-between">
                          <span>Cap: {veh.passenger_capacity} pax</span>
                          {veh.accessibility_features && (
                            <span className="text-sky-700 font-semibold text-[10px]">♿ Accessible</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Available Driver ({availableDrivers.length} Available)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableDrivers.map((drv) => (
                    <button
                      key={drv.id}
                      type="button"
                      onClick={() => setSelectedDriverId(drv.id)}
                      className={`rounded-xl border p-3 text-left transition ${
                        selectedDriverId === drv.id
                          ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-100'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{drv.full_name}</span>
                        <span className="text-[10px] font-semibold text-emerald-700">★ {drv.rating}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 font-mono">
                        {drv.badge_number} • {drv.contact_number}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!selectedVehicleId || !selectedDriverId}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  <Zap className="h-4 w-4 text-sky-400" />
                  <span>Confirm Dispatch Assignment</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs">
            Select a pending request from the queue to configure dispatch allocation.
          </div>
        )}
      </div>
    </div>
  );
}
