-- ==============================================================================
-- MANOHAR INTERNATIONAL AIRPORT (MOPA / GOX) - STAFF & DRIVER TRANSIT SYSTEM
-- Database Migration: Simplified Staff & Driver Schema with RLS & Atomic Accept
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums (Simplified to Staff & Driver)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('staff', 'driver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE location_category AS ENUM (
        'Terminal & Forecourt',
        'Airport Administration',
        'Security',
        'Cargo',
        'Staff Facilities',
        'Technical / Maintenance',
        'Emergency Services',
        'Parking / Transport'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('available', 'on_trip', 'maintenance', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE driver_status AS ENUM ('available', 'on_trip', 'offline', 'on_break');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'requested',
        'driver_accepted',
        'in_transit',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Roles Definition Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role user_role DEFAULT 'staff' NOT NULL,
    badge_number TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Approved Airport Premises Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category location_category NOT NULL,
    description TEXT NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    pickup_allowed BOOLEAN DEFAULT TRUE NOT NULL,
    dropoff_allowed BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    operating_hours TEXT DEFAULT '24/7' NOT NULL,
    icon_name TEXT DEFAULT 'MapPin' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    passenger_capacity INT NOT NULL CHECK (passenger_capacity >= 1),
    luggage_capacity INT NOT NULL DEFAULT 2,
    accessibility_features BOOLEAN DEFAULT FALSE NOT NULL,
    accessibility_description TEXT,
    status vehicle_status DEFAULT 'available' NOT NULL,
    current_location TEXT DEFAULT 'Main Terminal Building',
    assigned_driver_id UUID,
    last_maintenance_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    badge_number TEXT UNIQUE NOT NULL,
    assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    status driver_status DEFAULT 'available' NOT NULL,
    current_booking_id UUID,
    employment_status TEXT DEFAULT 'active' NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS fk_vehicles_driver;
ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_driver FOREIGN KEY (assigned_driver_id) REFERENCES drivers(id) ON DELETE SET NULL;

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL,
    staff_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    pickup_location_id UUID REFERENCES locations(id) ON DELETE RESTRICT NOT NULL,
    destination_location_id UUID REFERENCES locations(id) ON DELETE RESTRICT NOT NULL,
    passenger_count INT NOT NULL CHECK (passenger_count >= 1 AND passenger_count <= 14),
    booking_type TEXT DEFAULT 'now' NOT NULL CHECK (booking_type IN ('now', 'scheduled')),
    scheduled_at TIMESTAMPTZ,
    status booking_status DEFAULT 'requested' NOT NULL,
    assigned_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    special_requirements JSONB DEFAULT '{"luggage_assistance": false, "wheelchair_accessible": false}'::JSONB NOT NULL,
    notes TEXT DEFAULT '',
    cancellation_reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_different_locations CHECK (pickup_location_id <> destination_location_id)
);

-- 7. Booking Status History
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    status booking_status NOT NULL,
    changed_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    changed_by_name TEXT NOT NULL,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL CHECK (type IN ('info', 'success', 'warning', 'alert')),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_staff ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON bookings(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON bookings(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations(category);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR get_current_user_role() = 'driver');

CREATE POLICY "Users can update own non-role profile fields" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Locations readable by staff and drivers" ON locations
    FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "View vehicles" ON vehicles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "View drivers" ON drivers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff and drivers view relevant bookings" ON bookings
    FOR SELECT USING (
        staff_id = auth.uid()
        OR (get_current_user_role() = 'driver' AND status = 'requested')
        OR assigned_driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

CREATE POLICY "Staff can create own booking" ON bookings
    FOR INSERT WITH CHECK (staff_id = auth.uid() AND get_current_user_role() = 'staff');

CREATE POLICY "Staff cancel or driver update assigned booking" ON bookings
    FOR UPDATE USING (
        (staff_id = auth.uid() AND status IN ('requested', 'driver_accepted'))
        OR assigned_driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );

CREATE POLICY "Users view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ==============================================================================
-- ATOMIC TRANSACTION FUNCTION: Driver Accepts Staff Pickup Request
-- ==============================================================================
CREATE OR REPLACE FUNCTION accept_staff_booking_atomic(
    p_booking_id UUID,
    p_driver_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_booking RECORD;
    v_vehicle RECORD;
    v_driver RECORD;
    v_conflict_booking RECORD;
BEGIN
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking record not found.');
    END IF;

    IF v_booking.status <> 'requested' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking is no longer waiting for pickup.');
    END IF;

    SELECT * INTO v_driver FROM drivers WHERE id = p_driver_id FOR UPDATE;
    IF NOT FOUND OR v_driver.assigned_vehicle_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Driver or assigned vehicle not found.');
    END IF;

    SELECT * INTO v_vehicle FROM vehicles WHERE id = v_driver.assigned_vehicle_id FOR UPDATE;
    IF NOT FOUND OR v_vehicle.status IN ('maintenance', 'offline') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Assigned vehicle is unavailable.');
    END IF;

    SELECT * INTO v_conflict_booking FROM bookings
    WHERE id <> p_booking_id
      AND (assigned_driver_id = p_driver_id OR assigned_vehicle_id = v_vehicle.id)
      AND status IN ('driver_accepted', 'in_transit')
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Driver or vehicle is already on active trip ' || v_conflict_booking.booking_reference
        );
    END IF;

    IF v_vehicle.passenger_capacity < v_booking.passenger_count THEN
        RETURN jsonb_build_object('success', false, 'error', 'Vehicle capacity is less than required staff count.');
    END IF;

    UPDATE vehicles SET status = 'on_trip' WHERE id = v_vehicle.id;
    UPDATE drivers SET status = 'on_trip', current_booking_id = p_booking_id WHERE id = p_driver_id;
    UPDATE bookings SET
        assigned_vehicle_id = v_vehicle.id,
        assigned_driver_id = p_driver_id,
        status = 'driver_accepted',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_booking_id;

    INSERT INTO booking_status_history (booking_id, status, changed_by_user_id, changed_by_name, notes)
    VALUES (
        p_booking_id,
        'driver_accepted',
        v_driver.user_id,
        v_driver.full_name,
        'Driver ' || v_driver.full_name || ' accepted pickup in ' || v_vehicle.registration_number
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
