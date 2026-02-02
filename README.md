# CodeXFrame — Project Control Center

A static, vanilla HTML/CSS/JS dashboard for tracking and managing all your projects. No frameworks, no build tools — deploy directly to GitHub Pages or Netlify.

## How It Works

The app loads project data from `data/projects.json` (the **defaults**), then merges in any **local overrides** stored in your browser's localStorage. Local overrides win when both exist for the same field.

### Views

- **Dashboard** — Projects grouped by Phase (4 → 1), with collapsible cards showing status, notes, tech, tags, and action buttons.
- **Table** — Sortable columns (click headers), inline dropdowns for phase and status changes.

### Filters & Search

- **Search** — Matches against title, notes, tech, tags, and nextAction.
- **Phase** / **Status** / **Category** / **Priority** — Dropdown filters.
- **Needs action** — Shows only projects where `nextAction` is set or status is `not_started`, `auditing`, or `fixing`.

### Actions

All actions write to localStorage overrides (no server needed):

- **Mark reviewed** — Sets `lastReviewed` to today's date.
- **Freeze** — Sets status to `frozen` and marks as reviewed today.
- **Archive** — Sets status to `archived`.

In Table view you can also change phase and status directly via dropdowns.

## Editing projects.json

The file `data/projects.json` is the source of truth for project defaults. Each entry:

```json
{
  "id": "my-project",
  "title": "My Project",
  "category": "ferdig | påbegynt | ide",
  "phase": 1-4,
  "status": "not_started | auditing | fixing | active | frozen | archived",
  "repoUrl": "https://github.com/..." or null,
  "liveUrl": "https://..." or null,
  "lastReviewed": "2025-07-12" or null,
  "nextAction": "What to do next",
  "notes": "Description or context",
  "tech": ["HTML", "CSS", "JavaScript"],
  "tags": ["web", "tool"],
  "priority": "low | medium | high" or null
}
```

### Field Meanings

| Field | Purpose |
|---|---|
| `id` | Stable slug, used for deep-linking and override keys |
| `phase` | Maturity: 1=Idea, 2=In progress, 3=MVP, 4=Live |
| `status` | Current workflow state |
| `category` | Original Norwegian grouping (ferdig/påbegynt/ide) |
| `nextAction` | What needs to happen next (shown as "Needs action" dot) |
| `priority` | Optional — shown as colored dot (red/orange/green) |

### Status Values

| Status | Meaning |
|---|---|
| `not_started` | No work done yet on this iteration |
| `auditing` | Currently reviewing / analyzing |
| `fixing` | Actively fixing issues |
| `active` | Healthy and maintained |
| `frozen` | Intentionally paused |
| `archived` | No longer active |

## localStorage Overrides

When you use the UI to change a project's status, mark it reviewed, freeze it, etc., those changes are saved as **overrides** in `localStorage` under the key `cxf-overrides`. They are merged on top of the JSON defaults at load time.

This means:
- Editing `projects.json` updates defaults for everyone.
- Your personal changes (via the UI) persist in your browser only.
- Overrides take precedence per-field.

## Import / Export / Reset

At the bottom of the page:

- **Export JSON** — Downloads the fully merged dataset (defaults + your overrides) as a `.json` file.
- **Import JSON** — Upload a previously exported file. Replaces all local overrides.
- **Reset overrides** — Clears all localStorage overrides and reloads from `projects.json` defaults.

## Themes

Three color themes available via the nav bar: **Light**, **Sky**, and **Dark**. Selection is persisted in localStorage.

## Deployment

This is a static site. Deploy the repo root to any static host:

```bash
# GitHub Pages: enable Pages on the repo root
# Netlify: set publish directory to "/"
# Or just open index.html locally
```

No build step required.
