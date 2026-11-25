import { describe, expect, it, beforeEach } from 'vitest';
import { BookingService, CreateBookingInput } from '../lib/booking-service';
import { StorageService } from '../lib/storage';
import { UserProfile } from '../types';

describe('MOPA Airport Staff & Driver Pickup Service', () => {
  const staffUser: UserProfile = {
    id: 'test-staff-1',
    name: 'Vikram Joshi',
    email: 'vikram.joshi@mopa.aero',
    phone: '+91 98230 44556',
    role: 'staff',
    badge_number: 'GGIAL-EMP-4089',
    department: 'Airport Operations',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const driverUser: UserProfile = {
    id: 'test-driver-1',
    name: 'Rajesh Naik',
    email: 'rajesh.naik@mopa.aero',
    phone: '+91 98221 44001',
    role: 'driver',
    badge_number: 'MOPA-DRV-101',
    department: 'Campus Transport Fleet',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    StorageService.resetToDefaults();
  });

  it('rejects booking when pickup and drop-off are identical', () => {
    const input: CreateBookingInput = {
      pickup_location_id: 'loc-08',
      destination_location_id: 'loc-08',
      passenger_count: 1,
      booking_type: 'now',
      special_requirements: {
        luggage_assistance: false,
        wheelchair_accessible: false,
      },
    };

    const result = BookingService.validateBookingInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.destination_location_id).toContain('same location');
  });

  it('rejects locations outside the approved airport premises list', () => {
    const input: CreateBookingInput = {
      pickup_location_id: 'loc-08',
      destination_location_id: 'outside-panaji',
      passenger_count: 1,
      booking_type: 'now',
      special_requirements: {
        luggage_assistance: false,
        wheelchair_accessible: false,
      },
    };

    const result = BookingService.validateBookingInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.destination_location_id).toContain('airport premises');
  });

  it('allows airport staff to request pickup between any active airport premises locations', () => {
    const input: CreateBookingInput = {
      pickup_location_id: 'loc-08', // GMR Office
      destination_location_id: 'loc-07', // ATC Office
      passenger_count: 2,
      booking_type: 'now',
      special_requirements: {
        luggage_assistance: false,
        wheelchair_accessible: false,
      },
    };

    const result = BookingService.createBooking(input, staffUser);
    expect(result.success).toBe(true);
    expect(result.booking?.status).toBe('requested');
    expect(result.booking?.staff_id).toBe(staffUser.id);
  });

  it('prevents driver accounts from submitting staff ride requests', () => {
    const input: CreateBookingInput = {
      pickup_location_id: 'loc-01',
      destination_location_id: 'loc-07',
      passenger_count: 1,
      booking_type: 'now',
      special_requirements: {
        luggage_assistance: false,
        wheelchair_accessible: false,
      },
    };

    const result = BookingService.createBooking(input, driverUser);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Only airport staff');
  });

  it('rejects booking when rider count exceeds maximum vehicle capacity (14)', () => {
    const input: CreateBookingInput = {
      pickup_location_id: 'loc-01',
      destination_location_id: 'loc-04',
      passenger_count: 18,
      booking_type: 'now',
      special_requirements: {
        luggage_assistance: false,
        wheelchair_accessible: false,
      },
    };

    const result = BookingService.validateBookingInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.passenger_count).toContain('Maximum capacity');
  });

  it('prevents double assignment when driver or vehicle is already on an active trip', () => {
    // Seed bk-1002 is in_transit with drv-02 and veh-02
    const activeBooking = StorageService.getBookingById('bk-1002');
    expect(activeBooking?.status).toBe('in_transit');

    const newReq = BookingService.createBooking(
      {
        pickup_location_id: 'loc-05',
        destination_location_id: 'loc-09',
        passenger_count: 2,
        booking_type: 'now',
        special_requirements: {
          luggage_assistance: false,
          wheelchair_accessible: false,
        },
      },
      staffUser
    );

    expect(newReq.success).toBe(true);
    const acceptRes = BookingService.acceptBooking(newReq.booking!.id, 'drv-02');
    expect(acceptRes.success).toBe(false);
    expect(acceptRes.error).toContain('already on an active trip');
  });

  it('prevents driver without wheelchair ramp vehicle from accepting accessible ride request', () => {
    const req = BookingService.createBooking(
      {
        pickup_location_id: 'loc-01',
        destination_location_id: 'loc-03',
        passenger_count: 2,
        booking_type: 'now',
        special_requirements: {
          luggage_assistance: false,
          wheelchair_accessible: true,
        },
      },
      staffUser
    );

    expect(req.success).toBe(true);
    // drv-04 drives veh-04 (Executive Innova MPV) which does not have accessibility_features
    const acceptRes = BookingService.acceptBooking(req.booking!.id, 'drv-04');
    expect(acceptRes.success).toBe(false);
    expect(acceptRes.error).toContain('wheelchair ramp access');
  });

  it('completes the simplified Staff Request -> Driver Accept -> Picked Up -> Dropped Off lifecycle', () => {
    const req = BookingService.createBooking(
      {
        pickup_location_id: 'loc-08',
        destination_location_id: 'loc-09',
        passenger_count: 2,
        booking_type: 'now',
        special_requirements: {
          luggage_assistance: false,
          wheelchair_accessible: false,
        },
      },
      staffUser
    );
    expect(req.success).toBe(true);
    const bookingId = req.booking!.id;

    // Driver accepts pickup
    const acceptRes = BookingService.acceptBooking(bookingId, 'drv-05');
    expect(acceptRes.success).toBe(true);
    expect(StorageService.getBookingById(bookingId)?.status).toBe('driver_accepted');

    // Driver confirms staff picked up
    expect(
      BookingService.updateBookingStatus(bookingId, 'in_transit', 'Santosh Parab', 'drv-05').success
    ).toBe(true);
    const inTransitBooking = StorageService.getBookingById(bookingId)!;
    expect(inTransitBooking.status).toBe('in_transit');
    expect(inTransitBooking.started_at).toBeDefined();

    // Driver confirms dropped off -> releases driver and vehicle
    expect(
      BookingService.updateBookingStatus(bookingId, 'completed', 'Santosh Parab', 'drv-05').success
    ).toBe(true);
    const completedBooking = StorageService.getBookingById(bookingId)!;
    expect(completedBooking.status).toBe('completed');
    expect(completedBooking.completed_at).toBeDefined();

    const releasedVehicle = StorageService.getVehicles().find((v) => v.id === 'veh-05');
    const releasedDriver = StorageService.getDrivers().find((d) => d.id === 'drv-05');
    expect(releasedVehicle?.status).toBe('available');
    expect(releasedDriver?.status).toBe('available');
    expect(releasedDriver?.current_booking_id).toBeNull();
  });

  it('releases driver and vehicle when a ride request is cancelled before pickup', () => {
    const req = BookingService.createBooking(
      {
        pickup_location_id: 'loc-08',
        destination_location_id: 'loc-14',
        passenger_count: 1,
        booking_type: 'now',
        special_requirements: {
          luggage_assistance: false,
          wheelchair_accessible: false,
        },
      },
      staffUser
    );
    const bookingId = req.booking!.id;

    expect(BookingService.acceptBooking(bookingId, 'drv-01').success).toBe(true);
    expect(StorageService.getVehicles().find((v) => v.id === 'veh-01')?.status).toBe('on_trip');

    const cancelRes = BookingService.cancelBooking(
      bookingId,
      'Shift assignment changed',
      staffUser.name,
      staffUser.id
    );
    expect(cancelRes.success).toBe(true);
    expect(StorageService.getBookingById(bookingId)?.status).toBe('cancelled');
    expect(StorageService.getVehicles().find((v) => v.id === 'veh-01')?.status).toBe('available');
    expect(StorageService.getDrivers().find((d) => d.id === 'drv-01')?.status).toBe('available');
  });
});
