// Vercel compiles the public demonstration build without Cloudflare bindings.
// The browser automatically falls back to device-local mode when these are absent.
export const env: Record<string, never> = {};
