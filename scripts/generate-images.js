import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../public/images/products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const products = [
  { slug: 'vyro-pulse-anc-earbuds', name: 'Pulse ANC', cat: 'Audio & Sound', icon: '🎧' },
  { slug: 'vyro-air-sport-tws-earbuds', name: 'Air Sport TWS', cat: 'Audio & Sound', icon: '🏃' },
  { slug: 'vyro-clarity-studio-wireless-headphones', name: 'Clarity Studio', cat: 'Audio & Sound', icon: '🎵' },
  { slug: 'vyro-boom-portable-bluetooth-speaker', name: 'Boom 360', cat: 'Audio & Sound', icon: '🔊' },
  { slug: 'vyro-flow-magnetic-neckband', name: 'Flow Neckband', cat: 'Audio & Sound', icon: '🧲' },
  { slug: 'vyro-apex-amoled-smartwatch', name: 'Apex AMOLED', cat: 'Wearables', icon: '⌚' },
  { slug: 'vyro-pulse-fit-active-smartwatch', name: 'Pulse Fit', cat: 'Wearables', icon: '⚡' },
  { slug: 'vyro-stride-pro-fitness-band', name: 'Stride Pro', cat: 'Wearables', icon: '📈' },
  { slug: 'vyro-tempo-essential-health-tracker', name: 'Tempo Tracker', cat: 'Wearables', icon: '🎯' },
  { slug: 'vyro-volt-20k-65w-power-bank', name: 'Volt 20K 65W', cat: 'Power & Charging', icon: '🔋' },
  { slug: 'vyro-pocket-10k-magnetic-power-bank', name: 'Pocket 10K MagSafe', cat: 'Power & Charging', icon: '🧲' },
  { slug: 'vyro-turbo-65w-triple-gan-charger', name: 'Turbo 65W GaN', cat: 'Power & Charging', icon: '⚡' },
  { slug: 'vyro-armored-100w-usbc-cable', name: 'Armored 100W Cable', cat: 'Power & Charging', icon: '🔌' },
  { slug: 'vyro-shield-magsafe-phone-case', name: 'Shield MagSafe Case', cat: 'Mobile Accessories', icon: '📱' },
  { slug: 'vyro-pivot-aluminum-desk-stand', name: 'Pivot Desk Stand', cat: 'Mobile Accessories', icon: '📐' },
  { slug: 'vyro-magmount-wireless-car-charger', name: 'MagMount Car Charger', cat: 'Mobile Accessories', icon: '🚗' },
  { slug: 'vyro-stealth-71-gaming-headset', name: 'Stealth 7.1', cat: 'Gaming', icon: '🎮' },
  { slug: 'vyro-phantom-wireless-gaming-headset', name: 'Phantom Wireless', cat: 'Gaming', icon: '🕹️' },
  { slug: 'vyro-strike-hall-effect-wireless-controller', name: 'Strike Gamepad', cat: 'Gaming', icon: '🎯' },
  { slug: 'vyro-glider-xl-rgb-gaming-desk-mat', name: 'Glider XL RGB', cat: 'Gaming', icon: '✨' },
  { slug: 'vyro-aura-rgb-smart-bulb', name: 'Aura RGB Bulb', cat: 'Smart Living', icon: '💡' },
  { slug: 'vyro-glow-5m-rgbic-ambient-light-strip', name: 'Glow Light Strip', cat: 'Smart Living', icon: '🌈' },
  { slug: 'vyro-vision-2k-smart-security-camera', name: 'Vision 2K Camera', cat: 'Smart Living', icon: '📹' },
  { slug: 'vyro-socket-16a-smart-plug', name: 'Socket 16A Smart Plug', cat: 'Smart Living', icon: '🔌' },
];

for (const p of products) {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141424"/>
      <stop offset="50%" stop-color="#1A1A2E"/>
      <stop offset="100%" stop-color="#0E0E18"/>
    </linearGradient>
    <radialGradient id="cyan-glow" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stop-color="#00E5CC" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="#00E5CC" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#00E5CC" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00E5CC" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#009E8E" stop-opacity="0.3"/>
    </linearGradient>
    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="800" fill="url(#bg)"/>

  <!-- Radial Glow Behind Device -->
  <circle cx="400" cy="380" r="320" fill="url(#cyan-glow)"/>

  <!-- Subtle Tech Grid -->
  <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
    <line x1="100" y1="0" x2="100" y2="800"/>
    <line x1="250" y1="0" x2="250" y2="800"/>
    <line x1="400" y1="0" x2="400" y2="800"/>
    <line x1="550" y1="0" x2="550" y2="800"/>
    <line x1="700" y1="0" x2="700" y2="800"/>
    <line x1="0" y1="100" x2="800" y2="100"/>
    <line x1="0" y1="250" x2="800" y2="250"/>
    <line x1="0" y1="400" x2="800" y2="400"/>
    <line x1="0" y1="550" x2="800" y2="550"/>
    <line x1="0" y1="700" x2="800" y2="700"/>
  </g>

  <!-- Central Device Podium / Halo -->
  <circle cx="400" cy="380" r="220" fill="none" stroke="rgba(0, 229, 204, 0.15)" stroke-width="2"/>
  <circle cx="400" cy="380" r="170" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(0, 229, 204, 0.3)" stroke-width="1" stroke-dasharray="6 6"/>

  <!-- Product Icon / Glyphs -->
  <g filter="url(#card-shadow)">
    <rect x="300" y="280" width="200" height="200" rx="40" fill="#1C1C32" stroke="url(#accent-stroke)" stroke-width="2"/>
    <text x="400" y="405" font-size="88" text-anchor="middle" dominant-baseline="middle">${p.icon}</text>
  </g>

  <!-- Brand Wordmark -->
  <text x="400" y="110" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="700" fill="#00E5CC" letter-spacing="8" text-anchor="middle">VYRO</text>
  <line x1="360" y1="130" x2="440" y2="130" stroke="#00E5CC" stroke-width="2" stroke-opacity="0.8"/>

  <!-- Category Tag -->
  <rect x="270" y="540" width="260" height="36" rx="18" fill="rgba(0, 229, 204, 0.08)" stroke="rgba(0, 229, 204, 0.3)" stroke-width="1"/>
  <text x="400" y="563" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" fill="#00E5CC" letter-spacing="2" text-anchor="middle">${p.cat.toUpperCase()}</text>

  <!-- Product Title -->
  <text x="400" y="630" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="600" fill="#FAFAFA" text-anchor="middle">${p.name}</text>
  <text x="400" y="670" font-family="Inter, system-ui, sans-serif" font-size="16" fill="#9CA3AF" text-anchor="middle">Official Prototype Demonstration Unit</text>

  <!-- Corner Tech Reticles -->
  <path d="M 40 70 L 40 40 L 70 40" fill="none" stroke="rgba(0,229,204,0.4)" stroke-width="2"/>
  <path d="M 760 70 L 760 40 L 730 40" fill="none" stroke="rgba(0,229,204,0.4)" stroke-width="2"/>
  <path d="M 40 730 L 40 760 L 70 760" fill="none" stroke="rgba(0,229,204,0.4)" stroke-width="2"/>
  <path d="M 760 730 L 760 760 L 730 760" fill="none" stroke="rgba(0,229,204,0.4)" stroke-width="2"/>
</svg>`;

  fs.writeFileSync(path.join(targetDir, `${p.slug}.svg`), svgContent, 'utf-8');
}

console.log(`Generated ${products.length} product SVG placeholder images in ${targetDir}`);
