import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export type UserRole = "user" | "manager" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type TokenPayload = {
  sub: string;
  role: UserRole;
};

export const authCookieName = "ruhani_token";

export function signAuthToken(user: { _id: unknown; role: UserRole }) {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ sub: String(user._id), role: user.role }, jwtSecret, { expiresIn });
}

export function setAuthCookie(token: string) {
  cookies().set(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAuthCookie() {
  cookies().delete(authCookieName);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = cookies().get(authCookieName)?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) return null;

  try {
    const payload = jwt.verify(token, jwtSecret) as TokenPayload;
    await connectToDatabase();
    const user = await User.findById(payload.sub).select("name email role").lean();

    if (!user) return null;

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role as UserRole
    };
  } catch {
    return null;
  }
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/account");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}
