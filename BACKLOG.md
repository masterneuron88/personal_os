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

---

## Ideas (not yet committed to doing)

*(Nothing logged here yet — add ideas as they come up, even half-formed ones.)*

---

## Done (resolved items, kept for history)

### ~~Comments/alarm_lead_minutes not exposed via PATCH~~
**Added:** 2026-09-20 · **Resolved:** 2026-09-20
`RoutineItemUpdate`/`PlanningItemUpdate` and `RoutineItemOut`/`PlanningItemOut` didn't expose the new `comments`/`alarm_lead_minutes` fields. Fixed and verified end-to-end (curl PATCH + psql check). Commit `c5926e3`.
