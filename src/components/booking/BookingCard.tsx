'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AirportLocation, SpecialRequirements } from '@/types';
import LocationSelector from './LocationSelector';
import { BookingService, CreateBookingInput } from '@/lib/booking-service';
import {
  Accessibility,
  AlertCircle,
  ArrowUpDown,
  Briefcase,
  Calendar,
  Car,
  Clock,
  Loader2,
} from 'lucide-react';

interface BookingCardProps {
  locations: AirportLocation[];
  initialPickupId?: string;
  initialDestinationId?: string;
  onLocationsChange?: (pickupId: string, destId: string) => void;
}

export default function BookingCard({
  locations,
  initialPickupId = 'loc-08', // GMR Office
  initialDestinationId = 'loc-07', // ATC Office
  onLocationsChange,
}: BookingCardProps) {
  const router = useRouter();
  const { user, role } = useAuth();

  const [localPickupId, setLocalPickupId] = useState<string>(initialPickupId);
  const [localDestinationId, setLocalDestinationId] = useState<string>(initialDestinationId);
  const pickupId = onLocationsChange ? initialPickupId : localPickupId;
  const destinationId = onLocationsChange ? initialDestinationId : localDestinationId;
  const [bookingType, setBookingType] = useState<'now' | 'scheduled'>('now');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [specialRequirements, setSpecialRequirements] = useState<SpecialRequirements>({
    luggage_assistance: false,
    wheelchair_accessible: false,
    notes: '',
  });
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPickup = (loc: AirportLocation) => {
    setLocalPickupId(loc.id);
    setErrorMessage(null);
    onLocationsChange?.(loc.id, destinationId);
  };

  const handleSelectDestination = (loc: AirportLocation) => {
    setLocalDestinationId(loc.id);
    setErrorMessage(null);
    onLocationsChange?.(pickupId, loc.id);
  };

  const handleSwap = () => {
    const temp = pickupId;
    setLocalPickupId(destinationId);
    setLocalDestinationId(temp);
    setErrorMessage(null);
    onLocationsChange?.(destinationId, temp);
  };

  const handleRequirementToggle = (key: keyof Omit<SpecialRequirements, 'notes'>) => {
    setSpecialRequirements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Please sign in to request a pickup.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const input: CreateBookingInput = {
      pickup_location_id: pickupId,
      destination_location_id: destinationId,
      passenger_count: passengerCount,
      booking_type: bookingType,
      scheduled_at: bookingType === 'scheduled' ? scheduledAt : null,
      special_requirements: {
        ...specialRequirements,
        notes,
      },
      notes,
    };

    setTimeout(() => {
      const res = BookingService.createBooking(input, user);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to submit pickup request.');
        return;
      }

      if (res.booking) {
        router.push(`/booking/${res.booking.id}`);
      }
    }, 300);
  };

  const pickupLocation = locations.find((l) => l.id === pickupId);
  const destinationLocation = locations.find((l) => l.id === destinationId);

  if (role === 'driver') {
    return (
      <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Signed In as Campus Driver</h2>
            <p className="text-xs text-slate-600">
              Drivers accept staff pickup requests and update drop-off status from the Driver Desk.
            </p>
          </div>
        </div>
        <Link
          href="/driver"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition"
        >
          <span>Open Driver Pickup Desk →</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-lg shadow-slate-200/50">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Request Staff Pickup & Drop-off
          </h2>
          <p className="text-xs text-slate-500">
            Select where a driver should pick you up and drop you off inside airport premises
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBookingType('now')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              bookingType === 'now'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-sky-600" />
            <span>Pickup Now</span>
          </button>
          <button
            type="button"
            onClick={() => setBookingType('scheduled')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              bookingType === 'scheduled'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-sky-600" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleBookRide} className="space-y-5">
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <div className="relative space-y-4">
          <LocationSelector
            label="Pickup Location (Airport Premises)"
            placeholder="Select where driver should pick you up"
            selectedLocationId={pickupId}
            onSelect={handleSelectPickup}
            excludeLocationId={destinationId}
            locations={locations}
            isPickup={true}
          />

          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap pickup and drop-off"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 transition"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          <LocationSelector
            label="Drop-off Location (Desired Destination)"
            placeholder="Select your drop-off location inside airport"
            selectedLocationId={destinationId}
            onSelect={handleSelectDestination}
            excludeLocationId={pickupId}
            locations={locations}
            isPickup={false}
          />
        </div>

        {bookingType === 'scheduled' && (
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5">
            <label className="block text-xs font-semibold text-sky-900 uppercase tracking-wider mb-1.5">
              Scheduled Pickup Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-500 focus:outline-hidden"
              required={bookingType === 'scheduled'}
            />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Staff Riders Count
            </label>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              {passengerCount} {passengerCount === 1 ? 'Staff Member' : 'Staff Members'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 6, 8, 14].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setPassengerCount(count)}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition border ${
                  passengerCount === count
                    ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Vehicle Needs (Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleRequirementToggle('luggage_assistance')}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                specialRequirements.luggage_assistance
                  ? 'border-sky-500 bg-sky-50/80 text-sky-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Briefcase
                className={`h-4 w-4 ${
                  specialRequirements.luggage_assistance ? 'text-sky-600' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="text-xs font-semibold">Equipment / Gear</div>
                <div className="text-[10px] text-slate-500">Carrying tools or bags</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRequirementToggle('wheelchair_accessible')}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                specialRequirements.wheelchair_accessible
                  ? 'border-sky-500 bg-sky-50/80 text-sky-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Accessibility
                className={`h-4 w-4 ${
                  specialRequirements.wheelchair_accessible ? 'text-sky-600' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="text-xs font-semibold">Accessible Vehicle</div>
                <div className="text-[10px] text-slate-500">Ramp equipped shuttle</div>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Pickup Landmark / Note for Driver (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Standing outside GMR lobby gate, wearing yellow vest"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
              <span>Sending Request to Drivers...</span>
            </>
          ) : (
            <>
              <span>REQUEST PICKUP</span>
              <span className="text-xs font-normal text-sky-400 lowercase tracking-normal">
                ({pickupLocation?.name || 'Pickup'} → {destinationLocation?.name || 'Drop-off'})
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
