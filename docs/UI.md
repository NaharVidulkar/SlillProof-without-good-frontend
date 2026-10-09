# SkillProof UI & Design System Specification

## 1. Design Philosophy: "Learnthru" Three-Column Student Dashboard
SkillProof uses a calm, evidence-driven, three-column layout inspired by the Learnthru reference architecture. It balances clarity, high information density, and focused examination spaces.

---

## 2. Palette & Design Tokens

Defined centrally in `src/index.css` via `@theme` and CSS variables:

| Token | Hex Value | Usage |
|---|---|---|
| `--color-page` / `--bg-page` | `#D9DEE8` | Outer canvas / background margin |
| `--color-main` / `--bg-main` | `#EAEDF2` | Main surface container |
| `--color-panel` / `--bg-panel` | `#FFFFFF` | Cards, sidebar, and right panel |
| `--color-navy` / `--text-navy` | `#3B4A6B` | Primary headings, brand text, emphasis |
| `--color-muted-text` / `--text-muted` | `#8A94AD` | Secondary copy, metadata, timestamps |
| `--color-pill` / `--btn-pill` | `#7B8AB8` | Primary pill action buttons |
| `--color-pill-hover` | `#6877A6` | Button hover state |
| `--color-blue-accent` / Section A | `#4A64B8` to `#5A77D4` | Basic / Easy section card gradient |
| `--color-periwinkle` / Section B | `#6F86C9` to `#7E92D2` | Medium section card gradient |
| `--color-purple-accent` / Section C | `#8E7FBF` to `#E57D8E` | Hard section card gradient (purple to coral) |
| `--color-coral` | `#F28B94` | Calendar "Today" highlight, status alerts |

### Typography
- **Primary Font Family:** Mulish (`sans-serif`), loaded via Google Fonts.
- **Weights:** Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800).
- **Monospace:** System monospace font for code snippets, time codes, and percentages.

---

## 3. Layout Architecture

### A. Desktop (1280px and up)
- Three full-height rounded columns:
  1. **LEFT Sidebar:** 240px (`w-60`), white, sticky, rounded-3xl (`rounded-2xl` / `rounded-3xl`), contains original SkillProof mark and wordmark, lucide line-icon navigation, and bottom "Need help?" card with illustration linking to `/help`.
  2. **MAIN Column:** Flexible surface (`flex-1`), light gray-blue (`#EAEDF2`), rounded-3xl, scrollable, holds TopBar and view content.
  3. **RIGHT Panel:** 320px (`w-80`), white, sticky, rounded-3xl. Rendered **only on `/dashboard`**.

### B. Intermediate Screens (1024px to 1279px)
- The Left Sidebar remains visible.
- The Right Panel collapses and stacks below the main content inside the main column as rounded cards.

### C. Mobile & Tablets (< 900px, including 390px)
- Sidebar transforms into a slide-in modal drawer triggered by the hamburger menu icon in TopBar.
- Single-column stacked layout with zero horizontal page scroll at 390px.
- Data tables scroll horizontally inside their own isolated `overflow-x-auto` wrapper with minimum column constraints.

### D. Assessment Attempt Focus Mode
- Full-width isolated workspace with **no sidebar and no right panel** to eliminate distractions during timed coding evaluations.

---

## 4. Shared Components

### Layout (`src/components/layout/`)
- `AppShell`: Top-level wrapper managing 3-column desktop layout, mobile drawer, responsive breakpoints, and attempt mode isolation.
- `Sidebar`: Brand identity, navigation tabs, active state indicators, and "Need help?" card.
- `TopBar`: Client-side search field with live autocomplete dropdown and dynamic date formatting (`8 October 2026, Thursday`).
- `RightPanel`: Dedicated dashboard right panel hosting ProfileCard, BadgeCard, MiniCalendar, and ReminderList.

### UI Components (`src/components/ui/`)
- `Banner`: Welcome card featuring state-driven copy, pill action button, and original inline isometric 3D code-window cards SVG illustration.
- `GradientCard`: Section cards featuring Easy (blue), Medium (periwinkle), and Hard (purple-to-coral) gradients with progress bars and question weights.
- `DataTable`: Generic data table rendering spaced, white rounded rows matching Learnthru design.
- `ProfileCard`: Circular avatar, candidate name, role, and pill button to `/profile`.
- `BadgeCard`: Current verified badge tier, percentage, status chip (Active / Provisional / Under review), and credential view link.
- `MiniCalendar`: Interactive month calendar with coral "Today" badge and soft lavender pills for days with real activities with tooltips.
- `ReminderList`: Real notifications for pending deadlines, retake availability, and weakest skill practise recommendations with bottom gradient fade.
- `LevelBadge`: Novice, Beginner, Intermediate, Advanced badges.
- `ConfidenceRing`: SVG radial progress indicator for Low, Medium, and High Bayesian confidence.
- `TierChip`: Claimed, Assessed, and Demonstrated verification tier chips.
