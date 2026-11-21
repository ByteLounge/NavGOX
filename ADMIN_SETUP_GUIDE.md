# MANOHAR INTERNATIONAL AIRPORT (MOPA / GOX)
## INTER-CAMPUS TRANSPORTATION SYSTEM — ADMINISTRATOR & DEPLOYMENT GUIDE

This document serves as the official operational and engineering deployment manual for **NavGOX**, the exclusive internal campus ground mobility and taxi dispatch platform for **Manohar International Airport (MOPA / GOX), Pernem, Goa, India**.

---

## 1. ARCHITECTURE OVERVIEW

NavGOX is architected with a production Next.js 14/15 App Router front-and-backend stack, PostgreSQL database with Row Level Security (RLS) policies, atomic server transaction functions for vehicle double-assignment prevention, and Leaflet aerodrome mapping.

### Dual-Engine Capability:
1. **Cloud Production Mode**: Powered by Supabase PostgreSQL with real-time replication and BCAS-compliant role-based security.
2. **Instant Test / Demo Mode**: Built-in reactive in-memory & local persistence engine with full seed dataset of all 21 official MOPA locations, 6 vehicles, 5 drivers, and 5 distinct user roles.

---

## 2. PREREQUISITES & ENVIRONMENT SETUP

### System Requirements:
- Node.js 18.x or 20.x+
- npm or pnpm
- A Supabase account (free or enterprise tier)

### Environment Variables:
Copy `.env.example` to `.env.local` in the project root:

```env
# Supabase Database & Auth Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Application Settings
NEXT_PUBLIC_CAMPUS_NAME="Manohar International Airport (MOPA / GOX)"
NEXT_PUBLIC_AIRPORT_CODE="GOX"
```

> **Note:** If `NEXT_PUBLIC_SUPABASE_URL` is omitted or unconfigured during testing, NavGOX automatically operates in Standalone Offline/Demo Mode with complete interactive functionality.

---

## 3. SUPABASE PROJECT CREATION & DATABASE MIGRATION

### Step 1: Create Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. Click **New project**.
3. Set project name: `mopa-navgox-transport`.
4. Choose region: **South Asia (Mumbai)** for optimal latency to Goa.
5. Set a secure database password and create the project.

### Step 2: Execute Schema Migrations
1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **New Query**.
3. Open `supabase/migrations/20261121_init_mopa_transport.sql` from this repository.
4. Paste the complete SQL migration into the query window and click **Run**.
5. This initializes all 13 required relational tables:
   - `roles`
   - `profiles`
   - `locations`
   - `vehicles`
   - `drivers`
   - `bookings`
   - `booking_status_history`
   - `notifications`
   - `vehicle_assignments`
   - `operating_hours`
   - `approved_routes`
   - `audit_logs`
   - `system_settings`
   Along with indexes, foreign key constraints, atomic assignment functions (`assign_vehicle_and_driver_atomic`), and Row Level Security (RLS) policies.

---

## 4. SEEDING APPROVED AIRPORT LOCATIONS & INITIAL FLEET

1. In the Supabase **SQL Editor**, open another new query window.
2. Open `supabase/seed.sql` from this repository.
3. Paste and run the script.
4. This seeds the official **21 designated MOPA airport campus locations**:

### Public Passenger Locations:
1. **Arrival**: Ground Floor Arrival Kerbside & Pick-up Zones 1-4
2. **Departure**: Upper Level Departure Kerbside, Gates 1-6 Forecourt
3. **Main Terminal Building**: Central Entrance & Baggage Reclaim
4. **Gox Village / Forecourt**: Curated Promenade & Food Court
5. **Airport Parking**: Blocks P1-P4
6. **Taxi Waiting Area**: Commercial & Shuttle Staging Loop

