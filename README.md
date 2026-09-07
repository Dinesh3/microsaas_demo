# Site Ledger — AI Business Operations Agent

MVP implementation of the AI Business Operations Agent for Interior Design & UPVC SMBs,
built to the Priority-1 scope from the product plan:

> Customer Enquiry → Appointment → Site Visit/Measurement → AI Quotation → Follow-up →
> Payment → Task Tracking → "What Am I Forgetting?" AI Agent

**Stack:** React + TypeScript + Vite + Tailwind (frontend) · Python + FastAPI + SQLAlchemy (backend) · SQLite by default, swappable to PostgreSQL.

---

## 1. Project structure

```
microsaas_demo/
├── backend/
│   ├── app/
│   │   ├── core/        # config, security (JWT/bcrypt), auth dependency
│   │   ├── db/          # SQLAlchemy session/engine
│   │   ├── models/      # ORM models (User, Customer, Appointment, Quotation, Payment, Task, FollowUp, Product)
│   │   ├── schemas/     # Pydantic request/response schemas
│   │   ├── routers/     # API endpoints, one file per module
│   │   ├── seed.py      # creates the first admin login + sample price list
│   │   └── main.py      # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # one page per module
│   │   ├── components/      # layout + shared UI primitives
│   │   ├── lib/              # api client, auth context
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 2. What's implemented (MVP / Priority 1)

- **Auth:** JWT login, two roles — `admin` and `user`. Admins can create more admin/team logins from the "Team Logins" page.
- **Customers:** capture enquiry details, track through the full lifecycle stage list from the plan (New Enquiry → … → After-Sales Follow-up).
- **Appointments:** book, assign, reschedule, track status (Booked/Confirmed/Rescheduled/Cancelled/Completed).
- **Quotations:** line items are priced **only** from the Product/Price Master (the AI/user cannot invent a price) — auto-calculates material, labour, installation, transport, tax, discount, margin. Supports versioned revisions (`POST /quotations/{id}/revise`), status tracking, and PDF export.
- **AI Margin & Discount Agent:** `POST /quotations/{id}/check-discount?target_price=...` — tells you whether a proposed price is profitable, and the recommended minimum, exactly like the plan's worked example.
- **Follow-ups:** logged per customer/quotation/appointment/payment with next-follow-up date and outcome.
- **Payments:** advance / stage / final schedules, outstanding balance, overdue detection.
- **Tasks:** manual + a `source` field ready for AI-created tasks.
- **AI Daily Agent:** `/api/agent/daily-briefing` and `/api/agent/what-am-i-forgetting` — rule-based (works with zero external dependencies) aggregation of what needs attention today. See the comment in `app/routers/ai_agent.py` for how to upgrade this to a real LLM-driven agent later.
- **Price Master:** the central product/pricing table described in Section 9 of the plan.

**Not yet built** (Priority 2/3 in the plan — natural next steps): WhatsApp/voice input, project/inventory/supplier tracking, customer portal, forecasting.

## 3. Local setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit SECRET_KEY and admin credentials
uvicorn app.main:app --reload   # runs on http://localhost:8000
```

On first run, it creates the SQLite DB, your first admin login (from `.env`), and sample pricing data automatically. API docs: `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev                     # runs on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:8000`, so just run both servers side by side and open `http://localhost:5173`.

Log in with the admin email/password you set in `backend/.env` (defaults: `admin@example.com` / `Admin@12345` — **change these before deploying anywhere real**).

### Switching database (SQLite → PostgreSQL)

Nothing to change in code. In `backend/.env`:

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
```

Install `psycopg2-binary` is already in `requirements.txt`. Restart the backend — tables are created automatically via `Base.metadata.create_all`. For a production setup, swap that for Alembic migrations (the package is already in `requirements.txt`, just not wired up yet).

## 4. Pushing this to your GitHub repo

This was built in a sandboxed environment with no network/GitHub access, so push it from your own machine:

```bash
cd microsaas_demo
git init
git add .
git commit -m "Initial commit: AI Business Operations Agent MVP"
git branch -M main
git remote add origin https://github.com/Dinesh3/microsaas_demo.git
git push -u origin main
```

If the repo already has a README/commit on GitHub, pull first: `git pull origin main --allow-unrelated-histories`, resolve any conflicts, then push.

## 5. Suggested next steps

1. Change `SECRET_KEY` and admin credentials in `.env` before any real use.
2. Wire up Alembic for schema migrations once you move off SQLite.
3. Add WhatsApp/voice input for quotation creation (Section 8 of the plan).
4. Replace the rule-based AI agent with an LLM-backed one using tool-calling against the same endpoints (Section 34's safety model — validate before execute).
5. Add object storage (S3-compatible) for quotation PDFs and site photos instead of generating PDFs on the fly only.
