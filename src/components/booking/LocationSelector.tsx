'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AirportLocation, UserRole } from '@/types';
import {
  Boxes,
  Briefcase,
  Building,
  Building2,
  Car,
  Check,
  ChevronDown,
  CircleParking,
  Coffee,
  Flame,
  Hammer,
  KeyRound,
  MapPin,
  PackageCheck,
  PlaneLanding,
  PlaneTakeoff,
  RadioTower,
  Search,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Store,
  Truck,
  UtensilsCrossed,
  Wrench,
  X,
  AlertTriangle,
} from 'lucide-react';

interface LocationSelectorProps {
  label: string;
  placeholder: string;
  selectedLocationId: string;
  onSelect: (location: AirportLocation) => void;
  excludeLocationId?: string;
  locations: AirportLocation[];
  userRole: UserRole;
  isPickup?: boolean;
}

// Icon mapper for airport locations
const iconMap: Record<string, React.ElementType> = {
  PlaneLanding,
  PlaneTakeoff,
  Building2,
  Store,
  CircleParking,
  Car,
  RadioTower,
  Briefcase,
  Building,
  ShieldCheck,
  UtensilsCrossed,
  Truck,
  PackageCheck,
  Boxes,
  Coffee,
  ShieldAlert,
  KeyRound,
  Flame,
  Siren,
  Wrench,
  Hammer,
  MapPin,
};

export default function LocationSelector({
  label,
  placeholder,
  selectedLocationId,
  onSelect,
  excludeLocationId,
  locations,
  userRole,
  isPickup = true,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations by permission, exclusion, search query, category
  const filteredLocations = locations.filter((loc) => {
    if (excludeLocationId && loc.id === excludeLocationId) return false;
    if (isPickup && !loc.pickup_allowed) return false;
    if (!isPickup && !loc.dropoff_allowed) return false;

    // Filter restricted for passenger
    if (loc.is_restricted && userRole === 'passenger' && !loc.restricted_roles.includes('passenger')) {
      return false;
    }

    if (selectedCategory !== 'all' && loc.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = loc.name.toLowerCase().includes(q);
      const matchDesc = loc.description.toLowerCase().includes(q);
      const matchCategory = loc.category.toLowerCase().includes(q);
      return matchName || matchDesc || matchCategory;
    }

    return true;
  });

  const categories = Array.from(new Set(locations.map((l) => l.category)));

  const SelectedIcon = selectedLocation
    ? iconMap[selectedLocation.icon_name] || MapPin
    : MapPin;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
        {label}
      </label>

      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition shadow-2xs ${
          isOpen
            ? 'border-sky-500 ring-2 ring-sky-100 bg-white'
            : selectedLocation
            ? 'border-slate-300 bg-white hover:border-slate-400'
            : 'border-slate-200 bg-slate-50 hover:bg-white'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isPickup ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <SelectedIcon className="h-5 w-5" />
          </div>

          <div className="overflow-hidden">
            {selectedLocation ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 truncate">
                    {selectedLocation.name}
                  </span>
                  {selectedLocation.is_restricted && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                      Staff Restricted
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate">{selectedLocation.description}</div>
              </>
            ) : (
              <span className="text-sm text-slate-400">{placeholder}</span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airport location or terminal area..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({locations.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Locations List */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const LocIcon = iconMap[loc.icon_name] || MapPin;
                const isSelected = loc.id === selectedLocationId;

                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onSelect(loc);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition ${
                      isSelected
                        ? 'bg-sky-50 text-sky-900'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          loc.is_restricted
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <LocIcon className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-xs truncate">{loc.name}</span>
                          {loc.is_restricted && (
                            <span className="rounded bg-amber-50 border border-amber-200 px-1 text-[9px] font-semibold text-amber-700">
                              Restricted
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{loc.description}</div>
                      </div>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-sky-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching authorized airport locations found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
