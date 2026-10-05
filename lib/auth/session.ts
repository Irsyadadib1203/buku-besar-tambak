import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "tambak_session";

export type UserRole = "SUPERADMIN" | "OWNER";

export interface SessionData {
  userId: string;
  username: string;
  role: UserRole;
  exp: number;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET harus berisi minimal 32 karakter.");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export async function createSession(data: Omit<SessionData, "exp">) {
  // Set expiry to 7 days
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const sessionData: SessionData = { ...data, exp };
  
  const payload = Buffer.from(JSON.stringify(sessionData)).toString("base64url");
  const signedValue = `${payload}.${sign(payload)}`;
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  
  if (!sessionCookie) return null;
  
  try {
    const [payload, signature] = sessionCookie.value.split(".");
    if (!payload || !signature) return null;

    const expected = Buffer.from(sign(payload));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as SessionData;
    
    if (data.exp < Date.now()) {
      return null;
    }
    
    return data;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
