// Centralized environment variable access & minimal validation
// Extend or integrate Zod later if stricter validation required.

interface RawEnv extends ImportMetaEnv {
  VITE_API_BASE_URL?: string;
  VITE_API_TIMEOUT?: string;
  VITE_API_RETRIES?: string;
  VITE_API_KEY?: string;
  VITE_ENABLE_API_LOGGING?: string;
  VITE_ENABLE_RETRIES?: string;
  VITE_DISABLE_REQUEST_DEDUPLICATION?: string;
  VITE_AVOID_CORS_PREFLIGHT?: string;
}

const raw = import.meta.env as unknown as RawEnv;

function num(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function optionalWarn(name: keyof RawEnv, required = true): string | undefined {
  const value = raw[name];
  if (!value && required) {
    // Soft warning; could throw to fail fast if desired
    console.warn(`[env] Missing required variable: ${name}`);
  }
  return value;
}

export const ENV = Object.freeze({
  MODE: raw.MODE,
  DEV: raw.DEV,
  PROD: raw.PROD,
  API_BASE_URL: optionalWarn("VITE_API_BASE_URL") || "",
  API_TIMEOUT: num(raw.VITE_API_TIMEOUT, 10000),
  API_RETRIES: num(raw.VITE_API_RETRIES, 0),
  API_KEY: optionalWarn("VITE_API_KEY", false) || "",
  ENABLE_API_LOGGING: raw.VITE_ENABLE_API_LOGGING === "true",
  ENABLE_RETRIES: raw.VITE_ENABLE_RETRIES !== "false",
  DISABLE_REQUEST_DEDUP: raw.VITE_DISABLE_REQUEST_DEDUPLICATION === "true",
  AVOID_CORS_PREFLIGHT: raw.VITE_AVOID_CORS_PREFLIGHT === "true",
});

export type EnvShape = typeof ENV;
