-- ==============================================================================
-- MANOHAR INTERNATIONAL AIRPORT (MOPA / GOX) - SEED DATA
-- Approved Airport Locations, Initial Fleet, Drivers, and Settings
-- ==============================================================================

-- 1. Insert Roles
INSERT INTO roles (name, description) VALUES
    ('passenger', 'Passenger travelling via MOPA airport with public campus access'),
    ('employee', 'Verified GMR, CISF, Airline, or Airport Ground employee'),
    ('driver', 'Campus transit shuttle and buggy operator'),
    ('dispatcher', 'Integrated Operations Control Center (IOCC) dispatch controller'),
    ('admin', 'Super administrator with full system and fleet oversight')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Approved MOPA Airport Locations
INSERT INTO locations (id, name, category, description, lat, lng, pickup_allowed, dropoff_allowed, is_active, is_restricted, restricted_roles, operating_hours, icon_name)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Arrival', 'Passenger Area', 'Ground Floor Arrival Kerbside & Pick-up Zones 1-4', 15.7330, 73.8625, true, true, true, false, ARRAY['passenger', 'employee', 'driver', 'dispatcher', 'admin']::user_role[], '24/7', 'PlaneLanding'),
    ('a0000000-0000-0000-0000-000000000002', 'Departure', 'Passenger Area', 'Upper Level Departure Kerbside, Gates 1-6 Forecourt', 15.7338, 73.8628, true, true, true, false, ARRAY['passenger', 'employee', 'driver', 'dispatcher', 'admin']::user_role[], '24/7', 'PlaneTakeoff'),
    ('a0000000-0000-0000-0000-000000000003', 'Main Terminal Building', 'Terminal', 'Central Terminal Entrance & Baggage Reclaim Transit Hub', 15.7335, 73.8620, true, true, true, false, ARRAY['passenger', 'employee', 'driver', 'dispatcher', 'admin']::user_role[], '24/7', 'Building2'),
    ('a0000000-0000-0000-0000-000000000004', 'Gox Village / Forecourt', 'Passenger Area', 'Outdoor Curated Promenade, Food Courtyard & Retail Village', 15.7325, 73.8632, true, true, true, false, ARRAY['passenger', 'employee', 'driver', 'dispatcher', 'admin']::user_role[], '06:00 - 02:00', 'Store'),
    ('a0000000-0000-0000-0000-000000000005', 'Airport Parking', 'Parking / Transport', 'Multi-level & Surface Public Car Parking Blocks P1-P4', 15.7315, 73.8638, true, true, true, false, ARRAY['passenger', 'employee', 'driver', 'dispatcher', 'admin']::user_role[], '24/7', 'CircleParking'),
    ('a0000000-0000-0000-0000-000000000006', 'Taxi Waiting Area', 'Parking / Transport', 'Commercial Taxi Bay & Inter-Campus Vehicle Staging Loop', 15.7318, 73.8648, true, true, true, false, ARRAY['passenger', 'employee', 'driver', 'dispatcher', 'admin']::user_role[], '24/7', 'Car'),
    ('a0000000-0000-0000-0000-000000000007', 'ATC Office', 'Airport Administration', 'Air Traffic Control Complex & Tower Administration Building', 15.7380, 73.8590, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7 (Restricted AAI/GMR Pass Only)', 'RadioTower'),
    ('a0000000-0000-0000-0000-000000000008', 'GMR Office', 'Airport Administration', 'GMR Goa International Airport Ltd (GGIAL) Executive Offices', 15.7308, 73.8615, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '08:00 - 20:00', 'Briefcase'),
    ('a0000000-0000-0000-0000-000000000009', 'Admin Building', 'Airport Administration', 'Campus Central HR, Finance & Operations Management Annex', 15.7302, 73.8608, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '08:00 - 19:00', 'Building'),
    ('a0000000-0000-0000-0000-000000000010', 'CISF Office', 'Security', 'Central Industrial Security Force Barracks & Airport Security HQ', 15.7295, 73.8618, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7 (Authorized Pass Only)', 'ShieldCheck'),
    ('a0000000-0000-0000-0000-000000000011', 'Canteen', 'Staff Facilities', 'Airport Employee Mess & Staff Welfare Dining Facility', 15.7300, 73.8628, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '06:00 - 23:30', 'UtensilsCrossed'),
    ('a0000000-0000-0000-0000-000000000012', 'Naka / Cargo Gate', 'Cargo', 'Heavy Cargo Inbound Checkpost & Commercial Access Barrier', 15.7355, 73.8710, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7', 'Truck'),
    ('a0000000-0000-0000-0000-000000000013', 'Naka Air Cargo', 'Cargo', 'Airside Cargo Security Verification Bay & Escort Checkpoint', 15.7350, 73.8695, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7', 'PackageCheck'),
    ('a0000000-0000-0000-0000-000000000014', 'Cargo Building', 'Cargo', 'Integrated Air Cargo Terminal, Customs Warehouse & Cold Chain', 15.7345, 73.8685, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7', 'Boxes'),
    ('a0000000-0000-0000-0000-000000000015', 'Flight Kitchen', 'Staff Facilities', 'Airline Catering Services & In-Flight Meal Production Facility', 15.7340, 73.8670, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7', 'Coffee'),
    ('a0000000-0000-0000-0000-000000000016', 'Gate House 1', 'Security', 'North Campus Perimeter Entry Point & Security Sentry', 15.7280, 73.8595, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7', 'ShieldAlert'),
    ('a0000000-0000-0000-0000-000000000017', 'Gate 2', 'Security', 'East Logistics & Technical Access Gate House', 15.7290, 73.8715, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7', 'KeyRound'),
    ('a0000000-0000-0000-0000-000000000018', 'Main Fire Station', 'Emergency Services', 'Category 9 Aircraft Rescue and Fire Fighting (ARFF) Base', 15.7390, 73.8655, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7 Emergency', 'Flame'),
    ('a0000000-0000-0000-0000-000000000019', 'Satellite Fire Station', 'Emergency Services', 'West Runway Secondary ARFF Emergency Response Unit', 15.7420, 73.8480, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7 Emergency', 'Siren'),
    ('a0000000-0000-0000-0000-000000000020', 'Airline Engineering and Maintenance Building', 'Technical / Maintenance', 'Ground Support Equipment (GSE) Workshops & Line Maintenance', 15.7360, 73.8665, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '24/7', 'Wrench'),
    ('a0000000-0000-0000-0000-000000000021', 'TMT Workshop', 'Technical / Maintenance', 'Transport Maintenance & Transit Fleet Servicing Depots', 15.7352, 73.8658, true, true, true, true, ARRAY['employee', 'dispatcher', 'admin']::user_role[], '07:00 - 22:00', 'Hammer')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Vehicles
INSERT INTO vehicles (id, registration_number, name, vehicle_type, passenger_capacity, luggage_capacity, accessibility_features, accessibility_description, status, current_location)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'GA-11-A-1024', 'Shuttle Alpha 1 (Coach)', 'Airport Shuttle', 14, 10, true, 'Hydraulic wheelchair ramp & low step entrance', 'available', 'Arrival'),
    ('b0000000-0000-0000-0000-000000000002', 'GA-11-EV-0101', 'Buggy Eco-Glide 1', 'Electric Buggy', 4, 2, false, null, 'available', 'Main Terminal Building'),
    ('b0000000-0000-0000-0000-000000000003', 'GA-11-EV-0102', 'Buggy Eco-Care (Accessible)', 'Electric Buggy', 3, 2, true, 'Dedicated low-profile wheelchair anchorage docking', 'available', 'Departure'),
    ('b0000000-0000-0000-0000-000000000004', 'GA-11-TX-4402', 'Executive Innova MPV', 'Passenger Car', 6, 4, false, null, 'available', 'Taxi Waiting Area'),
    ('b0000000-0000-0000-0000-000000000005', 'GA-11-UV-9011', 'Utility Transit Van', 'Utility Vehicle', 5, 8, true, 'Wide sliding side door with folding ramp', 'available', 'Admin Building'),
    ('b0000000-0000-0000-0000-000000000006', 'GA-11-A-1025', 'Shuttle Alpha 2', 'Airport Shuttle', 14, 10, true, 'Hydraulic wheelchair ramp', 'maintenance', 'TMT Workshop')
ON CONFLICT (registration_number) DO NOTHING;

-- 4. Insert Drivers
INSERT INTO drivers (id, full_name, contact_number, email, license_number, badge_number, status, employment_status, rating)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Rajesh Naik', '+91 98221 44001', 'rajesh.naik@mopa.aero', 'DL-GA-11-2018-091', 'MOPA-DRV-101', 'available', 'active', 4.90),
    ('c0000000-0000-0000-0000-000000000002', 'Amit Sawant', '+91 98221 44002', 'amit.sawant@mopa.aero', 'DL-GA-11-2019-142', 'MOPA-DRV-102', 'available', 'active', 4.80),
    ('c0000000-0000-0000-0000-000000000003', 'Rohan Vernekar', '+91 98221 44003', 'rohan.vernekar@mopa.aero', 'DL-GA-11-2020-205', 'MOPA-DRV-103', 'available', 'active', 5.00),
    ('c0000000-0000-0000-0000-000000000004', 'Premanand Gaonkar', '+91 98221 44004', 'premanand.g@mopa.aero', 'DL-GA-11-2017-088', 'MOPA-DRV-104', 'available', 'active', 4.70),
    ('c0000000-0000-0000-0000-000000000005', 'Santosh Parab', '+91 98221 44005', 'santosh.parab@mopa.aero', 'DL-GA-11-2021-319', 'MOPA-DRV-105', 'available', 'active', 4.85)
ON CONFLICT (license_number) DO NOTHING;

-- Associate drivers to initial vehicles
UPDATE vehicles SET assigned_driver_id = 'c0000000-0000-0000-0000-000000000001' WHERE id = 'b0000000-0000-0000-0000-000000000001';
UPDATE vehicles SET assigned_driver_id = 'c0000000-0000-0000-0000-000000000002' WHERE id = 'b0000000-0000-0000-0000-000000000002';
UPDATE vehicles SET assigned_driver_id = 'c0000000-0000-0000-0000-000000000003' WHERE id = 'b0000000-0000-0000-0000-000000000003';
UPDATE vehicles SET assigned_driver_id = 'c0000000-0000-0000-0000-000000000004' WHERE id = 'b0000000-0000-0000-0000-000000000004';
UPDATE vehicles SET assigned_driver_id = 'c0000000-0000-0000-0000-000000000005' WHERE id = 'b0000000-0000-0000-0000-000000000005';

UPDATE drivers SET assigned_vehicle_id = 'b0000000-0000-0000-0000-000000000001' WHERE id = 'c0000000-0000-0000-0000-000000000001';
UPDATE drivers SET assigned_vehicle_id = 'b0000000-0000-0000-0000-000000000002' WHERE id = 'c0000000-0000-0000-0000-000000000002';
UPDATE drivers SET assigned_vehicle_id = 'b0000000-0000-0000-0000-000000000003' WHERE id = 'c0000000-0000-0000-0000-000000000003';
UPDATE drivers SET assigned_vehicle_id = 'b0000000-0000-0000-0000-000000000004' WHERE id = 'c0000000-0000-0000-0000-000000000004';
UPDATE drivers SET assigned_vehicle_id = 'b0000000-0000-0000-0000-000000000005' WHERE id = 'c0000000-0000-0000-0000-000000000005';
