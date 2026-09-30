# PersonalOS — Roadmap

> **Purpose:** Unified feature roadmap across web + Android, ordered by priority — not by when it was originally planned. `BACKLOG.md` is tech debt and deferred gaps; this is "what's left to build and in what order."
>
> **Ordering principle (set 2026-09-28):** get to a daily-usable Android app as fast as possible, then layer in the rest while already benefiting from it — rather than building the full original vision before using any of it.

---

## Phase 0.5 — Safety first (done)

### 0. Put the Android project under version control
Moved into the `personal_os` repo at `android/`. Credentials moved out of `AuthRepository.kt` into untracked `local.properties`, read via `BuildConfig`.
**Status:** Done (2026-09-30, commit `7fabb75`). Verified by clearing app storage and confirming a fresh login still worked.

## Phase 1 — Daily-usable Android (highest priority)

### 1. Today screen — routine/planning items list
Item cards with domain pill, status pill (in_progress = purple, postponed = amber, pending/done = no pill), time, and comment box, per `personalos-android-ui-spec.html`.
**Status:** Done. Data-wired 2026-09-29; visual styling (pills, dimming/strikethrough for done) added and visually verified against real data 2026-09-30.

### 2. Done / Postpone — real backend actions
Both buttons call real `PATCH` requests against `/routines`, updating status on the server and refreshing the list.
**Status:** Done (2026-09-29). Verified against the live database.
**Milestone reached:** the app is genuinely usable day-to-day for routine tracking.

### 2a. Install on physical phone (APK)
Build a debug APK and sideload it onto the real phone. No app store.
**Estimate:** ~20 min
**Status:** In progress (2026-09-30).

### 2b. Snooze-style postpone
Postpone asks "for how long?" (e.g. 15 min / 1 hr / tomorrow) and actually moves the item's scheduled time, instead of only flipping a status label. Needs: backend endpoint accepting a duration and computing the new time; Android picker; web picker; a decision on whether status returns to `pending` or stays `postponed`.
**Estimate:** ~half a day across 2 sessions.
**Status:** Not started.

### 2c. Host the web app on the VM
Production build (`npm run build`) served by Caddy on the existing DuckDNS domain, so it's reachable from any device. No purchase needed.
**Estimate:** 30-45 min
**Status:** Not started.

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