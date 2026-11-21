'use client';

import React, { useState } from 'react';
import { Driver, Vehicle, VehicleStatus, VehicleType } from '@/types';
import { StorageService } from '@/lib/storage';
import {
  Accessibility,
  AlertCircle,
  Car,
  Edit,
  Plus,
  Power,
  ShieldCheck,
  User,
  Wrench,
  X,
} from 'lucide-react';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onRefresh: () => void;
}

const VEHICLE_TYPES: VehicleType[] = [
  'Airport Shuttle',
  'Electric Buggy',
  'Passenger Car',
  'Utility Vehicle',
  'VIP Van',
  'Other',
];

export default function VehicleManager({ vehicles, drivers, onRefresh }: VehicleManagerProps) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emptyVehicle: Vehicle = {
    id: '',
    registration_number: '',
    name: '',
    vehicle_type: 'Airport Shuttle',
    passenger_capacity: 14,
    luggage_capacity: 6,
    accessibility_features: false,
    status: 'available',
    current_location: 'Main Terminal Building',
    assigned_driver_id: null,
    last_maintenance_date: '2026-11-21',
  };

  const handleOpenAdd = () => {
    setEditingVehicle({
      ...emptyVehicle,
      id: `veh-${Date.now()}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle({ ...v });
    setIsModalOpen(true);
  };

  const handleToggleMaintenance = (v: Vehicle) => {
    const updatedStatus: VehicleStatus = v.status === 'maintenance' ? 'available' : 'maintenance';
    const updated = { ...v, status: updatedStatus };
    StorageService.saveVehicle(updated);
    onRefresh();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    StorageService.saveVehicle(editingVehicle);
    setIsModalOpen(false);
    setEditingVehicle(null);
    onRefresh();
  };

  const statusBadges: Record<VehicleStatus, string> = {
    available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    assigned: 'bg-sky-100 text-sky-800 border-sky-200',
    on_trip: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    maintenance: 'bg-amber-100 text-amber-800 border-amber-200',
    offline: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Campus Ground Fleet Vehicles ({vehicles.length})
          </h3>
          <p className="text-xs text-slate-500">
            Internal shuttle buses, electric buggies, and accessible transit units
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          <Plus className="h-4 w-4 text-sky-400" />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {vehicles.map((v) => {
          const assignedDriver = drivers.find((d) => d.id === v.assigned_driver_id);
          return (
            <div
              key={v.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{v.name}</h4>
                  <div className="font-mono text-xs font-bold text-sky-700 mt-0.5">
                    {v.registration_number}
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    statusBadges[v.status]
                  }`}
                >
                  {v.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Type</span>
                  <span className="font-medium text-slate-800">{v.vehicle_type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Capacity</span>
                  <span className="font-medium text-slate-800">{v.passenger_capacity} Passengers</span>
                </div>
              </div>

              <div className="mt-2 text-xs flex items-center justify-between">
                <span className="text-slate-500">
                  Driver: <strong>{assignedDriver ? assignedDriver.full_name : 'Unassigned'}</strong>
                </span>
                {v.accessibility_features && (
                  <span className="flex items-center gap-1 text-sky-700 font-semibold text-[10px]">
                    <Accessibility className="h-3.5 w-3.5" />
                    <span>Accessible</span>
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleMaintenance(v)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                    v.status === 'maintenance'
                      ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <Wrench className="h-3 w-3" />
                  <span>{v.status === 'maintenance' ? 'End Maintenance' : 'Set Maintenance'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(v)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingVehicle.name ? `Edit Vehicle: ${editingVehicle.name}` : 'Register New Campus Vehicle'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Registration Plate
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVehicle.registration_number}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, registration_number: e.target.value })
                    }
                    placeholder="e.g. GA-11-A-1099"
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono uppercase focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Fleet Name / Call Sign
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVehicle.name}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, name: e.target.value })
                    }
                    placeholder="e.g. Shuttle Beta 1"
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={editingVehicle.vehicle_type}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        vehicle_type: e.target.value as VehicleType,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Passenger Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={editingVehicle.passenger_capacity}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        passenger_capacity: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Assigned Driver
                  </label>
                  <select
                    value={editingVehicle.assigned_driver_id || ''}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        assigned_driver_id: e.target.value || null,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                  >
                    <option value="">No Driver Assigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} ({d.badge_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Operating Status
                  </label>
                  <select
                    value={editingVehicle.status}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        status: e.target.value as VehicleStatus,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-sky-500"
                  >
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="on_trip">On Trip</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingVehicle.accessibility_features}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        accessibility_features: e.target.checked,
                      })
                    }
                    className="rounded text-sky-600"
                  />
                  <span>Equipped with Wheelchair Ramp / Low Floor Access</span>
                </label>
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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
