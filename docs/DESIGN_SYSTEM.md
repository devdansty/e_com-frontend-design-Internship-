# VYRO Design System

> Last updated: 2026-10-24 — Phase 1 (Foundation)

## Visual Direction

- **Modern and minimalist** — clean editorial layouts, generous whitespace
- **Premium consumer technology** — inspired by brands like Apple, Nothing, and Bang & Olufsen
- **Restrained accent color** — a single electric cyan-mint (`#00E5CC`) used sparingly
- **Off-white surfaces** — warm neutral `#FAFAFA` background, pure white cards
- **Deep charcoal typography** — `#1A1A2E` primary, grey secondary
- **Subtle details** — controlled shadows, fine borders, micro-interactions (planned)

---

## Color Tokens

All colors are defined as CSS custom properties in `src/index.css` and mapped
to Tailwind utilities via `tailwind.config.ts` under the `vyro` prefix.

### Brand / Accent

| Token                     | Value                        | Tailwind Class                    |
|---------------------------|------------------------------|-----------------------------------|
| `--vyro-accent`           | `#00E5CC`                    | `bg-vyro-accent`, `text-vyro-accent` |
| `--vyro-accent-hover`     | `#00CDB6`                    | `bg-vyro-accent-hover`            |
| `--vyro-accent-muted`     | `rgba(0, 229, 204, 0.12)`   | `bg-vyro-accent-muted`            |

### Surfaces

| Token                         | Value                        | Usage                |
|-------------------------------|------------------------------|----------------------|
| `--vyro-bg`                   | `#FAFAFA`                    | Page background      |
| `--vyro-surface`              | `#FFFFFF`                    | Cards, panels        |
| `--vyro-surface-elevated`     | `#FFFFFF`                    | Elevated cards       |
| `--vyro-surface-overlay`      | `rgba(0, 0, 0, 0.45)`       | Modal overlays       |

### Text

| Token                     | Value       | Usage                   |
|---------------------------|-------------|-------------------------|
| `--vyro-text-primary`     | `#1A1A2E`   | Headings, body          |
| `--vyro-text-secondary`   | `#6B7280`   | Supporting text         |
| `--vyro-text-muted`       | `#9CA3AF`   | Captions, placeholders  |
| `--vyro-text-inverse`     | `#FFFFFF`   | Text on dark surfaces   |
| `--vyro-text-accent`      | `#009E8E`   | Accent links/labels     |

### Borders

| Token                     | Value       |
|---------------------------|-------------|
| `--vyro-border`           | `#E5E7EB`   |
| `--vyro-border-strong`    | `#D1D5DB`   |
| `--vyro-border-focus`     | `#00E5CC`   |

### State Colors

| Token              | Value                        | Usage         |
|--------------------|------------------------------|---------------|
| `--vyro-success`   | `#10B981`                    | Confirmations |
| `--vyro-success-bg`| `rgba(16, 185, 129, 0.08)`   | Success bg    |
| `--vyro-warning`   | `#F59E0B`                    | Alerts        |
| `--vyro-warning-bg`| `rgba(245, 158, 11, 0.08)`   | Warning bg    |
| `--vyro-error`     | `#EF4444`                    | Errors        |
| `--vyro-error-bg`  | `rgba(239, 68, 68, 0.08)`    | Error bg      |

---

## Typography

**Font stack**: `Inter`, `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial`, `sans-serif`

Inter is loaded from Google Fonts (weights: 300, 400, 500, 600, 700).

### Scale

| Token              | Size    | Typical Use        |
|--------------------|---------|--------------------|
| `--vyro-text-xs`   | 12px    | Fine print         |
| `--vyro-text-sm`   | 14px    | Captions, labels   |
| `--vyro-text-base` | 16px    | Body text          |
| `--vyro-text-lg`   | 18px    | Large body         |
| `--vyro-text-xl`   | 20px    | Subheadings        |
| `--vyro-text-2xl`  | 24px    | Section headings   |
| `--vyro-text-3xl`  | 30px    | Page headings      |
| `--vyro-text-4xl`  | 36px    | Hero subheadings   |
| `--vyro-text-5xl`  | 48px    | Hero headings      |
| `--vyro-text-6xl`  | 60px    | Display headings   |

### Line Heights

