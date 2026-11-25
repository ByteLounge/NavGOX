import {
  AirportLocation,
  Booking,
  BookingStatusHistory,
  Driver,
  NotificationItem,
  SystemSettings,
  UserProfile,
  Vehicle,
} from '@/types';
import {
  DEFAULT_SYSTEM_SETTINGS,
  DEMO_USERS,
  SEED_DRIVERS,
  SEED_LOCATIONS,
  SEED_VEHICLES,
} from './constants';

const STORAGE_KEYS = {
  LOCATIONS: 'navgox_locations_v4',
  VEHICLES: 'navgox_vehicles_v4',
  DRIVERS: 'navgox_drivers_v4',
  USERS: 'navgox_users_v4',
  BOOKINGS: 'navgox_bookings_v4',
  STATUS_HISTORY: 'navgox_status_history_v4',
  NOTIFICATIONS: 'navgox_notifications_v4',
  SETTINGS: 'navgox_settings_v4',
  ACTIVE_USER: 'navgox_active_user_v4',
};

// Initial sample staff pickup & drop-off bookings
const SEED_BOOKINGS: Booking[] = [
  {
    id: 'bk-1001',
    booking_reference: 'MOPA-2026-00041',
    staff_id: 'usr-staff-1',
    staff_name: 'Vikram Joshi',
    staff_phone: '+91 98230 44556',
    staff_badge: 'GGIAL-EMP-4089',
    staff_department: 'Airport Operations & Terminal Services',
    pickup_location_id: 'loc-08', // GMR Office
    pickup_location_name: 'GMR Office',
    destination_location_id: 'loc-07', // ATC Office
    destination_location_name: 'ATC Office',
    passenger_count: 2,
    booking_type: 'now',
    scheduled_at: null,
    status: 'requested',
    assigned_driver_id: null,
    assigned_driver: null,
    assigned_vehicle_id: null,
    assigned_vehicle: null,
    special_requirements: {
      luggage_assistance: false,
      wheelchair_accessible: false,
      notes: 'Waiting at GMR Office main entrance',
    },
    notes: 'Waiting at GMR Office main entrance',
    requested_at: '2026-11-25T14:45:00Z',
    updated_at: '2026-11-25T14:45:00Z',
  },
  {
    id: 'bk-1002',
    booking_reference: 'MOPA-2026-00042',
    staff_id: 'usr-staff-2',
    staff_name: 'Priya Deshpande',
    staff_phone: '+91 98230 55112',
    staff_badge: 'CISF-MOPA-214',
    staff_department: 'CISF Security & Cargo Verification',
    pickup_location_id: 'loc-03', // Main Terminal Building
    pickup_location_name: 'Main Terminal Building',
    destination_location_id: 'loc-14', // Cargo Building
    destination_location_name: 'Cargo Building',
    passenger_count: 1,
    booking_type: 'now',
    scheduled_at: null,
    status: 'in_transit',
    assigned_driver_id: 'drv-02',
    assigned_driver: SEED_DRIVERS[1],
    assigned_vehicle_id: 'veh-02',
    assigned_vehicle: SEED_VEHICLES[1],
    special_requirements: {
      luggage_assistance: false,
      wheelchair_accessible: false,
      notes: 'Inspection shift handover at Cargo bay',
    },
    notes: 'Inspection shift handover at Cargo bay',
    requested_at: '2026-11-25T14:30:00Z',
    accepted_at: '2026-11-25T14:31:00Z',
    started_at: '2026-11-25T14:35:00Z',
    updated_at: '2026-11-25T14:35:00Z',
  },
  {
    id: 'bk-1003',
    booking_reference: 'MOPA-2026-00043',
    staff_id: 'usr-staff-1',
    staff_name: 'Vikram Joshi',
    staff_phone: '+91 98230 44556',
    staff_badge: 'GGIAL-EMP-4089',
    staff_department: 'Airport Operations & Terminal Services',
    pickup_location_id: 'loc-09', // Admin Building
    pickup_location_name: 'Admin Building',
    destination_location_id: 'loc-20', // Airline Engineering and Maintenance Building
    destination_location_name: 'Airline Engineering and Maintenance Building',
    passenger_count: 1,
    booking_type: 'now',
    scheduled_at: null,
    status: 'completed',
    assigned_driver_id: 'drv-03',
    assigned_driver: SEED_DRIVERS[2],
    assigned_vehicle_id: 'veh-03',
    assigned_vehicle: SEED_VEHICLES[2],
    special_requirements: {
      luggage_assistance: false,
      wheelchair_accessible: false,
    },
    notes: 'GSE bay inspection',
    requested_at: '2026-11-25T12:10:00Z',
    accepted_at: '2026-11-25T12:12:00Z',
    started_at: '2026-11-25T12:18:00Z',
    completed_at: '2026-11-25T12:28:00Z',
    updated_at: '2026-11-25T12:28:00Z',
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    user_id: 'usr-driver-1',
    booking_id: 'bk-1001',
    title: 'New Staff Pickup Request',
    message: 'Vikram Joshi requested a pickup from GMR Office to ATC Office (2 pax).',
    type: 'info',
    is_read: false,
    created_at: '2026-11-25T14:45:00Z',
  },
  {
    id: 'notif-02',
    user_id: 'usr-staff-2',
    booking_id: 'bk-1002',
    title: 'In Transit to Cargo Building',
    message: 'Driver Amit Sawant (GA-11-EV-0101) is taking you to Cargo Building.',
    type: 'success',
    is_read: false,
    created_at: '2026-11-25T14:35:00Z',
  },
];

