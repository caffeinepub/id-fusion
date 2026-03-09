import { IDFusionRole } from "../backend";

const ADMIN_CREDENTIALS = {
  username: "Irshad",
  password: "Irshad1327",
  role: IDFusionRole.admin,
};

const ROLE_CREDS_KEY = "idfusion_role_creds_v2";

export type RoleCreds = {
  id: string;
  username: string;
  password: string;
};

export type RoleCredsMap = {
  general: RoleCreds[];
  rto: RoleCreds[];
  passport: RoleCreds[];
  voter: RoleCreds[];
};

const NON_ADMIN_ROLES: Array<keyof RoleCredsMap> = [
  "general",
  "rto",
  "passport",
  "voter",
];

const DEFAULT_MAP: RoleCredsMap = {
  general: [],
  rto: [],
  passport: [],
  voter: [],
};

export function getRoleCreds(): RoleCredsMap {
  try {
    const raw = localStorage.getItem(ROLE_CREDS_KEY);
    if (!raw) return { ...DEFAULT_MAP };
    const parsed = JSON.parse(raw) as Partial<RoleCredsMap>;
    return {
      general: parsed.general ?? [],
      rto: parsed.rto ?? [],
      passport: parsed.passport ?? [],
      voter: parsed.voter ?? [],
    };
  } catch {
    return { ...DEFAULT_MAP };
  }
}

export function saveRoleCreds(map: RoleCredsMap): void {
  localStorage.setItem(ROLE_CREDS_KEY, JSON.stringify(map));
}

export function addRoleCred(
  role: keyof RoleCredsMap,
  username: string,
  password: string,
): void {
  const current = getRoleCreds();
  current[role] = [
    ...current[role],
    { id: crypto.randomUUID(), username: username.trim(), password },
  ];
  saveRoleCreds(current);
}

export function updateRoleCred(
  role: keyof RoleCredsMap,
  id: string,
  username: string,
  password: string,
): void {
  const current = getRoleCreds();
  current[role] = current[role].map((c) =>
    c.id === id ? { ...c, username: username.trim(), password } : c,
  );
  saveRoleCreds(current);
}

export function removeRoleCred(role: keyof RoleCredsMap, id: string): void {
  const current = getRoleCreds();
  current[role] = current[role].filter((c) => c.id !== id);
  saveRoleCreds(current);
}

export function validateCredentials(
  username: string,
  password: string,
): IDFusionRole | null {
  // Check admin first
  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    return ADMIN_CREDENTIALS.role;
  }

  // Check role credentials (multiple per role)
  const roleCreds = getRoleCreds();
  for (const role of NON_ADMIN_ROLES) {
    const list = roleCreds[role];
    if (list.some((c) => c.username === username && c.password === password)) {
      return IDFusionRole[role];
    }
  }

  return null;
}
