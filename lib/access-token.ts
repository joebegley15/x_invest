export const ACCESS_COOKIE = "xi_access";

export async function expectedAccessValue() {
  const password = process.env.SITE_PASSWORD;
  if (!password) throw new Error("SITE_PASSWORD is not set");
  const data = new TextEncoder().encode(`x_invest:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}