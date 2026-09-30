# PersonalOS Android — Project Context

> **Purpose:** Technical source of truth for the Android companion app. Read this before changing any Android code; update it after. Mirrors the role of `PROJECT_CONTEXT.md` (backend + web). If the two ever disagree about the backend, `PROJECT_CONTEXT.md` wins.
>
> **Last updated:** 2026-09-30

---

## 1. What this app is (and isn't)

A narrow, on-the-go companion to the PersonalOS web app — not a port of it. Two jobs only:

1. **Today** — view, complete, and postpone planned items from the existing backend, with alarms and comments (alarms and comments not built yet).
2. **Capture** — free-form voice-or-text logging of the day, raw and unclassified at input time (not built yet).

Single user (the owner). Distributed as a sideloaded APK only — never published to an app store.

---

## 2. Environment

| Item | Value |
|---|---|
| IDE | Android Studio Quail 4 (2026.1.4 Patch 1), Apple Silicon |
| Project location | `~/Projects/personal_os/android` (in git as of 2026-09-30, commit `7fabb75`) |
| Package | `com.example.personalos` |
| Min SDK | 24 (Android 7.0) |
| Compile / target SDK | 37 |
| Build config | Kotlin DSL (`build.gradle.kts`), version catalog in `gradle/libs.versions.toml` |
| UI | Jetpack Compose + Material 3 |
| Emulator | Pixel 8, API 37.2 "CinnamonBun" (Android 17.0), Google Play image |

---

## 3. Dependencies added beyond the template

Declared in `libs.versions.toml`, referenced in `app/build.gradle.kts`.

| Library | Version | Why |
|---|---|---|
| Retrofit | 2.11.0 | HTTP client — turns API calls into Kotlin functions |
| Retrofit Gson converter | 2.11.0 | JSON ↔ Kotlin objects |
| OkHttp logging interceptor | 4.12.0 | Declared but **not yet wired in** (see §8) |
| AndroidX Security Crypto | 1.1.0 | Encrypted token storage. Deprecated upstream but functional; revisit later |

Manifest: `android.permission.INTERNET` added. No cleartext exception — the backend is HTTPS-only.

---

## 4. Package structure

```
com.example.personalos/
├── MainActivity.kt          Entry point. Scaffold → TodayScreen.
├── auth/
│   ├── AuthModels.kt        LoginRequest, LoginResponse (access_token)
│   ├── AuthRepository.kt    ensureLoggedIn(): reuse stored token, else log in
│   └── TokenManager.kt      Save/read JWT in EncryptedSharedPreferences
├── network/
│   ├── ApiService.kt        Retrofit interface (endpoints, §5)
│   ├── RetrofitInstance.kt  Singleton; BASE_URL = https://04os.duckdns.org
│   └── RoutineItem.kt       RoutineItem data class + StatusUpdate
└── ui/
    ├── theme/               Template theme files (unchanged)
    └── today/
        ├── TodayScreen.kt   Fetches /routines, LazyColumn of cards, refresh trigger
        └── RoutineItemCard.kt  One item: text fields + Done / Postpone buttons
```

---

## 5. Backend contract (what Android actually calls)

Base URL `https://04os.duckdns.org` — Caddy reverse-proxies to FastAPI on the Azure VM. All protected calls send `Authorization: Bearer <jwt>`.

| Call | Method + path | Body | Returns |
|---|---|---|---|
| Login | `POST /auth/login` | `{email, password}` | `{access_token}` |
| Today's items | `GET /routines` | — | `List<RoutineItem>` |
| Update status | `PATCH /routines/{id}` | `{status}` | `RoutineItem` |

**Field mapping gotchas (both bit us):**
- `id` is a **UUID string**, not an Int. Declaring it `Int` crashes Gson with `NumberFormatException`.
- Backend uses snake_case; Kotlin uses camelCase. Every multi-word field needs `@SerializedName` (`scheduled_time`, `alarm_lead_minutes`, `access_token`).

**Valid `status` values:** `pending`, `in_progress`, `done`, `postponed`.

`/routines` is not the only item source — `planning_items` exists on the backend too, and Android does not read it yet.

---

## 6. Auth approach

No login screen. On launch, `AuthRepository.ensureLoggedIn()` returns the stored token if one exists; otherwise it calls `/auth/login` with credentials hardcoded in `AuthRepository.kt`, stores the result via `TokenManager`, and returns it.

Acceptable only because this is a single-user sideloaded APK. **Known weakness:** JWTs expire after 7 days, and the app does not yet detect a 401 and re-login — it will reuse a stale token until the app data is cleared. See §8.

---

## 7. Data flow for a status change

Tap Done/Postpone → `updateStatus()` in `RoutineItemCard` launches a coroutine → `ensureLoggedIn()` → `PATCH /routines/{id}` → on 200, `onStatusChanged()` → `TodayScreen` increments `refreshTrigger` → `LaunchedEffect(refreshTrigger)` refetches the whole list.

Verified end-to-end on 2026-09-29 against the live database.

---

## 8. Known gaps and tech debt


3. **No 401 handling.** Expired token is never cleared or refreshed.
4. **Errors are invisible.** Failures only reach Logcat (`tag:PersonalOS`); nothing shows on screen.
5. **Debug logging left in** `RoutineItemCard.updateStatus()` — prints the token. Remove before real use.
6. **OkHttp logging interceptor declared, not wired.** Network calls are silent in Logcat.
7. **Postpone only flips a label.** It does not move the item's time. Snooze-style postpone is on the roadmap.
8. **Web app has no visual state for `postponed`.** Postponed items look identical to pending ones on the web dashboard. This is why a web check appeared to show "nothing changed" on 2026-09-29 when the database was in fact correct.
9. **Visuals are placeholder.** Plain text; domain/status pills and colors from the UI spec not yet applied.

**Resolved (2026-09-30, commit 7fabb75):** project moved into the personal_os repo at android/; credentials moved out of AuthRepository.kt into untracked local.properties, read via BuildConfig.

---

## 9. How to verify things

- **Android side:** Logcat, filter `tag:PersonalOS`.
- **Backend side:** on the VM, `sudo journalctl -u personalos-backend -f` to stream live requests.
- **Ground truth:** log in with curl to get a token, then `curl -H "Authorization: Bearer <token>" https://04os.duckdns.org/routines`. Trust this over either UI.

---

## 10. Related docs

- `PROJECT_CONTEXT.md` — backend + web source of truth
- `personalos-android-ui-spec.html` — visual target for Android screens
- `ROADMAP.md` — build order
- `BACKLOG.md` — deferred items and tech debt
