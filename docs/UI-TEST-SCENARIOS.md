# dToggl — Full UI Test Scenarios

> **96 automated Playwright E2E tests** across 16 sections.
> All tests pass against `localhost:3000` with a fresh SQLite database.
>
> Run: `npx playwright test`

---

## 1. Authentication (12 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1.1 | Landing page redirect | Navigate to `/` while unauthenticated | Redirected to `/login` |
| 1.2 | Protected route guard | Visit `/timer`, `/projects`, `/clients`, `/calendar`, `/reports`, `/settings` unauthenticated | Each redirects to `/login` |
| 1.3 | Login page renders | Navigate to `/login` | Email input, password input, submit button, and "Sign up" link visible |
| 1.4 | Register page renders | Navigate to `/register` | Name, email, password inputs and submit button visible |
| 1.5 | Successful registration | Fill name/email/password on `/register`, submit | Redirected to `/timer`; timer bar visible |
| 1.6 | Successful login | Register via API, then fill email/password on `/login`, submit | Redirected to `/timer`; timer bar visible |
| 1.7 | Wrong password error | Login with correct email but wrong password | Error message displayed; stays on `/login` |
| 1.8 | Duplicate registration | Register same email twice via API | Second call returns HTTP 409 |
| 1.9 | Authenticated user on /login | Login, then navigate to `/login` | Redirected to `/timer` |
| 1.10 | Logout flow | Login, click "Log out" in sidebar | Session cleared; redirected to `/login`; `/timer` no longer accessible |
| 1.11 | /api/auth/me (authenticated) | Call GET `/api/auth/me` with valid session | Returns JSON with `id`, `email`, `name`, `workspaceId` |
| 1.12 | /api/auth/me (unauthenticated) | Call GET `/api/auth/me` without cookie | Returns HTTP 401 |

---

## 2. Timer & Time Tracking (10 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 2.1 | Timer bar renders | Navigate to `/timer` | Description input, play button, and `00:00:00` display visible |
| 2.2 | Start timer via play button | Click the play/start button | Timer starts; elapsed display counts up; stop button appears |
| 2.3 | Start timer via Enter key | Type description in input, press Enter | Timer starts with that description |
| 2.4 | Stop timer saves entry | Start timer with description, wait, click stop | Timer resets to `00:00:00`; entry appears in list below with description and duration |
| 2.5 | Entry appears in list | Stop a timer | Completed entry visible in time entries list with correct description |
| 2.6 | Entries grouped by day | Create entries for today | Entries grouped under date header showing day name and daily total |
| 2.7 | Delete a time entry | Create entry, click delete button on it | Entry removed from list; deletion confirmed |
| 2.8 | Empty state | New user with no entries | "No time entries" or similar empty state message shown |
| 2.9 | Timer persists on reload | Start timer, reload page | Timer still running with accumulated time after reload |
| 2.10 | Billable toggle | Toggle billable icon on timer bar, start/stop timer | Entry saved with `billable: true` (verified via API) |

---

## 3. Projects (8 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 3.1 | Projects page renders | Navigate to `/projects` | Heading "Projects" and "Create Project" button visible |
| 3.2 | Create project | Click "Create Project", fill name, save | New project appears in list |
| 3.3 | Project color indicator | Create project with specific color | Color swatch displayed next to project name |
| 3.4 | Edit project name | Click edit on existing project, change name, save | Updated name shown in list |
| 3.5 | Delete project | Click delete on project, confirm | Project removed from list |
| 3.6 | Link project to client | Create client first, then create project selecting that client | Project shows client association |
| 3.7 | Project API fields | GET `/api/projects` | Each project has `id`, `name`, `color`, `billable`, `clientId`, etc. |
| 3.8 | Multiple projects listed | Create 3 projects | All 3 appear in the list correctly |

---

## 4. Clients (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 4.1 | Clients page renders | Navigate to `/clients` | Heading and create button visible |
| 4.2 | Create client | Click "Create Client", fill name, save | New client appears in list |
| 4.3 | Edit client name | Click edit on existing client, change name, save | Updated name shown |
| 4.4 | Delete client | Click delete, confirm | Client removed from list |
| 4.5 | Client API fields | GET `/api/clients` | Returns `id`, `name`, `archived`, `workspaceId` |

---

## 5. Tags (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 5.1 | Tags page renders | Navigate to `/tags` | "Tags" heading visible |
| 5.2 | Create tag via inline input | Type tag name in input, press Enter or click add | Tag appears in tag list |
| 5.3 | Delete tag | Click delete on existing tag | Tag removed from list |
| 5.4 | Duplicate tag constraint | Create tag "Work", then try creating "Work" again | Returns HTTP 500 (unique constraint violation) |
| 5.5 | Multiple tags display | Create 3 tags via API | All 3 listed correctly |

