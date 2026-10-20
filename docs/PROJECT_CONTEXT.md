# Project Context

**Purpose**: Build a premium‑looking frontend prototype for a Pakistani consumer‑electronics and smart‑gadgets brand (working name **VYRO**). The prototype showcases product catalog, cart, and checkout flows, but remains frontend‑only until a MERN backend is integrated.

**Target Market**: Pakistan – prices displayed in PKR, with localized delivery information.

**Technology Stack**:
- React 19 (TSX)
- Vite
- TypeScript (strict mode)
- Tailwind CSS (utility‑first styling)
- React Router (client‑side routing)
- Zustand (global state, persisted)
- TanStack Query (data fetching & caching)
- Lucide React (icon library)
- React Hook Form & Zod (planned for checkout forms)
- Vitest + React Testing Library (unit / component testing)
- ESLint & Prettier (code quality & formatting)

**Brand Requirement**: Original identity – no copying of logos or layouts from existing brands. Visual direction is minimalist, technology‑inspired with a premium feel.

**Currency**: PKR (Pakistani Rupee).

**Scope**: Frontend prototype only. No backend services are built now; an API abstraction layer will be added later.

**Required Features (high‑level)**:
- Product catalogue (dynamic, driven by JSON/mock data)
- Product detail view
- Shopping cart with persistence
- Wishlist
- Checkout flow (forms will use React Hook Form & Zod)
- Responsive layout for mobile‑tablet‑desktop

**Non‑Negotiable Constraints**:
- Feature‑based folder architecture
- SOLID principles & separation of concerns
- Strict TypeScript typing
- Centralized design‑token system (CSS variables & Tailwind config)
- Reusable, modular UI components
- All state management via Zustand (cart, wishlist) and TanStack Query (data fetching)
