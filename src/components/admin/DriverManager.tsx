'use client';

import React, { useState } from 'react';
import { Driver, DriverStatus, Vehicle } from '@/types';
import { StorageService } from '@/lib/storage';
import {
  Car,
  CheckCircle2,
  Edit,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  User,
  X,
} from 'lucide-react';

interface DriverManagerProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  onRefresh: () => void;
}

export default function DriverManager({ drivers, vehicles, onRefresh }: DriverManagerProps) {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emptyDriver: Driver = {
    id: '',
    full_name: '',
    contact_number: '+91 ',
    email: '',
    profile_photo: '',
    license_number: '',
    badge_number: 'MOPA-DRV-',
    assigned_vehicle_id: null,
    status: 'available',
    current_booking_id: null,
    employment_status: 'active',
    rating: 5.0,
  };

  const handleOpenAdd = () => {
    setEditingDriver({
      ...emptyDriver,
      id: `drv-${Date.now()}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditingDriver({ ...d });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    StorageService.saveDriver(editingDriver);
    setIsModalOpen(false);
    setEditingDriver(null);
    onRefresh();
  };

  const statusColors: Record<DriverStatus, string> = {
    available: 'bg-emerald-100 text-emerald-800',
    assigned: 'bg-sky-100 text-sky-800',
    on_trip: 'bg-indigo-100 text-indigo-800',
    on_break: 'bg-amber-100 text-amber-800',
    offline: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Campus Shuttle Drivers Roster ({drivers.length})
          </h3>
          <p className="text-xs text-slate-500">
            Certified airport ground vehicle drivers and airside permit holders
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          <Plus className="h-4 w-4 text-sky-400" />
          <span>Add Driver</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {drivers.map((drv) => {
          const vehicle = vehicles.find((v) => v.id === drv.assigned_vehicle_id);
          return (
            <div
              key={drv.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm">
                    {drv.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{drv.full_name}</h4>
                    <div className="text-[11px] text-slate-400 font-mono">{drv.badge_number}</div>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    statusColors[drv.status]
                  }`}
                >
                  {drv.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono">{drv.contact_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">License:</span>
                  <span className="font-mono">{drv.license_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-semibold text-slate-800">
                    {vehicle ? `${vehicle.name} (${vehicle.registration_number})` : 'None'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{drv.rating || 5.0}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(drv)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Edit Driver
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingDriver.full_name ? `Edit: ${editingDriver.full_name}` : 'Register Driver'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingDriver.full_name}
                  onChange={(e) =>
                    setEditingDriver({ ...editingDriver, full_name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDriver.contact_number}
                    onChange={(e) =>
                      setEditingDriver({ ...editingDriver, contact_number: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editingDriver.email}
                    onChange={(e) =>
                      setEditingDriver({ ...editingDriver, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Driving License No.
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDriver.license_number}
                    onChange={(e) =>
                      setEditingDriver({ ...editingDriver, license_number: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono uppercase focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    MOPA Airport Badge ID
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDriver.badge_number}
                    onChange={(e) =>
                      setEditingDriver({ ...editingDriver, badge_number: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono uppercase focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Assigned Vehicle
                  </label>
                  <select
                    value={editingDriver.assigned_vehicle_id || ''}
                    onChange={(e) =>
                      setEditingDriver({
                        ...editingDriver,
                        assigned_vehicle_id: e.target.value || null,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                  >
                    <option value="">Unassigned</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.registration_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Availability Status
                  </label>
                  <select
                    value={editingDriver.status}
                    onChange={(e) =>
                      setEditingDriver({
                        ...editingDriver,
                        status: e.target.value as DriverStatus,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                  >
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="on_trip">On Trip</option>
                    <option value="on_break">On Break</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Save Driver Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
