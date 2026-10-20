import type { Category, Subcategory } from '../types/category';

/**
 * Canonical, centralized category registry for the VYRO platform.
 * Single source of truth for catalog taxonomy, navigation trees, and category routing.
 *
 * DO NOT duplicate category arrays in navigation or presentation components.
 * Always query or import from this registry.
 */
export const CATEGORY_REGISTRY: readonly Category[] = [
  {
    id: 'cat-audio-sound',
    slug: 'audio-sound',
    name: 'Audio & Sound',
    description:
      'Immersive acoustic engineering featuring active noise cancellation, studio-grade drivers, and ergonomic design.',
    icon: 'Headphones',
    badge: 'Popular',
    isFeatured: true,
    displayOrder: 1,
    subcategories: [
      {
        id: 'subcat-wireless-earbuds',
        slug: 'wireless-earbuds',
        name: 'Wireless Earbuds',
        categorySlug: 'audio-sound',
        description:
          'True wireless stereo earbuds with low-latency gaming modes, ANC, and wireless charging cases.',
        displayOrder: 1,
        isFeatured: true,
      },
      {
        id: 'subcat-headphones',
        slug: 'headphones',
        name: 'Headphones',
        categorySlug: 'audio-sound',
        description:
          'Over-ear and on-ear wireless headphones with custom-tuned acoustic drivers and multi-point pairing.',
        displayOrder: 2,
        isFeatured: true,
      },
      {
        id: 'subcat-speakers',
        slug: 'speakers',
        name: 'Speakers',
        categorySlug: 'audio-sound',
        description:
          'Portable Bluetooth speakers with 360-degree omnidirectional sound and IPX waterproof durability.',
        displayOrder: 3,
        isFeatured: false,
      },
      {
        id: 'subcat-neckbands',
        slug: 'neckbands',
        name: 'Neckbands',
        categorySlug: 'audio-sound',
        description:
          'Flexible magnetic wireless neckbands engineered for ultra-long battery endurance and active lifestyle.',
        displayOrder: 4,
        isFeatured: false,
      },
    ],
  },
  {
    id: 'cat-wearables',
    slug: 'wearables',
    name: 'Wearables',
    description:
      'Sleek smartwatches and biometric fitness trackers built to monitor health metrics and keep you effortlessly connected.',
    icon: 'Watch',
    badge: 'Trending',
    isFeatured: true,
    displayOrder: 2,
    subcategories: [
      {
        id: 'subcat-smartwatches',
        slug: 'smartwatches',
        name: 'Smartwatches',
        categorySlug: 'wearables',
        description:
          'High-brightness AMOLED smartwatches with Bluetooth calling, GPS tracking, and comprehensive health sensors.',
        displayOrder: 1,
        isFeatured: true,
      },
      {
        id: 'subcat-fitness-bands',
        slug: 'fitness-bands',
        name: 'Fitness Bands',
        categorySlug: 'wearables',
        description:
          'Featherweight activity bands tracking heart rate, SpO2 levels, sleep stages, and daily athletic goals.',
        displayOrder: 2,
        isFeatured: false,
      },
    ],
  },
  {
    id: 'cat-power-charging',
    slug: 'power-charging',
    name: 'Power & Charging',
    description:
      'Next-generation GaN fast chargers, high-capacity power banks, and reinforced cables for rapid device power delivery.',
    icon: 'Zap',
    badge: 'Essential',
    isFeatured: true,
    displayOrder: 3,
    subcategories: [
      {
        id: 'subcat-power-banks',
        slug: 'power-banks',
        name: 'Power Banks',
        categorySlug: 'power-charging',
        description:
          'High-capacity 20,000mAh+ external batteries with multi-port USB-C PD output and digital percentage screens.',
        displayOrder: 1,
        isFeatured: true,
      },
      {
        id: 'subcat-wall-chargers',
        slug: 'wall-chargers',
        name: 'Wall Chargers',
        categorySlug: 'power-charging',
        description:
          'Compact Gallium Nitride (GaN) fast wall adapters supporting up to 100W multi-device simultaneous charging.',
        displayOrder: 2,
        isFeatured: true,
      },
      {
        id: 'subcat-charging-cables',
        slug: 'charging-cables',
        name: 'Charging Cables',
        categorySlug: 'power-charging',
        description:
          'Braided Kevlar USB-C to USB-C and Lightning cables tested for 30,000+ bends with high-speed data sync.',
        displayOrder: 3,
        isFeatured: false,
      },
    ],
  },
  {
    id: 'cat-mobile-accessories',
    slug: 'mobile-accessories',
    name: 'Mobile Accessories',
    description:
      'Impact-resistant protective cases, precision aluminum desktop stands, and magnetic auto mounts.',
    icon: 'Smartphone',
    isFeatured: false,
    displayOrder: 4,
    subcategories: [
      {
        id: 'subcat-cases-covers',
        slug: 'cases-covers',
        name: 'Cases & Covers',
        categorySlug: 'mobile-accessories',
        description:
          'Military-grade drop-tested phone cases featuring MagSafe magnetic alignment and slim tactile grips.',
        displayOrder: 1,
        isFeatured: false,
      },
      {
        id: 'subcat-stands-holders',
        slug: 'stands-holders',
        name: 'Stands & Holders',
        categorySlug: 'mobile-accessories',
        description:
          'Solid aluminum desk stands and foldable travel holders designed for optimal ergonomics.',
        displayOrder: 2,
        isFeatured: false,
      },
      {
        id: 'subcat-car-accessories',
        slug: 'car-accessories',
        name: 'Car Accessories',
        categorySlug: 'mobile-accessories',
        description:
          'Qi2 wireless charging car vent mounts and high-output dual-port cigarette lighter fast chargers.',
        displayOrder: 3,
        isFeatured: false,
      },
    ],
  },
  {
    id: 'cat-gaming',
    slug: 'gaming',
    name: 'Gaming',
    description:
      'Ultra-low-latency wireless headsets, ergonomic multi-platform controllers, and competitive esports accessories.',
    icon: 'Gamepad2',
    badge: 'Performance',
    isFeatured: true,
    displayOrder: 5,
    subcategories: [
      {
        id: 'subcat-gaming-headsets',
        slug: 'gaming-headsets',
        name: 'Gaming Headsets',
        categorySlug: 'gaming',
        description:
          'Virtual 7.1 surround sound headsets equipped with broadcast-grade noise-suppressing microphones.',
        displayOrder: 1,
        isFeatured: true,
      },
      {
        id: 'subcat-controllers',
        slug: 'controllers',
        name: 'Controllers',
        categorySlug: 'gaming',
        description:
          'Wireless precision controllers with Hall-effect magnetic joysticks and customizable rear paddles.',
        displayOrder: 2,
        isFeatured: true,
      },
      {
        id: 'subcat-gaming-accessories',
        slug: 'gaming-accessories',
        name: 'Gaming Accessories',
        categorySlug: 'gaming',
        description:
          'Illuminated RGB headset stands, precision finger grips, and speed-optimized desk mats.',
        displayOrder: 3,
        isFeatured: false,
      },
    ],
  },
  {
    id: 'cat-smart-living',
    slug: 'smart-living',
    name: 'Smart Living',
    description:
      'Automated smart ambient lighting, high-definition smart security cameras, and voice-controlled IoT plugs.',
    icon: 'Home',
    isFeatured: false,
    displayOrder: 6,
    subcategories: [
      {
        id: 'subcat-smart-lights',
        slug: 'smart-lights',
        name: 'Smart Lights',
        categorySlug: 'smart-living',
        description:
          '16-million-color Wi-Fi ambient bulbs and light strips compatible with Alexa and Google Home.',
        displayOrder: 1,
        isFeatured: false,
      },
      {
        id: 'subcat-security-cameras',
        slug: 'security-cameras',
        name: 'Security Cameras',
        categorySlug: 'smart-living',
        description:
          '2K indoor and outdoor smart Wi-Fi cameras with infrared night vision and AI human motion detection.',
        displayOrder: 2,
        isFeatured: false,
      },
      {
        id: 'subcat-smart-plugs',
        slug: 'smart-plugs',
        name: 'Smart Plugs',
        categorySlug: 'smart-living',
        description:
          'Energy-monitoring Wi-Fi smart plugs with automated timer scheduling and overload safety shutoff.',
        displayOrder: 3,
        isFeatured: false,
      },
    ],
  },
];

