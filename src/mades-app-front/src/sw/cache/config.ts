export const CACHE_NAME = 'mades-app-cache-v7';

export const BASE_PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.png',
  '/favicon.svg'
];

export const GOOGLE_FONT_STYLE_URLS = [
  'https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap'
];

export function buildPrecacheUrls(buildAssetUrls: string[]): string[] {
  return [...BASE_PRECACHE_URLS, ...buildAssetUrls];
}