### Operational & Restricted Administration Locations:
7. **ATC Office**: Air Traffic Control Tower & Radar Complex
8. **GMR Office**: GGIAL Executive Headquarters
9. **Admin Building**: Operations Annex
10. **CISF Office**: Airport Security Command Barracks
11. **Canteen**: Staff Welfare Dining Facility
12. **Naka / Cargo Gate**: Cargo Access Checkpost
13. **Naka Air Cargo**: Airside Cargo Verification
14. **Cargo Building**: Cold Chain & Customs Terminal
15. **Flight Kitchen**: In-Flight Catering Production
16. **Gate House 1**: North Perimeter Sentry
17. **Gate 2**: East Logistics Gate
18. **Main Fire Station**: Category 9 ARFF Crash Station
19. **Satellite Fire Station**: Runway West Emergency Post
20. **Airline Engineering and Maintenance Building**: GSE Workshop
21. **TMT Workshop**: Transit Maintenance Depot

---

## 5. CREATING THE FIRST SUPER ADMINISTRATOR

To establish the initial Super Administrator account:

1. In the Supabase Dashboard, navigate to **Authentication** > **Users** > **Add user**.
2. Enter email: `admin@mopa.aero` and set a secure production password.
3. Once created, copy the generated user `UID`.
4. Open the **SQL Editor** and link the auth record to the admin profile:

```sql
INSERT INTO profiles (id, email, full_name, phone, role, badge_number, department, is_active)
VALUES (
    'YOUR-USER-UID-HERE',
    'admin@mopa.aero',
    'Commander Alok Deshmukh',
    '+91 832 249 9001',
    'admin',
    'MOPA-DIR-001',
    'Directorate of Airport Security & Ground Systems',
    true
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## 6. ADDING DRIVERS AND FLEET VEHICLES

Administrators can add vehicles and drivers either directly in the database or via the **Ops & Dispatch Dashboard** (`/admin`):

### Via Ops Console (`/admin`):
1. Navigate to the **Vehicles** tab and click **Add Vehicle**.
2. Enter the Goa transport registration plate (e.g. `GA-11-A-1026`), passenger capacity, vehicle type, and whether it has wheelchair ramp accessibility features.
3. Navigate to the **Drivers** tab and click **Add Driver**.
4. Enter the driver's full name, contact number, license number, and MOPA Airport Badge ID.
5. Link the driver to an active vehicle.

---

## 7. USER ROLES & PERMISSIONS HIERARCHY

| Role | Interface Route | Permitted Locations | Actions |
| :--- | :--- | :--- | :--- |
| **Passenger** | `/dashboard` | Public locations only (Arrival, Departure, Terminal, Forecourt, Parking, Taxi Bay) | Book now/scheduled, view status, track ride, cancel before transit |
| **Employee** | `/dashboard` | All 21 campus locations (including ATC, GMR, CISF, Cargo, Maintenance) | Book inter-campus shuttle, specify department, track ride |
| **Driver** | `/driver` | Assigned routes | Accept trips, mark arrived at pickup, mark passenger onboard, complete trip, toggle shift status |
| **Dispatcher** | `/admin` | All campus locations | View live queue, execute atomic vehicle/driver assignments, resolve double-booking conflicts, cancel with reason |
| **Admin** | `/admin` | Complete oversight | Manage locations, manage fleet, edit user roles, inspect security audit logs, configure system helplines |

---

## 8. PRODUCTION DEPLOYMENT (VERCEL)

### Step 1: Push Code to Git Repository
```bash
git add .
git commit -m "feat: complete MOPA airport campus transport system"
git branch -M main
git remote add origin https://github.com/your-org/navgox.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Import repository on [https://vercel.com](https://vercel.com).
2. Set Framework Preset: **Next.js**.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.

---

## 9. EMERGENCY PROTOCOLS & HELPLINES

- **GMR IOCC Helpline**: `+91 832 249 9000`
- **CISF Control Room**: `+91 832 249 9100`
- **Taxi Dispatch Bay**: `+91 832 249 9010`
