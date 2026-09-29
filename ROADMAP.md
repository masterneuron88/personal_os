# PersonalOS — Roadmap

> **Purpose:** Unified feature roadmap across web + Android, ordered by priority — not by when it was originally planned. `BACKLOG.md` is tech debt and deferred gaps; this is "what's left to build and in what order."
>
> **Ordering principle (set 2026-09-28):** get to a daily-usable Android app as fast as possible, then layer in the rest while already benefiting from it — rather than building the full original vision before using any of it.

---

## Phase 1 — Daily-usable Android (highest priority)

### 1. Today screen — routine/planning items list
Build the Today tab per `personalos-android-ui-spec.html`: item cards, domain pill, status pill, time, alarm-lead hint. Read-only first (data already flows — confirmed working 2026-09-28).
**Estimate:** ~1 session (2-3 hrs)
**Status:** Not started.

### 2. Done / Postpone — real backend actions
Wire the two buttons on each item card to actual `PATCH` calls against `/routines` (and `/planning` once relevant), updating status on the server, not just locally.
**Estimate:** ~1 session (1.5-2 hrs)
**Status:** Not started.
**Milestone:** once this lands, the app is genuinely usable day-to-day for routine tracking.

---

## Phase 2 — Capture (text first, voice later)

### 3. Backend `/capture` endpoint
New endpoint accepting raw text (and later raw audio). Doesn't exist yet — needed before the Capture screen can persist anything.
**Estimate:** small, <1 hr backend work.
**Status:** Not started.

### 4. Capture screen (text only)
Per the UI spec: text field, auto-save (trigger TBD — see `BACKLOG.md` open question), recent-entries list. No voice, no attachments yet.
**Estimate:** ~1-2 sessions (2-3 hrs)
**Status:** Not started.

---

## Phase 3 — Alarms & reminders

### 5. Alarm/reminder system
Configurable lead time (already have `alarm_lead_minutes` on the backend), snooze. Android's alarm/notification permissions and background-execution rules add real complexity here.
**Estimate:** ~1 session (2 hrs)
**Status:** Not started.

---

## Phase 4 — Voice capture & offline resilience

### 6. Voice input (on-device SpeechRecognizer)
Tap-to-speak in the Capture screen, transcribed on-device.
**Estimate:** part of the larger voice/offline effort below.

### 7. Offline queue (Room + WorkManager)
Raw audio/text stored locally when offline, status tracked (`pending_sync` / `transcribed` / `synced`), retried automatically on reconnect.
**Estimate combined (6+7):** ~2-3 sessions (5-6 hrs) — the most complex remaining piece, three new concepts stacked together.
**Status:** Not started.

---

## Later / not yet scheduled

- Attachments in capture and comments (screenshots, PDFs, spreadsheets) — see `BACKLOG.md` #13, deliberately deferred, needs VM file storage + upload endpoint.
- Frontend `localStorage`-only sections (learnings, plans, career goals) migrated to backend.
- `/life_score` endpoint documented in `PROJECT_CONTEXT.md`.

---

## Out of scope for now

- Kubernetes — considered and deliberately deferred (2026-09-28); a single well-configured VM is right-sized for current scale. Revisit only if a single server genuinely can't handle the load.
