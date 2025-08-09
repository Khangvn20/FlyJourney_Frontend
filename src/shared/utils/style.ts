import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merge helper (moved from lib/utils.ts)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
