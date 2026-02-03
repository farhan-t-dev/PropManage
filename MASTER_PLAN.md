# PropManage - Enterprise-Grade Property Management Spec

**Objective:** To build a high-performance, visually stunning, and operationally complex SaaS platform that handles the full lifecycle of property management.

---

## 1. System Architecture (The "Pro" Stack)
- **Backend:** Django 5.x (DRF)
    - **Auth:** JWT via **HTTP-Only Cookies** (Anti-XSS/CSRF). [DONE]
    - **WebSocket Engine:** Daphne + Django Channels for real-time events. [DONE]
    - **Operations:** Celery + Redis + WeasyPrint (PDF) + Mailpit (SMTP). [DONE]
- **Frontend:** React 18 + Vite + Tailwind CSS v4
    - **State Management:** Zustand (Clean, minimal, high performance). [DONE]
    - **Routing:** React Router 6 with smart RBAC Navigation Guards. [DONE]
    - **Design:** "Modern Premium" (Clean, high-contrast, accessibility-focused). [DONE]

---

## 2. Core Feature Blueprint

### A. Advanced Inventory (Multi-Unit)
- **Multi-Unit Support:** Properties contain Units (Apartments, Rooms, Suites). [DONE]
- **Document Vault:** Secure storage for Leases (PDFs) and Tenant IDs with per-owner permissions. [DONE]
- **Amenities:** JSONB tagging for granular unit features. [DONE]

### B. The "Senior" Booking Engine
- **Turnover Buffers:** Automatically block "Cleaning/Maintenance Gaps" between bookings. [DONE]
- **Dynamic Pricing:** Real-time calculation based on peak seasons. [DONE]
- **Conflict Prevention:** Concurrency-safe availability checks via `select_for_update`. [DONE]

### C. Financial & Accounting (The "WOW" Zone)
- **Ledger-Based Tracking:** Real-time transaction records for payments, payouts, and fees. [DONE]
- **Automated PDF Invoicing:** Celery task generates professional PDF receipts via WeasyPrint. [DONE]
- **Owner Payouts:** Visualized earnings vs. fees in the landlord dashboard. [DONE]

### D. Operations & Maintenance
- **State Machine Workflow:** Enforced transitions (Pending -> In Progress -> Resolved). [DONE]
- **Business Logic Guards:** Tickets cannot be "Resolved" without an attached "Cost". [DONE]
- **Real-Time Alerts:** Instant push notifications when ticket status changes. [DONE]

---

## 3. Development Sprint Plan

### Phase 1: The "Hard" Foundation [COMPLETED]
- [x] **Infrastructure:** Production-ready `docker-compose` with Daphne and Nginx.
- [x] **Security:** HTTP-Only Cookie JWT + Frontend RBAC Guards.
- [x] **Schema:** "Property -> Unit" architecture.
- [x] **Real-Time:** Django Channels + Redis infrastructure.

### Phase 2: React Migration & UI Polish [COMPLETED]
- [x] **Framework Switch:** Migrate full SPA from Vue to React + Vite.
- [x] **Theme Engine:** Standardize Tailwind v4 custom brand identity.
- [x] **Interactive Charts:** Financial visualization using Chart.js.
- [x] **Robustness:** Global loading states, empty state illustrations, and null-safety.

### Phase 3: Technical "Flex" Features (Current Focus)
- [x] **Omnisearch:** A global "Cmd+K" search component for units and tenants. [DONE]
- [x] **User Registration:** Dynamic multi-role onboarding with auto-login. [DONE]
- [ ] **E-Signature Mock:** Draw signature on canvas and embed into the PDF.
- [ ] **Export Engine:** Export financial reports to CSV/Excel using Pandas.

### Phase 4: Performance & Scalability
- [ ] **Storage Upgrade:** Move from local storage to S3 Pre-signed URLs for Document Vault.
- [ ] **Localization:** Implement `django-money` for multi-currency support.
- [ ] **Unit Tests:** Increase coverage for WebSocket consumers and FSM transitions.