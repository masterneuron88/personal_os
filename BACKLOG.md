# PersonalOS — Backlog: Tech Debt & Future Ideas

> **Purpose:** A running list of things that are known, deliberate gaps, shortcuts, or ideas — not urgent enough to fix now, but too important to forget. This is different from `PROJECT_CONTEXT.md` (which describes what's actually built) and from the spec files (which describe the original plan) — this is the "we know about this, revisit later" list.
>
> **Process:** Add an entry any time we knowingly defer something, cut a corner, or think of something worth doing later. Periodically (start of a session, or whenever it feels cluttered) review this list together and either action an item (move it to done, with a date) or confirm it's still deferred.
>
> **Format per entry:** Date added, one-line title, brief context, and status.

---

## Open Items

### 1. Pre-commit hook is local-only (not portable)
**Added:** 2026-09-20
The `.git/hooks/pre-commit` script that warns when backend code changes without a `PROJECT_CONTEXT.md` update lives only in `.git/hooks/` on this machine — it is **not tracked by git** and won't exist on a fresh clone (new machine, or if the repo is ever shared). If that ever matters, move the script into the repo itself (e.g. `scripts/pre-commit`) and add a one-time setup command (like a symlink) so anyone cloning the repo can enable it.
**Status:** Deferred — not needed for single-user, single-machine use today.

### 2. `/life_score` endpoint undocumented
**Added:** 2026-09-20
`life_score.py` is registered as a router in `main.py`, but its actual endpoints were never reviewed or added to `PROJECT_CONTEXT.md` — Section 4 of that doc has a placeholder "TODO" for it.
**Status:** Open — document next time this file is touched, or proactively before it matters for Android.

### 3. Frontend still has localStorage-only sections
**Added:** (carried over from project history, confirmed still true as of 2026-09-20)
Learnings, plans, and career goals in the web app are still stored in `localStorage`, not the backend — unlike tasks/routines/planning, which are fully migrated. This is a known, deliberate partial migration, not a bug.
**Status:** Open — planned as a "further out" item in the original roadmap.

### 4. Hosting decision: Azure B1s VM, starting small — monitor and upgrade if needed
**Added:** 2026-09-21
Chose Azure B1s VM (~$7.59/mo, 1 vCPU, 1 GB RAM) over Oracle Cloud free tier and over Azure App Service, to host FastAPI + Postgres together (same architecture as originally planned for Oracle, just on Azure). Kept Postgres — did NOT switch to SQLite, since that would have required reworking models.py (UUID/Enum types) and redoing all 5 existing Alembic migrations for no real benefit given single-user scale.
**Known risks accepted for now:**
- 1 GB RAM is tight for Postgres + FastAPI running simultaneously — risk of swapping under concurrent load (e.g. multiple devices syncing at once), which is the most likely cause of a "slow app" experience.
- B1s is a burstable VM (CPU credits), not dedicated — fine for light CRUD traffic, but would throttle under any sustained load (e.g. future server-side audio transcription).
- No managed backups — a nightly `pg_dump` (or equivalent) needs to be set up manually; nothing protects the data by default if the VM has an issue.
- No managed auto-restart — `systemd` needs to be configured so FastAPI/Postgres restart automatically on crash or reboot.
**Plan:** Start on B1s, watch for sluggishness or memory pressure in the first couple weeks of real use, and resize to B1ms ($15.60/mo, 2 GB RAM) if needed — this is a simple resize + reboot on Azure, no rebuild required.
**Status:** Decided, not yet executed.

### 5. Set up automated Postgres backups (must-do, not optional)
**Added:** 2026-09-21
Since we're self-hosting Postgres on a single VM with no managed database service, there is no safety net for data loss. Need a scheduled backup routine (e.g. nightly `pg_dump` to a separate storage location) before this VM becomes the real, only copy of the data.
**Status:** Open — should be done as part of initial VM setup, not deferred.

### 6. Set up systemd auto-restart for backend + Postgres
**Added:** 2026-09-21
On the Azure VM, FastAPI needs to run as a `systemd` service (not manual `uvicorn --reload`) so it restarts automatically on crash or VM reboot. Postgres also needs to be confirmed to start automatically on boot.
**Status:** Open — part of initial VM setup.

---

## Ideas (not yet committed to doing)

*(Nothing logged here yet — add ideas as they come up, even half-formed ones.)*

---

## Done (resolved items, kept for history)

### ~~Comments/alarm_lead_minutes not exposed via PATCH~~
**Added:** 2026-09-20 · **Resolved:** 2026-09-20
`RoutineItemUpdate`/`PlanningItemUpdate` and `RoutineItemOut`/`PlanningItemOut` didn't expose the new `comments`/`alarm_lead_minutes` fields. Fixed and verified end-to-end (curl PATCH + psql check). Commit `c5926e3`.
