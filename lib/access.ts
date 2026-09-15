import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, JUDGE_COOKIE, expectedAdminValue, expectedJudgeValue } from "./access-token";

export async function hasAdminAccess() {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return value === (await expectedAdminValue());
}

export async function hasJudgeAccess() {
  const value = (await cookies()).get(JUDGE_COOKIE)?.value;
  return value === (await expectedJudgeValue());
}

export async function requireAdmin() {
  if (!(await hasAdminAccess())) redirect("/login?role=admin");
}

export async function requireJudge() {
  if (!(await hasJudgeAccess())) redirect("/login?role=judge");
}
