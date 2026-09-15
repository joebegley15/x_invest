export function slugifyShow(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyJudge(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
