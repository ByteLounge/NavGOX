'use client';

import React, { useState } from 'react';
import { AirportLocation, LocationCategory, UserRole } from '@/types';
import { StorageService } from '@/lib/storage';
import {
  AlertTriangle,
  Check,
  Edit,
  MapPin,
  Plus,
  Power,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';

interface LocationManagerProps {
  locations: AirportLocation[];
  onRefresh: () => void;
}

const CATEGORIES: LocationCategory[] = [
  'Passenger Area',
  'Terminal',
  'Airport Administration',
  'Security',
  'Cargo',
  'Staff Facilities',
  'Technical / Maintenance',
  'Emergency Services',
  'Parking / Transport',
];

export default function LocationManager({ locations, onRefresh }: LocationManagerProps) {
  const [editingLocation, setEditingLocation] = useState<AirportLocation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [securityWarningAccepted, setSecurityWarningAccepted] = useState(false);

  // Blank template for new location
  const emptyLocation: AirportLocation = {
    id: '',
    name: '',
    category: 'Passenger Area',
    description: '',
    lat: 15.7645,
    lng: 73.8680,
    pickup_allowed: true,
    dropoff_allowed: true,
    is_active: true,
    is_restricted: false,
    restricted_roles: ['employee', 'dispatcher', 'admin'],
    operating_hours: '24/7',
    icon_name: 'MapPin',
  };

  const handleOpenAdd = () => {
    setEditingLocation({
      ...emptyLocation,
      id: `loc-${Date.now()}`,
    });
    setSecurityWarningAccepted(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: AirportLocation) => {
    setEditingLocation({ ...loc });
    setSecurityWarningAccepted(loc.is_restricted);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    if (editingLocation.is_restricted && !securityWarningAccepted) {
      alert('You must acknowledge the airport security protocol before saving a restricted location.');
      return;
    }

    StorageService.saveLocation(editingLocation);
    setIsModalOpen(false);
    setEditingLocation(null);
    onRefresh();
  };

  const handleToggleActive = (loc: AirportLocation) => {
    const updated = { ...loc, is_active: !loc.is_active };
    StorageService.saveLocation(updated);
    onRefresh();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            MOPA Airport Approved Locations Directory ({locations.length})
          </h3>
          <p className="text-xs text-slate-500">
            Designated campus transport stops, pickup bays, and restricted operational points
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
        >
          <Plus className="h-4 w-4 text-sky-400" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Grid of Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className={`rounded-xl border p-4 transition ${
              loc.is_active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{loc.name}</h4>
                  {loc.is_restricted && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                      Restricted
                    </span>
                  )}
                </div>
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 mt-1">
                  {loc.category}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleActive(loc)}
                  title={loc.is_active ? 'Deactivate' : 'Activate'}
                  className={`p-1.5 rounded-lg border transition ${
                    loc.is_active
                      ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      : 'border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(loc)}
                  title="Edit Location"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500 line-clamp-2">{loc.description}</p>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
              <span className="text-slate-600 font-sans font-medium">{loc.operating_hours}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Location Modal */}
      {isModalOpen && editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingLocation.name ? `Edit: ${editingLocation.name}` : 'Register Airport Location'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  required
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                  placeholder="e.g. Flight Kitchen Bay 3"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={editingLocation.category}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        category: e.target.value as LocationCategory,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-sky-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={editingLocation.operating_hours}
                    onChange={(e) =>
                      setEditingLocation({ ...editingLocation, operating_hours: e.target.value })
                    }
                    placeholder="e.g. 24/7 or 06:00 - 22:00"
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Description & Landmark
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingLocation.description}
                  onChange={(e) =>
                    setEditingLocation({ ...editingLocation, description: e.target.value })
                  }
                  placeholder="Specific access gate, floor, or operational role."
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editingLocation.lat}
                    onChange={(e) =>
                      setEditingLocation({ ...editingLocation, lat: parseFloat(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={editingLocation.lng}
                    onChange={(e) =>
                      setEditingLocation({ ...editingLocation, lng: parseFloat(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingLocation.pickup_allowed}
                    onChange={(e) =>
                      setEditingLocation({ ...editingLocation, pickup_allowed: e.target.checked })
                    }
                    className="rounded text-sky-600"
                  />
                  <span>Pickup Allowed</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingLocation.dropoff_allowed}
                    onChange={(e) =>
                      setEditingLocation({ ...editingLocation, dropoff_allowed: e.target.checked })
                    }
                    className="rounded text-sky-600"
                  />
                  <span>Drop-off Allowed</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-amber-800">
                  <input
                    type="checkbox"
                    checked={editingLocation.is_restricted}
                    onChange={(e) =>
                      setEditingLocation({ ...editingLocation, is_restricted: e.target.checked })
                    }
                    className="rounded text-amber-600"
                  />
                  <span className="font-bold">Security Restricted (Employees / Staff Only)</span>
                </label>
              </div>

              {/* Security Warning Box if restricted */}
              {editingLocation.is_restricted && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Airport Security Protocol Warning</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    This location will be hidden from public passengers and will only be accessible to authorized airport staff with verified AAI / CISF passes. Never route unverified vehicles into restricted airside zones.
                  </p>
                  <label className="flex items-center gap-2 text-[11px] font-bold text-amber-900 pt-1">
                    <input
                      type="checkbox"
                      checked={securityWarningAccepted}
                      onChange={(e) => setSecurityWarningAccepted(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>I confirm this is an authorized, verified campus stop</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-xs"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
