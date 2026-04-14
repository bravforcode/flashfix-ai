# Architecture Decision Records (ADR) - FlashFix AI

## ADR 001: Modular Refactoring from Monolith to React + Vite

**Date:** 2026-04-12
**Status:** Accepted

### Context

The original `FlashFix.html` was a 1,225-line monolithic file containing HTML, CSS, and JS. It was becoming difficult to maintain, test, and scale.

### Decision

Refactor the project into a modular architecture using:
- **React (18.3.1):** For component-based UI.
- **Vite (5.2.12):** For fast development and bundling.
- **TypeScript:** For type safety and better DX.
- **Zustand (4.5.2):** For lightweight global state management.

### Consequences

- Improved maintainability and readability.
- Faster build times and HMR.
- Type safety reduces runtime errors.
- Learning curve for developers new to React.

---

## ADR 002: Switching to Tailwind CSS

**Date:** 2026-04-12
**Status:** Accepted

### Context

The project initially used plain CSS with a Design Token system. The user requested a switch to Tailwind CSS for better styling efficiency.

### Decision

Use **Tailwind CSS (3.4.3)** for all styling. Map original Design Tokens to Tailwind theme extensions.

### Consequences

- Faster UI development.
- Consistent design system.
- Smaller CSS bundle size (Purge).

---

## ADR 003: Migrating from IndexedDB to Supabase

**Date:** 2026-04-12
**Status:** Accepted

### Context

IndexedDB was chosen for offline-first local storage. The user requested a switch to Supabase for cloud-based persistence.

### Decision

Use **Supabase** for database operations (AI Cache, Learning History, Mastery Scores).

### Consequences

- Cross-device sync capability.
- Easier data analysis and backend integration.
- Requires internet connection (unless offline sync is implemented later).

---

## ADR 004: Math Rendering with KaTeX

**Date:** 2026-04-12
**Status:** Accepted

### Context

The app frequently displays math formulas that need to be rendered beautifully.

### Decision

Integrate **KaTeX (0.16.10)** for high-performance math rendering. Create a `MathText` component that auto-parses LaTeX patterns.

### Consequences

- Professional-grade math display.
- Faster than MathJax.
- Requires careful handling of LaTeX strings in JSON responses.
