import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export const MOBILE_TOKEN_SECRET =
  process.env.NEXTAUTH_SECRET || "tarek-store-secret-key-change-in-production";

export const MOBILE_TOKEN_EXPIRES_IN = "30d";

export interface AuthUser {
  id: string;
  uniqueId: string;
  role: string;
  email: string;
  name: string | null;
}

interface MobileTokenPayload {
  id: string;
  uniqueId: string;
  role: string;
}

export function signMobileToken(payload: MobileTokenPayload): string {
  return jwt.sign(payload, MOBILE_TOKEN_SECRET, {
    expiresIn: MOBILE_TOKEN_EXPIRES_IN,
  });
}

function readBearerToken(req?: NextRequest): string | null {
  const header = req?.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

async function getUserFromBearer(req?: NextRequest): Promise<AuthUser | null> {
  const token = readBearerToken(req);
  if (!token) return null;

  let payload: MobileTokenPayload;
  try {
    payload = jwt.verify(token, MOBILE_TOKEN_SECRET) as MobileTokenPayload;
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) return null;

  return {
    id: user.id,
    uniqueId: user.uniqueId,
    role: user.role,
    email: user.email,
    name: user.name,
  };
}

/**
 * Resolves the caller from either a NextAuth web session cookie or a
 * `Authorization: Bearer <token>` header issued by /api/mobile/login.
 */
export async function getAuthUser(req?: NextRequest): Promise<AuthUser | null> {
  const bearerUser = await getUserFromBearer(req);
  if (bearerUser) return bearerUser;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    uniqueId: session.user.uniqueId,
    role: session.user.role,
    email: session.user.email || "",
    name: session.user.name ?? null,
  };
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin" || user?.role === "superadmin";
}

export async function canManageSupport(user: AuthUser | null): Promise<boolean> {
  if (!user) return false;
  if (user.role === "superadmin") return true;

  const permissions = await prisma.subAdminPermission.findUnique({
    where: { userId: user.id },
  });
  if (permissions?.manageSupport) return true;

  return user.role === "admin";
}
