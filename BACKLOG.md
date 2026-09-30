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



### 5. Set up automated Postgres backups (must-do, not optional)
**Added:** 2026-09-21
Since we're self-hosting Postgres on a single VM with no managed database service, there is no safety net for data loss. Need a scheduled backup routine (e.g. nightly `pg_dump` to a separate storage location) before this VM becomes the real, only copy of the data.
**Status:** Open — should be done as part of initial VM setup, not deferred.



### 7. Rotate DATABASE_URL password (exposed in plaintext during Azure setup chat)
**Added:** 2026-09-24
The Postgres password for `personal_os_app` was pasted in plaintext into a Claude chat while sharing `DATABASE_URL` for Azure VM setup. Low real risk for a single-user personal project, but good hygiene to rotate.
**To do:**
- Pick a new password
- Update it in Postgres (`ALTER USER personal_os_app WITH PASSWORD 'newpassword';`) — both locally and on the Azure VM once created there
- Update `.env` in both places (local machine and Azure VM) to match
- Restart FastAPI (local and VM) after updating `.env` so it picks up the new value


### 9. Rotate DATABASE_URL password (exposed a second time, now on the Azure VM too)
**Added:** 2026-09-24
Same password rotation item as before (#5) — the plaintext password was also used to set up the VM's Postgres user (`personal_os_app`) during Azure setup. When rotating:
- Update the password in Postgres **on both** the local machine and the Azure VM
- Update `.env` in both places to match
- Restart FastAPI in both places (locally: manual restart; on VM: `sudo systemctl restart personalos-backend`)

### 10. Create a DECISIONS.md (or HISTORY.md) for resolved-item context
**Added:** 2026-09-26
Now that BACKLOG.md only tracks pending items (not resolved history), we may lose useful "why did we decide X" context over time. A separate, append-only file — one-line entries, never edited — would preserve decisions (e.g. Azure vs Oracle, systemd setup) without bloating the backlog.
**Status:** Deferred — nice-to-have, not urgent.

### 11. Update PROJECT_CONTEXT.md — replace stale Oracle Cloud references with Azure
**Added:** 2026-09-26
Section 5 and Section 6 of PROJECT_CONTEXT.md still describe Oracle Cloud as the hosting plan. Actual hosting is the Azure VM (`personalos-vm`, `4.224.33.25`), deployed and confirmed working. Needs a find-and-replace pass.
**Status:** Open.

### 12. Create Android-specific docs (PROJECT_CONTEXT, BACKLOG, update main ROADMAP)
**Added:** 2026-09-26
As the Android app project grows, it needs the same documentation discipline as the backend. Need:
- `personalos-android-project-context.md` — live state of the Android codebase (structure, build config, Kotlin/Compose patterns)
- `personalos-android-backlog.md` — Android-specific tech debt and pending features
- `ROADMAP.md` (at repo root) — unified feature roadmap across web + Android, with phases and priorities
**Status:** Open — start documenting during next Android session, as the project structure stabilizes.


### 15. Migrate planning_items status enum + add domain column properly
**Added:** 2026-09-30
Web Planning UI shows "planned/in-progress/completed" but the backend `PlanningStatus` enum is `open/promoted/archived` — words don't semantically match ("promoted" ≠ "in progress"). Also `planning_items` has no `domain` column at all (unlike `routine_items`), so the UI's domain tags on plan cards are currently frontend-only and don't persist. Fix both in one migration: rename the enum values to match actual meaning, and add a nullable `domain` column. Needed before the Planning UI can be genuinely backend-synced (blocks item #3).
**Status:** Open.



---

## Ideas (not yet committed to doing)

*(Nothing logged here yet — add ideas as they come up, even half-formed ones.)*

---

## Done (resolved items, kept for history)

### ~~Comments/alarm_lead_minutes not exposed via PATCH~~
**Added:** 2026-09-20 · **Resolved:** 2026-09-20
`RoutineItemUpdate`/`PlanningItemUpdate` and `RoutineItemOut`/`PlanningItemOut` didn't expose the new `comments`/`alarm_lead_minutes` fields. Fixed and verified end-to-end (curl PATCH + psql check). Commit `c5926e3`.
