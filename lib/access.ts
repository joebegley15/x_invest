import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, expectedAccessValue } from "./access-token";

export async function hasAccess() {
  const value = (await cookies()).get(ACCESS_COOKIE)?.value;
  return value === (await expectedAccessValue());
}

export async function requireAccess() {
  if (!(await hasAccess())) redirect("/login");
}