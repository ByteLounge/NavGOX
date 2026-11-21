'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/types';
import { Clock, Filter, History, Search, ShieldCheck } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export default function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.actor_name.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Airport Operations Security Audit Log ({logs.length})
          </h3>
          <p className="text-xs text-slate-500">
            Immutable chronological record of assignments, cancellations, and status changes
          </p>
        </div>

        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Action Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActionFilter('all')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
            actionFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Events
        </button>
        {actions.map((act) => (
          <button
            key={act}
            type="button"
            onClick={() => setActionFilter(act)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
              actionFilter === act
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {act.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor & Role</th>
              <th className="p-3">Action Type</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filtered.length > 0 ? (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="p-3 text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-sans">
                    <span className="font-semibold text-slate-900">{log.actor_name}</span>
                    <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 uppercase">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{log.target_entity}</td>
                  <td className="p-3 font-sans text-slate-800 max-w-md">{log.details}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-slate-400 font-sans">
                  No audit entries found matching the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
