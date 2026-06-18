# Campus Life Planner

A lightweight, accessible single-page web application for students to manage campus tasks, events, and study sessions. Track assignments, club meetings, and academic activities all in one place.

Built with **vanilla HTML, CSS, and JavaScript**. No frameworks. No external dependencies.

---

## Live Project

- **Project URL:** [https://eunice-nina.github.io/campus-life-planner/](https://eunice-nina.github.io/campus-life-planner/)
- **Demo Video:** https://youtu.be/nAduw0ffST4

---

## Features

- Create and manage campus tasks and events with due dates
- Regex-powered search with match highlighting
- Weekly study target with live progress tracking
- Duration tracking in minutes with automatic hour conversion
- Sortable records table (by date, title, or duration)
- JSON import and export
- Fully keyboard navigable; no mouse required
- Screen reader accessible with ARIA live regions
- Mobile-first responsive design (360px → 1024px+)
- Dark/Light mode toggle

---

## File Structure

```
campus-life-planner/
├── index.html          # Single page, all 5 sections
├── tests.html          # Regex unit tests (M3)
├── seed.json           # 5 sample records
├── README.md           # This file
│
├── styles/
│   └── main.css        # Variables, reset, layout, typography, breakpoints
│
└── scripts/
    ├── app.js          # Entry point, event listeners, init
    ├── storage.js      # localStorage load/save (M6)
    ├── ui.js           # DOM rendering functions (M4, M5)
    ├── validators.js   # Regex validation rules (M3)
    ├── search.js       # Regex search & highlighting (M4)
    └── stats.js        # Dashboard statistics calculations (M5)
```

---

## Regex Catalog

| Rule | Pattern | Purpose |
|------|---------|---------|
| Title | `^\S(?:.*\S)?$` | No leading or trailing spaces |
| Due Date | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | Valid date in `YYYY-MM-DD` format |
| Duration | `^(0\|[1-9]\d*)$` | Positive integer (minutes) |
| Tag | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | Letters, spaces, and hyphens only |
| Duplicate word | `\b(\w+)\s+\1\b` | Catches "the the" typos using a back-reference |
| Time tokens | `\b\d{2}:\d{2}\b` | Finds time patterns like `14:30` |
| Tag filter | `(?=.*Academics)` | Lookahead for filtering by tag |
| Capitalized words | `\b[A-Z][a-z]+\b` | Finds capitalized words in search |
| 3-digit numbers | `\d{3}` | Finds durations like `120` or `180` |

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next element |
| `Shift + Tab` | Move to previous element |
| `Enter` / `Space` | Activate button or link |
| `Escape` | Cancel edit / close form |
| `Ctrl + 1` | Navigate to Dashboard |
| `Ctrl + 2` | Navigate to Records |
| `Ctrl + 3` | Navigate to Add Record |
| `Ctrl + 4` | Navigate to Settings |
| `Ctrl + 5` | Navigate to About |

The entire application is keyboard navigable. No mouse required.

---

## Accessibility

- **Skip link** — First focusable element; jumps directly to main content
- **Semantic landmarks** — `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- **Form labels** — Every `<input>` has a matching `<label for="...">`
- **Error messages** — `aria-describedby` and `aria-invalid` on invalid fields
- **Live regions:**
  - `role="status" aria-live="polite"` — form success messages, target under cap
  - `aria-live="assertive"` — urgent alerts when target is exceeded
  - `role="alert"` — validation errors
- **Focus styles** — Custom `outline: 2px solid #4A6CF7; outline-offset: 3px`
- **Colour contrast** — All text meets WCAG AA (≥ 4.5:1 ratio)
- **Sort buttons** — `aria-sort="ascending"` / `"descending"` / `"none"`
- **Search highlights** — `<mark>` elements with screen reader context
- **Reduced motion** — Respects the `prefers-reduced-motion` OS setting

---

## Responsive Breakpoints

| Viewport | Layout |
|----------|--------|
| 360px (base) | Single column, card layout for records |
| 768px+ | 4-column stats grid, records displayed as a table |
| 1024px+ | Full desktop layout with grid-based forms |

Strategy: **Mobile-first CSS** — base styles target 360px, then progressively enhanced using `min-width` media queries.

---

## Getting Started

### Clone and open

```bash
git clone https://github.com/yourusername/campus-life-planner.git
cd campus-life-planner
open index.html
# Or right-click index.html → Open with Live Server (VS Code)
```

### What to expect at this stage (M2)

- All 5 sections are visible and styled (Dashboard, Records, Add/Edit Form, Settings, About)
- Navigation works — clicking tabs scrolls to the correct section
- Forms are styled but do not yet validate (validation added in M3)
- Tables and stats are empty (populated in M4 and M5)
- No data persistence yet (added in M6)

### Run the tests

```bash
open tests.html
```

Regex unit tests run automatically on page load and display results inline.

---

## Data Model

Every record follows this structure:

```json
{
  "id": "rec_001",
  "title": "Study for Math Final",
  "dueDate": "2026-01-25",
  "duration": 180,
  "tag": "Academics",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

Sample data with 5 diverse records is available in `seed.json`.

---

## Contact

- **GitHub:** [github.com/Eunice-Nina](https://github.com/Eunice-Nina)
- **Email:** s.eunice@alustudent.com
