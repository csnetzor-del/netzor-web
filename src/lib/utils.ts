import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Default billing currency for client dashboard & payments */
export const CLIENT_CURRENCY = "INR";

export function formatCurrency(
  amount: number,
  currency: string = CLIENT_CURRENCY
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Indian Rupee display (₹) — used in logged-in client dashboard */
export function formatRupee(amount: number) {
  return formatCurrency(amount, "INR");
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function generateClientCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `NZR-CL-${num}`;
}

export function generateTransactionId() {
  return `NZP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
