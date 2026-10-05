import { getCurrentAuth, getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login");
  return auth;
}

export async function requireUser() {
  const auth = await requireAuth();
  if (!auth.user || auth.user.isBlocked) redirect("/unauthorized");
  return { ...auth.user, connectionUsername: auth.connectionUsername };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/unauthorized");
  return user;
}