| Token                    | Value  |
|--------------------------|--------|
| `--vyro-leading-tight`   | 1.15   |
| `--vyro-leading-snug`    | 1.3    |
| `--vyro-leading-normal`  | 1.5    |
| `--vyro-leading-relaxed` | 1.65   |

### Letter Spacing

| Token                     | Value     |
|---------------------------|-----------|
| `--vyro-tracking-tight`   | -0.025em  |
| `--vyro-tracking-normal`  | 0em       |
| `--vyro-tracking-wide`    | 0.05em    |
| `--vyro-tracking-wider`   | 0.1em     |

---

## Spacing Scale

Uses a `0.25rem` (4px) base unit. All defined as `--vyro-space-{n}`.

| Token             | Value   | Pixels |
|-------------------|---------|--------|
| `--vyro-space-1`  | 0.25rem | 4px    |
| `--vyro-space-2`  | 0.5rem  | 8px    |
| `--vyro-space-3`  | 0.75rem | 12px   |
| `--vyro-space-4`  | 1rem    | 16px   |
| `--vyro-space-5`  | 1.25rem | 20px   |
| `--vyro-space-6`  | 1.5rem  | 24px   |
| `--vyro-space-8`  | 2rem    | 32px   |
| `--vyro-space-10` | 2.5rem  | 40px   |
| `--vyro-space-12` | 3rem    | 48px   |
| `--vyro-space-16` | 4rem    | 64px   |
| `--vyro-space-20` | 5rem    | 80px   |
| `--vyro-space-24` | 6rem    | 96px   |

---

## Border Radii

| Token                  | Value   |
|------------------------|---------|
| `--vyro-radius-none`   | 0       |
| `--vyro-radius-sm`     | 4px     |
| `--vyro-radius-md`     | 8px     |
| `--vyro-radius-lg`     | 12px    |
| `--vyro-radius-xl`     | 16px    |
| `--vyro-radius-full`   | 9999px  |

---

## Shadows

| Token              | Description           |
|--------------------|-----------------------|
| `--vyro-shadow-xs` | Barely visible lift   |
| `--vyro-shadow-sm` | Cards at rest         |
| `--vyro-shadow-md` | Cards on hover        |
| `--vyro-shadow-lg` | Dropdowns, popovers   |
| `--vyro-shadow-xl` | Modals, dialogs       |

---

## Content Widths

| Token             | Value   | Usage                |
|-------------------|---------|----------------------|
| `--vyro-width-sm` | 640px   | Narrow content       |
| `--vyro-width-md` | 768px   | Tablet content       |
| `--vyro-width-lg` | 1024px  | Desktop content      |
| `--vyro-width-xl` | 1280px  | Wide content         |
| `--vyro-width-2xl`| 1440px  | Maximum content      |

---

## Responsive Breakpoints

Uses Tailwind's default breakpoint system:

| Prefix | Min Width |
|--------|-----------|
| `sm`   | 640px     |
| `md`   | 768px     |
| `lg`   | 1024px    |
| `xl`   | 1280px    |
| `2xl`  | 1536px    |

---

## Transitions

| Token                    | Value  |
|--------------------------|--------|
| `--vyro-duration-fast`   | 100ms  |
| `--vyro-duration-normal` | 200ms  |
| `--vyro-duration-slow`   | 350ms  |
| `--vyro-easing`          | cubic-bezier(0.4, 0, 0.2, 1) |

---

## Global Base Styles (Implemented)

- `box-sizing: border-box` on all elements
- Antialiased font rendering
- `scroll-behavior: smooth` (respects `prefers-reduced-motion`)
- Heading scale (h1–h6) with tight line-height and tight tracking
- Links: inherit color, accent on hover
- Buttons: reset to bare element (no browser chrome)
- Images: `display: block`, `max-width: 100%`
- Inputs: inherit font
- `:focus-visible` ring using accent color
- `::selection` uses accent-muted background
- Slim custom scrollbar
- `#root` flex column with `isolation: isolate`

---

## Conventions (Planned)

The following are planned for later phases and are **not yet implemented**:

- **Button variants**: primary, secondary, outline, ghost, destructive
- **Input fields**: consistent border, focus ring, error state
- **Product cards**: image ratio, title/price/badge layout
- **Interaction patterns**: hover lifts, skeleton loaders
- **Accessibility**: WCAG AA contrast ratios, ARIA patterns
