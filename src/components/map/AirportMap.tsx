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
    <div className="flex h-[520px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-900 text-slate-400 shadow-md animate-pulse">
      <MapPin className="mb-2 h-10 w-10 text-amber-500 animate-bounce" />
      <span className="text-sm font-bold text-white">Loading MOPA Airport Aerodrome & Campus Map...</span>
      <span className="text-xs text-slate-400">Rendering high-resolution satellite imagery & approved transit bays</span>
    </div>
  ),
});

export default function AirportMap(props: AirportMapProps) {
  return <DynamicAirportMapInner {...props} />;
}
