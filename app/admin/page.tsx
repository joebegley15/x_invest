import Link from "next/link";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows } from "@/lib/schema";
import { NewShowForm } from "./new-show-form";

export default async function AdminHomePage() {
  await requireAdmin();

  const allShows = await db.select().from(shows).orderBy(desc(shows.createdAt));

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Shows</h1>

      <ul className="mt-4 flex flex-col gap-2">
        {allShows.map((show) => (
          <li key={show.id}>
            <Link
              href={`/admin/shows/${show.id}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <span className="font-medium">{show.name}</span>
              <span className="text-sm text-zinc-500">{show.status}</span>
            </Link>
          </li>
        ))}
        {allShows.length === 0 && <p className="text-zinc-500">No shows yet.</p>}
      </ul>

      <h2 className="mt-8 text-lg font-semibold">New show</h2>
      <NewShowForm />
    </main>
  );
}