// Pre-computed lookup maps for O(1) slug resolution
const CATEGORY_MAP = new Map<string, Category>(
  CATEGORY_REGISTRY.map((cat) => [cat.slug, cat]),
);

interface SubcategoryResolution {
  category: Category;
  subcategory: Subcategory;
}

const SUBCATEGORY_MAP = new Map<string, SubcategoryResolution>();
for (const category of CATEGORY_REGISTRY) {
  for (const subcategory of category.subcategories) {
    SUBCATEGORY_MAP.set(`${category.slug}/${subcategory.slug}`, {
      category,
      subcategory,
    });
    // Also index by standalone subcategory slug for rapid lookups
    if (!SUBCATEGORY_MAP.has(subcategory.slug)) {
      SUBCATEGORY_MAP.set(subcategory.slug, { category, subcategory });
    }
  }
}

/**
 * Returns all registered categories sorted by displayOrder.
 */
export function getAllCategories(): readonly Category[] {
  return CATEGORY_REGISTRY;
}

/**
 * Returns only categories marked as featured for homepage or top-nav highlights.
 */
export function getFeaturedCategories(): readonly Category[] {
  return CATEGORY_REGISTRY.filter((cat) => cat.isFeatured);
}

/**
 * Finds a top-level category by its slug.
 * Returns undefined if not found.
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  if (!slug) return undefined;
  return CATEGORY_MAP.get(slug.toLowerCase().trim());
}

/**
 * Finds a specific subcategory given both parent category slug and subcategory slug.
 */
