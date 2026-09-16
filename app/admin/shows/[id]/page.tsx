import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows, judges, contestants } from "@/lib/schema";
import { ShowNameForm, StartShowForm, JudgesForm, ContestantsForm } from "./forms";
import { ShowTitle } from "@/app/components/show-title";
import { StatusBadge } from "@/app/components/status-badge";

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const [show] = await db.select().from(shows).where(eq(shows.id, id));
  if (!show) notFound();

  const showJudges = await db.select().from(judges).where(eq(judges.showId, id)).orderBy(judges.id);
  const showContestants = await db
    .select()
    .from(contestants)
    .where(eq(contestants.showId, id))
    .orderBy(contestants.position);

  const isSetup = show.status === "setup";

  return (
    <main className="min-h-screen bg-navy p-8">
      <div className="mx-auto max-w-3xl">
        <ShowTitle size="sm" name={show.name} />

        <div className="mt-6 flex items-center gap-3">
          <StatusBadge status={show.status} />
        </div>

        <ShowNameForm showId={show.id} initialName={show.name} />

        {isSetup ? (
          <StartShowForm showId={show.id} />
        ) : (
          <Link
            href={`/admin/shows/${show.id}/run`}
            className="mt-4 inline-block font-serif text-gold underline"
          >
            Go to run screen
          </Link>
        )}

        <section className="mt-8 rounded-xl border border-line bg-panel p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.02em] text-white">Judges</h2>
          <JudgesForm
            showId={show.id}
            initialText={showJudges.map((j) => j.name).join("\n")}
            readOnly={!isSetup}
          />
          {showJudges.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1 text-sm">
              {showJudges.map((j) => (
                <li key={j.id}>
                  <a href={`/judge/${j.slug}`} className="font-serif text-gold underline">
                    {`/judge/${j.slug}`}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-line bg-panel p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.02em] text-white">
            Contestants
          </h2>
          <ContestantsForm
            showId={show.id}
            initialText={showContestants.map((c) => c.startupName).join("\n")}
            readOnly={!isSetup}
          />
        </section>
      </div>
    </main>
  );
}
