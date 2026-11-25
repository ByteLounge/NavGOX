'use client';

import React from 'react';
import { BookingStatus } from '@/types';
import { Check, XCircle } from 'lucide-react';

interface BookingTimelineProps {
  status: BookingStatus;
  requestedAt: string;
  acceptedAt?: string;
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
  {
    key: 'requested',
    title: 'Pickup Requested',
    description: 'Request sent to available campus drivers',
  },
  {
    key: 'driver_accepted',
    title: 'Driver En Route',
    description: 'Driver accepted and heading to pickup point',
  },
  {
    key: 'in_transit',
    title: 'Picked Up • In Transit',
    description: 'Staff onboard, heading to desired drop-off location',
  },
  {
    key: 'completed',
    title: 'Dropped Off',
    description: 'Arrived safely at airport destination',
  },
];

export default function BookingTimeline({
  status,
  requestedAt,
  acceptedAt,
  startedAt,
  completedAt,
  cancelledAt,
}: BookingTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <div className="flex items-center gap-2 font-bold text-sm">
          <XCircle className="h-5 w-5 text-rose-600" />
          <span>Ride Cancelled</span>
        </div>
        <p className="mt-1 text-xs text-rose-700">
          This pickup request was cancelled and any assigned driver has been released back to duty.
        </p>
        {cancelledAt && (
          <div className="mt-2 text-[11px] text-rose-600">
            Cancelled at:{' '}
            {new Date(cancelledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    );
  }

  const stepKeys = PRIMARY_STEPS.map((s) => s.key);
  const currentStepIndex = stepKeys.indexOf(status);

  const timeByStep: Partial<Record<BookingStatus, string | undefined>> = {
    requested: requestedAt,
    driver_accepted: acceptedAt,
    in_transit: startedAt,
    completed: completedAt,
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        {PRIMARY_STEPS.map((step, index) => {
          const isPassed = currentStepIndex > index || (status === 'completed' && index === PRIMARY_STEPS.length - 1);
          const isCurrent = currentStepIndex === index && status !== 'completed';
          const stepTime = timeByStep[step.key];

          return (
            <div key={step.key} className="flex items-start gap-3 relative">
              {index < PRIMARY_STEPS.length - 1 && (
                <div
                  className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 transition-colors ${
                    isPassed ? 'bg-sky-500' : 'bg-slate-200'
                  }`}
                />
              )}

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

              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between gap-2">
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
                  <div className="flex items-center gap-2">
                    {stepTime && (isPassed || isCurrent) && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(stepTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800 animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
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
