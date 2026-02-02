# PropManage - Senior Architecture & Implementation Plan

**Project:** PropManage (Automated Property Management & Booking System)
**Role:** Senior Full-Stack Engineer
**Architecture:** Monorepo (Django API + Vue.js SPA)
**Infrastructure:** Dockerized Microservices

---

## 1. High-Level Architecture

We will follow a **Headless Architecture** pattern.
- **Backend (The "Brain"):** Django REST Framework (DRF) serving JSON. No server-side HTML rendering.
- **Frontend (The "Face"):** Vue 3 (Composition API) + Pinia (State) + Tailwind CSS.
- **Async Workers (The "Muscle"):** Celery + Redis for handling heavy tasks (emailing, report generation) off the main thread.
- **Database:** PostgreSQL (Relational data integrity is critical for bookings/finance).

### System Diagram
```mermaid
[Vue 3 Client] --(JSON/JWT)--> [Nginx Proxy] --(HTTP)--> [Django API]
                                                           |
                                        +------------------+------------------+
                                        |                  |                  |
                                  [PostgreSQL]          [Redis] <---- [Celery Worker]
```

---

## 2. Database Schema Strategy (Core Entities)

1.  **Users (Custom User Model):**
    - `role`: Enum ['admin', 'landlord', 'tenant']
    - Standard auth fields (email, password hash).
2.  **Properties:**
    - `owner`: FK to User (Landlord).
    - `address`, `features` (JSONField), `base_price`.
3.  **Bookings:**
    - `property`: FK to Property.
    - `tenant`: FK to User.
    - `start_date`, `end_date`, `status` (['pending', 'confirmed', 'cancelled']).
    - **Constraint:** Non-overlapping dates per property.
4.  **Invoices:**
    - `booking`: FK to Booking.
    - `amount`, `status`, `due_date`.

---

## 3. Development Phases (Sprint Plan)

### Phase 1: The Foundation (Backend Focus)
**Goal:** A working API that can handle auth and basic CRUD.
- [x] Dockerize the stack (Django, Postgres, Redis).
- [x] Configure `settings.py` for environment variables.
- [x] Implement Custom User Model & JWT Authentication (SimpleJWT).
- [x] Create `Property` and `Booking` models.
- [x] **Milestone:** Admin panel works, Postman collection for Auth/Properties returns 200 OK.

### Phase 2: The Core Logic (Complex Backend)
**Goal:** Handle the "business" of property management.
- [ ] **Booking Algorithm:** Write the service layer to check availability (`is_available(property, start, end)`).
- [ ] **Celery Setup:** Configure Celery worker.
- [ ] **Background Task:** `send_confirmation_email` task triggered on booking creation.
- [ ] **Unit Tests:** Test the availability logic edge cases (overlapping dates).

### Phase 3: The Frontend Shell (Vue.js Setup)
**Goal:** A clean UI that talks to the API.
- [x] Setup Vue Router & Pinia stores (`authStore`, `propertyStore`).
- [x] Create "Layouts": `AuthLayout` (Login/Register) vs `DashboardLayout` (Sidebar + Content).
- [x] Build Login form & JWT storage logic (Axios interceptors).

### Phase 4: Feature Integration
**Goal:** Connect Front and Back.
- [ ] **Dashboard:** Landlord view (My Properties) vs Tenant view (My Bookings).
- [ ] **Booking Flow:** Calendar UI to select dates -> POST /api/bookings/.
- [ ] **Real-time Feedback:** Toast notifications on success/error.

### Phase 5: The "Showcase" Features (Advanced)
**Goal:** Prove seniority.
- [ ] **Data Viz:** Add a chart to Landlord Dashboard showing "Monthly Revenue" (Chart.js).
- [ ] **Report Export:** Button to "Download CSV" (Backend generates it via Pandas + Celery, returns download link).
- [ ] **Optimized Deployment:** Docker Compose for production (Nginx serving static files).

---

## 4. Immediate Next Steps

1.  **Docker Setup:** Create `Dockerfile` and `docker-compose.yml` to run the DB and API without manual terminal hacking.
2.  **Django Config:** Clean up `settings.py` and set up the PostgreSQL connection.
