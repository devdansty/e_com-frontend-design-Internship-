# VYRO Architecture & Domain Model

> Last updated: Phase 3 — Centralized Category Registry & Mock Product Dataset

---

## 1. Architectural Principles

The VYRO frontend prototype is structured according to **Feature-Driven Modular Architecture** combined with **Domain-Driven Design (DDD)** principles:

1. **Separation of Concerns**: Domain models represent core business entities and logic independently from React presentation components, UI styling, and specific state containers.
2. **Single Source of Truth**: Each domain entity has exactly one canonical definition located in its respective feature module. No domain type is duplicated across directories.
3. **Unidirectional Dependency Graph (Acyclic)**: Feature modules and shared modules maintain strict topological dependencies. Cross-cutting types never depend on feature types, and features do not form circular dependencies.
4. **Centralized Re-Export Hub**: All domain types are aggregated and re-exported via `src/types/index.ts`, offering clean imports for consumers while preserving clear feature ownership.
5. **Strict TypeScript Typing**:
   - Explicit types over `any` or loose `Record<string, any>`.
   - Optionality is explicit: genuinely optional fields are marked with `?`, whereas mandatory domain attributes (e.g., `id`, `slug`, `price`, `currency`, `stockStatus`) are strictly required.
   - Designed for TypeScript modern compiler settings (`erasableSyntaxOnly`, `verbatimModuleSyntax`). Pure type annotations with zero runtime bundle overhead.

---

## 2. Directory Layout & Type Organization

Domain models follow a feature-centric structure under `src/`:

```
public/
└── images/
    └── products/                    # 24 local SVG product placeholder assets (800x800)

src/
├── types/                           # Cross-cutting primitives, API contracts, central hub
│   ├── common.ts                    # Shared domain value objects (CurrencyCode, StockStatus, ProductImage)
│   ├── api.ts                       # Generic API envelopes, errors, and pagination contracts
│   └── index.ts                     # Centralized re-export barrel for all domain models
│
├── features/
│   ├── products/
│   │   ├── types/
│   │   │   ├── product.ts           # Product, ProductVariant, ProductSpecification, ProductBadge
│   │   │   ├── query.ts             # ProductQueryParams, ProductSortOption, PaginatedProducts
│   │   │   └── index.ts             # Products feature types barrel
│   │   ├── data/
│   │   │   ├── mock-products.ts     # 24 demonstration products covering all 18 subcategories
│   │   │   ├── mock-products.test.ts# Catalog validation tests (uniqueness, prices, categories)
│   │   │   └── index.ts             # Data module barrel
│   │   └── index.ts                 # Feature entry point (re-exports types + mock data)
│   │
│   ├── categories/
│   │   ├── types/
│   │   │   ├── category.ts          # Category, Subcategory, CategoryTree
│   │   │   └── index.ts             # Categories feature types barrel
│   │   ├── data/
│   │   │   ├── category-registry.ts # Centralized category taxonomy registry & query helpers
│   │   │   ├── category-registry.test.ts # Consistency and uniqueness unit tests
│   │   │   └── index.ts             # Data module barrel
│   │   └── index.ts                 # Feature entry point (re-exports types + registry)
│   │
│   ├── cart/
│   │   └── types/
│   │       ├── cart.ts              # CartItem, CartItemInput, CartSummary
│   │       └── index.ts             # Cart feature types barrel
│   │
│   └── wishlist/
│       └── types/
│           ├── wishlist.ts          # WishlistProductId, WishlistIdentifier, WishlistItem, WishlistState
│           └── index.ts             # Wishlist feature types barrel
│
├── services/                        # Service layer (data access abstraction)
│   ├── catalogue/
│   │   ├── catalogue-service.interface.ts # Typed async CatalogueService contract
│   │   ├── catalogue-helpers.ts     # Pure filter, sort, price, and pagination functions
│   │   ├── catalogue-helpers.test.ts# 69 unit tests for pure transformation helpers
│   │   ├── mock-catalogue-service.ts# Deterministic mock adapter + singleton instance
│   │   ├── mock-catalogue-service.test.ts # 39 integration tests for service methods
│   │   └── index.ts                 # Catalogue service module barrel
│   └── index.ts                     # Central services entry point
```

### Module Dependency Graph

