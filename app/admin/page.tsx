import Link from "next/link";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows } from "@/lib/schema";
import { NewShowForm } from "./new-show-form";
import { DeleteShowButton } from "./delete-show-button";
import { ShowTitle } from "@/app/components/show-title";
import { StatusBadge } from "@/app/components/status-badge";

export default async function AdminHomePage() {
  await requireAdmin("/admin");

  const allShows = await db.select().from(shows).orderBy(desc(shows.createdAt));

  return (
    <main className="min-h-screen bg-navy p-8">
      <div className="mx-auto max-w-3xl">
        <ShowTitle size="sm" />
        <h1 className="mt-6 font-display text-2xl uppercase tracking-[0.02em] text-white">
          Shows
        </h1>

        <ul className="mt-4 flex flex-col gap-2">
          {allShows.map((show) => (
            <li
              key={show.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-4 py-3 transition-colors hover:border-gold"
            >
              <Link href={`/admin/shows/${show.id}`} className="flex flex-1 items-center justify-between">
                <span className="font-display uppercase tracking-[0.02em] text-white">
                  {show.name}
                </span>
                <StatusBadge status={show.status} />
              </Link>
              <DeleteShowButton showId={show.id} showName={show.name} />
            </li>
          ))}
          {allShows.length === 0 && <p className="font-serif text-lavender">No shows yet.</p>}
        </ul>

        <h2 className="mt-8 font-display text-lg uppercase tracking-[0.02em] text-white">
          New show
        </h2>
        <NewShowForm />
      </div>
    </main>
  );
}