---

## 6. Calendar View (6 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 6.1 | Calendar renders | Navigate to `/calendar` | Current month name, day-of-week headers (Sun–Sat or Mon–Sun) visible |
| 6.2 | "Today" button | Navigate away from current month, click "Today" | Returns to current month |
| 6.3 | Month navigation | Click prev/next arrows | Month name updates; day grid changes accordingly |
| 6.4 | Duration heatmap | Seed entries with varying durations | Calendar cells show duration indicators/heatmap coloring |
| 6.5 | Day detail sidebar | Click on a day with entries | Sidebar opens showing entries for that day with descriptions and durations |
| 6.6 | Month statistics | View calendar with seeded entries | Statistics cards show total hours, average daily hours, active days |

---

## 7. Reports (5 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 7.1 | Reports page renders | Navigate to `/reports` | Summary cards visible (total tracked, average per day, etc.) |
| 7.2 | Date range selectors | Check for date range options | Week / Month / Year selectors present |
| 7.3 | Reports reflect data | Seed time entries via API, view reports | Summary cards show non-zero values matching seeded data |
| 7.4 | Switch date range | Click different range (Week → Month) | View updates to reflect new range |
| 7.5 | Reports API structure | GET `/api/reports` | Returns `totalDuration`, `entriesCount`, `projectBreakdown`, `dailyBreakdown` |

---

## 8. Settings (2 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 8.1 | Profile info displayed | Navigate to `/settings` | Shows user email and name |
| 8.2 | App version shown | View settings page | Version number or app info visible |

---

## 9. Sidebar Navigation (6 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 9.1 | All nav items present | Login, check sidebar | Timer, Projects, Clients, Tags, Calendar, Reports, Settings links visible |
| 9.2 | Branding visible | Check sidebar header | "dToggl" logo/text displayed |
| 9.3 | Navigation works | Click each nav link | Navigates to correct page (`/timer`, `/projects`, `/clients`, `/tags`, `/calendar`, `/reports`, `/settings`) |
| 9.4 | Active item highlighted | Navigate to `/projects` | Projects link has active/highlighted styling |
| 9.5 | Section labels | Check sidebar structure | Section groupings: TRACK, ANALYZE, MANAGE, ADMIN visible |
| 9.6 | Shortcuts & Logout | Check sidebar footer area | "Shortcuts" and "Log out" buttons present |

---

## 10. Keyboard Shortcuts (9 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 10.1 | `?` opens help modal | Press `?` key | Keyboard shortcuts modal appears |
| 10.2 | Escape closes modal | Open shortcuts modal, press `Escape` | Modal closes |
| 10.3 | `p` → Projects | Press `p` | Navigates to `/projects` |
| 10.4 | `r` → Reports | Press `r` | Navigates to `/reports` |
| 10.5 | `c` → Calendar | Press `c` | Navigates to `/calendar` |
| 10.6 | `t` → Timer | Press `t` | Navigates to `/timer` |
| 10.7 | Shortcuts disabled in inputs | Focus on description input, press `p` | Types "p" into input instead of navigating |
| 10.8 | `Ctrl+N` → Timer | Press `Ctrl+N` | Navigates to `/timer` (new entry shortcut) |
| 10.9 | Sidebar shortcuts button | Click "Shortcuts" button in sidebar | Help modal opens |

---

## 11. Toast Notifications (3 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 11.1 | Timer start toast | Start a timer | Success toast appears ("Timer started" or similar) |
| 11.2 | Timer stop toast | Stop a running timer | Toast shows "Saved" with duration |
| 11.3 | Toast auto-dismiss | Trigger a toast, wait ~3 seconds | Toast disappears automatically |

---

## 12. Time Entry ↔ Project Association (2 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 12.1 | Entry with project via API | Create project via API, create time entry linked to project, visit `/timer` | Entry displays with project name and color |
| 12.2 | Timer project picker | Create projects, click project picker on timer bar | Dropdown shows available projects |

---