```
           [ src/types/common.ts ]
           [ src/types/api.ts    ]
                 ▲         ▲
                 │         │
    ┌────────────┴─────────┴────────────┐
    │                                   │
[ features/categories ]       [ features/products ]
                                        ▲
                       ┌────────────────┴────────────────┐
                       │                                 │
             [ features/cart ]                 [ features/wishlist ]
                       ▲                                 ▲
                       └────────────────┬────────────────┘
                                        │
                                [ src/types/index.ts ]
```

- **Leaf Nodes**: `types/common.ts` and `types/api.ts` have zero external project dependencies.
- **Catalog Domain**: `features/products` depends only on `types/common.ts` and `types/api.ts`.
- **Taxonomy Domain**: `features/categories` depends only on `types/common.ts`.
- **Cart & Wishlist**: Depend on `types/common.ts` and `features/products`. They do not depend on each other.
- **Result**: Completely acyclic (no circular imports).

---

## 3. Domain Model Specifications

### 3.1 Catalog & Products (`src/features/products/types`)

#### `Product`
The core entity representing an item in the VYRO consumer-electronics catalog:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique entity identifier (UUID or database ID) |
| `slug` | `string` | URL-safe slug for routing (e.g. `vyro-pulse-wireless-earbuds`) |
| `name` | `string` | Display name of the product |
| `shortDescription` | `string` | Brief elevator pitch for cards and search summaries |
| `description` | `string` | In-depth description for detail pages (markdown/HTML support) |
| `price` | `number` | Regular base price in PKR |
| `salePrice` | `number?` | Optional promotional or discounted price |
| `currency` | `CurrencyCode` | ISO currency code (defaults to `'PKR'`) |
| `brand` | `string` | Brand or sub-brand name (e.g. `'VYRO'`) |
| `categorySlug` | `string` | Slug of parent category (e.g. `'audio'`) |
| `subcategorySlug` | `string` | Slug of specific subcategory (e.g. `'tws-earbuds'`) |
| `primaryImage` | `ProductImage` | Main product hero image with accessibility metadata |
| `gallery` | `ProductImage[]?` | Supplementary product gallery angles |
| `features` | `string[]` | Key highlight bullet points |
| `specifications` | `ProductSpecification[]` | Structured technical specifications |
| `variants` | `ProductVariant[]?` | Available SKU variations (color, storage, etc.) |
| `stockStatus` | `StockStatus` | Inventory status (`'in_stock'`, `'low_stock'`, etc.) |
| `rating` | `number?` | Aggregated customer rating (0 to 5) |
| `reviewCount` | `number?` | Total count of validated customer reviews |
| `badges` | `ProductBadge[]?` | Merchandising badges (`'new'`, `'bestseller'`, `'sale'`, etc.) |
| `relatedProductIds` | `string[]?` | IDs of related cross-sell or upsell products |
| `sku` | `string?` | Optional inventory stock keeping unit |
| `isFeatured` | `boolean?` | Flag for homepage spotlight curation |

#### Mock Product Dataset (`src/features/products/data/mock-products.ts`)
The initial catalog includes **24 distinct demonstration products** distributed across all 6 categories and all 18 subcategories:
- **Price Integrity**: All base prices are numeric and in PKR. When `salePrice` is defined, it is strictly less than `price`.
- **Category & Subcategory Validation**: Every record references an existing `categorySlug` and `subcategorySlug` from `CATEGORY_REGISTRY`.
- **Media Assets**: Each product references a dedicated, high-resolution local SVG asset in `/images/products/${slug}.svg` (800x800) featuring the VYRO tech-minimalist aesthetic. No external or unstable CDN URLs.
- **Specification & Feature Richness**: Every product has at least 3 highlight features and multiple grouped technical specifications.
- **Query Helpers**: Includes `getMockProducts()`, `getMockProductById(id)`, `getMockProductBySlug(slug)`, `getMockProductsByCategory(categorySlug)`, `getMockProductsBySubcategory(subcategorySlug)`, and `getFeaturedMockProducts()`.

---

### 3.2 Taxonomy & Categories (`src/features/categories`)

