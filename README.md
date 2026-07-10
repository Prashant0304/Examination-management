# University IA & External Marks System

A role-based exam records system: Faculty enter IA + External marks → HOD reviews →
Admin gives final approval. Students see only their finalized results. Every change
to a mark is written to an immutable audit log.

## Stack

- **Backend**: Java 21, Spring Boot 3, Spring Security (JWT), PostgreSQL, Flyway
- **Frontend**: React 18 + TypeScript + Vite
- **Infra**: Docker Compose, Nginx (reverse proxy + static hosting), Let's Encrypt (production)

## Project layout

```
backend/    Spring Boot API (Maven)
frontend/   React app (Vite)
proxy/      Nginx reverse-proxy config (routes /api to backend, / to frontend)
docker-compose.yml
.env.example
```

---

## 1. Local development (without Docker)

### Backend
```bash
cd backend
# Requires a local Postgres running with a DB matching application.yml,
# or export DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD to point elsewhere.
export ADMIN_EMAIL=admin@university.edu
export ADMIN_PASSWORD=SomeStrongTempPassword123!
export JWT_SECRET=$(openssl rand -base64 48)
mvn spring-boot:run
```
On first startup, since no admin exists yet, the app creates one using
`ADMIN_EMAIL` / `ADMIN_PASSWORD`. **Log in and change the password immediately**
(a password-change endpoint is a natural next addition — see "What's not built yet" below).

### Frontend
```bash
cd frontend
cp .env.example .env      # points VITE_API_BASE_URL at http://localhost:8080/api
npm install
npm run dev
```
Visit `http://localhost:5173`.

---

## 2. Running everything with Docker Compose (recommended)

```bash
cp .env.example .env
# edit .env: set DB_PASSWORD, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD to real values
docker compose up --build
```

This starts four containers on an isolated internal network:
- `db` — Postgres (not exposed to the host)
- `backend` — Spring Boot API (not exposed to the host)
- `frontend` — static React build served by Nginx (not exposed to the host)
- `proxy` — the only container publishing ports (80/443), routes `/api/*` to
  the backend and everything else to the frontend

Visit `http://localhost`.

---

## 3. First-time data setup

Once logged in as admin, use the catalog endpoints (a small admin UI for these
is a good next step — for now, call them directly, e.g. with `curl` or Postman,
using the admin's access token from `/api/auth/login`):

1. `POST /api/admin/catalog/departments` — create departments
2. `POST /api/admin/users` — create HOD/Faculty/Student accounts (assign each to a department)
3. `POST /api/admin/catalog/subjects` — create subjects (with IA/External max marks)
4. `POST /api/admin/catalog/exam-cycles` — open an exam cycle (e.g. "Odd Sem 2026")
5. `POST /api/admin/catalog/faculty-assignments` — assign faculty to subjects for that cycle
6. `POST /api/admin/catalog/student-enrollments` — enroll students in subjects for that cycle

After that: Faculty can enter marks → submit → HOD approves → Admin finalizes →
Student sees their result.

---

## 4. Security measures already in place

- Passwords hashed with BCrypt (cost factor 12)
- JWT access tokens (15 min) + refresh tokens (7 days); frontend keeps tokens in
  memory only (not localStorage) to reduce XSS token-theft exposure
- Account lockout after 5 failed logins (15 min lock)
- Role-based access control enforced at the API layer (`@PreAuthorize`), not just hidden UI
- Every mark change is appended to `mark_audit_log` — nothing is overwritten or deleted
- Marks become read-only once `SUBMITTED`; only an explicit admin "reopen" (logged)
  allows further edits after final approval
- Global exception handler — stack traces and internal errors are never sent to the client
- CORS locked to configured origins; CSP and `X-Frame-Options: DENY` headers set
- Database and backend containers are not exposed to the host — only the proxy is
- Database credentials, JWT secret, and admin password are supplied via environment
  variables, never hardcoded or committed

## 5. Production hosting (recommended path)

A small VPS gives you full control over backups and patching, which matters for
official academic records.

1. **Provision a VPS** — e.g. DigitalOcean Droplet or AWS Lightsail, 2GB RAM minimum, Ubuntu 24.04.
2. **Point a domain at it** (an A record to the VPS's IP).
3. **Install Docker + Docker Compose** on the VPS.
4. **Copy this project to the server**, create `.env` with real production secrets.
5. **Get a TLS certificate** with certbot in webroot mode:
   ```bash
   mkdir -p proxy/certbot/www proxy/certbot/conf
   docker run --rm -v $(pwd)/proxy/certbot/www:/var/www/certbot \
     -v $(pwd)/proxy/certbot/conf:/etc/letsencrypt \
     certbot/certbot certonly --webroot -w /var/www/certbot \
     -d your-domain.edu --email you@university.edu --agree-tos
   ```
6. **Uncomment the HTTPS server block** in `proxy/nginx.conf` (fill in your domain),
   and add a `location /.well-known/acme-challenge/` block pointing at the certbot
   webroot for renewals. Redirect port 80 → 443.
7. **Restart the stack**: `docker compose up -d --build`
8. **Set up automatic certificate renewal** via a cron job calling `certbot renew`
   and reloading nginx.
9. **Back up the `db_data` volume regularly** (e.g. nightly `pg_dump` to off-server storage) —
   this is the one thing you cannot afford to lose.
10. **Keep the host patched** (`unattended-upgrades` on Ubuntu) and restrict SSH to key-based auth.

---

## 6. What's built vs. what's a natural next step

Built: auth + JWT refresh, RBAC for 4 roles, mark entry/submit/HOD-approve/admin-approve/
reject/reopen workflow with full audit trail, student read-only view, admin user &
catalog management, Dockerized deployment with a security-hardened reverse proxy.

Reasonable next additions, not included here to keep this first pass reviewable:
- Password-change / forced-reset-on-first-login endpoint
- Bulk mark upload (CSV) for faculty
- PDF/Excel export of final results per subject or per student (grade sheets)
- Email notifications on submission/approval/rejection
- Pagination on list endpoints once data volume grows
- Admin UI screens for the catalog endpoints (currently API-only)
