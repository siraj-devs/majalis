import { generateSessionToken, hashToken } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import type { AuthProvider, Role } from "@prisma/client";

const SESSION_DAYS = 7;

export type ConnectionInput = {
  provider: AuthProvider;
  providerId: string;
  name: string;
  username: string;
  avatar?: string | null;
};

/** Upsert Telegram (etc.) connection only — never creates a User. */
export async function upsertConnection(input: ConnectionInput) {
  const existing = await prisma.connection.findUnique({
    where: {
      provider_providerId: {
        provider: input.provider,
        providerId: input.providerId,
      },
    },
  });

  if (existing) {
    const connection = await prisma.connection.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        username: input.username,
        avatar: input.avatar ?? null,
        accessedAt: new Date(),
      },
    });
    return { connectionId: connection.id, userId: connection.userId };
  }

  const connection = await prisma.connection.create({
    data: {
      provider: input.provider,
      providerId: input.providerId,
      name: input.name,
      username: input.username,
      avatar: input.avatar ?? null,
    },
  });

  return { connectionId: connection.id, userId: null };
}

export async function createAuthSession(params: { connectionId: string }) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash,
      connectionId: params.connectionId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export type SessionAuth = {
  connectionId: string;
  connectionName: string;
  connectionUsername: string;
  connectionAvatar: string | null;
  provider: AuthProvider;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role: Role;
    isBlocked: boolean;
  } | null;
};

export async function getAuthFromSessionToken(
  token: string,
): Promise<SessionAuth | null> {
  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      connection: {
        include: { user: true },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session
        .delete({ where: { id: session.id } })
        .catch(() => {});
    }
    return null;
  }

  const { connection } = session;
  return {
    connectionId: connection.id,
    connectionName: connection.name,
    connectionUsername: connection.username,
    connectionAvatar: connection.avatar,
    provider: connection.provider,
    user: connection.user
      ? {
          id: connection.user.id,
          name: connection.user.name,
          image: connection.user.image,
          role: connection.user.role,
          isBlocked: connection.user.isBlocked,
        }
      : null,
  };
}
