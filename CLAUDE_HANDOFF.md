# PersonalOS — Claude Session Handoff

> **Purpose:** This file exists so a brand-new Claude account/session can pick up this project with zero loss of context. Read this first, in full, before responding to anything else. Then read the four files it points to.

---

## 0. Read these files next, in this order

All at the repo root: `github.com/masterneuron88/personal_os` (clone or `git pull` to get them).

1. **`PROJECT_CONTEXT.md`** — the backend + web technical source of truth (schema, endpoints, architecture decisions). This wins if anything else disagrees with it.
2. **`BACKLOG.md`** — every genuinely pending item. Only pending items live here; resolved ones are deleted outright (not archived) — that's a deliberate choice, don't "helpfully" restore history into it.
3. **`personalos-android-project-context.md`** — same role as PROJECT_CONTEXT.md, but for the Android app specifically.
4. **`ROADMAP.md`** — build order / phase plan across both web and Android.
5. **`personalos-android-ui-spec.html`** — visual target for Android screens (colors, pills, layout). Open it in a browser to see it rendered, don't just read the raw HTML.

---

## 1. Who you're talking to, and how to work with them

- **Satish** — building this as a personal project *and* as how he's learning full-stack development. He had **zero prior coding background** (not just Android/Kotlin — programming in general) at the start of this project.
- **Every instruction needs to be explicit about which tool**: Terminal, VS Code, or Android Studio. Never assume familiarity with any of them.
- **One clear action per line**, not dense paragraphs of instructions. Step, then wait for confirmation/output, then next step.
- **Do not ask whether to pause or stop mid-task.** Proceed continuously until he says to stop. (He finds "should we continue or stop here?" a waste of his time — he'll tell you when he wants to end a session.)
- **Screenshots are the real bottleneck, not tokens.** A past session hit an image-count limit mid-task and had to restart. When an error is text (a tooltip, Logcat, terminal output, a build log), ask him to paste the text, not screenshot it. Save screenshots for genuinely visual things (emulator UI, layout, colors).
- **He verifies before proceeding** — expects to see actual command output / actual screenshots before you assume a step worked, not just "this should work now."
- **Never ask him to paste real credentials into chat.** Passwords have leaked into chat history before (see BACKLOG #7/#9) purely by him pasting terminal output that happened to contain them. If a command's output might contain a secret, warn him before he pastes it, or ask him to redact it.

---

## 2. Current state, as of 2026-09-30

**Web app (backend + frontend):** stable and working. FastAPI + PostgreSQL, deployed on an Azure VM (`personalos-vm`, `4.224.33.25`, Ubuntu 24.04, region Central India), running as a systemd service, reverse-proxied through Caddy with HTTPS at `https://04os.duckdns.org` (free DuckDNS domain). Full CRUD for `routine_items` and `planning_items`, JWT auth, Focus Mode and Life Score endpoints.

**Android app:** just reached a real milestone — it's now inside the main repo (`android/` folder, first committed at `7fabb75`), and login credentials were moved out of source code into untracked `local.properties`, read via `BuildConfig`. Verified working end-to-end (cleared app storage, confirmed fresh login still works). The Today screen is **functionally complete** — fetches real routine items, renders them as cards, Done/Postpone buttons actually call the backend and refresh the list. Visual polish was just added: domain-colored pills and status pills (in_progress = purple, postponed = amber, done = dimmed + strikethrough), matching the UI spec. This hasn't been visually verified yet with real data on screen (database was empty during the last test) — worth adding a test item and re-screenshotting early in the next session.

**Not yet built on Android:** Capture screen (voice/text logging), alarms/reminders, snooze-style postpone (item 2b on roadmap), installing a real APK on his phone (item 2a on roadmap).

**Web Planning feature — mid-discussion, not yet built:** the Planning section UI (add a plan with a future target date, domain tags, status) already exists visually but writes to `localStorage` only, not the real backend — even though the backend already has a full `/planning` API. Decided approach (not yet implemented): properly migrate the `PlanningStatus` enum (currently `open/promoted/archived`, which doesn't match the UI's `planned/in-progress/completed` labels) and add a missing `domain` column to `planning_items`, then wire `AppContext.tsx`'s `addPlan`/`updatePlan`/`deletePlan` to real API calls the same way `addTask`/`updateTask`/`deleteTask` already talk to `/routines`. This is logged as **BACKLOG item #15** — do that migration properly, don't just patch around it.

---

## 3. What's next (in the order Satish wants, as of this handoff)

1. **Android UI polish continuation** (if picking up mid-stream): verify the new pill styling actually renders correctly with real data (add a test routine item first).
2. **Build a debug APK and sideload it onto his real phone** — no app store, just install directly. (Roadmap item 2a.)
3. Only after those: snooze-style postpone (2b), hosting the web app on the VM itself instead of `npm run dev` (2c), then Capture screen + `/capture` backend endpoint, then voice capture.
4. **BACKLOG item #15** (planning_items migration) whenever there's a natural opening — not urgent, but blocks fully wiring the Planning UI.

---

## 4. Known housekeeping still open (see BACKLOG.md for full detail)

- Postgres has **no automated backup** — single point of failure on the Azure VM. Flagged as the most important non-feature item outstanding.
- `DATABASE_URL` password should be rotated (it was pasted in plaintext into chat during initial Azure setup, months ago, low real risk but good hygiene) — items #7/#9.
- `PROJECT_CONTEXT.md` still has a couple of stale Oracle Cloud references (Azure is what's actually deployed) — item #11.
- `/life_score` endpoint exists but was never documented — item #2.

---

## 5. A note on how this file came to exist

Satish is switching from a corporate Claude account to a personal one, and wanted a clean way to hand off context without re-explaining everything. This file is that handoff. If he gives you this file at the start of a new conversation: read it, read the four linked files, and respond as if you already know all of the above — don't narrate that you "read a handoff file," just be caught up.
