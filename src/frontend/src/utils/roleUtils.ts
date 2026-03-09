import { IDFusionRole } from "../backend";

export const ROLE_LABELS: Record<IDFusionRole, string> = {
  [IDFusionRole.admin]: "Administrator",
  [IDFusionRole.general]: "General",
  [IDFusionRole.rto]: "RTO Officer",
  [IDFusionRole.passport]: "Passport Officer",
  [IDFusionRole.voter]: "Voter Officer",
};

export const ROLE_COLORS: Record<IDFusionRole, string> = {
  [IDFusionRole.admin]: "text-accent",
  [IDFusionRole.general]: "text-primary",
  [IDFusionRole.rto]: "text-emerald-400",
  [IDFusionRole.passport]: "text-purple-400",
  [IDFusionRole.voter]: "text-orange-400",
};

export const ROLE_BG_COLORS: Record<IDFusionRole, string> = {
  [IDFusionRole.admin]: "bg-accent/10 border-accent/30",
  [IDFusionRole.general]: "bg-primary/10 border-primary/30",
  [IDFusionRole.rto]: "bg-emerald-500/10 border-emerald-500/30",
  [IDFusionRole.passport]: "bg-purple-500/10 border-purple-500/30",
  [IDFusionRole.voter]: "bg-orange-500/10 border-orange-500/30",
};

export const ROLE_ICONS: Record<IDFusionRole, string> = {
  [IDFusionRole.admin]: "🛡️",
  [IDFusionRole.general]: "👤",
  [IDFusionRole.rto]: "🚗",
  [IDFusionRole.passport]: "✈️",
  [IDFusionRole.voter]: "🗳️",
};

export const ROLE_DESCRIPTIONS: Record<IDFusionRole, string> = {
  [IDFusionRole.admin]: "Full access — manage all identity records",
  [IDFusionRole.general]: "View Aadhaar, PAN & Ration Card",
  [IDFusionRole.rto]: "View Driving License & RC Card",
  [IDFusionRole.passport]: "View Passport records",
  [IDFusionRole.voter]: "View Voter ID records",
};

export const PENDING_ROLE_KEY = "idfusion_pending_role";

export function savePendingRole(role: IDFusionRole) {
  localStorage.setItem(PENDING_ROLE_KEY, role);
}

export function getPendingRole(): IDFusionRole | null {
  const stored = localStorage.getItem(PENDING_ROLE_KEY);
  if (!stored) return null;
  if (Object.values(IDFusionRole).includes(stored as IDFusionRole)) {
    return stored as IDFusionRole;
  }
  return null;
}

export function clearPendingRole() {
  localStorage.removeItem(PENDING_ROLE_KEY);
}
