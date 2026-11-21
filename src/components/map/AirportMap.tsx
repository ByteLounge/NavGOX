'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { AirportLocation } from '@/types';
import { MapPin } from 'lucide-react';

interface AirportMapProps {
  locations: AirportLocation[];
  pickupId?: string;
  destinationId?: string;
  onSelectPickup?: (locationId: string) => void;
  onSelectDestination?: (locationId: string) => void;
  height?: string;
  interactive?: boolean;
}

const DynamicAirportMapInner = dynamic(() => import('./AirportMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-500 shadow-sm animate-pulse">
      <MapPin className="mb-2 h-8 w-8 text-sky-600 animate-bounce" />
      <span className="text-sm font-medium">Loading MOPA Airport Aerodrome & Campus Map...</span>
      <span className="text-xs text-slate-400">Rendering authorized internal transport nodes</span>
    </div>
  ),
});

export default function AirportMap(props: AirportMapProps) {
  return <DynamicAirportMapInner {...props} />;
}
