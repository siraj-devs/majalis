import {
  createAuthSession,
  deleteSessionByToken,
  getAuthFromSessionToken,
  type SessionAuth,
} from "@/lib/auth-db";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "majalis_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function establishSession(params: { connectionId: string }) {
  const { token } = await createAuthSession(params);
  await setAuthCookie(token);
}

export async function getCurrentAuth(): Promise<SessionAuth | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return getAuthFromSessionToken(token);
}

/** Linked app user, or null if only a pending Telegram connection. */
export async function getCurrentUser() {
  const auth = await getCurrentAuth();
  return auth?.user ?? null;
}

export async function clearSession() {
  const token = await getAuthToken();
  if (token) {
    await deleteSessionByToken(token);
  }
  await removeAuthCookie();
}
