# PersonalOS — Project Context

> **Purpose of this file:** This is the single source of truth for the actual current state of the codebase — schema, endpoints, architecture decisions. It is NOT a plan or a spec (see `00-product-brainstorm.md`, `requirements.md`, `design.md`, `tasks.md` for those) — it describes what's really built, right now.
>
> **Update discipline:** Before planning or making ANY code change (schema, routers, architecture), read this file first — it is the authoritative current state. After any such change, update this file in the same work session, before committing. A git pre-commit hook (`.git/hooks/pre-commit`) enforces the "after" half by warning if `models.py`, any file under `app/`, or `alembic/versions/` changed without a matching change to this file in the same commit. This applies to any AI assistant or contributor working on this repo, not just one tool or one session.
>
> **Last updated:** 2026-09-20

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI (Python) |
| Database | PostgreSQL (`personal_os_db`) |
| ORM / migrations | SQLAlchemy + Alembic |
| Auth | JWT (HS256, 7-day expiry) via `python-jose` style token, `bcrypt==4.0.1` for password hashing |
| Frontend | React + TypeScript + Vite + shadcn-ui |
| Repo | `github.com/masterneuron88/personal_os` (monorepo: `frontend/`, `backend/`) |
| Local backend path | `~/Projects/personal_os/backend` |
| Local frontend path | `~/Projects/personal_os/frontend` |

**Terminal tab convention (local dev):**
- Tab 1: `uvicorn app.main:app --reload` (backend server — leave running)
- Tab 2: general commands (migrations, psql, git, etc.)
- Tab 3: `npm run dev` (frontend — leave running)

---

## 2. Backend Folder Structure

```
backend/
├── alembic/
│   └── versions/        — one file per migration, chronological
├── app/
│   ├── main.py           — FastAPI app instance, CORS, router registration
│   ├── models.py         — SQLAlchemy ORM models (all tables + enums)
│   ├── database.py       — DB session/engine setup, get_db()
│   ├── auth.py           — /auth router: login, get_current_user dependency
│   ├── security.py       — password hashing/verification, JWT create/decode
│   ├── routines.py       — /routines router
│   ├── planning.py       — /planning router
│   ├── life_score.py     — /life_score-ish router (exists, not yet documented here — content not reviewed in this pass)
│   └── config.py         — app config/env loading
├── create_user.py        — one-off script to create the single user account
├── alembic.ini
└── .env                  — DB connection string, JWT secret, etc. (not committed)
```

---

## 3. Database Schema (current, as of last migration `7a76f337b554`)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | default `uuid.uuid4` |
| email | String, unique, not null | |
| hashed_password | String, not null | bcrypt |
| created_at | DateTime(tz) | server default `now()` |

### `routine_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID, FK → users.id, not null | |
| title | String, not null | |
| domain | Enum(`Domain`), not null | work / health / family / wealth / me |
| scheduled_date | Date, not null | |
| scheduled_time | Time, nullable | |
| status | Enum(`RoutineStatus`), not null, default `pending` | **pending / done / in_progress / postponed** (last two added in migration `7a76f337b554`) |
| is_recurring | Boolean, not null, default False | |
| recurrence_rule | Enum(`RecurrenceRule`), nullable | none / daily / weekly |
| comments | String, nullable | **added in `7a76f337b554`** |
| alarm_lead_minutes | Integer, nullable | **added in `7a76f337b554`** — minutes before `scheduled_time` an alarm should fire; null = no alarm |
| template_id | UUID, FK → routine_items.id, nullable | self-referential — links a recurring instance back to its template row |
| created_at | DateTime(tz) | server default `now()` |
| updated_at | DateTime(tz) | server default `now()`, onupdate `now()` |

### `planning_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID, FK → users.id, not null | |
| title | String, not null | |
| horizon | Enum(`PlanningHorizon`), not null | today / month / year / custom |
| target_date | Date, nullable | |
| notes | String, nullable | pre-existing free-text field |
| status | Enum(`PlanningStatus`), not null, default `open` | open / promoted / archived — **this is a workflow-state enum, distinct from RoutineStatus; not touched by the recent migration** |
| comments | String, nullable | **added in `7a76f337b554`** |
| alarm_lead_minutes | Integer, nullable | **added in `7a76f337b554`** |
| created_at | DateTime(tz) | server default `now()` |
| updated_at | DateTime(tz) | server default `now()`, onupdate `now()` |

### Enums defined in `models.py`
- `Domain`: work, health, family, wealth, me
- `RoutineStatus`: pending, done, in_progress, postponed
- `RecurrenceRule`: none, daily, weekly
- `PlanningHorizon`: today, month, year, custom
- `PlanningStatus`: open, promoted, archived

**Postgres enum type names** (needed for any future manual `ALTER TYPE` migrations):
- `RoutineStatus` → Postgres type `routinestatus`
- `RecurrenceRule` → Postgres type `recurrencerule`
- `PlanningStatus` → Postgres type `planningstatus`
- `Domain` → Postgres type `domain`
- `PlanningHorizon` → Postgres type `planninghorizon`
*(Only `routinestatus` has been confirmed by direct inspection so far — the others follow the same lowercase-classname convention SQLAlchemy uses by default.)*

### Not yet in the schema (planned, not built)
- `capture_entries` table — planned for the Android voice/text capture feature (see Section 6)

---

## 4. API Endpoints (current)

