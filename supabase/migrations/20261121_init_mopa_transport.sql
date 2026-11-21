-- ==============================================================================
-- MANOHAR INTERNATIONAL AIRPORT (MOPA / GOX) - INTER-CAMPUS TRANSPORTATION SYSTEM
-- Database Migration: Full Production Schema with RLS and Atomic Functions
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('passenger', 'employee', 'driver', 'dispatcher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE location_category AS ENUM (
        'Passenger Area',
        'Terminal',
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
    CREATE TYPE vehicle_status AS ENUM ('available', 'assigned', 'on_trip', 'maintenance', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE driver_status AS ENUM ('available', 'assigned', 'on_trip', 'offline', 'on_break');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'requested',
        'searching',
        'assigned',
        'driver_accepted',
        'driver_arriving',
        'arrived_pickup',
        'passenger_onboard',
        'in_transit',
        'completed',
        'cancelled',
        'rejected'
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
    role user_role DEFAULT 'passenger' NOT NULL,
    badge_number TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Approved Airport Locations Table
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
    is_restricted BOOLEAN DEFAULT FALSE NOT NULL,
    restricted_roles user_role[] DEFAULT ARRAY['passenger'::user_role, 'employee'::user_role, 'driver'::user_role, 'dispatcher'::user_role, 'admin'::user_role],
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

-- Add foreign key back to vehicles table for assigned driver
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS fk_vehicles_driver;
ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_driver FOREIGN KEY (assigned_driver_id) REFERENCES drivers(id) ON DELETE SET NULL;

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL,
    passenger_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    pickup_location_id UUID REFERENCES locations(id) ON DELETE RESTRICT NOT NULL,
    destination_location_id UUID REFERENCES locations(id) ON DELETE RESTRICT NOT NULL,
    passenger_count INT NOT NULL CHECK (passenger_count >= 1 AND passenger_count <= 14),
    booking_type TEXT DEFAULT 'now' NOT NULL CHECK (booking_type IN ('now', 'scheduled')),
    scheduled_at TIMESTAMPTZ,
    status booking_status DEFAULT 'requested' NOT NULL,
    assigned_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    special_requirements JSONB DEFAULT '{"luggage_assistance": false, "wheelchair_accessible": false, "special_assistance": false}'::JSONB NOT NULL,
    notes TEXT DEFAULT '',
    cancellation_reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    assigned_at TIMESTAMPTZ,
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

-- 9. Vehicle Assignments Log Table
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT NOT NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE RESTRICT NOT NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    released_at TIMESTAMPTZ
);

-- 10. Operating Hours Configuration
CREATE TABLE IF NOT EXISTS operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_24_hours BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 11. Approved Internal Campus Routes Table
CREATE TABLE IF NOT EXISTS approved_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name TEXT NOT NULL,
    from_location_id UUID REFERENCES locations(id) ON DELETE RESTRICT NOT NULL,
    to_location_id UUID REFERENCES locations(id) ON DELETE RESTRICT NOT NULL,
    estimated_duration_minutes INT DEFAULT 5 NOT NULL,
    is_airside_escort_required BOOLEAN DEFAULT FALSE NOT NULL,
    allowed_vehicle_types TEXT[] DEFAULT ARRAY['Airport Shuttle', 'Electric Buggy', 'Passenger Car', 'Utility Vehicle'],
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role user_role NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for high-performance operations
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON bookings(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON bookings(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_locations_category ON locations(category);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

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
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view their own profile; Dispatchers/Admins can view all
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR get_current_user_role() IN ('dispatcher', 'admin'));

CREATE POLICY "Users can update own non-role profile fields" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to profiles" ON profiles
    FOR ALL USING (get_current_user_role() = 'admin');

-- Locations: Active approved locations visible according to role
CREATE POLICY "Locations read access" ON locations
    FOR SELECT USING (
        is_active = true AND (
            is_restricted = false
            OR get_current_user_role() = ANY(restricted_roles)
            OR get_current_user_role() IN ('dispatcher', 'admin')
        )
    );

CREATE POLICY "Admins and dispatchers manage locations" ON locations
    FOR ALL USING (get_current_user_role() IN ('dispatcher', 'admin'));

-- Vehicles & Drivers: Everyone authenticated can view vehicles & drivers; Admins manage
CREATE POLICY "View vehicles" ON vehicles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage vehicles" ON vehicles
    FOR ALL USING (get_current_user_role() IN ('dispatcher', 'admin'));

CREATE POLICY "View drivers" ON drivers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage drivers" ON drivers
    FOR ALL USING (get_current_user_role() IN ('dispatcher', 'admin'));

-- Bookings:
-- 1. Passengers & Employees can view their own bookings
-- 2. Assigned drivers can view their assigned bookings
-- 3. Dispatchers & Admins can view and manage all bookings
CREATE POLICY "Passengers view own bookings" ON bookings
    FOR SELECT USING (
        passenger_id = auth.uid()
        OR assigned_driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
        OR get_current_user_role() IN ('dispatcher', 'admin')
    );

CREATE POLICY "Users can create own booking" ON bookings
    FOR INSERT WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "Users can cancel own booking before transit" ON bookings
    FOR UPDATE USING (
        (passenger_id = auth.uid() AND status IN ('requested', 'searching', 'assigned'))
        OR assigned_driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
        OR get_current_user_role() IN ('dispatcher', 'admin')
    );

-- Notifications
CREATE POLICY "Users view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Audit Logs: Dispatchers and Admins can view
CREATE POLICY "Audit logs visible to ops and admin" ON audit_logs
    FOR SELECT USING (get_current_user_role() IN ('dispatcher', 'admin'));

-- ==============================================================================
-- ATOMIC TRANSACTION FUNCTION: Assign Vehicle & Driver with Concurrency Lock
-- ==============================================================================
CREATE OR REPLACE FUNCTION assign_vehicle_and_driver_atomic(
    p_booking_id UUID,
    p_vehicle_id UUID,
    p_driver_id UUID,
    p_dispatcher_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_booking RECORD;
    v_vehicle RECORD;
    v_driver RECORD;
    v_conflict_booking RECORD;
BEGIN
    -- Lock booking row
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking record not found.');
    END IF;

    IF v_booking.status IN ('completed', 'cancelled', 'rejected') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot assign vehicle to completed or cancelled booking.');
    END IF;

    -- Lock vehicle row
    SELECT * INTO v_vehicle FROM vehicles WHERE id = p_vehicle_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Vehicle record not found.');
    END IF;

    IF v_vehicle.status = 'maintenance' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Vehicle is currently grounded for maintenance.');
    END IF;

    -- Lock driver row
    SELECT * INTO v_driver FROM drivers WHERE id = p_driver_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Driver record not found.');
    END IF;

    -- Concurrency check: Ensure vehicle is not on another active trip
    SELECT * INTO v_conflict_booking FROM bookings
    WHERE id <> p_booking_id
      AND assigned_vehicle_id = p_vehicle_id
      AND status IN ('assigned', 'driver_accepted', 'driver_arriving', 'arrived_pickup', 'passenger_onboard', 'in_transit')
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Conflict: Vehicle is currently engaged on active trip ' || v_conflict_booking.booking_reference
        );
    END IF;

    -- Capacity check
    IF v_vehicle.passenger_capacity < v_booking.passenger_count THEN
        RETURN jsonb_build_object('success', false, 'error', 'Vehicle capacity is less than required passenger count.');
    END IF;

    -- Perform Assignment
    UPDATE vehicles SET status = 'assigned' WHERE id = p_vehicle_id;
    UPDATE drivers SET status = 'assigned', current_booking_id = p_booking_id WHERE id = p_driver_id;
    UPDATE bookings SET
        assigned_vehicle_id = p_vehicle_id,
        assigned_driver_id = p_driver_id,
        status = 'assigned',
        assigned_at = NOW(),
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- Insert Status History
    INSERT INTO booking_status_history (booking_id, status, changed_by_user_id, changed_by_name, notes)
    VALUES (
        p_booking_id,
        'assigned',
        p_dispatcher_id,
        'Dispatcher',
        'Vehicle ' || v_vehicle.registration_number || ' and Driver ' || v_driver.full_name || ' assigned'
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
