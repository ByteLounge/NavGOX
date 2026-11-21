'use client';

import React from 'react';
import { BookingStatus } from '@/types';
import {
  Check,
  Clock,
  Car,
  UserCheck,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface BookingTimelineProps {
  status: BookingStatus;
  requestedAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

interface StepItem {
  key: BookingStatus;
  title: string;
  description: string;
}

const PRIMARY_STEPS: StepItem[] = [
  { key: 'requested', title: 'Requested', description: 'Booking queued in system' },
  { key: 'assigned', title: 'Vehicle Assigned', description: 'Vehicle & driver allocated' },
  { key: 'driver_accepted', title: 'Driver Accepted', description: 'Driver confirmed assignment' },
  { key: 'driver_arriving', title: 'Driver Arriving', description: 'En route to pickup location' },
  { key: 'arrived_pickup', title: 'At Pickup Point', description: 'Waiting for passenger' },
  { key: 'passenger_onboard', title: 'Boarded', description: 'Passenger onboard vehicle' },
  { key: 'in_transit', title: 'In Transit', description: 'Moving to destination' },
  { key: 'completed', title: 'Completed', description: 'Arrived safely at destination' },
];

export default function BookingTimeline({
  status,
  requestedAt,
  assignedAt,
  startedAt,
  completedAt,
  cancelledAt,
}: BookingTimelineProps) {
  // If cancelled or rejected
  if (status === 'cancelled' || status === 'rejected') {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <div className="flex items-center gap-2 font-bold text-sm">
          <XCircle className="h-5 w-5 text-rose-600" />
          <span>Trip {status === 'cancelled' ? 'Cancelled' : 'Rejected'}</span>
        </div>
        <p className="mt-1 text-xs text-rose-700">
          This booking request was {status}. Vehicles and drivers have been released back into available campus service.
        </p>
        {cancelledAt && (
          <div className="mt-2 text-[11px] text-rose-600">
            Timestamp: {new Date(cancelledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    );
  }

  const stepKeys = PRIMARY_STEPS.map((s) => s.key);
  const currentStepIndex = stepKeys.indexOf(status === 'searching' ? 'requested' : status);

  return (
    <div className="w-full">
      <div className="space-y-4">
        {PRIMARY_STEPS.map((step, index) => {
          const isPassed = currentStepIndex > index;
          const isCurrent = currentStepIndex === index;
          const isPending = currentStepIndex < index;

          return (
            <div key={step.key} className="flex items-start gap-3 relative">
              {/* Vertical connector line */}
              {index < PRIMARY_STEPS.length - 1 && (
                <div
                  className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 transition-colors ${
                    isPassed ? 'bg-sky-500' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Status Circle Indicator */}
              <div
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  isPassed
                    ? 'bg-sky-600 text-white'
                    : isCurrent
                    ? 'bg-slate-900 text-white ring-4 ring-sky-100 shadow-sm'
                    : 'border-2 border-slate-200 bg-white text-slate-300'
                }`}
              >
                {isPassed ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-slate-900 font-extrabold'
                        : isPassed
                        ? 'text-sky-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  {isCurrent && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800 animate-pulse">
                      Live
                    </span>
                  )}
                </div>
                <div
                  className={`text-[11px] ${
                    isCurrent ? 'text-slate-600' : isPassed ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
