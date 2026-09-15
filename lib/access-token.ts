export const ADMIN_COOKIE = "xi_admin";
export const JUDGE_COOKIE = "xi_judge";

async function hash(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function expectedAdminValue() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not set");
  return hash(`x_invest:admin:${password}`);
}

export async function expectedJudgeValue() {
  const password = process.env.JUDGE_PASSWORD;
  if (!password) throw new Error("JUDGE_PASSWORD is not set");
  return hash(`x_invest:judge:${password}`);
}
