# PropManage - Scalable Property Operations Engine

**PropManage** is an enterprise-grade SaaS platform designed to streamline property management through automated financial ledgers, legal document generation, and real-time tenant-landlord communication.

## Core Capabilities
- **Sophisticated Inventory:** Nested architecture (Properties > Units) with turnover buffer logic.
- **Automated Financial Ledgers:** Real-time transaction tracking (`payment`, `payout`, `fee`, `refund`) with atomic data integrity.
- **Legal Document Vault:** Secure storage and generation of professional PDF invoices using WeasyPrint.
- **Real-Time Communication:** Instant push notifications via Django Channels (WebSockets) for critical events.
- **Operations State Machine:** Maintenance workflow enforced by a Finite State Machine (`django-fsm`).
- **Secure Authentication:** Cookie-based JWT system (HttpOnly) for superior security against XSS/CSRF.

## Tech Stack
### Backend
- **Framework:** Python Django 5.x (Django REST Framework)
- **Asynchronous:** Daphne (ASGI), Celery + Redis
- **Security:** JWT (stored in HttpOnly Cookies), Role-Based Access Control (RBAC)
- **Database:** PostgreSQL

### Frontend
- **Framework:** React 18 + Vite
- **State Management:** Zustand
- **Styling:** Tailwind CSS v4 (with PostCSS)
- **Animations:** Framer Motion
- **Charts:** Chart.js

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (serving React) & Daphne (serving API/WebSockets)
- **Development Tools:** Mailpit (Email testing)

## Project Structure
```text
├── backend/            # Django API, WebSockets, and Background Tasks
├── frontend/           # React SPA (Vite + Tailwind)
├── docker-compose.yml  # Full-stack orchestration
└── MASTER_PLAN.md      # Detailed roadmap and technical specifications
```

## Getting Started
1. **Launch Stack:**
   ```bash
   docker-compose up --build
   ```
2. **Setup Admin:**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```
3. **Seed Demo Data:**
   ```bash
   docker-compose exec backend python manage.py seed_data
   ```
4. **Access UI:** `http://localhost:5173`