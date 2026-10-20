import { isAdminRequest } from "@/lib/adminGuard";

// Set MAINTENANCE_MODE=true to show the "coming soon" page to visitors.
// A logged-in admin still sees the real site, to preview it.
export function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === "true";
}

export async function isHiddenFromVisitor(): Promise<boolean> {
  return isMaintenanceMode() && !(await isAdminRequest());
}
