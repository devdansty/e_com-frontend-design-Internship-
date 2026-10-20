# VYRO Backend API Contracts & Specification

> Target Backend: **MERN Stack (Node.js, Express, MongoDB/Mongoose)**  
> Protocol: **REST over HTTPS**  
> Data Format: **JSON (`application/json`)**  
> Currency: **PKR (Pakistani Rupee)**  
> Base URL: `/api` (Production e.g. `https://api.vyro.pk/api`, Development `http://localhost:5000/api`)

---

## 1. Architectural Principles & Protocol Standards

1. **Envelope Consistency**: All API endpoints return a standardized JSON envelope discriminating success from failure via a top-level boolean `success` field (`ApiResponse<T>`).
2. **Stateless REST**: All catalogue read endpoints are stateless and idempotent (`GET`).
3. **Graceful Degradation & Client Abstraction**:
   - The frontend consumes a typed `CatalogueService` interface.
   - When configured in `mock` mode (the default), no network requests are made.
   - When configured in `http` mode, calls are dispatched via a typed HTTP client adapter.
4. **Resilient Domain Mapping**:
   - The client application never assumes the database schema (e.g. MongoDB `_id`, timestamps) matches domain models 1-to-1.
   - Field transformations (such as `_id` to `id`, stringified numbers, or alternative image structures) are handled by a dedicated adapter layer before reaching UI components.
5. **No Secrets in Client**: No secret keys, database credentials, or admin tokens exist in client-side code or client `.env` files.

---

## 2. Standard Request & Response Envelopes

### 2.1 Successful Response (`ApiSuccessResponse<T>`)
Every successful request returns HTTP 200 (or 201 for creations) with:

```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string; // ISO 8601 string, e.g. "2026-10-25T01:30:00.000Z"
}
```

