# PropManage - Enterprise-Grade Property Management Spec

**Objective:** To build a high-performance, visually stunning, and operationally complex SaaS platform that handles the full lifecycle of property management.

---

## 1. System Architecture (The "Pro" Stack)
- **Backend:** Django 5.x (DRF)
    - **Auth:** JWT via **HTTP-Only Cookies** (Anti-XSS/CSRF).
    - **Complexity:** Service Layer pattern to separate business logic from views.
    - **Database:** PostgreSQL with **Atomic Transactions** and **Check Constraints**.
- **Frontend:** Vue 3 (Composition API) + Tailwind CSS
    - **State Management:** Pinia + **TanStack Query** (for server-state caching).
    - **Design:** "Fluid Dashboard" (Clean, minimalist, business-centric).
- **Operations:** Celery + Redis + WeasyPrint (PDF) + Mailpit (SMTP).

---

## 2. Core Feature Blueprint

### A. Advanced Inventory (Multi-Unit)
- **Multi-Unit Support:** Properties contain Units (Apartments, Rooms, Suites).
- **Document Vault:** Secure storage for Leases (PDFs) and Tenant IDs.
- **Amenities:** JSONB tagging for granular unit features.

### B. The "Senior" Booking Engine
- **Turnover Buffers:** Automatically block "Cleaning/Maintenance Gaps" between bookings (e.g., 24h gap).
- **Dynamic Pricing:** Real-time calculation based on seasons, duration, and guest count.
- **Conflict Prevention:** Database-level `ExclusionConstraints` to prevent double-booking.
- **Multi-step Wizard:** Pick Dates -> Choose Unit -> Review Lease -> Confirm.

### C. Financial & Accounting (The "WOW" Zone)
- **Ledger-Based Tracking:** Real accounting logic (Debits/Credits) for landlord balances.
- **Automated PDF Invoicing:** Celery task generates professional PDF receipts via WeasyPrint.
- **Owner Payouts:** Tracking revenue vs. management fees.

### D. Operations & Maintenance
- **Ticket System:** Maintenance requests with priority levels and photo attachments.
- **SLA Tracking:** Timers to track response times for landlord "Senior" benchmarks.

### E. Analytics (Business Intelligence)
- **Occupancy Heatmaps:** Visual grid showing room availability over time.
- **Revenue Forecasting:** Predictive trends based on current booking velocity (Historical data).

---

## 3. Development Sprint Plan

### Phase 1: The "Hard" Foundation (Current Focus)
- [ ] **Infrastructure:** Production-ready `docker-compose` with healthy-checks.
- [ ] **Security:** Implement HTTP-Only Cookie Authentication.
- [ ] **Schema Overhaul:** Migrate from "Property" to "Property -> Unit" architecture.
- [ ] **Lease Model:** Create the Document Vault logic.

### Phase 2: Complex Business Logic
- [ ] **Booking Service:** Implement the "Buffer Gap" logic and Dynamic Pricing engine.
- [ ] **Accounting Service:** Build the ledger system for invoices and payouts.
- [ ] **PDF Engine:** Build the asynchronous PDF generator.

### Phase 3: Premium UI/UX (SaaS Standard)
- [ ] **Global Layout:** Sidebar-driven app shell with "Glassmorphism" accents.
- [ ] **Interactive Calendar:** A custom booking calendar showing unit availability.
- [ ] **Dashboards:** Landlord "Analytics" dashboard vs. Tenant "Resident" dashboard.

### Phase 4: Polish & Performance
- [ ] **Query Optimization:** Use `prefetch_related` to achieve <100ms API responses.
- [ ] **Audit Logs:** Track every sensitive change (Price changes, booking cancels).
- [ ] **Load Testing:** Document the system's ability to handle 100+ concurrent bookings.
