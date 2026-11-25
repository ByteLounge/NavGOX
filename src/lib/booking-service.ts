import {
  Booking,
  BookingStatus,
  SpecialRequirements,
  UserProfile,
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
  const count = existing.length + 44;
  const padded = String(count).padStart(5, '0');
  return `MOPA-${year}-${padded}`;
}

export const BookingService = {
  validateBookingInput(input: CreateBookingInput): ValidationResult {
    const errors: Record<string, string> = {};

    if (!input.pickup_location_id) {
      errors.pickup_location_id = 'Please select an approved pickup location.';
    }

    if (!input.destination_location_id) {
      errors.destination_location_id = 'Please select a drop-off location.';
    }

    if (
      input.pickup_location_id &&
      input.destination_location_id &&
      input.pickup_location_id === input.destination_location_id
    ) {
      errors.destination_location_id = 'Pickup and drop-off cannot be the same location.';
    }

    const allLocations = StorageService.getAllLocations();
    const pickup = allLocations.find((l) => l.id === input.pickup_location_id);
    const destination = allLocations.find((l) => l.id === input.destination_location_id);

    if (!pickup) {
      errors.pickup_location_id = 'Selected pickup location is not within airport premises.';
    } else {
      if (!pickup.is_active) {
        errors.pickup_location_id = `${pickup.name} is currently inactive for transport.`;
      }
      if (!pickup.pickup_allowed) {
        errors.pickup_location_id = `Pickups are not permitted at ${pickup.name}.`;
      }
    }

    if (!destination) {
      errors.destination_location_id = 'Selected drop-off location is not within airport premises.';
    } else {
      if (!destination.is_active) {
        errors.destination_location_id = `${destination.name} is currently inactive for transport.`;
      }
      if (!destination.dropoff_allowed) {
        errors.destination_location_id = `Drop-offs are not permitted at ${destination.name}.`;
      }
    }

    if (!input.passenger_count || input.passenger_count < 1) {
      errors.passenger_count = 'Staff rider count must be at least 1.';
    } else if (input.passenger_count > 14) {
      errors.passenger_count = 'Maximum capacity per ride request is 14.';
    }

    if (input.booking_type === 'scheduled') {
      if (!input.scheduled_at) {
        errors.scheduled_at = 'Please select a scheduled date and time.';
      } else {
        const scheduledTime = new Date(input.scheduled_at).getTime();
        if (scheduledTime <= Date.now()) {
          errors.scheduled_at = 'Scheduled time must be in the future.';
        }
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },

  createBooking(
    input: CreateBookingInput,
    user: UserProfile
  ): { success: boolean; booking?: Booking; error?: string } {
    if (user.role !== 'staff') {
      return {
        success: false,
        error: 'Only airport staff members can request a pickup.',
      };
    }

    const validation = this.validateBookingInput(input);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError };
    }

    const allLocations = StorageService.getAllLocations();
    const pickup = allLocations.find((l) => l.id === input.pickup_location_id)!;
    const destination = allLocations.find((l) => l.id === input.destination_location_id)!;

    const bookingId = `bk-${Date.now()}`;
    const reference = generateBookingReference();
    const nowIso = new Date().toISOString();

    const newBooking: Booking = {
      id: bookingId,
      booking_reference: reference,
      staff_id: user.id,
      staff_name: user.name,
      staff_phone: user.phone,
      staff_badge: user.badge_number,
      staff_department: user.department,
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

    StorageService.addStatusHistory({
      booking_id: bookingId,
      status: 'requested',
      changed_by_user_id: user.id,
      changed_by_name: user.name,
      timestamp: nowIso,
      notes: `Pickup requested from ${pickup.name} to ${destination.name}`,
    });

    // Notify requesting staff member
    StorageService.addNotification({
      user_id: user.id,
      booking_id: bookingId,
      title: 'Pickup Request Sent',
      message: `Request ${reference} (${pickup.name} → ${destination.name}) is visible to campus drivers.`,
      type: 'info',
      is_read: false,
    });

    // Notify all driver user accounts
    const driverUsers = StorageService.getUsers().filter((u) => u.role === 'driver');
    driverUsers.forEach((drvUser) => {
      StorageService.addNotification({
        user_id: drvUser.id,
        booking_id: bookingId,
        title: 'New Staff Pickup Request',
        message: `${user.name} needs pickup at ${pickup.name} → ${destination.name} (${input.passenger_count} pax).`,
        type: 'info',
        is_read: false,
      });
    });

    return {
      success: true,
      booking: StorageService.getBookingById(bookingId),
    };
  },

  acceptBooking(
    bookingId: string,
    driverId: string,
    vehicleIdOverride?: string
  ): { success: boolean; error?: string } {
    const booking = StorageService.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    if (booking.status !== 'requested') {
      return {
        success: false,
        error: `This ride request is already ${booking.status.replace('_', ' ')}.`,
      };
    }

    const drivers = StorageService.getDrivers();
    const vehicles = StorageService.getVehicles();
    const driver = drivers.find((d) => d.id === driverId);

    if (!driver) {
      return { success: false, error: 'Driver profile not found.' };
    }

    if (driver.employment_status !== 'active') {
      return { success: false, error: 'Driver account is not currently active.' };
    }

    if (driver.status === 'offline' || driver.status === 'on_break') {
      return {
        success: false,
        error: 'Set your status to Available before accepting a pickup request.',
      };
    }

    const vehicleId = vehicleIdOverride || driver.assigned_vehicle_id;
    const vehicle = vehicles.find((v) => v.id === vehicleId);

    if (!vehicle) {
      return { success: false, error: 'No assigned vehicle found for this driver.' };
    }

    if (vehicle.status === 'maintenance' || vehicle.status === 'offline') {
      return {
        success: false,
        error: `Vehicle ${vehicle.registration_number} is currently unavailable (${vehicle.status}).`,
      };
    }

    // Prevent double-assignment on active trips
    const activeBookings = StorageService.getBookings().filter(
      (b) => b.id !== bookingId && ['driver_accepted', 'in_transit'].includes(b.status)
    );

    const driverConflict = activeBookings.find((b) => b.assigned_driver_id === driver.id);
    if (driverConflict) {
      return {
        success: false,
        error: `You are already on an active trip (${driverConflict.booking_reference}). Complete it first.`,
      };
    }

    const vehicleConflict = activeBookings.find((b) => b.assigned_vehicle_id === vehicle.id);
    if (vehicleConflict) {
      return {
        success: false,
        error: `Vehicle ${vehicle.registration_number} is currently engaged on trip ${vehicleConflict.booking_reference}.`,
      };
    }

    // Capacity verification
    if (vehicle.passenger_capacity < booking.passenger_count) {
      return {
        success: false,
        error: `Capacity mismatch: ${vehicle.name} holds ${vehicle.passenger_capacity} pax, but request needs ${booking.passenger_count}.`,
      };
    }

    // Accessibility check
    if (booking.special_requirements.wheelchair_accessible && !vehicle.accessibility_features) {
      return {
        success: false,
        error: `Accessibility requirement: This ride requires wheelchair ramp access, which ${vehicle.name} does not have.`,
      };
    }

    const nowIso = new Date().toISOString();

    vehicle.status = 'on_trip';
    StorageService.saveVehicle(vehicle);

    driver.status = 'on_trip';
    driver.current_booking_id = bookingId;
    StorageService.saveDriver(driver);

    booking.assigned_vehicle_id = vehicle.id;
    booking.assigned_vehicle = vehicle;
    booking.assigned_driver_id = driver.id;
    booking.assigned_driver = driver;
    booking.accepted_at = nowIso;
    booking.status = 'driver_accepted';
    booking.updated_at = nowIso;
    StorageService.saveBooking(booking);

    StorageService.addStatusHistory({
      booking_id: booking.id,
      status: 'driver_accepted',
      changed_by_user_id: driver.id,
      changed_by_name: driver.full_name,
      timestamp: nowIso,
      notes: `${driver.full_name} accepted pickup in ${vehicle.name} (${vehicle.registration_number})`,
    });

    StorageService.addNotification({
      user_id: booking.staff_id,
      booking_id: booking.id,
      title: 'Driver On The Way',
      message: `${driver.full_name} accepted your pickup in ${vehicle.name} (${vehicle.registration_number}).`,
      type: 'success',
      is_read: false,
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

    if (newStatus === 'completed') {
      booking.completed_at = nowIso;
      this.releaseVehicleAndDriver(booking.assigned_vehicle_id, booking.assigned_driver_id);
    }

    if (newStatus === 'cancelled') {
      booking.cancelled_at = nowIso;
      if (notes && !booking.cancellation_reason) {
        booking.cancellation_reason = notes;
      }
      this.releaseVehicleAndDriver(booking.assigned_vehicle_id, booking.assigned_driver_id);
    }

    StorageService.saveBooking(booking);

    StorageService.addStatusHistory({
      booking_id: booking.id,
      status: newStatus,
      changed_by_user_id: actorId,
      changed_by_name: actorName,
      timestamp: nowIso,
      notes: notes || `Status updated from ${previousStatus} to ${newStatus}`,
    });

    const statusMessages: Partial<Record<BookingStatus, { title: string; message: string }>> = {
      in_transit: {
        title: 'Picked Up • In Transit',
        message: `Onboard with ${booking.assigned_driver?.full_name || 'driver'}, heading to ${booking.destination_location_name}.`,
      },
      completed: {
        title: 'Dropped Off • Trip Completed',
        message: `You have been dropped off at ${booking.destination_location_name}.`,
      },
      cancelled: {
        title: 'Ride Request Cancelled',
        message: `Booking ${booking.booking_reference} has been cancelled.`,
      },
    };

    const notifInfo = statusMessages[newStatus];
    if (notifInfo) {
      StorageService.addNotification({
        user_id: booking.staff_id,
        booking_id: booking.id,
        title: notifInfo.title,
        message: notifInfo.message,
        type: newStatus === 'cancelled' ? 'warning' : 'info',
        is_read: false,
      });
    }

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

    if (['completed', 'cancelled', 'in_transit'].includes(booking.status)) {
      return { success: false, error: `Cannot cancel a trip that is ${booking.status.replace('_', ' ')}.` };
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