export function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string,
): Subcategory | undefined {
  if (!categorySlug || !subcategorySlug) return undefined;
  const key = `${categorySlug.toLowerCase().trim()}/${subcategorySlug.toLowerCase().trim()}`;
  return SUBCATEGORY_MAP.get(key)?.subcategory;
}

/**
 * Finds a subcategory and its parent category by subcategory slug alone.
 */
export function findSubcategoryBySlug(
  subcategorySlug: string,
): SubcategoryResolution | undefined {
  if (!subcategorySlug) return undefined;
  return SUBCATEGORY_MAP.get(subcategorySlug.toLowerCase().trim());
}

/**
 * Returns a flat list of all subcategories across all categories.
 */
export function getAllSubcategories(): readonly Subcategory[] {
  return CATEGORY_REGISTRY.flatMap((cat) => cat.subcategories);
}

/**
 * Returns an array of all valid category slugs.
 */
export function getCategorySlugs(): string[] {
  return CATEGORY_REGISTRY.map((cat) => cat.slug);
}

/**
 * Returns subcategory slugs, optionally filtered by parent category slug.
 */
export function getSubcategorySlugs(categorySlug?: string): string[] {
  if (categorySlug) {
    const category = getCategoryBySlug(categorySlug);
    return category ? category.subcategories.map((sub) => sub.slug) : [];
  }
  return getAllSubcategories().map((sub) => sub.slug);
}

/**
 * Type guard / validation check for category slugs.
 */
export function isValidCategorySlug(slug: string): boolean {
  if (!slug) return false;
  return CATEGORY_MAP.has(slug.toLowerCase().trim());
}

/**
 * Type guard / validation check for subcategory slugs.
 */
export function isValidSubcategorySlug(
  categorySlug: string,
  subcategorySlug: string,
): boolean {
  return getSubcategoryBySlug(categorySlug, subcategorySlug) !== undefined;
}