#### `Category` & `Subcategory` Domain Types
- **`Category`**: Top-level taxonomic grouping containing `id`, `slug`, `name`, optional `description`, `icon` (Lucide identifier), `badge`, `isFeatured`, `displayOrder`, and strongly typed `subcategories: Subcategory[]`.
- **`Subcategory`**: Second-level subdivision containing `id`, `slug`, `name`, `categorySlug` (parent foreign key), optional `description`, `badge`, `isFeatured`, and `displayOrder`.

#### Centralized Category Registry (`src/features/categories/data/category-registry.ts`)
The catalog taxonomy is centralized in `CATEGORY_REGISTRY` as an immutable source of truth:
- **No Duplicate Arrays**: Navigation headers, mobile drawers, footer links, and filters import from this registry or invoke query helpers instead of re-defining category arrays.
- **Independent Identifiers**: Stable, predictable slugs (`audio-sound`, `wireless-earbuds`) and persistent IDs (`cat-audio-sound`, `subcat-wireless-earbuds`) are decoupled from localized or editorial display labels (`Audio & Sound`, `Wireless Earbuds`).
- **Extensibility**: Adding new categories requires only appending an item to `CATEGORY_REGISTRY`. The dynamic routes (`/category/:categorySlug`, `/category/:categorySlug/:subcategorySlug`) resolve data dynamically without code modifications to router tables.

#### Initial Taxonomy Breakdown (6 Categories, 18 Subcategories)
1. **Audio & Sound** (`audio-sound`):
   - Wireless Earbuds (`wireless-earbuds`)
   - Headphones (`headphones`)
   - Speakers (`speakers`)
   - Neckbands (`neckbands`)
2. **Wearables** (`wearables`):
   - Smartwatches (`smartwatches`)
   - Fitness Bands (`fitness-bands`)
3. **Power & Charging** (`power-charging`):
   - Power Banks (`power-banks`)
   - Wall Chargers (`wall-chargers`)
   - Charging Cables (`charging-cables`)
4. **Mobile Accessories** (`mobile-accessories`):
   - Cases & Covers (`cases-covers`)
   - Stands & Holders (`stands-holders`)
   - Car Accessories (`car-accessories`)
5. **Gaming** (`gaming`):
   - Gaming Headsets (`gaming-headsets`)
   - Controllers (`controllers`)
   - Gaming Accessories (`gaming-accessories`)
6. **Smart Living** (`smart-living`):
   - Smart Lights (`smart-lights`)
   - Security Cameras (`security-cameras`)
   - Smart Plugs (`smart-plugs`)

#### Query & Lookup Helpers
- `getAllCategories()`: Returns all categories sorted by `displayOrder`.
- `getFeaturedCategories()`: Returns categories marked with `isFeatured: true`.
- `getCategoryBySlug(slug)`: O(1) case-insensitive lookup via pre-computed `CATEGORY_MAP`.
- `getSubcategoryBySlug(categorySlug, subcategorySlug)`: O(1) composite lookup verifying parent-child relationship.
- `findSubcategoryBySlug(subcategorySlug)`: Resolves a subcategory and its parent category from the subcategory slug alone.
- `getAllSubcategories()`: Flat array of all 18 subcategories.
- `getCategorySlugs()`, `getSubcategorySlugs(categorySlug?)`: Slug list extraction for routing and static param generation.
- `isValidCategorySlug(slug)`, `isValidSubcategorySlug(categorySlug, subcategorySlug)`: Boolean type guards for route validation and 404 guards.

---

### 3.3 Shopping Cart (`src/features/cart/types`)

#### `CartItem`
Self-contained line item model representing a user's cart selection:
- `id`: Composite identifier `${productId}-${variantId || 'default'}`
- `productId`: Reference to parent `Product.id`
- `productSlug`: Slug for quick navigation back to PDP
- `name`: Snapshot of product name
- `price`: Unit price snapshot at time of addition
- `salePrice`?: Discounted unit price
- `currency`: Base currency (`'PKR'`)
- `quantity`: Quantity selected (>= 1)
- `image`: Thumbnail image
- `selectedVariant`?: Snapshot of chosen `ProductVariant`
- `stockStatus`?: Real-time stock status check
- `maxQuantity`?: Max orderable quantity limit
- `addedAt`: ISO timestamp