type StorageSubscriber = () => void;
const subscribers: Set<StorageSubscriber> = new Set();

function notifySubscribers() {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error('Subscriber callback error:', err);
    }
  });
}

// In-memory fallback cache for SSR and Node.js testing environments
const memoryCache: Record<string, string> = {};

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    const cached = memoryCache[key];
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        return JSON.parse(JSON.stringify(defaultValue)) as T;
      }
    }
    return JSON.parse(JSON.stringify(defaultValue)) as T;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return JSON.parse(JSON.stringify(defaultValue)) as T;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return JSON.parse(JSON.stringify(defaultValue)) as T;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    memoryCache[key] = JSON.stringify(value);
    notifySubscribers();
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers();
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export const StorageService = {
  subscribe(callback: StorageSubscriber): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },

  // --- Locations (All active airport premises stops available to staff & drivers) ---
  getLocations(): AirportLocation[] {
    const all = getStored<AirportLocation[]>(STORAGE_KEYS.LOCATIONS, SEED_LOCATIONS);
    return all.filter((loc) => loc.is_active);
  },

  getAllLocations(): AirportLocation[] {
    return getStored<AirportLocation[]>(STORAGE_KEYS.LOCATIONS, SEED_LOCATIONS);
  },

  // --- Vehicles ---
  getVehicles(): Vehicle[] {
    return getStored<Vehicle[]>(STORAGE_KEYS.VEHICLES, SEED_VEHICLES);
  },

  saveVehicle(vehicle: Vehicle): void {
    const all = this.getVehicles();
    const idx = all.findIndex((v) => v.id === vehicle.id);
    if (idx >= 0) {
      all[idx] = vehicle;
    } else {
      all.push(vehicle);
    }
    setStored(STORAGE_KEYS.VEHICLES, all);
  },

  // --- Drivers ---
  getDrivers(): Driver[] {
    return getStored<Driver[]>(STORAGE_KEYS.DRIVERS, SEED_DRIVERS);
  },

  saveDriver(driver: Driver): void {
    const all = this.getDrivers();
    const idx = all.findIndex((d) => d.id === driver.id);
    if (idx >= 0) {
      all[idx] = driver;
    } else {
      all.push(driver);
    }
    setStored(STORAGE_KEYS.DRIVERS, all);
  },

  // --- Users & Profiles ---
  getUsers(): UserProfile[] {
    return getStored<UserProfile[]>(STORAGE_KEYS.USERS, DEMO_USERS);
  },

  saveUser(user: UserProfile): void {
    const all = this.getUsers();
    const idx = all.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      all[idx] = user;
    } else {
      all.push(user);
    }
    setStored(STORAGE_KEYS.USERS, all);
  },

  getActiveUser(): UserProfile {
    return getStored<UserProfile>(STORAGE_KEYS.ACTIVE_USER, DEMO_USERS[0]);
  },

  setActiveUser(user: UserProfile): void {
    setStored(STORAGE_KEYS.ACTIVE_USER, user);
  },

  // --- Bookings ---
  getBookings(): Booking[] {
    return getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS);
  },

  getBookingById(id: string): Booking | undefined {
    return this.getBookings().find((b) => b.id === id || b.booking_reference === id);
  },

  saveBooking(booking: Booking): void {
    const all = this.getBookings();
    const idx = all.findIndex((b) => b.id === booking.id);
    if (idx >= 0) {
      all[idx] = booking;
    } else {
      all.unshift(booking);
    }
    setStored(STORAGE_KEYS.BOOKINGS, all);
  },

  // --- Status History ---
  getStatusHistory(bookingId: string): BookingStatusHistory[] {
    const all = getStored<BookingStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, []);
    return all.filter((h) => h.booking_id === bookingId).sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
  },

  addStatusHistory(history: Omit<BookingStatusHistory, 'id'>): void {
    const all = getStored<BookingStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, []);
    all.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...history,
    });
    setStored(STORAGE_KEYS.STATUS_HISTORY, all);
  },

  // --- Notifications ---
  getNotifications(userId?: string): NotificationItem[] {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    if (!userId) return all;
    return all.filter((n) => n.user_id === userId);
  },

  addNotification(item: Omit<NotificationItem, 'id' | 'created_at'>): void {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    all.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString(),
      ...item,
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
  },

  markNotificationAsRead(id: string): void {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const item = all.find((n) => n.id === id);
    if (item) {
      item.is_read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  },

  // --- Settings ---
  getSettings(): SystemSettings {
    return getStored<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SYSTEM_SETTINGS);
  },

  // Reset demo data
  resetToDefaults(): void {
    Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    }
    notifySubscribers();
  },
};
