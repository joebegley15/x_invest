"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, JUDGE_COOKIE, expectedAdminValue, expectedJudgeValue } from "@/lib/access-token";

export type LoginState = { error?: string } | undefined;

function safeNext(next: string, fallback: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const role = formData.get("role") === "judge" ? "judge" : "admin";
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };

  if (role === "judge") {
    if (password !== process.env.JUDGE_PASSWORD) return { error: "Wrong password." };
    cookieStore.set(JUDGE_COOKIE, await expectedJudgeValue(), cookieOptions);
    redirect(safeNext(next, "/"));
  }

  if (password !== process.env.ADMIN_PASSWORD) return { error: "Wrong password." };
  cookieStore.set(ADMIN_COOKIE, await expectedAdminValue(), cookieOptions);
  redirect(safeNext(next, "/admin"));
}