#### `CartSummary`
Computed cart totals:
- `items`: `CartItem[]`
- `totalQuantity`: Sum of item quantities
- `uniqueItemCount`: Count of distinct line items
- `subtotal`: Raw item price sum
- `discountTotal`: Total savings
- `shippingEstimate`: Localized delivery calculation (PKR)
- `taxEstimate`: Applicable sales tax
- `total`: Final payable total

---

### 3.4 Wishlist (`src/features/wishlist/types`)

#### Identifier Types & State
- **`WishlistProductId`**: Branded alias `string` for product identification.
- **`WishlistIdentifier`**: String key (`productId` or composite `${productId}:${variantId}`) used for O(1) membership checks.
- **`WishlistItem`**: Lightweight persisted record containing `id`, `productId`, `variantId?`, and `addedAt`.
- **`PopulatedWishlistItem`**: Enriched wishlist entry including the complete hydrated `Product` object.
- **`WishlistState`**: Normalized state structure containing `productIds: string[]` and `items: WishlistItem[]`.

---

### 3.5 API Contracts & Common Envelopes (`src/types`)

#### Discriminated API Envelope
```ts
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  timestamp?: string;
}
```

#### Standardized Error Handling
- `ApiError`: Contains `code: ApiErrorCode | string`, `message: string`, `status: number`, and `details`.
- `ApiErrorCode`: Pre-defined error codes (`'NOT_FOUND'`, `'OUT_OF_STOCK'`, `'VALIDATION_ERROR'`, `'UNAUTHORIZED'`, etc.).
- `ApiValidationError`: Field-level validation feedback for form submissions.

#### Pagination Envelope
- `PaginationMeta`: `page`, `limit`, `totalItems`, `totalPages`, `hasNextPage`, `hasPrevPage`.
- `PaginatedResponse<T>`: Generic container `{ items: T[]; pagination: PaginationMeta }`.

---

## 4. State Management Integration Strategy

| State Category | Technology | Domain Mapping |
|---|---|---|
| **Server / Catalog State** | TanStack Query | `Product`, `Category`, `PaginatedProducts`, `ApiResponse<T>` |
| **Client Cart State** | Zustand (`persist`) | `CartItem[]`, `CartSummary` |
| **Client Wishlist State** | Zustand (`persist`) | `WishlistState`, `WishlistIdentifier` |
| **Form Inputs** | React Hook Form & Zod | Aligns with `CartItemInput`, checkout billing schemas |

---

## 5. Catalogue Service Layer (`src/services/catalogue`)

The catalogue service isolates all data access, filtering, sorting, and pagination logic from presentation components and UI hooks.

### 5.1 Architecture & Interface Contract
- **Contract (`CatalogueService`)**:
  - `getProducts(params?: ProductQueryParams): Promise<PaginatedProducts>`
  - `getProductBySlug(slug: string): Promise<Product | undefined>`
  - `getCategories(): Promise<Category[]>`
  - `getCategoryBySlug(slug: string): Promise<Category | undefined>`
  - `getRelatedProducts(slug: string): Promise<Product[]>`
- **Dual Concrete Implementations**:
  1. `MockCatalogueService`: Deterministic in-memory fixture access. Used by default; enables offline prototyping with zero backend dependencies.
  2. `HttpCatalogueService`: Typed HTTP adapter connecting to a MERN / REST API backend via `HttpClient`.
- **Asynchronous Design**: All methods return promises, enabling drop-in replacement with an HTTP/REST adapter without changing any consumer code.
- **Explicit Not-Found Handling**: Missing records cleanly return `undefined` (or empty arrays for collections) without throwing unhandled exceptions.
- **Centralized Service Factory & Mode Selection**:
  - `createCatalogueService(config)` / `getCatalogueService()`: Configured via environment variable `VITE_DATA_SOURCE` (`mock` by default, or `http`).
  - `catalogueService` singleton delegates dynamically to the active service.
  - Zero hardcoded secrets in client-side code.
- **DTO Transformation Layer (`catalogue-mapper.ts`)**:
  - Decouples client domain models from raw backend or third-party database structures (such as MongoDB `_id` vs `id`, stringified numbers, or alternative image structures).