### 2.2 Error Response (`ApiErrorResponse`)
Every error response (HTTP 4xx or 5xx) returns:

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode | string;  // e.g. 'NOT_FOUND', 'VALIDATION_ERROR'
    message: string;              // Human-readable summary
    status: number;               // HTTP status code (e.g. 404, 400, 500)
    details?: Record<string, unknown> | ApiValidationError[];
    timestamp?: string;
  };
  timestamp: string;
}
```

### 2.3 Standard Error Codes
| Code | HTTP Status | Description |
|---|---|---|
| `BAD_REQUEST` | 400 | Malformed query parameter or invalid syntax |
| `NOT_FOUND` | 404 | Requested entity slug or ID was not found |
| `VALIDATION_ERROR` | 422 | Query or body parameters failed schema validation |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled server or database exception |
| `SERVICE_UNAVAILABLE` | 503 | Database or backend temporarily unavailable |
| `NETWORK_ERROR` | Client | Client-side fetch failure or network disconnection |

---

## 3. Data Representation Standards

### 3.1 Currency & Price
- **Currency**: Strictly Pakistani Rupee (`'PKR'`). All prices are denominated in PKR.
- **Representation**: Unformatted numeric floats/integers (e.g. `12499`, `4499`). Prices must **not** be sent as formatted strings with commas or currency signs (e.g., `"Rs. 12,499"`).
- **Base Price (`price`)**: Must be a positive number (`price > 0`).
- **Sale Price (`salePrice`)**: Optional number. When present, it must be strictly less than `price` (`0 < salePrice < price`).
- **Effective Price**: Evaluated as `salePrice ?? price`.

### 3.2 Inventory & Stock Status
Stock statuses are strictly typed string enums:
- `'in_stock'`: Product is readily available for immediate dispatch.
- `'low_stock'`: Limited inventory remaining (e.g. fewer than 5 units).
- `'out_of_stock'`: Temporarily depleted inventory.
- `'preorder'`: Upcoming release available for advance booking.
- `'discontinued'`: No longer produced or restocked.

### 3.3 Pagination Format
All collection queries utilize zero-leak standard pagination metadata:

```json
{
  "page": 1,
  "limit": 12,
  "totalItems": 24,
  "totalPages": 2,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

## 4. Endpoint Specifications

### 4.1 `GET /api/products`
Retrieves a paginated list of catalog products filtered and sorted according to query parameters.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `search` | `string` | No | Case-insensitive multi-token keyword match | `search=anc+earbuds` |
| `categorySlug` | `string` | No | Exact match against category slug | `categorySlug=audio-sound` |
| `subcategorySlug` | `string` | No | Exact match against subcategory slug | `subcategorySlug=wireless-earbuds` |
| `brand` | `string` | No | Brand name filter | `brand=VYRO` |
| `minPrice` | `number` | No | Minimum effective price in PKR | `minPrice=5000` |
| `maxPrice` | `number` | No | Maximum effective price in PKR | `maxPrice=25000` |
| `stockStatus` | `string` | No | Comma-separated allowed statuses | `stockStatus=in_stock,low_stock` |
| `inStockOnly` | `boolean` | No | Shorthand for in_stock and low_stock | `inStockOnly=true` |
| `badges` | `string` | No | Comma-separated required badges | `badges=bestseller,sale` |
| `isFeatured` | `boolean` | No | Restrict to featured showcase items | `isFeatured=true` |
| `sortBy` | `string` | No | Sort preset (`featured`, `price_asc`, `price_desc`, `rating_desc`, `newest`, `name_asc`, `name_desc`) | `sortBy=price_asc` |
| `sortOrder` | `string` | No | Direction override (`asc`, `desc`) | `sortOrder=asc` |
| `page` | `number` | No | 1-indexed page number (default: `1`) | `page=1` |
| `limit` | `number` | No | Page size (default: `12`, max: `100`) | `limit=12` |

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prod-pulse-anc",
        "slug": "vyro-pulse-anc-earbuds",
        "name": "VYRO Pulse ANC Wireless Earbuds",
        "shortDescription": "Flagship hybrid active noise cancelling earbuds with 42dB reduction.",
        "description": "Engineered for immersive sound in bustling urban Pakistani environments...",
        "price": 12999,
        "salePrice": 9999,
        "currency": "PKR",
        "brand": "VYRO",
        "categorySlug": "audio-sound",
        "subcategorySlug": "wireless-earbuds",
        "primaryImage": {
          "id": "img-pulse-anc-primary",
          "url": "/images/products/vyro-pulse-anc-earbuds.svg",
          "altText": "VYRO Pulse ANC Earbuds in Matte Graphite Black",
          "width": 800,
          "height": 800,
          "isPrimary": true
        },
        "features": [
          "Hybrid Active Noise Cancellation up to 42dB",
          "Custom 11mm titanium diaphragm drivers",
          "38-hour battery with fast USB-C charge"
        ],
        "specifications": [
          { "group": "Audio", "name": "Driver Size", "value": "11mm Titanium Dynamic" }
        ],
        "stockStatus": "in_stock",
        "rating": 4.8,
        "reviewCount": 142,
        "badges": ["bestseller", "sale"],
        "isFeatured": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalItems": 24,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "appliedFilters": {
      "categorySlug": "audio-sound",
      "limit": 12,
      "page": 1
    }
  },
  "timestamp": "2026-10-25T01:30:00.000Z"
}
```

---

### 4.2 `GET /api/products/:slug`
Retrieves detailed information for a single product identified by its unique URL slug.

#### Path Parameters
- `slug` (`string`, required): URL slug of the product (e.g. `vyro-pulse-anc-earbuds`).

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "prod-pulse-anc",
    "slug": "vyro-pulse-anc-earbuds",
    "name": "VYRO Pulse ANC Wireless Earbuds",
    "shortDescription": "Flagship hybrid active noise cancelling earbuds with 42dB reduction.",
    "description": "Engineered for immersive sound...",
    "price": 12999,
    "salePrice": 9999,
    "currency": "PKR",
    "brand": "VYRO",
    "categorySlug": "audio-sound",
    "subcategorySlug": "wireless-earbuds",
    "primaryImage": {
      "id": "img-pulse-anc-primary",
      "url": "/images/products/vyro-pulse-anc-earbuds.svg",
      "altText": "VYRO Pulse ANC Earbuds in Matte Graphite Black",
      "width": 800,
      "height": 800,
      "isPrimary": true
    },
    "gallery": [],
    "features": ["Hybrid Active Noise Cancellation up to 42dB"],
    "specifications": [
      { "group": "Audio", "name": "Driver Size", "value": "11mm Titanium Dynamic" }
    ],
    "variants": [
      { "id": "var-pulse-blk", "name": "Color", "value": "Graphite Black", "inStock": true }
    ],
    "stockStatus": "in_stock",
    "rating": 4.8,
    "reviewCount": 142,
    "badges": ["bestseller", "sale"],
    "relatedProductIds": ["prod-nova-watch", "prod-volt-100w"],
    "isFeatured": true
  },
  "timestamp": "2026-10-25T01:30:00.000Z"
}
```

