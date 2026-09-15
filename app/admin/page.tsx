import { requireAccess } from "@/lib/access";

export default async function AdminHomePage() {
  await requireAccess();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Shows</h1>
      <p className="mt-4 text-zinc-500">Shows will appear here in Phase 3.</p>
    </main>
  );
}