### 5.2 Pure Transformation Functions (`catalogue-helpers.ts`)
Decoupled pure helper functions ensure testability and reusability:
- `effectivePrice(product)`: Evaluates `salePrice ?? price`.
- `matchesSearch(product, search)`: Multi-token case-insensitive search across name, short description, and brand.
- `matchesCategory(product, categorySlug)` & `matchesSubcategory(product, subcategorySlug)`: Taxonomy filtering.
- `matchesPriceRange(product, minPrice, maxPrice)`: Range boundary checks against effective price.
- `matchesStockStatus(product, stockStatus, inStockOnly)`: Status checks and in-stock convenience filter.
- `matchesBadges(product, badges)`: Badges array inclusion.
- `matchesFeatured(product, isFeatured)`: Homepage curation filter.
- `applySorting(products, sortBy)`: Deterministic sorting (`price_asc`, `price_desc`, `rating_desc`, `name_asc`, `name_desc`, `newest`, `featured`).
- `normalizePaginationParams(page, limit)` & `buildPaginationMeta(...)`: Predictable pagination calculations with clamping.
- `applyPagination(items, page, limit)`: Array slicing for page windows.

---

## 6. Import Conventions

Consumers have two clean options for importing domain models:

### Option A: From Canonical Feature Path (Recommended for feature-internal code)
```ts
import type { Product, ProductVariant } from '@/features/products/types';
import type { CartItem } from '@/features/cart/types';
import { catalogueService } from '@/services/catalogue';
```

### Option B: From Centralized Domain Hub (Recommended for shared/cross-feature code)
```ts
import type {
  Product,
  Category,
  CartItem,
  WishlistItem,
  ApiResponse,
} from '@/types';
import { catalogueService } from '@/services';
```

Both approaches reference the exact same underlying type definitions, guaranteeing zero code or type duplication.

---

## 7. Testing & Quality Gates

Automated test suites in Vitest ensure data validity, HTTP protocol resilience, and strict adherence to architectural contracts (**214 tests total across 8 test suites**):

- **Category Registry Tests (`src/features/categories/data/category-registry.test.ts`)**: 27 unit tests validating taxonomy completeness, slug uniqueness, kebab-case formatting, and parent-child consistency across all 6 categories and 18 subcategories.
- **Product Dataset Tests (`src/features/products/data/mock-products.test.ts`)**: 25 unit tests asserting:
  - 24 distinct products with complete coverage of all 18 subcategories
  - Price sanity (`price > 0`, `salePrice < price`, `currency === 'PKR'`)
  - Referential integrity (valid `categorySlug` and `subcategorySlug` matching `CATEGORY_REGISTRY`)
  - Media asset completeness (`primaryImage` with non-empty URL, alt text, and dimensions)
  - Related product ID references exist in the dataset
- **Catalogue Helpers Tests (`src/services/catalogue/catalogue-helpers.test.ts`)**: 69 unit tests validating each pure filter predicate, price calculation, sort comparators, pagination metadata generation, and edge cases.
- **Mock Catalogue Service Tests (`src/services/catalogue/mock-catalogue-service.test.ts`)**: 39 integration tests verifying pagination, sorting, filters, and missing record handling.
- **HTTP Client Tests (`src/services/http/http-client.test.ts`)**: 16 unit tests asserting query serialization, `ApiSuccessResponse` unwrapping, non-JSON error handling (502 Gateway), network disconnection, timeout (`SERVICE_UNAVAILABLE`), and request cancellation (`AbortSignal`).
- **Catalogue Mapper Tests (`src/services/catalogue/catalogue-mapper.test.ts`)**: 14 unit tests validating MongoDB `_id` to `id` mapping, image URL to `ProductImage` conversion, stringified price parsing, rating clamping, and external dummy API normalization.
- **HTTP Catalogue Service Tests (`src/services/catalogue/http-catalogue-service.test.ts`)**: 14 integration tests verifying all 5 service methods, query string formatting, graceful 404 translation to `undefined`/`[]`, and 500 error propagation.
- **Catalogue Factory Tests (`src/services/catalogue/catalogue-factory.test.ts`)**: 10 unit tests verifying default fallback to `MockCatalogueService`, `VITE_DATA_SOURCE=http` resolution, custom baseUrl injection, and singleton proxy delegation.
- **TypeScript & Linting Gates**:
  - `npm run typecheck` (`tsc --noEmit`): Strict mode compilation with zero type errors.
  - `npm run lint` (`oxlint`): Zero lint warnings and zero errors.
  - `npm run build` (`tsc -b && vite build`): Production bundle compilation.
