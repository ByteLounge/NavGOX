# NavGOX — MOPA Airport Staff & Driver Campus Transit
### Manohar International Airport (MOPA / GOX), Pernem, Goa, India

**NavGOX** is a streamlined internal airport premises transport web application built exclusively for **Manohar International Airport (MOPA / GOX)**. It connects **airport staff** (GMR, AAI, ATC, CISF, Cargo, Catering, Engineering, and ARFF teams) directly with **campus drivers** who pick them up and drop them off at any of the 21 approved locations within the airport premises.

> **Operational Scope:** Exclusively for airport staff and campus drivers travelling inside MOPA airport premises.

---

## ✈️ Simplified 2-Role Workflow

- **Airport Staff (`staff`):**
  - Request an immediate or scheduled pickup between any of the 21 airport premises stops.
  - Track live ride progress (*Pickup Requested* → *Driver En Route* → *Picked Up • In Transit* → *Dropped Off*).
  - View assigned driver, vehicle, and call the driver directly.
  - Cancel pending requests before pickup if shift plans change.

- **Campus Driver (`driver`):**
  - View live incoming pickup requests from airport staff on the Driver Desk (`/driver`).
  - Accept compatible requests with one tap (*Accept & Pick Up*).
  - Advance trips in 2 simple steps: **Confirm Staff Picked Up** → **Confirm Dropped Off (Complete)**.
  - Double-booking prevention ensures drivers and vehicles cannot accept overlapping active trips, and automatically releases them when a drop-off completes.

---

## 📍 21 Airport Premises Locations

All 21 stops inside the airport premises are available to airport staff and drivers:
- **Terminal & Forecourt:** Arrival, Departure, Main Terminal Building, Gox Village / Forecourt
- **Parking & Transport:** Airport Parking, Taxi Waiting Area
- **Administration & Security:** ATC Office, GMR Office, Admin Building, CISF Office, Gate House 1, Gate 2
- **Staff & Catering:** Canteen, Flight Kitchen
- **Cargo & Technical:** Naka / Cargo Gate, Naka Air Cargo, Cargo Building, Airline Engineering and Maintenance Building, TMT Workshop
- **Emergency Services:** Main Fire Station, Satellite Fire Station

---

## 🚀 Quick Start

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and use the **Switch View** menu in the top bar to switch between **Staff** and **Driver** personas.
