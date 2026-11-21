import {
  Booking,
  BookingStatus,
  SpecialRequirements,
  UserProfile,
  UserRole,
} from '@/types';
import { StorageService } from './storage';

export interface CreateBookingInput {
  pickup_location_id: string;
  destination_location_id: string;
  passenger_count: number;
  booking_type: 'now' | 'scheduled';
  scheduled_at?: string | null;
  special_requirements: SpecialRequirements;
  notes?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// Generate unique reference MOPA-YYYY-XXXXX
export function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const existing = StorageService.getBookings();
  const count = existing.length + 44; // seed offset for realistic numbers
  const padded = String(count).padStart(5, '0');
  return `MOPA-${year}-${padded}`;
}

export const BookingService = {
  validateBookingInput(
    input: CreateBookingInput,
    userRole: UserRole
  ): ValidationResult {
    const errors: Record<string, string> = {};

    if (!input.pickup_location_id) {
      errors.pickup_location_id = 'Please select an approved pickup location.';
    }

    if (!input.destination_location_id) {
      errors.destination_location_id = 'Please select a destination.';
    }

    if (
      input.pickup_location_id &&
      input.destination_location_id &&
      input.pickup_location_id === input.destination_location_id
    ) {
      errors.destination_location_id = 'Pickup and destination cannot be the same location.';
    }

    const allLocations = StorageService.getAllLocationsAdmin();
    const pickup = allLocations.find((l) => l.id === input.pickup_location_id);
    const destination = allLocations.find((l) => l.id === input.destination_location_id);

    if (pickup) {
      if (!pickup.is_active) {
        errors.pickup_location_id = `${pickup.name} is currently inactive for transport.`;
      }
      if (!pickup.pickup_allowed) {
        errors.pickup_location_id = `Pickups are not permitted at ${pickup.name}.`;
      }
      if (pickup.is_restricted && userRole === 'passenger' && !pickup.restricted_roles.includes('passenger')) {
        errors.pickup_location_id = `Security restriction: ${pickup.name} requires airport employee credentials.`;
      }
    }

    if (destination) {
      if (!destination.is_active) {
        errors.destination_location_id = `${destination.name} is currently inactive for transport.`;
      }
      if (!destination.dropoff_allowed) {
        errors.destination_location_id = `Drop-offs are not permitted at ${destination.name}.`;
      }
      if (destination.is_restricted && userRole === 'passenger' && !destination.restricted_roles.includes('passenger')) {
        errors.destination_location_id = `Security restriction: ${destination.name} requires airport employee credentials.`;
      }
    }

    if (!input.passenger_count || input.passenger_count < 1) {
      errors.passenger_count = 'Passenger count must be at least 1.';
    } else if (input.passenger_count > 14) {
      errors.passenger_count = 'Maximum passenger capacity per booking is 14.';
    }

    if (input.booking_type === 'scheduled') {
      if (!input.scheduled_at) {
        errors.scheduled_at = 'Please select a scheduled date and time.';
      } else {
        const scheduledTime = new Date(input.scheduled_at).getTime();
        const now = Date.now();
        if (scheduledTime <= now) {
          errors.scheduled_at = 'Scheduled time must be in the future.';
        }
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },

  createBooking(input: CreateBookingInput, user: UserProfile): { success: boolean; booking?: Booking; error?: string } {
    const validation = this.validateBookingInput(input, user.role);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError };
    }

    const allLocations = StorageService.getAllLocationsAdmin();
    const pickup = allLocations.find((l) => l.id === input.pickup_location_id)!;
    const destination = allLocations.find((l) => l.id === input.destination_location_id)!;

    const bookingId = `bk-${Date.now()}`;
    const reference = generateBookingReference();
    const nowIso = new Date().toISOString();

    const newBooking: Booking = {
      id: bookingId,
      booking_reference: reference,
      passenger_id: user.id,
      passenger_name: user.name,
      passenger_phone: user.phone,
      passenger_role: user.role,
      passenger_badge: user.badge_number,
      pickup_location_id: pickup.id,
      pickup_location_name: pickup.name,
      destination_location_id: destination.id,
      destination_location_name: destination.name,
      passenger_count: input.passenger_count,
      booking_type: input.booking_type,
      scheduled_at: input.scheduled_at || null,
      status: 'requested',
      assigned_driver_id: null,
      assigned_driver: null,
      assigned_vehicle_id: null,
      assigned_vehicle: null,
      special_requirements: input.special_requirements,
      notes: input.notes || '',
      requested_at: nowIso,
      updated_at: nowIso,
    };

    StorageService.saveBooking(newBooking);

    // Add status history
    StorageService.addStatusHistory({
      booking_id: bookingId,
      status: 'requested',
      changed_by_user_id: user.id,
      changed_by_name: user.name,
      timestamp: nowIso,
      notes: `Ride requested from ${pickup.name} to ${destination.name}`,
    });

    // Notify user
    StorageService.addNotification({
      user_id: user.id,
      booking_id: bookingId,
      title: 'Booking Request Received',
      message: `Your ride request (${reference}) from ${pickup.name} to ${destination.name} is registered.`,
      type: 'info',
      is_read: false,
    });

    // Notify dispatchers
    const dispatchers = StorageService.getUsers().filter((u) => u.role === 'dispatcher' || u.role === 'admin');
    dispatchers.forEach((d) => {
      StorageService.addNotification({
        user_id: d.id,
        booking_id: bookingId,
        title: 'New Trip Request',
        message: `New booking ${reference}: ${input.passenger_count} pax from ${pickup.name} to ${destination.name}`,
        type: 'info',
        is_read: false,
      });
    });

    // Log Audit
    StorageService.addAuditLog({
      actor_name: user.name,
      actor_role: user.role,
      action: 'BOOKING_CREATED',
      target_entity: 'booking',
      entity_id: bookingId,
      details: `Created booking ${reference} (${input.passenger_count} pax, ${pickup.name} -> ${destination.name})`,
    });

    // If auto-dispatch is enabled and ride is 'now', attempt smart automatic vehicle allocation
    const settings = StorageService.getSettings();
    if (settings.auto_dispatch_enabled && input.booking_type === 'now') {
      this.attemptAutoAllocation(newBooking);
    }

    return {
      success: true,
      booking: StorageService.getBookingById(bookingId),
    };
  },

  attemptAutoAllocation(booking: Booking): boolean {
    const vehicles = StorageService.getVehicles();
    const drivers = StorageService.getDrivers();
    const activeBookings = StorageService.getBookings().filter((b) =>
      ['assigned', 'driver_accepted', 'driver_arriving', 'arrived_pickup', 'passenger_onboard', 'in_transit'].includes(
        b.status
      )
    );

    const busyVehicleIds = new Set(activeBookings.map((b) => b.assigned_vehicle_id).filter(Boolean));
    const busyDriverIds = new Set(activeBookings.map((b) => b.assigned_driver_id).filter(Boolean));

    // Find suitable vehicle
    const suitableVehicle = vehicles.find((v) => {
      if (v.status !== 'available') return false;
      if (busyVehicleIds.has(v.id)) return false;
      if (v.passenger_capacity < booking.passenger_count) return false;
      if (booking.special_requirements.wheelchair_accessible && !v.accessibility_features) return false;
      return true;
    });

    if (!suitableVehicle) return false;

    // Find suitable driver
    const suitableDriver = drivers.find((d) => {
      if (d.status !== 'available') return false;
      if (busyDriverIds.has(d.id)) return false;
      if (d.employment_status !== 'active') return false;
      // Prefer vehicle's pre-assigned driver if available
      if (suitableVehicle.assigned_driver_id && d.id === suitableVehicle.assigned_driver_id) return true;
      return true;
    });

    if (!suitableDriver) return false;

    const result = this.assignVehicleAndDriver(
      booking.id,
      suitableVehicle.id,
      suitableDriver.id,
      'MOPA Auto-Dispatch Engine',
      'system'
    );

    return result.success;
  },

  assignVehicleAndDriver(
    bookingId: string,
    vehicleId: string,
    driverId: string,
    actorName: string,
    actorId: string
  ): { success: boolean; error?: string } {
    const booking = StorageService.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      return { success: false, error: `Cannot assign vehicle to a ${booking.status} booking.` };
    }

    const vehicles = StorageService.getVehicles();
    const drivers = StorageService.getDrivers();
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const driver = drivers.find((d) => d.id === driverId);

    if (!vehicle) {
      return { success: false, error: 'Vehicle not found.' };
    }
    if (!driver) {
      return { success: false, error: 'Driver not found.' };
    }

    if (vehicle.status === 'maintenance') {
      return { success: false, error: `Vehicle ${vehicle.registration_number} is currently grounded for maintenance.` };
    }
    if (vehicle.status === 'offline') {
      return { success: false, error: `Vehicle ${vehicle.registration_number} is offline.` };
    }

    // Double-booking check: Ensure vehicle is not on another active booking
    const activeBookings = StorageService.getBookings().filter((b) =>
      b.id !== bookingId &&
      ['assigned', 'driver_accepted', 'driver_arriving', 'arrived_pickup', 'passenger_onboard', 'in_transit'].includes(
        b.status
      )
    );

    const vehicleConflict = activeBookings.find((b) => b.assigned_vehicle_id === vehicle.id);
    if (vehicleConflict) {
      return {
        success: false,
        error: `Conflict: Vehicle ${vehicle.registration_number} is currently engaged on active trip ${vehicleConflict.booking_reference}.`,
      };
    }

    const driverConflict = activeBookings.find((b) => b.assigned_driver_id === driver.id);
    if (driverConflict) {
      return {
        success: false,
        error: `Conflict: Driver ${driver.full_name} is currently engaged on active trip ${driverConflict.booking_reference}.`,
      };
    }

    // Capacity verification
    if (vehicle.passenger_capacity < booking.passenger_count) {
      return {
        success: false,
        error: `Insufficient capacity: Vehicle ${vehicle.name} accommodates ${vehicle.passenger_capacity} passengers, but booking requires ${booking.passenger_count}.`,
      };
    }

    // Accessibility check
    if (booking.special_requirements.wheelchair_accessible && !vehicle.accessibility_features) {
      return {
        success: false,
        error: `Accessibility requirement: This trip requires wheelchair accessibility, but ${vehicle.name} does not have accessibility equipment.`,
      };
    }

    const nowIso = new Date().toISOString();

    // Update vehicle status
    vehicle.status = 'assigned';
    StorageService.saveVehicle(vehicle);

    // Update driver status
    driver.status = 'assigned';
    driver.current_booking_id = bookingId;
    StorageService.saveDriver(driver);

    // Update booking
    booking.assigned_vehicle_id = vehicle.id;
    booking.assigned_vehicle = vehicle;
    booking.assigned_driver_id = driver.id;
    booking.assigned_driver = driver;
    booking.assigned_at = nowIso;
    booking.status = 'assigned';
    booking.updated_at = nowIso;
    StorageService.saveBooking(booking);

    // Record status history
    StorageService.addStatusHistory({
      booking_id: booking.id,
      status: 'assigned',
      changed_by_user_id: actorId,
      changed_by_name: actorName,
      timestamp: nowIso,
      notes: `Vehicle ${vehicle.registration_number} and Driver ${driver.full_name} assigned`,
    });

    // Notify passenger
    StorageService.addNotification({
      user_id: booking.passenger_id,
      booking_id: booking.id,
      title: 'Vehicle Assigned',
      message: `${driver.full_name} has been assigned to your ride with ${vehicle.name} (${vehicle.registration_number}).`,
      type: 'success',
      is_read: false,
    });

    // Notify driver
    const driverUser = StorageService.getUsers().find((u) => u.phone === driver.contact_number || u.name === driver.full_name);
    if (driverUser) {
      StorageService.addNotification({
        user_id: driverUser.id,
        booking_id: booking.id,
        title: 'New Trip Assigned',
        message: `You have been assigned trip ${booking.booking_reference} from ${booking.pickup_location_name} to ${booking.destination_location_name}.`,
        type: 'info',
        is_read: false,
      });
    }

    // Log Audit
    StorageService.addAuditLog({
      actor_name: actorName,
      actor_role: actorId === 'system' ? 'dispatcher' : 'admin',
      action: 'VEHICLE_ASSIGNED',
      target_entity: 'booking',
      entity_id: booking.id,
      details: `Assigned Vehicle ${vehicle.registration_number} and Driver ${driver.full_name} to ${booking.booking_reference}`,
    });

    return { success: true };
  },

  updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    actorName: string,
    actorId: string,
    notes?: string
  ): { success: boolean; error?: string } {
    const booking = StorageService.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    const previousStatus = booking.status;
    const nowIso = new Date().toISOString();

    booking.status = newStatus;
    booking.updated_at = nowIso;

    if (newStatus === 'in_transit' && !booking.started_at) {
      booking.started_at = nowIso;
    }

    // When completed, release vehicle and driver
    if (newStatus === 'completed') {
      booking.completed_at = nowIso;
      this.releaseVehicleAndDriver(booking.assigned_vehicle_id, booking.assigned_driver_id);
    }

    // When cancelled or rejected, release vehicle and driver
    if (newStatus === 'cancelled' || newStatus === 'rejected') {
      booking.cancelled_at = nowIso;
      if (notes && !booking.cancellation_reason) {
        booking.cancellation_reason = notes;
      }
      this.releaseVehicleAndDriver(booking.assigned_vehicle_id, booking.assigned_driver_id);
    }

    StorageService.saveBooking(booking);

    // Status history
    StorageService.addStatusHistory({
      booking_id: booking.id,
      status: newStatus,
      changed_by_user_id: actorId,
      changed_by_name: actorName,
      timestamp: nowIso,
      notes: notes || `Status updated from ${previousStatus} to ${newStatus}`,
    });

    // Notify passenger
    const statusMessages: Partial<Record<BookingStatus, { title: string; message: string }>> = {
      driver_accepted: {
        title: 'Driver Confirmed',
        message: `${booking.assigned_driver?.full_name || 'Driver'} accepted your trip request.`,
      },
      driver_arriving: {
        title: 'Driver Approaching',
        message: `Your shuttle vehicle is on its way to ${booking.pickup_location_name}.`,
      },
      arrived_pickup: {
        title: 'Driver Arrived at Pickup',
        message: `Your driver has arrived at ${booking.pickup_location_name}. Please proceed to the vehicle.`,
      },
      passenger_onboard: {
        title: 'Passenger Boarded',
        message: `Boarding verified. Departing for ${booking.destination_location_name}.`,
      },
      in_transit: {
        title: 'Ride In Transit',
        message: `En route to ${booking.destination_location_name}. Have a safe journey across MOPA campus.`,
      },
      completed: {
        title: 'Trip Completed',
        message: `You have arrived at ${booking.destination_location_name}. Thank you for using MOPA Campus Transport.`,
      },
      cancelled: {
        title: 'Trip Cancelled',
        message: `Booking ${booking.booking_reference} has been cancelled.`,
      },
    };

    const notifInfo = statusMessages[newStatus];
    if (notifInfo) {
      StorageService.addNotification({
        user_id: booking.passenger_id,
        booking_id: booking.id,
        title: notifInfo.title,
        message: notifInfo.message,
        type: newStatus === 'cancelled' ? 'warning' : 'info',
        is_read: false,
      });
    }

    // Audit log
    StorageService.addAuditLog({
      actor_name: actorName,
      actor_role: 'driver',
      action: 'STATUS_TRANSITION',
      target_entity: 'booking',
      entity_id: booking.id,
      details: `${booking.booking_reference} transitioned from ${previousStatus} to ${newStatus}`,
    });

    return { success: true };
  },

  cancelBooking(
    bookingId: string,
    reason: string,
    actorName: string,
    actorId: string
  ): { success: boolean; error?: string } {
    const booking = StorageService.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return { success: false, error: `Trip is already ${booking.status}.` };
    }

    booking.cancellation_reason = reason;
    StorageService.saveBooking(booking);
    return this.updateBookingStatus(bookingId, 'cancelled', actorName, actorId, reason);
  },

  releaseVehicleAndDriver(vehicleId: string | null, driverId: string | null): void {
    if (vehicleId) {
      const vehicles = StorageService.getVehicles();
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (vehicle && vehicle.status !== 'maintenance' && vehicle.status !== 'offline') {
        vehicle.status = 'available';
        StorageService.saveVehicle(vehicle);
      }
    }

    if (driverId) {
      const drivers = StorageService.getDrivers();
      const driver = drivers.find((d) => d.id === driverId);
      if (driver && driver.status !== 'offline' && driver.status !== 'on_break') {
        driver.status = 'available';
        driver.current_booking_id = null;
        StorageService.saveDriver(driver);
      }
    }
  },
};
