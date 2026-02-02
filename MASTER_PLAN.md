# PropManage - Elite Property Management & Booking System

**Goal:** Build a production-ready, visually stunning, and architecturally superior property management platform that showcases senior-level proficiency in Django and Vue.js.

---

## 1. High-Level Architecture (The "Senior" Stack)

- **Backend:** Django 5.x (REST Framework)
    - **Versioning:** API v1 structure.
    - **Security:** JWT with HTTP-only cookies (CSRF protected).
    - **Performance:** Redis caching for frequent property lookups.
    - **Documentation:** Auto-generated OpenAPI 3.0 schema (drf-spectacular).
- **Frontend:** Vue 3 (Composition API) + Vite
    - **UI:** Tailwind CSS + Shadcn-Vue (Premium component library).
    - **Data Fetching:** TanStack Query (Vue Query) for caching and optimistic updates.
    - **State:** Pinia (Persistent user sessions).
- **Async & Real-time:**
    - **Workers:** Celery + Redis.
    - **Real-time:** Django Channels (WebSockets) for instant booking notifications.
- **Infrastructure:**
    - **Orchestration:** Docker Compose (Nginx, Gunicorn, Postgres, Redis, Celery, Mailpit).

---

## 2. Advanced Database & Logic

### Core Entities (Refined)
1.  **Users:** Custom model with Profile images, Bio, and Role-based permissions (Landlord, Tenant, Admin).
2.  **Properties:**
    - `images`: Many-to-one relationship for galleries.
    - `amenities`: JSONB/Array field for flexible filtering.
    - `location`: Geocoding support (lat/long).
3.  **Bookings:**
    - **Status Machine:** [Draft -> Pending -> Confirmed -> Completed -> Cancelled].
    - **Collision Logic:** Database-level constraints to prevent double-booking.
4.  **Financials (Invoices):**
    - **PDF Generation:** Automated backend PDF generation for receipts.
    - **Balance Tracking:** User-level ledger for landlords.

---

## 3. The Overhaul Sprint Plan

### Phase 1: Architectural Foundation (Backend Focus)
- [ ] **Infrastructure:** Modernize `docker-compose.yml` with Nginx, Mailpit, and healthy-check deps.
- [ ] **API Standard:** Implement standard response wrappers (Success/Error/Pagination).
- [ ] **Security:** Switch JWT storage to HTTP-only cookies for enhanced security.
- [ ] **Versioning:** Move all endpoints to `/api/v1/`.

### Phase 2: Feature Richness (Backend & Logic)
- [ ] **Media Management:** Implement `easy-thumbnails` or similar for optimized property images.
- [ ] **Advanced Scheduling:** Add turnover time logic (e.g., 1 day gap between bookings).
- [ ] **PDF Engine:** Create a Celery task to generate professional PDF invoices via `WeasyPrint`.
- [ ] **Analytics Engine:** Service layer for complex revenue forecasting and occupancy stats.

### Phase 3: Premium UI/UX (Frontend Overhaul)
- [ ] **Theme System:** Implement a modern, responsive design using a "Fluid UI" approach.
- [ ] **Dashboard 2.0:**
    - **Landlord:** Interactive charts (Revenue, Bookings) + Quick Action widgets.
    - **Tenant:** Booking timeline + Payment history.
- [ ] **Property Discovery:** Advanced filtering sidebar + Map integration (Leaflet/MapLibre).
- [ ] **Booking Flow:** Multi-step reservation wizard with real-time price calculation.

### Phase 4: Senior Polish
- [ ] **Real-time Notifications:** WebSockets for "New Booking" alerts.
- [ ] **Global Error Handling:** Integrated Toast system for every API failure.
- [ ] **Performance:** Implement `select_related` and `prefetch_related` across all ViewSets.
- [ ] **Testing:** 90%+ coverage on business logic (availability, invoicing).

---

## 4. Immediate Next Steps

1.  **Docker & Environment:** Update `docker-compose.yml` for production-like local dev.
2.  **API Versioning & Standard:** Restructure URLs and responses.
3.  **Frontend Layout:** Implement the "Shell" of the new premium UI.