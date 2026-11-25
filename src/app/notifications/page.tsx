'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { StorageService } from '@/lib/storage';
import { NotificationItem } from '@/types';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refreshNotifs = useCallback(() => {
    if (user) {
      setNotifications(StorageService.getNotifications(user.id));
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(refreshNotifs, 0);
    const unsub = StorageService.subscribe(refreshNotifs);
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [refreshNotifs]);

  const handleMarkAsRead = (id: string) => {
    StorageService.markNotificationAsRead(id);
    refreshNotifs();
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      StorageService.markNotificationAsRead(n.id);
    });
    refreshNotifs();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time status updates, driver arrival alerts, and dispatch notices
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <CheckCheck className="h-4 w-4 text-sky-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 transition ${
                item.is_read
                  ? 'border-slate-200 bg-white text-slate-600'
                  : 'border-sky-200 bg-sky-50/60 text-slate-900 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      item.type === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.type === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {item.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : item.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-sky-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                    <div className="text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.booking_id && (
                    <Link
                      href={`/booking/${item.booking_id}`}
                      className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-slate-50 transition"
                    >
                      View Trip
                    </Link>
                  )}
                  {!item.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-white">
            <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No Notifications</p>
            <p className="mt-1">All trip alerts and dispatch updates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
