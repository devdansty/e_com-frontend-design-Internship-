import type { CurrencyCode, ProductImage, StockStatus } from '../../../types/common';
import type { ProductVariant } from '../../products/types/product';

/**
 * Line item in the shopping cart.
 * Pure domain model detached from any UI or React rendering component.
 */
export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  name: string;
  price: number;
  salePrice?: number;
  currency: CurrencyCode;
  quantity: number;
  image: ProductImage;
  selectedVariant?: ProductVariant;
  stockStatus?: StockStatus;
  maxQuantity?: number;
  addedAt: string;
}

/**
 * Input payload for adding a product/variant to the cart.
 */
export interface CartItemInput {
  productId: string;
  productSlug: string;
  name: string;
  price: number;
  salePrice?: number;
  currency: CurrencyCode;
  quantity: number;
  image: ProductImage;
  selectedVariant?: ProductVariant;
  maxQuantity?: number;
}

/**
 * Computed financial and quantity breakdown of the current cart state.
 */
export interface CartSummary {
  items: CartItem[];
  totalQuantity: number;
  uniqueItemCount: number;
  subtotal: number;
  discountTotal: number;
  shippingEstimate: number;
  taxEstimate: number;
  total: number;
  currency: CurrencyCode;
}
