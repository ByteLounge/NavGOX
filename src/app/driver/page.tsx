'use client';

import React from 'react';
import DriverDashboardView from '@/components/driver/DriverDashboardView';

export default function DriverPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          Campus Vehicle Driver Console
        </h1>
        <p className="text-xs text-slate-500">
          Airport shuttle operations, live trip progression, and passenger boarding confirmation
        </p>
      </div>

      <DriverDashboardView />
    </div>
  );
}
