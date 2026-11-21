export type UserRole = 'passenger' | 'employee' | 'driver' | 'dispatcher' | 'admin';

export type LocationCategory =
  | 'Passenger Area'
  | 'Terminal'
  | 'Airport Administration'
  | 'Security'
  | 'Cargo'
  | 'Staff Facilities'
  | 'Technical / Maintenance'
  | 'Emergency Services'
  | 'Parking / Transport';

export interface AirportLocation {
  id: string;
  name: string;
  category: LocationCategory;
  description: string;
  lat: number;
  lng: number;
  pickup_allowed: boolean;
  dropoff_allowed: boolean;
  is_active: boolean;
  is_restricted: boolean;
  restricted_roles: UserRole[]; // If empty or contains 'passenger', visible to public passengers
  operating_hours: string;
  icon_name: string;
}

export type VehicleType =
  | 'Airport Shuttle'
  | 'Electric Buggy'
  | 'Passenger Car'
  | 'Utility Vehicle'
  | 'VIP Van'
  | 'Other';

export type VehicleStatus = 'available' | 'assigned' | 'on_trip' | 'maintenance' | 'offline';

export interface Vehicle {
  id: string;
  registration_number: string;
  name: string;
  vehicle_type: VehicleType;
  passenger_capacity: number;
  luggage_capacity: number;
  accessibility_features: boolean; // Wheelchair ramp / low floor
  accessibility_description?: string;
  status: VehicleStatus;
  current_location: string;
  assigned_driver_id: string | null;
  last_maintenance_date: string;
}

export type DriverStatus = 'available' | 'assigned' | 'on_trip' | 'offline' | 'on_break';

export interface Driver {
  id: string;
  full_name: string;
  contact_number: string;
  email: string;
  profile_photo: string;
  license_number: string;
  badge_number: string;
  assigned_vehicle_id: string | null;
  status: DriverStatus;
  current_booking_id: string | null;
  employment_status: 'active' | 'on_leave' | 'suspended';
  rating?: number;
}

export type BookingStatus =
  | 'requested'
  | 'searching'
  | 'assigned'
  | 'driver_accepted'
  | 'driver_arriving'
  | 'arrived_pickup'
  | 'passenger_onboard'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type BookingType = 'now' | 'scheduled';

export interface SpecialRequirements {
  luggage_assistance: boolean;
  wheelchair_accessible: boolean;
  special_assistance: boolean;
  priority_escort?: boolean;
  notes?: string;
}

export interface Booking {
  id: string;
  booking_reference: string; // e.g. MOPA-2026-00001
  passenger_id: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_role: UserRole;
  passenger_badge?: string;
  pickup_location_id: string;
  pickup_location_name: string;
  destination_location_id: string;
  destination_location_name: string;
  passenger_count: number;
  booking_type: BookingType;
  scheduled_at: string | null;
  status: BookingStatus;
  assigned_driver_id: string | null;
  assigned_driver?: Driver | null;
  assigned_vehicle_id: string | null;
  assigned_vehicle?: Vehicle | null;
  special_requirements: SpecialRequirements;
  notes: string;
  cancellation_reason?: string;
  requested_at: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  updated_at: string;
}

export interface BookingStatusHistory {
  id: string;
  booking_id: string;
  status: BookingStatus;
  changed_by_user_id: string;
  changed_by_name: string;
  timestamp: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  booking_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  is_read: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  badge_number?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  target_entity: string;
  entity_id: string;
  details: string;
}

export interface SystemSettings {
  campus_name: string;
  airport_code: string;
  auto_dispatch_enabled: boolean;
  max_passenger_per_booking: number;
  emergency_helpline: string;
  dispatch_desk_phone: string;
  cisf_control_phone: string;
  operating_hours: string;
  allow_public_registrations: boolean;
}
