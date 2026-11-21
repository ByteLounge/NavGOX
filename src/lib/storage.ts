import {
  AirportLocation,
  AuditLog,
  Booking,
  BookingStatus,
  BookingStatusHistory,
  Driver,
  NotificationItem,
  SystemSettings,
  UserProfile,
  UserRole,
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
  LOCATIONS: 'navgox_locations_v1',
  VEHICLES: 'navgox_vehicles_v1',
  DRIVERS: 'navgox_drivers_v1',
  USERS: 'navgox_users_v1',
  BOOKINGS: 'navgox_bookings_v1',
  STATUS_HISTORY: 'navgox_status_history_v1',
  NOTIFICATIONS: 'navgox_notifications_v1',
  AUDIT_LOGS: 'navgox_audit_logs_v1',
  SETTINGS: 'navgox_settings_v1',
  ACTIVE_USER: 'navgox_active_user_v1',
};

// Initial sample bookings
const SEED_BOOKINGS: Booking[] = [
  {
    id: 'bk-1001',
    booking_reference: 'MOPA-2026-00041',
    passenger_id: 'usr-employee-1',
    passenger_name: 'Vikram Joshi',
    passenger_phone: '+91 98230 44556',
    passenger_role: 'employee',
    passenger_badge: 'GGIAL-EMP-4089',
    pickup_location_id: 'loc-08', // GMR Office
    pickup_location_name: 'GMR Office',
    destination_location_id: 'loc-07', // ATC Office
    destination_location_name: 'ATC Office',
    passenger_count: 2,
    booking_type: 'now',
    scheduled_at: null,
    status: 'in_transit',
    assigned_driver_id: 'drv-01',
    assigned_driver: SEED_DRIVERS[0],
    assigned_vehicle_id: 'veh-01',
    assigned_vehicle: SEED_VEHICLES[0],
    special_requirements: {
      luggage_assistance: false,
      wheelchair_accessible: false,
      special_assistance: false,
      notes: 'Attending joint airspace safety review at ATC',
    },
    notes: 'Escorting technical consultant',
    requested_at: '2026-11-21T14:45:00Z',
    assigned_at: '2026-11-21T14:47:00Z',
    started_at: '2026-11-21T14:52:00Z',
    updated_at: '2026-11-21T14:55:00Z',
  },
  {
    id: 'bk-1002',
    booking_reference: 'MOPA-2026-00042',
    passenger_id: 'usr-passenger-1',
    passenger_name: 'Sunita Sharma',
    passenger_phone: '+91 98230 11223',
    passenger_role: 'passenger',
    pickup_location_id: 'loc-01', // Arrival
    pickup_location_name: 'Arrival',
    destination_location_id: 'loc-04', // Gox Village
    destination_location_name: 'Gox Village / Forecourt',
    passenger_count: 3,
    booking_type: 'now',
    scheduled_at: null,
    status: 'arrived_pickup',
    assigned_driver_id: 'drv-02',
    assigned_driver: SEED_DRIVERS[1],
    assigned_vehicle_id: 'veh-02',
    assigned_vehicle: SEED_VEHICLES[1],
    special_requirements: {
      luggage_assistance: true,
      wheelchair_accessible: false,
      special_assistance: false,
      notes: 'Family with 2 trolley bags',
    },
    notes: 'Standing near Gate 2 pillar B',
    requested_at: '2026-11-21T15:00:00Z',
    assigned_at: '2026-11-21T15:02:00Z',
    updated_at: '2026-11-21T15:08:00Z',
  },
  {
    id: 'bk-1003',
    booking_reference: 'MOPA-2026-00043',
    passenger_id: 'usr-passenger-1',
    passenger_name: 'Sunita Sharma',
    passenger_phone: '+91 98230 11223',
    passenger_role: 'passenger',
    pickup_location_id: 'loc-05', // Parking
    pickup_location_name: 'Airport Parking',
    destination_location_id: 'loc-02', // Departure
    destination_location_name: 'Departure',
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
      wheelchair_accessible: true,
      special_assistance: true,
    },
    notes: 'Elderly passenger needing assistance to departure gate',
    requested_at: '2026-11-21T12:10:00Z',
    assigned_at: '2026-11-21T12:12:00Z',
    started_at: '2026-11-21T12:18:00Z',
    completed_at: '2026-11-21T12:30:00Z',
    updated_at: '2026-11-21T12:30:00Z',
  },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    timestamp: '2026-11-21T14:47:00Z',
    actor_name: 'Pooja Mandrekar',
    actor_role: 'dispatcher',
    action: 'DISPATCH_ASSIGNMENT',
    target_entity: 'booking',
    entity_id: 'bk-1001',
    details: 'Assigned Vehicle Shuttle Alpha 1 (GA-11-A-1024) and Driver Rajesh Naik to MOPA-2026-00041',
  },
  {
    id: 'aud-02',
    timestamp: '2026-11-21T15:02:00Z',
    actor_name: 'Pooja Mandrekar',
    actor_role: 'dispatcher',
    action: 'DISPATCH_ASSIGNMENT',
    target_entity: 'booking',
    entity_id: 'bk-1002',
    details: 'Assigned Vehicle Buggy Eco-Glide 1 and Driver Amit Sawant to MOPA-2026-00042',
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    user_id: 'usr-passenger-1',
    booking_id: 'bk-1002',
    title: 'Driver Arrived at Pickup',
    message: 'Amit Sawant (GA-11-EV-0101) has arrived at Arrival. Please proceed to the vehicle.',
    type: 'success',
    is_read: false,
    created_at: '2026-11-21T15:08:00Z',
  },
  {
    id: 'notif-02',
    user_id: 'usr-employee-1',
    booking_id: 'bk-1001',
    title: 'Ride In Transit',
    message: 'Your campus transit to ATC Office is currently underway with Driver Rajesh Naik.',
    type: 'info',
    is_read: true,
    created_at: '2026-11-21T14:55:00Z',
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

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
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

  // --- Locations ---
  getLocations(userRole?: UserRole): AirportLocation[] {
    const all = getStored<AirportLocation[]>(STORAGE_KEYS.LOCATIONS, SEED_LOCATIONS);
    if (!userRole || userRole === 'admin' || userRole === 'dispatcher') {
      return all;
    }
    // Filter restricted locations for passengers
    if (userRole === 'passenger') {
      return all.filter((loc) => loc.is_active && (!loc.is_restricted || loc.restricted_roles.includes('passenger')));
    }
    // Employees and Drivers can see authorized locations
    return all.filter(
      (loc) => loc.is_active && (!loc.is_restricted || loc.restricted_roles.includes(userRole))
    );
  },

  getAllLocationsAdmin(): AirportLocation[] {
    return getStored<AirportLocation[]>(STORAGE_KEYS.LOCATIONS, SEED_LOCATIONS);
  },

  saveLocation(location: AirportLocation): void {
    const all = this.getAllLocationsAdmin();
    const idx = all.findIndex((l) => l.id === location.id);
    if (idx >= 0) {
      all[idx] = location;
    } else {
      all.push(location);
    }
    setStored(STORAGE_KEYS.LOCATIONS, all);
  },

  deleteLocation(id: string): void {
    const all = this.getAllLocationsAdmin().filter((l) => l.id !== id);
    setStored(STORAGE_KEYS.LOCATIONS, all);
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

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const all = this.getAuditLogs();
    all.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
    setStored(STORAGE_KEYS.AUDIT_LOGS, all);
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
      id: `notif-${Date.now()}`,
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

  saveSettings(settings: SystemSettings): void {
    setStored(STORAGE_KEYS.SETTINGS, settings);
  },

  // Reset demo data
  resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.LOCATIONS);
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.DRIVERS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.STATUS_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    notifySubscribers();
  },
};
