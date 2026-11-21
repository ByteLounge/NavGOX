import { describe, expect, it, beforeEach } from 'vitest';
import { BookingService, CreateBookingInput } from '../lib/booking-service';
import { StorageService } from '../lib/storage';
import { UserProfile } from '../types';

describe('MOPA Airport Booking Service Logic', () => {
  const passengerUser: UserProfile = {
    id: 'test-passenger-1',
    name: 'Passenger Test',
    email: 'p@mopa.aero',
    phone: '+91 99999 11111',
    role: 'passenger',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const employeeUser: UserProfile = {
    id: 'test-employee-1',
    name: 'Employee Test',
    email: 'e@gmrgroup.in',
    phone: '+91 99999 22222',
    role: 'employee',
    badge_number: 'EMP-900',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    StorageService.resetToDefaults();
  });

  it('rejects booking when pickup and destination are identical', () => {
    const input: CreateBookingInput = {
      pickup_location_id: 'loc-01', // Arrival
      destination_location_id: 'loc-01', // Arrival
      passenger_count: 1,
      booking_type: 'now',
      special_requirements: {
        luggage_assistance: false,
        wheelchair_accessible: false,
        special_assistance: false,
      },
    };

    const result = BookingService.validateBookingInput(input, 'passenger');
    expect(result.valid).toBe(false);
    expect(result.errors.destination_location_id).toContain('same location');
  });

  it('prevents public passenger from booking restricted operational locations (e.g. ATC Office)', () => {
    const input: CreateBookingInput = {
      pickup_location_id: 'loc-01', // Arrival
      destination_location_id: 'loc-07', // ATC Office (restricted)
      passenger_count: 1,
      booking_type: 'now',
      special_requirements: {
        luggage_assistance: false,
        wheelchair_accessible: false,
        special_assistance: false,
      },
    };

    const result = BookingService.validateBookingInput(input, 'passenger');
    expect(result.valid).toBe(false);
    expect(result.errors.destination_location_id).toContain('Security restriction');
  });

  it('allows airport employees with credentials to book restricted operational locations', () => {
    const input: CreateBookingInput = {
      pickup_location_id: 'loc-08', // GMR Office
      destination_location_id: 'loc-07', // ATC Office
      passenger_count: 2,
      booking_type: 'now',
      special_requirements: {
        luggage_assistance: false,
        wheelchair_accessible: false,
        special_assistance: false,
      },
    };

    const result = BookingService.validateBookingInput(input, 'employee');
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('rejects booking when passenger count is greater than maximum permitted (14)', () => {
    const input: CreateBookingInput = {
      pickup_location_id: 'loc-01',
      destination_location_id: 'loc-04',
      passenger_count: 18,
      booking_type: 'now',
      special_requirements: {
        luggage_assistance: false,
        wheelchair_accessible: false,
        special_assistance: false,
      },
    };

    const result = BookingService.validateBookingInput(input, 'passenger');
    expect(result.valid).toBe(false);
    expect(result.errors.passenger_count).toContain('Maximum passenger capacity');
  });

  it('prevents double assignment: cannot assign vehicle that is already engaged in active trip', () => {
    // bk-1001 is already on active trip with veh-01 in seed data
    const activeBooking = StorageService.getBookingById('bk-1001');
    expect(activeBooking?.status).toBe('in_transit');

    // Create a new pending booking
    const newBookingRes = BookingService.createBooking(
      {
        pickup_location_id: 'loc-05',
        destination_location_id: 'loc-06',
        passenger_count: 2,
        booking_type: 'now',
        special_requirements: {
          luggage_assistance: false,
          wheelchair_accessible: false,
          special_assistance: false,
        },
      },
      passengerUser
    );

    expect(newBookingRes.success).toBe(true);
    const newBookingId = newBookingRes.booking!.id;

    // Try to manually assign veh-01 (which is active on bk-1001)
    const assignResult = BookingService.assignVehicleAndDriver(
      newBookingId,
      'veh-01',
      'drv-04',
      'Operations Dispatcher',
      'ops-admin'
    );

    expect(assignResult.success).toBe(false);
    expect(assignResult.error).toContain('Conflict');
    expect(assignResult.error).toContain('currently engaged');
  });

  it('prevents assigning vehicle without wheelchair features when wheelchair assistance is required', () => {
    const newBookingRes = BookingService.createBooking(
      {
        pickup_location_id: 'loc-01',
        destination_location_id: 'loc-02',
        passenger_count: 2,
        booking_type: 'now',
        special_requirements: {
          luggage_assistance: false,
          wheelchair_accessible: true, // Wheelchair required
          special_assistance: false,
        },
      },
      passengerUser
    );

    const bookingId = newBookingRes.booking!.id;

    // veh-04 (Executive Innova MPV) does NOT have accessibility_features and is available
    const assignResult = BookingService.assignVehicleAndDriver(
      bookingId,
      'veh-04',
      'drv-04',
      'Operations Dispatcher',
      'ops-admin'
    );

    expect(assignResult.success).toBe(false);
    expect(assignResult.error).toContain('wheelchair accessibility');
  });

  it('progresses booking through the full airport transit lifecycle and releases resources on complete', () => {
    // Disable auto-dispatch to test manual dispatcher assignment sequence
    StorageService.saveSettings({ ...StorageService.getSettings(), auto_dispatch_enabled: false });

    // Create new booking for employee
    const newBookingRes = BookingService.createBooking(
      {
        pickup_location_id: 'loc-08',
        destination_location_id: 'loc-09',
        passenger_count: 2,
        booking_type: 'now',
        special_requirements: {
          luggage_assistance: false,
          wheelchair_accessible: false,
          special_assistance: false,
        },
      },
      employeeUser
    );
    const bookingId = newBookingRes.booking!.id;

    // Assign available vehicle (veh-05) and driver (drv-05)
    const assignRes = BookingService.assignVehicleAndDriver(
      bookingId,
      'veh-05',
      'drv-05',
      'Dispatcher Pooja',
      'usr-dispatcher-1'
    );
    expect(assignRes.success).toBe(true);

    // Sequence of transitions
    expect(BookingService.updateBookingStatus(bookingId, 'driver_accepted', 'Santosh Parab', 'drv-05').success).toBe(true);
    expect(BookingService.updateBookingStatus(bookingId, 'driver_arriving', 'Santosh Parab', 'drv-05').success).toBe(true);
    expect(BookingService.updateBookingStatus(bookingId, 'arrived_pickup', 'Santosh Parab', 'drv-05').success).toBe(true);
    expect(BookingService.updateBookingStatus(bookingId, 'passenger_onboard', 'Santosh Parab', 'drv-05').success).toBe(true);
    expect(BookingService.updateBookingStatus(bookingId, 'in_transit', 'Santosh Parab', 'drv-05').success).toBe(true);

    const midTripBooking = StorageService.getBookingById(bookingId)!;
    expect(midTripBooking.status).toBe('in_transit');
    expect(midTripBooking.started_at).toBeDefined();

    // Complete ride
    expect(BookingService.updateBookingStatus(bookingId, 'completed', 'Santosh Parab', 'drv-05').success).toBe(true);

    const finishedBooking = StorageService.getBookingById(bookingId)!;
    expect(finishedBooking.status).toBe('completed');
    expect(finishedBooking.completed_at).toBeDefined();

    const releasedVehicle = StorageService.getVehicles().find((v) => v.id === 'veh-05');
    const releasedDriver = StorageService.getDrivers().find((d) => d.id === 'drv-05');
    expect(releasedVehicle?.status).toBe('available');
    expect(releasedDriver?.status).toBe('available');
    expect(releasedDriver?.current_booking_id).toBeNull();
  });

  it('releases vehicle and driver when booking is cancelled', () => {
    // bk-1002 is at arrived_pickup with veh-02 and drv-02
    const booking = StorageService.getBookingById('bk-1002')!;
    expect(booking.assigned_vehicle_id).toBe('veh-02');
    expect(booking.assigned_driver_id).toBe('drv-02');

    const cancelRes = BookingService.cancelBooking(
      'bk-1002',
      'Passenger had flight gate changed',
      'Dispatcher Pooja',
      'usr-dispatcher-1'
    );

    expect(cancelRes.success).toBe(true);

    const cancelledBooking = StorageService.getBookingById('bk-1002')!;
    expect(cancelledBooking.status).toBe('cancelled');
    expect(cancelledBooking.cancellation_reason).toContain('Passenger had flight gate changed');

    const freedVehicle = StorageService.getVehicles().find((v) => v.id === 'veh-02');
    const freedDriver = StorageService.getDrivers().find((d) => d.id === 'drv-02');
    expect(freedVehicle?.status).toBe('available');
    expect(freedDriver?.status).toBe('available');
  });
});
