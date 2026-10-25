# VYRO — Consumer Technology E-commerce Frontend

VYRO is a React-based e-commerce frontend concept for a Pakistani consumer-technology brand. The product direction covers audio devices, wearables, charging accessories, mobile accessories, gaming gear, and smart-living products.

The visual direction is modern, minimalist, and technology-inspired. The project is being developed as a modular frontend that can use mock catalogue data during development and connect to a future MERN backend through a defined API boundary.

> **Project status:** Frontend project in development. Check [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) for the current implementation status and known limitations. Do not assume that order processing, payments, authentication, or inventory updates are connected to a live backend.

## Technology Stack

- **React** for the user interface
- **TypeScript** for typed application code
- **Vite** for development and production builds
- **React Router** for client-side routing
- **Tailwind CSS and CSS variables** for styling and design tokens, where configured
- **Zustand** for client-side shopping state, where implemented
- **TanStack Query** for asynchronous data fetching, where implemented
- **Vitest and React Testing Library** for automated tests, where configured
- **Lucide React** for icons, where used

The installed dependencies and available commands in `package.json` are the source of truth for the current setup.

## Getting Started

### Requirements

- Node.js and npm compatible with the versions used by this project
- Git

### Install dependencies

From the project root, run:

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

### Build for production

```bash
npm run build
```

The production build is written to `dist/`. This directory is generated output and should normally not be committed to Git.

### Run quality checks

Use the scripts available in `package.json`:

```bash
npm run lint
npm run typecheck
npm run test
```

A command is available only if its script has been configured in `package.json`. Update this README if the project's scripts change.

## Project Structure

The repository follows a feature-oriented structure. Some files and folders may still be under development.

```text
.
├── docs/
│   ├── API_CONTRACTS.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── IMPLEMENTATION_STATUS.md
│   └── PROJECT_CONTEXT.md
├── public/
│   ├── images/
│   ├── favicon.svg
│   └── icons.svg
├── scripts/
│   └── generate-images.js
├── src/
│   ├── app/
│   │   └── router.tsx
│   ├── assets/
│   ├── features/
│   │   ├── cart/
│   │   │   └── types/
│   │   ├── categories/
│   │   │   ├── data/
│   │   │   └── types/
│   │   ├── products/
│   │   │   ├── data/
│   │   │   └── types/
│   │   └── wishlist/
│   │       └── types/
│   ├── services/
│   │   └── catalogue/
│   ├── types/
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

### Architectural conventions

- **Feature folders:** Keep product, category, cart, and wishlist code within their relevant feature boundaries.
- **Shared services:** Keep catalogue retrieval and API communication outside presentation components.
- **Domain types:** Reuse the shared TypeScript models instead of defining duplicate product or category shapes.
- **Single source of truth:** Keep categories and product records in their designated data modules rather than hardcoding separate copies inside UI components.
- **Reusable UI:** Prefer shared components for repeated patterns such as product cards, price displays, buttons, loading states, and empty states.
- **Separation of concerns:** Keep API access, domain logic, state management, and presentation responsibilities distinct.
- **Documented decisions:** Update the files in `docs/` when an architectural or API decision changes.

## Catalogue and API Design

The catalogue layer is intended to provide a common interface for loading products and categories. Development can use a deterministic mock service; an HTTP-backed implementation can be selected when a compatible backend is available.

The proposed REST API contract is documented in [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md). The contract may include endpoints such as:

```text
GET /api/products
GET /api/products/:slug
GET /api/categories
GET /api/categories/:slug
GET /api/products/:slug/related
```

These endpoints are API contracts for future integration; they are not evidence that a live backend is running.

If an external sample API is used, transform its response through a mapper into the application's domain types. Do not make React components depend directly on an external API's raw response shape.

## Product and Category Data

When adding a product:

1. Find the designated product data module under `src/features/products/data/`.
2. Add a record that follows the shared `Product` type.
3. Use a unique product ID and URL-friendly slug.
4. Assign valid category and subcategory slugs from the category registry.
5. Add the relevant image to the source image directory used by the product record.
6. Include available product details such as price, description, features, specifications, and stock status. Keep optional fields optional when information is unavailable.
7. Add or update tests for any new catalogue behavior.

When adding a category or subcategory:

1. Update the centralized category registry under `src/features/categories/data/`.
2. Give it a stable, unique slug.
3. Ensure products reference the correct category and subcategory slugs.
4. Confirm that navigation and listing pages derive their links and content from the registry rather than duplicate hardcoded arrays.

To remove a product, remove or deactivate the corresponding source record and check for references such as related-product IDs. Avoid editing generated files in `dist/`; rebuild the project instead.

## Environment Configuration

Review `.env.example` for the supported configuration variables. If the frontend uses an API base URL or a service-mode selector, configure those values locally according to the documented names.

For Vite, client-exposed environment variables generally use the `VITE_` prefix. **Never place private API keys, database credentials, payment secrets, or other server-only secrets in client-exposed variables.** Anything bundled into a frontend application can be inspected by users.

Do not commit local `.env` files or secrets to Git.

## Testing and Quality

Automated tests should cover important behavior such as:

- Catalogue mapping and query helpers
- Product lookup and filtering
- Sorting and pagination
- HTTP client error handling
- Mock/HTTP service selection
- Cart calculations and quantity rules
- Wishlist state behavior
- Important user-interface interactions

Run the configured checks before pushing changes. Record any checks that could not run and any known defects in [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md).

## Current Limitations

Unless explicitly implemented and connected in this repository, the following must be treated as future work or simulation-only behavior:

- A production Node.js/Express backend
- MongoDB persistence
- Server-side authentication and authorization
- Live stock and pricing validation
- Persisted customer orders
- Payment-gateway processing
- Shipping-provider integration
- Real transactional email or SMS notifications

Frontend validation improves usability but is not a security boundary. A production backend must validate prices, stock, permissions, order data, and payment status independently.

## Development Guidelines

- Make focused changes instead of rebuilding working parts of the application.
- Reuse existing types, services, stores, and components.
- Keep comments short and explain intent or non-obvious behavior rather than repeating the code.
- Add tests when changing business logic.
- Keep generated build output and dependencies out of source control.
- Update the relevant documentation when requirements, routes, API contracts, or architecture change.
- Do not describe mock behavior as production-connected functionality.

## Documentation

- [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) — project scope and requirements
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — code organization and technical boundaries
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — visual tokens and UI conventions
- [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) — catalogue API contracts
- [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) — completed work, pending work, and known issues

## License

No license has been specified yet. Add a `LICENSE` file before distributing or reusing this project under an explicit open-source license.
