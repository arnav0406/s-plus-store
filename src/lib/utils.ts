import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTenantURL(tenantSlug: string) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isSubdomainRoutingEnabled = process.env.NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING === "true";

  // In development or subdomain routing disabled mode, use normal routing
  if (isDevelopment || !isSubdomainRoutingEnabled) {
    // Strip trailing slashes. A trailing slash on NEXT_PUBLIC_APP_URL produces a
    // "//tenants/..." path, which the client router parses as a protocol-relative
    // URL — turning "tenants" into the hostname and breaking every prefetch.
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

    return `${appUrl}/tenants/${tenantSlug}`;
  }

  const protocol = "https";
  const domain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "").replace(/^\.+|\/+$/g, "");

  // In production, use subdomain routing
  return `${protocol}://${tenantSlug}.${domain}`;
};

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
};