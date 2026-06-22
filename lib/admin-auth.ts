import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "gc_admin_session";
export const ADMIN_HINT_COOKIE = "gc_admin_hint";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AdminSession = {
  adminId: number;
  username: string;
  displayName: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET이 설정되지 않았습니다.");
  }

  return secret;
}

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, originalHash] = storedHash.split("$");

  if (scheme !== "scrypt" || !salt || !originalHash) {
    return false;
  }

  const candidateHash = scryptSync(password, salt, 64).toString("hex");
  const original = Buffer.from(originalHash, "hex");
  const candidate = Buffer.from(candidateHash, "hex");

  return original.length === candidate.length && timingSafeEqual(original, candidate);
}

export function createSessionToken(session: Omit<AdminSession, "exp">) {
  const payload: AdminSession = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AdminSession;

    if (!payload.adminId || !payload.username || !payload.displayName || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE
  };
}
