"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, expectedAccessValue } from "@/lib/access-token";

export type LoginState = { error?: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (password !== process.env.SITE_PASSWORD) {
    return { error: "Wrong password." };
  }

  (await cookies()).set(ACCESS_COOKIE, await expectedAccessValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  redirect(safeNext);
}