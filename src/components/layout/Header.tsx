'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Bell,
  Bus,
  Car,
  ChevronDown,
  Compass,
  HelpCircle,
  History,
  LogOut,
  MapPin,
  Menu,
  Shield,
  SlidersHorizontal,
  User,
  Users,
  X,
} from 'lucide-react';
import { DEMO_USERS } from '@/lib/constants';
import { UserRole } from '@/types';

export default function Header() {
  const { user, role, unreadCount, switchPersona, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  const roleColors: Record<UserRole, string> = {
    passenger: 'bg-blue-100 text-blue-800 border-blue-200',
    employee: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    driver: 'bg-amber-100 text-amber-800 border-amber-200',
    dispatcher: 'bg-purple-100 text-purple-800 border-purple-200',
    admin: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const navLinks = [
    { label: 'Book Shuttle', href: '/dashboard', icon: Bus, show: true },
    { label: 'My Bookings', href: '/history', icon: History, show: true },
    {
      label: 'Driver Desk',
      href: '/driver',
      icon: Car,
      show: role === 'driver' || role === 'dispatcher' || role === 'admin',
    },
    {
      label: 'Ops & Dispatch',
      href: '/admin',
      icon: SlidersHorizontal,
      show: role === 'dispatcher' || role === 'admin',
    },
    { label: 'Campus Map', href: '/#campus-map', icon: Compass, show: true },
    { label: 'Helpline', href: '/help', icon: HelpCircle, show: true },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Banner: Quick Role Switcher for seamless testing */}
      <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white tracking-wide">MOPA / GOX</span>
            <span className="text-slate-400 hidden sm:inline">| Manohar International Airport Inter-Campus Transport</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden md:inline">Quick Test Persona:</span>
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700 transition"
              >
                <span>Switch Role: <strong className="capitalize text-sky-400">{role}</strong></span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {personaDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-64 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/10 z-50"
                  onClick={() => setPersonaDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Test Persona
                  </div>
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => switchPersona(demo.role)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition ${
                        role === demo.role ? 'bg-sky-50 font-semibold text-sky-900' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="capitalize">{demo.role} ({demo.name})</div>
                        <div className="text-[10px] text-slate-400">{demo.email}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${roleColors[demo.role]}`}>
                        {demo.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <Bus className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">NavGOX</span>
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 tracking-wider">
                MOPA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Campus Shuttle System</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks
            .filter((link) => link.show)
            .map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Right Section: Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</div>
                <div className="flex items-center justify-end gap-1">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                  {user.badge_number && (
                    <span className="text-[10px] text-slate-400">{user.badge_number}</span>
                  )}
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-300">
                {user.name.charAt(0)}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 shadow-lg">
          <div className="space-y-1">
            {navLinks
              .filter((l) => l.show)
              .map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-slate-500" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Switch Active Persona</div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => {
                    switchPersona(demo.role);
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded border px-2.5 py-1.5 text-xs text-left transition ${
                    role === demo.role ? 'border-sky-500 bg-sky-50 font-semibold text-sky-900' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="capitalize">{demo.role}</div>
                  <div className="text-[10px] text-slate-400 truncate">{demo.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
