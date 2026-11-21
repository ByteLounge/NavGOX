'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StorageService } from '@/lib/storage';
import {
  AirportLocation,
  AuditLog,
  Booking,
  Driver,
  SystemSettings,
  UserProfile,
  Vehicle,
} from '@/types';
import DispatchPanel from '@/components/admin/DispatchPanel';
import LiveBookingsTable from '@/components/admin/LiveBookingsTable';
import LocationManager from '@/components/admin/LocationManager';
import VehicleManager from '@/components/admin/VehicleManager';
import DriverManager from '@/components/admin/DriverManager';
import UserManager from '@/components/admin/UserManager';
import AuditLogViewer from '@/components/admin/AuditLogViewer';
import SystemSettingsPanel from '@/components/admin/SystemSettingsPanel';
import {
  Activity,
  AlertCircle,
  Bus,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  MapPin,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Zap,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'dispatch'
  | 'bookings'
  | 'locations'
  | 'vehicles'
  | 'drivers'
  | 'users'
  | 'audit'
  | 'settings';

export default function AdminOperationsPage() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [locations, setLocations] = useState<AirportLocation[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(StorageService.getSettings());

  const refreshAllData = () => {
    setBookings(StorageService.getBookings());
    setVehicles(StorageService.getVehicles());
    setDrivers(StorageService.getDrivers());
    setLocations(StorageService.getAllLocationsAdmin());
    setUsers(StorageService.getUsers());
    setAuditLogs(StorageService.getAuditLogs());
    setSettings(StorageService.getSettings());
  };

  useEffect(() => {
    refreshAllData();
    const unsub = StorageService.subscribe(() => {
      refreshAllData();
    });
    return () => {
      unsub();
    };
  }, []);

  // Compute Live Statistics
  const pendingRequests = bookings.filter((b) => b.status === 'requested' || b.status === 'searching');
  const activeRides = bookings.filter((b) =>
    ['assigned', 'driver_accepted', 'driver_arriving', 'arrived_pickup', 'passenger_onboard', 'in_transit'].includes(
      b.status
    )
  );
  const completedRides = bookings.filter((b) => b.status === 'completed');
  const cancelledRides = bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected');

  const availableVehicles = vehicles.filter((v) => v.status === 'available');
  const busyVehicles = vehicles.filter((v) => v.status === 'assigned' || v.status === 'on_trip');
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance');
  const availableDrivers = drivers.filter((d) => d.status === 'available');

  const tabs = [
    { id: 'overview', label: 'Overview & KPIs', icon: Activity },
    { id: 'dispatch', label: `Dispatch Queue (${pendingRequests.length})`, icon: Zap },
    { id: 'bookings', label: 'All Bookings', icon: Clock },
    { id: 'locations', label: `Locations (${locations.length})`, icon: MapPin },
    { id: 'vehicles', label: `Vehicles (${vehicles.length})`, icon: Bus },
    { id: 'drivers', label: `Drivers (${drivers.length})`, icon: Car },
    { id: 'users', label: `Users (${users.length})`, icon: Users },
    { id: 'audit', label: 'Security Audit', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Integrated Operations Control Center (IOCC)
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Manohar International Airport (MOPA / GOX) • Campus Ground Transportation Command
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-800">
            Current Operator: {user?.name} ({role.toUpperCase()})
          </span>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Bookings</span>
          <span className="text-xl font-extrabold text-slate-900">{bookings.length}</span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending Queue</span>
          <span className="text-xl font-extrabold text-amber-900">{pendingRequests.length}</span>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-sky-700 block">Active Rides</span>
          <span className="text-xl font-extrabold text-sky-900">{activeRides.length}</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Completed</span>
          <span className="text-xl font-extrabold text-emerald-900">{completedRides.length}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cancelled</span>
          <span className="text-xl font-extrabold text-slate-600">{cancelledRides.length}</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Avail Vehicles</span>
          <span className="text-xl font-extrabold text-emerald-700">{availableVehicles.length}</span>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-white p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-indigo-600 block">Busy Vehicles</span>
          <span className="text-xl font-extrabold text-indigo-700">{busyVehicles.length}</span>
        </div>

        <div className="rounded-xl border border-sky-200 bg-white p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-sky-600 block">Avail Drivers</span>
          <span className="text-xl font-extrabold text-sky-700">{availableDrivers.length}</span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-xs font-bold transition border-b-2 ${
                isActive
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Operational Fleet Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Ground Vehicle Fleet Staging
              </h3>

              <div className="space-y-2.5">
                {vehicles.map((veh) => (
                  <div
                    key={veh.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{veh.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {veh.registration_number} • {veh.vehicle_type} (Cap: {veh.passenger_capacity} pax)
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        veh.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : veh.status === 'maintenance'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {veh.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Airport Trips */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Live Trips Across Campus ({activeRides.length})
              </h3>

              {activeRides.length > 0 ? (
                <div className="space-y-2.5">
                  {activeRides.map((ride) => (
                    <div
                      key={ride.id}
                      className="rounded-xl border border-slate-100 p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sky-700">
                          {ride.booking_reference}
                        </span>
                        <span className="rounded bg-sky-100 text-sky-800 text-[10px] font-bold uppercase px-2 py-0.5">
                          {ride.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="font-medium text-slate-800">
                        {ride.pickup_location_name} → {ride.destination_location_name}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Operator:{' '}
                        <strong>
                          {ride.assigned_driver ? ride.assigned_driver.full_name : 'Pending Driver'}
                        </strong>{' '}
                        • Vehicle: {ride.assigned_vehicle?.registration_number || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No active rides currently on campus roadways.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dispatch' && (
        <DispatchPanel
          unassignedBookings={pendingRequests}
          vehicles={vehicles}
          drivers={drivers}
          onAssignmentComplete={refreshAllData}
        />
      )}

      {activeTab === 'bookings' && (
        <LiveBookingsTable
          bookings={bookings}
          vehicles={vehicles}
          drivers={drivers}
          onRefresh={refreshAllData}
        />
      )}

      {activeTab === 'locations' && (
        <LocationManager locations={locations} onRefresh={refreshAllData} />
      )}

      {activeTab === 'vehicles' && (
        <VehicleManager vehicles={vehicles} drivers={drivers} onRefresh={refreshAllData} />
      )}

      {activeTab === 'drivers' && (
        <DriverManager drivers={drivers} vehicles={vehicles} onRefresh={refreshAllData} />
      )}

      {activeTab === 'users' && (
        <UserManager users={users} onRefresh={refreshAllData} />
      )}

      {activeTab === 'audit' && (
        <AuditLogViewer logs={auditLogs} />
      )}

      {activeTab === 'settings' && (
        <SystemSettingsPanel settings={settings} onRefresh={refreshAllData} />
      )}
    </div>
  );
}