Base URL (local): `http://127.0.0.1:8000`
CORS: allows `localhost`/`127.0.0.1` on any port (regex-based), credentials allowed.

### `/auth` (auth.py)
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Body: `{email, password}` → returns `{access_token}` (JWT) |
| GET | `/auth/me` | Returns `{id, email}` of the authenticated user (Bearer token required) |

Auth dependency `get_current_user` (used across routers) validates the Bearer token via `decode_access_token` and loads the `User` row.

### `/routines` (routines.py)
| Method | Path | Purpose |
|---|---|---|
| GET | `/routines?target_date=YYYY-MM-DD` | List routine items for a date (defaults to today). Auto-generates today's recurring instances from templates before returning (`ensure_todays_recurring_instances`). |
| POST | `/routines` | Create a routine item. Body: `RoutineItemCreate` (title, domain, scheduled_date, scheduled_time?, is_recurring?, recurrence_rule?) |
| PATCH | `/routines/{item_id}` | Partial update. Body: `RoutineItemUpdate` (title?, domain?, scheduled_time?, status?, comments?, alarm_lead_minutes?) |
| DELETE | `/routines/{item_id}` | Delete a routine item |
| GET | `/routines/focus` | "Focus Mode" view — returns `current_activity`, `up_next`, and `in_progress` items for today, based on current time vs `scheduled_time` |

### `/planning` (planning.py)
| Method | Path | Purpose |
|---|---|---|
| GET | `/planning` | List all planning items for the current user |
| POST | `/planning` | Create. Body: `PlanningItemCreate` (title, horizon, target_date?, notes?) |
| PATCH | `/planning/{item_id}` | Partial update. Body: `PlanningItemUpdate` (title?, status?, notes?, comments?, alarm_lead_minutes?) |
| DELETE | `/planning/{item_id}` | Delete |

### `/life_score` (life_score.py)
Router registered in `main.py`; contents not reviewed in this documentation pass. **TODO: document this router's endpoints next time it's touched.**

### Root
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Health check → `{"status": "ok"}` |

---

## 5. Key Architectural Decisions & Rationale

- **Modular monolith**, not microservices — appropriate for single-user scale and learning stage.
- **Self-hosted Postgres**, currently local only — Oracle Cloud hosting is the next planned step (see Section 6).
- **JWT auth (7-day expiry, HS256)** for the web app login flow.
- **Single-user app** — `create_user.py` is a one-off script, not a signup flow.
- **`RoutineItem.template_id` self-reference** — recurring items work by having a "template" row (`is_recurring=True`, `template_id=None`) that `ensure_todays_recurring_instances()` uses to spawn a real dated instance (`template_id` = the template's id) each day it's needed, rather than storing recurrence as a rule evaluated on the fly everywhere.
- **`PlanningStatus` vs `RoutineStatus` are intentionally different enums** — planning items track workflow state (open → promoted → archived), while routine items track completion/progress state (pending → in_progress → done, or postponed). Do not conflate these when extending either.
- **Alembic does not auto-detect Postgres enum value additions** — confirmed pattern (see `7a76f337b554` migration): adding values to an existing Postgres enum type requires a manual `op.execute("ALTER TYPE <type_name> ADD VALUE IF NOT EXISTS '<value>'")` in the migration; `--autogenerate` will silently miss this.

---

## 6. Android Companion App — Planned Additions (not yet built)

Full plan lives in a separate execution doc (`personalos-android-execution-plan.md`), but the schema/API-relevant facts are summarized here since they'll land in this same backend:

- **Auth for Android:** static API key (not JWT), checked via a header (e.g. `X-API-Key`) — separate from the web app's JWT flow. Not yet implemented.

- **New table planned:** `capture_entries` — for the voice/text capture feature. Columns: `id`, `raw_text` (nullable), `raw_audio_url` (nullable), `source` (enum: voice/text), `status` (enum: pending_sync/transcribed/synced), `created_at`, `processed` (bool), `category` (nullable, filled later by analysis phase), `insights` (nullable, filled later).
- **New endpoint planned:** `POST /capture` — accepts raw text or raw audio upload.
- **Hosting:** Oracle Cloud Always Free tier VM, Postgres + FastAPI moved there, HTTPS via Caddy or similar. Web app's API base URL will need to point to the new hosted URL once this happens (currently `127.0.0.1:8000`).

---

## 7. Recent Changes Log

*(Keep this short — last ~10 entries. Full history lives in git log.)*

- **2026-09-20** — Migration `7a76f337b554`: added `comments`, `alarm_lead_minutes` to `routine_items` and `planning_items`; extended `RoutineStatus` enum with `in_progress`, `postponed`. Applied and verified (server restarts cleanly). Pydantic schemas (`RoutineItemUpdate`, `PlanningItemUpdate`) NOT yet updated to expose these new fields — follow-up needed.
- **2026-09-20** — Closed schema gap: `RoutineItemUpdate`/`PlanningItemUpdate` and `RoutineItemOut`/`PlanningItemOut` now all expose `comments` and `alarm_lead_minutes`. Verified end-to-end with curl PATCH + `psql` check (write and read both confirmed). Commit `c5926e3`.
- **(earlier, session 1)** — Initial backend build: `users`, `routine_items`, `planning_items` tables; JWT auth; CRUD for routines/planning; Focus Mode endpoint; CORS; frontend wired to real backend for tasks (learnings/plans/career goals still on localStorage as of last check).
