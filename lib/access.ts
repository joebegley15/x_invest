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

export async function requireAdmin(path?: string) {
  if (!(await hasAdminAccess())) {
    const next = path ? `&next=${encodeURIComponent(path)}` : "";
    redirect(`/login?role=admin${next}`);
  }
}

export async function requireJudge(path?: string) {
  if (!(await hasJudgeAccess())) {
    const next = path ? `&next=${encodeURIComponent(path)}` : "";
    redirect(`/login?role=judge${next}`);
  }
}
