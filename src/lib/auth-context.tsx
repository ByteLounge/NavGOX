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
  login: (email: string) => boolean;
  register: (profile: Omit<UserProfile, 'id' | 'created_at'>) => boolean;
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
    refreshUserData();
    const unsubscribe = StorageService.subscribe(() => {
      refreshUserData();
    });
    return () => {
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

  const login = (email: string): boolean => {
    const users = StorageService.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      StorageService.setActiveUser(found);
      setUser(found);
      return true;
    }
    // If not found, create a passenger profile automatically
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      phone: '+91 98220 00000',
      role: 'passenger',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    StorageService.saveUser(newProfile);
    StorageService.setActiveUser(newProfile);
    setUser(newProfile);
    return true;
  };

  const register = (data: Omit<UserProfile, 'id' | 'created_at'>): boolean => {
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...data,
    };
    StorageService.saveUser(newProfile);
    StorageService.setActiveUser(newProfile);
    setUser(newProfile);
    return true;
  };

  const logout = () => {
    // Revert to demo passenger
    const defaultPassenger = DEMO_USERS[0];
    StorageService.setActiveUser(defaultPassenger);
    setUser(defaultPassenger);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'passenger',
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
