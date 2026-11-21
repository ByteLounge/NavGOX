'use client';

import React, { useState } from 'react';
import { SystemSettings } from '@/types';
import { StorageService } from '@/lib/storage';
import {
  AlertTriangle,
  CheckCircle2,
  Phone,
  RotateCcw,
  Save,
  Settings,
  ShieldAlert,
} from 'lucide-react';

interface SystemSettingsPanelProps {
  settings: SystemSettings;
  onRefresh: () => void;
}

export default function SystemSettingsPanel({ settings, onRefresh }: SystemSettingsPanelProps) {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onRefresh();
  };

  const handleResetData = () => {
    if (
      confirm(
        'Reset demo data to initial factory seeds? This will restore all 21 locations, vehicles, and reset demo bookings.'
      )
    ) {
      StorageService.resetToDefaults();
      onRefresh();
      alert('Application storage reset to factory seed data.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Airport Campus Ground System Parameters</h3>
          <p className="text-xs text-slate-500">
            System configuration for Manohar International Airport internal transit operations
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <span>Parameters Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Campus Facility Name
            </label>
            <input
              type="text"
              required
              value={formData.campus_name}
              onChange={(e) => setFormData({ ...formData, campus_name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Airport IATA / ICAO Code
            </label>
            <input
              type="text"
              required
              value={formData.airport_code}
              onChange={(e) => setFormData({ ...formData, airport_code: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono font-bold focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              GMR IOCC Helpline
            </label>
            <input
              type="text"
              required
              value={formData.emergency_helpline}
              onChange={(e) => setFormData({ ...formData, emergency_helpline: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              CISF Control Phone
            </label>
            <input
              type="text"
              required
              value={formData.cisf_control_phone}
              onChange={(e) => setFormData({ ...formData, cisf_control_phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Dispatch Desk Phone
            </label>
            <input
              type="text"
              required
              value={formData.dispatch_desk_phone}
              onChange={(e) => setFormData({ ...formData, dispatch_desk_phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-mono focus:border-sky-500"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.auto_dispatch_enabled}
              onChange={(e) => setFormData({ ...formData, auto_dispatch_enabled: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>Enable Automated Intelligent Vehicle Dispatch for Immediate Bookings</span>
          </label>
          <p className="text-[11px] text-slate-500 pl-6.5">
            When enabled, immediate requests will automatically match compatible vehicles and available drivers without waiting for manual dispatcher assignment.
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Seed Data</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <Save className="h-4 w-4 text-sky-400" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
