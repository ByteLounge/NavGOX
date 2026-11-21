# NavGOX — MOPA Airport Inter-Campus Taxi Booking System
### Manohar International Airport (MOPA / GOX), Pernem, Goa, India

**NavGOX** is a production-grade, responsive internal airport transportation and fleet management web platform built exclusively for **Manohar International Airport (MOPA / GOX)**. It connects passengers, airport employees, GMR ground teams, CISF security personnel, cargo staff, and airline technical crews across 21 designated campus locations.

> **Operational Scope Note:** This system is strictly an internal airport campus transportation platform. It is **not** a general-purpose taxi booking app for travelling around the state of Goa.

---

## ✈️ System Capabilities & Architecture

- **Role-Based Access Control (RBAC):**
  - **Passenger:** Request transit between public approved points (Arrival, Departure, Terminal, GOX Village, Parking, Taxi Bay), view live step timeline, track assigned driver and vehicle, cancel before transit.
  - **Airport Employee:** Request on-demand or scheduled campus transit between all 21 locations, including restricted security and operations complexes (ATC Office, GMR Headquarters, Cargo complexes, Maintenance hangars).
  - **Driver:** Dedicated operations console, vehicle acceptance, one-click sequential status advancing (*Driver Arriving* → *At Pickup* → *Passenger Onboard* → *In Transit* → *Completed*), passenger contact, and shift history.
  - **Dispatcher (IOCC):** Real-time incoming request queue, smart automated vehicle matching, manual dispatch modal with capacity/accessibility verification, double-booking conflict protection, cancellation with logged audit reason.
  - **Super Administrator:** Complete system oversight of locations, fleet vehicles, drivers, user permissions, immutable security audit logs, and airport operating parameters.

- **Double-Assignment Prevention & Atomic Operations:**
  - Strict concurrency verification: Vehicles and drivers cannot be assigned if already engaged in an active trip.
  - Capacity & Accessibility rules: Ensures passenger count does not exceed vehicle capacity and matches wheelchair-accessible vehicles when ramp access is required.
  - Automatic resource release: Vehicles and drivers are atomically returned to `available` staging status when trips are marked completed or cancelled.

- **Official Aerodrome Map & Route Visualisation:**
  - Built with Leaflet and CartoDB Voyager tiles centered on MOPA coordinates `[15.7645, 73.8680]`.
  - Displays approved pickup bays, destination markers, campus boundary overlay, and Runway 09/27 non-vehicular movement restriction zone.
  - Interactive schematic internal perimeter route strictly avoiding runways and aircraft movement areas.

- **Dual-Engine Cloud & Standalone Demo Architecture:**
  - Connects to Supabase PostgreSQL with Row Level Security (RLS) when environment variables are supplied.
  - Simultaneously includes a zero-configuration, reactive local storage & event bus engine with full seed dataset of all 21 official locations, 6 vehicles, 5 drivers, and instant 1-click test persona switching in the header.

---

## 📍 21 Approved Campus Locations

| Category | Locations | Access Level |
| :--- | :--- | :--- |
| **Passenger & Public Areas** | Arrival, Departure, Main Terminal Building, GOX Village / Forecourt, Airport Parking, Taxi Waiting Area | Public & Passenger |
| **Airport Administration** | ATC Office, GMR Office, Admin Building | Employee Pass Required |
| **Security & Police** | CISF Office, Gate House 1, Gate 2 | Restricted AAI/CISF Pass |
| **Cargo & Catering** | Naka Cargo Gate, Naka Air Cargo Verification, Cargo Building, Flight Kitchen | Authorized Cargo Pass |
| **Technical & Maintenance** | Airline Engineering & Maintenance Building, TMT Workshop | GSE & Tech Pass |
| **Emergency Services** | Main Fire Station (ARFF Base), Satellite Fire Station | Category 9 ARFF Only |

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14/15 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Airport Navy `#0A192F`, Airport Sky `#0284C7`, Emerald Green `#059669`)
- **Icons:** Lucide React
- **Mapping:** Leaflet & OpenStreetMap
- **Database:** Supabase PostgreSQL with RLS, Triggers & PL/pgSQL Atomic Functions
- **Test Runner:** Vitest (automated unit and integration testing)

---

## 🚀 Quick Start & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Unit Tests
```bash
npm test
```
All 8 automated tests verify double-booking prevention, role restrictions, capacity validation, and status lifecycle.

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🧪 Quick Test Persona Switcher

Use the **Switch Test Persona** dropdown located in the top black navigation bar on any page to switch seamlessly between:
- **Passenger:** Sunita Sharma (`passenger@mopa.aero`)
- **Airport Employee:** Vikram Joshi (`employee@gmrgroup.in`, GGIAL Operations)
- **Driver:** Rajesh Naik (`driver@mopa.aero`, License: DL-GA-11-2018-091)
- **Dispatcher:** Pooja Mandrekar (`ops.dispatch@mopa.aero`, IOCC Control)
- **Super Admin:** Commander Alok Deshmukh (`admin@mopa.aero`, Directorate of Airport Security)

---

## 🗄️ Database Migrations & Production Deployment

For full cloud deployment using Supabase and Vercel, refer to the step-by-step setup manual:
- [ADMIN_SETUP_GUIDE.md](file:///D:/Projects/NavGOX/ADMIN_SETUP_GUIDE.md)
- SQL Migrations: [20261121_init_mopa_transport.sql](file:///D:/Projects/NavGOX/supabase/migrations/20261121_init_mopa_transport.sql)
- Seed Data: [seed.sql](file:///D:/Projects/NavGOX/supabase/seed.sql)

---

## 📞 Emergency Contacts & Airport Helplines

- **GMR IOCC Control Room:** `+91 832 249 9000`
- **CISF Airport Security Control:** `+91 832 249 9100`
- **Taxi Dispatch Staging Desk:** `+91 832 249 9010`
