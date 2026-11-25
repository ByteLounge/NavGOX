'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_USERS } from './constants';
import { StorageService } from './storage';
import { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  unreadCount: number;
  switchPersona: (roleOrId: UserRole | string) => void;
  login: (email: string) => UserProfile | null;
  register: (profile: Omit<UserProfile, 'id' | 'created_at'>) => UserProfile;
  logout: () => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUserData = () => {
    const active = StorageService.getActiveUser();
    setUser(active);
    if (active) {
      const notifs = StorageService.getNotifications(active.id);
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    } else {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const sync = () => {
      const active = StorageService.getActiveUser();
      setUser(active);
      if (active) {
        const notifs = StorageService.getNotifications(active.id);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      } else {
        setUnreadCount(0);
      }
    };
    const timer = setTimeout(sync, 0);
    const unsubscribe = StorageService.subscribe(sync);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const switchPersona = (roleOrId: UserRole | string) => {
    const users = StorageService.getUsers();
    let target = users.find((u) => u.id === roleOrId);
    if (!target) {
      target = users.find((u) => u.role === roleOrId);
    }
    if (target) {
      StorageService.setActiveUser(target);
      setUser(target);
      const notifs = StorageService.getNotifications(target.id);
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    }
  };

  const login = (email: string): UserProfile | null => {
    const users = StorageService.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      StorageService.setActiveUser(found);
      setUser(found);
      return found;
    }
    // Create an airport staff profile automatically for new staff sign-ins
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      phone: '+91 98220 00000',
      role: 'staff',
      department: 'Airport Staff',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    StorageService.saveUser(newProfile);
    StorageService.setActiveUser(newProfile);
    setUser(newProfile);
    return newProfile;
  };

  const register = (data: Omit<UserProfile, 'id' | 'created_at'>): UserProfile => {
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...data,
    };
    StorageService.saveUser(newProfile);

    // If registering as a driver, ensure a matching driver & vehicle record exist
    if (data.role === 'driver') {
      const drivers = StorageService.getDrivers();
      const existingDriver = drivers.find((d) => d.email.toLowerCase() === data.email.toLowerCase());
      if (!existingDriver) {
        const vehicles = StorageService.getVehicles();
        const availableVeh = vehicles.find((v) => !v.assigned_driver_id && v.status === 'available') || vehicles[0];
        const newDriverId = `drv-${Date.now()}`;
        StorageService.saveDriver({
          id: newDriverId,
          full_name: data.name,
          contact_number: data.phone,
          email: data.email,
          profile_photo: '',
          license_number: `DL-GA-11-${Math.floor(1000 + Math.random() * 9000)}`,
          badge_number: data.badge_number || `MOPA-DRV-${Math.floor(200 + Math.random() * 700)}`,
          assigned_vehicle_id: availableVeh ? availableVeh.id : null,
          status: 'available',
          current_booking_id: null,
          employment_status: 'active',
          rating: 5.0,
        });
      }
    }

    StorageService.setActiveUser(newProfile);
    setUser(newProfile);
    return newProfile;
  };

  const logout = () => {
    const defaultStaff = DEMO_USERS[0];
    StorageService.setActiveUser(defaultStaff);
    setUser(defaultStaff);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'staff',
        isAuthenticated: Boolean(user),
        unreadCount,
        switchPersona,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