#### Missing Resource Behavior (`404 Not Found`)
When no product matches the requested slug:
- **HTTP Status**: `404 Not Found`
- **Response Body**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Product with slug 'unknown-product' was not found",
      "status": 404
    },
    "timestamp": "2026-10-25T01:30:00.000Z"
  }
  ```
- **Client Service Behavior**: The typed `HttpCatalogueService` catches the 404 and returns `undefined` (matching the `CatalogueService` interface contract without throwing).

---

### 4.3 `GET /api/categories`
Returns the full taxonomy tree: all 6 top-level categories with their nested subcategories in presentation order.

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-audio",
      "slug": "audio-sound",
      "name": "Audio & Sound",
      "description": "High-fidelity wireless earbuds, studio-grade headphones, and immersive portable speakers.",
      "displayOrder": 1,
      "isActive": true,
      "subcategories": [
        {
          "id": "sub-wireless-earbuds",
          "slug": "wireless-earbuds",
          "name": "Wireless Earbuds",
          "categorySlug": "audio-sound",
          "displayOrder": 1,
          "isActive": true
        },
        {
          "id": "sub-headphones",
          "slug": "headphones",
          "name": "Headphones",
          "categorySlug": "audio-sound",
          "displayOrder": 2,
          "isActive": true
        }
      ]
    }
  ],
  "timestamp": "2026-10-25T01:30:00.000Z"
}
```

---

### 4.4 `GET /api/categories/:slug`
Retrieves a single category and its subcategories by its unique slug.

#### Path Parameters
- `slug` (`string`, required): Category slug (e.g. `audio-sound`, `wearables`, `gaming`).

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "cat-audio",
    "slug": "audio-sound",
    "name": "Audio & Sound",
    "description": "High-fidelity wireless earbuds, studio-grade headphones, and immersive portable speakers.",
    "displayOrder": 1,
    "isActive": true,
    "subcategories": [
      {
        "id": "sub-wireless-earbuds",
        "slug": "wireless-earbuds",
        "name": "Wireless Earbuds",
        "categorySlug": "audio-sound",
        "displayOrder": 1,
        "isActive": true
      }
    ]
  },
  "timestamp": "2026-10-25T01:30:00.000Z"
}
```

#### Missing Resource Behavior (`404 Not Found`)
When no category exists with that slug:
- **HTTP Status**: `404 Not Found`
- **Client Service Behavior**: The typed `HttpCatalogueService` catches the 404 and returns `undefined`.

---

### 4.5 `GET /api/products/:slug/related`
Returns an array of products related to the target product.

#### Path Parameters
- `slug` (`string`, required): The source product's slug.

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-nova-watch",
      "slug": "vyro-nova-smartwatch",
      "name": "VYRO Nova AMOLED Smartwatch",
      "price": 14999,
      "salePrice": 11999,
      "currency": "PKR",
      "categorySlug": "wearables",
      "subcategorySlug": "smartwatches",
      "primaryImage": {
        "id": "img-nova-watch-primary",
        "url": "/images/products/vyro-nova-smartwatch.svg",
        "altText": "VYRO Nova Smartwatch",
        "width": 800,
        "height": 800,
        "isPrimary": true
      },
      "stockStatus": "in_stock"
    }
  ],
  "timestamp": "2026-10-25T01:30:00.000Z"
}
```

#### Missing Resource Behavior
- When the parent product does not exist or has no related items: Returns `200 OK` with an empty array (`"data": []`), or `404 Not Found`.
- **Client Service Behavior**: The client always returns `Promise<Product[]>` (an empty array `[]` if not found or empty), never throwing.

---

## 5. Environment Configuration & Switching Modes

The application supports seamless toggling between deterministic mock mode and live HTTP mode via environment variables.

### 5.1 Environment Variables
Create a local `.env` file (copied from `.env.example`):

```env
# Mode: 'mock' (default) or 'http'
VITE_DATA_SOURCE=mock

# Base URL for the MERN / REST API backend
VITE_API_BASE_URL=http://localhost:5000/api

# Request timeout in milliseconds
VITE_API_TIMEOUT_MS=10000
```

### 5.2 How to Switch from Mock to HTTP Mode
1. **Mock Mode (Default)**:
   - Leave `VITE_DATA_SOURCE=mock` or unset.
   - The application uses `MockCatalogueService`, reading from local static datasets. Zero backend required.
2. **HTTP Mode (Live Backend)**:
   - Set `VITE_DATA_SOURCE=http` in `.env`.
   - Ensure `VITE_API_BASE_URL` points to your running backend (e.g. `http://localhost:5000/api`).
   - Restart the Vite development server (`npm run dev`).
   - The centralized factory `catalogueService` will instantiate `HttpCatalogueService` and dispatch network requests following these contracts.

### 5.3 Programmatic Service Selection
In tests or specialized runtime contexts, services can also be instantiated directly:

```typescript
import { createCatalogueService } from '@/services/catalogue';

// Instantiate mock service explicitly:
const mockService = createCatalogueService({ mode: 'mock' });

// Instantiate HTTP service targeting a specific URL:
const httpService = createCatalogueService({
  mode: 'http',
  apiBaseUrl: 'https://staging-api.vyro.pk/api',
  timeoutMs: 5000,
});
```