## 13. API Contracts (9 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 13.1 | POST time entry shape | POST `/api/time-entries` with valid data | Returns full entry: `id`, `description`, `start`, `stop`, `duration`, `projectId`, `tags` |
| 13.2 | GET entries date range | GET `/api/time-entries?from=...&to=...` | Returns only entries within the specified date range |
| 13.3 | GET current entry (none) | GET `/api/time-entries/current` with no running timer | Returns `null` or empty response |
| 13.4 | PATCH entry | PATCH `/api/time-entries/:id` with updated description | Returns updated entry with new description |
| 13.5 | DELETE entry | DELETE `/api/time-entries/:id` | Returns success; GET no longer returns that entry |
| 13.6 | Unauthenticated 401s | Call all major API endpoints without auth cookie | All return HTTP 401 |
| 13.7 | GET projects array | GET `/api/projects` | Returns array of project objects |
| 13.8 | GET clients array | GET `/api/clients` | Returns array of client objects |
| 13.9 | GET tags array | GET `/api/tags` | Returns array of tag objects |

---

## 14. Data Isolation (2 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 14.1 | User A cannot see User B projects | Create project as User A; login as User B, GET `/api/projects` | User B sees empty list (not User A's projects) |
| 14.2 | User A cannot see User B entries | Create time entry as User A; login as User B, GET `/api/time-entries` | User B sees empty list (not User A's entries) |

---

## 15. Edge Cases & Error Handling (8 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 15.1 | Register missing email | POST `/api/auth/register` with no email | Returns HTTP 400 |
| 15.2 | Register missing password | POST `/api/auth/register` with no password | Returns HTTP 400 |
| 15.3 | Login non-existent user | POST `/api/auth/login` with unknown email | Returns HTTP 401 |
| 15.4 | Create project empty name | POST `/api/projects` with `name: ""` | Returns a response (may succeed or reject based on validation) |
| 15.5 | Create client empty name | POST `/api/clients` with `name: ""` | Returns a response (may succeed or reject based on validation) |
| 15.6 | Delete non-existent entry | DELETE `/api/time-entries/non-existent-id` | Returns HTTP 404 |
| 15.7 | Auto-calculated duration | POST time entry with `start` and `stop` | Response `duration` equals `stop - start` in seconds |
| 15.8 | Running entry null duration | POST time entry with `start` only (no `stop`) | Response `duration` is `null` |

---

## 16. Visual & Layout (4 tests)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 16.1 | Dark theme default | Login, check `<html>` or `<body>` classes | Dark theme class applied (e.g., `dark` class or dark background color) |
| 16.2 | Page title | Check `document.title` | Contains "dToggl" |
| 16.3 | Sidebar width | Measure sidebar element | Fixed at 208px (Tailwind `w-52`) |
| 16.4 | Modal backdrop click-to-close | Open shortcuts modal, click outside/on backdrop | Modal closes |

---

## Test Architecture

### Test Helpers (`tests/e2e/helpers.ts`)

| Helper | Purpose |
|--------|---------|
| `uniqueEmail()` | Generates collision-free email per test using `runId + counter` |
| `TEST_PASSWORD` | Shared constant: `TestPass123!` |
| `apiRegister(page, email, password?, name?)` | Registers user via POST `/api/auth/register` |
| `apiLogin(page, email, password?)` | Logs in via POST `/api/auth/login`, stores cookie |
| `registerAndLogin(page, name?)` | One-shot: register + login with unique email |
| `apiCreateProject(page, data)` | POST `/api/projects` |
| `apiCreateClient(page, data)` | POST `/api/clients` |
| `apiCreateTag(page, data)` | POST `/api/tags` |
| `apiCreateTimeEntry(page, data)` | POST `/api/time-entries` |
| `waitForApp(page)` | Waits for `networkidle` state |

### Data Model (Prisma Schema)

| Model | Key Fields |
|-------|------------|
| **User** | id, email, name, passwordHash, timezone, dateFormat, timeFormat, darkMode, weekStart |
| **Workspace** | id, name; has members, projects, clients, tags, timeEntries |
| **WorkspaceMember** | userId, workspaceId, role (admin/member) |
| **Client** | id, name, archived, workspaceId |
| **Project** | id, name, color, billable, archived, estimate, workspaceId, clientId |
| **Tag** | id, name, workspaceId; unique on (name, workspaceId) |
| **TimeEntry** | id, description, start, stop, duration, billable, userId, workspaceId, projectId |
| **TimeEntryTag** | timeEntryId, tagId (composite PK) |

### Running Tests

```bash
# Prerequisites
cd dtoggl
cp .env.example .env          # if first time
npx prisma generate
npx prisma db push

# Start dev server
npm run dev

# Run all 96 tests
npx playwright test

# Run specific section
npx playwright test -g "Authentication"
npx playwright test -g "Timer"

# Run with UI mode
npx playwright test --ui

# Run headed (see browser)
npx playwright test --headed
```

---

**Total: 96 tests | 16 sections | All passing**
