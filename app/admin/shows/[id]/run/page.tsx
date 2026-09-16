import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows, contestants, judges, judgeVotes } from "@/lib/schema";
import { RunControls } from "./run-controls";
import { AudiencePanel } from "./audience-panel";
import { ShowTitle } from "@/app/components/show-title";
import { StatusBadge } from "@/app/components/status-badge";

export default async function RunPage({
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
  if (show.status === "setup") redirect(`/admin/shows/${id}`);

  const showContestants = await db
    .select()
    .from(contestants)
    .where(eq(contestants.showId, id))
    .orderBy(contestants.position);

  const showJudges = await db.select().from(judges).where(eq(judges.showId, id)).orderBy(judges.id);

  const current = showContestants.find((c) => c.id === show.currentContestantId) ?? null;
  const isLastContestant =
    current !== null && !showContestants.some((c) => c.position > current.position);

  const votes =
    current && current.status === "revealed"
      ? await db
          .select({ judgeId: judgeVotes.judgeId, value: judgeVotes.value })
          .from(judgeVotes)
          .where(eq(judgeVotes.contestantId, current.id))
      : [];

  return (
    <main className="min-h-screen bg-navy p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <ShowTitle size="sm" name={show.name} />
          <StatusBadge status={show.status} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {showContestants.map((c) => (
            <div
              key={c.id}
              className={`rounded-lg border px-4 py-3 text-sm ${
                c.id === show.currentContestantId ? "border-gold" : "border-line"
              }`}
            >
              <div className="font-display uppercase tracking-[0.02em] text-white">
                {c.startupName}
              </div>
              <div className="font-serif text-lavender">{c.status}</div>
            </div>
          ))}
        </div>

        {show.status === "live" &&
          (current ? (
            <RunControls
              showId={id}
              contestant={current}
              judges={showJudges}
              votes={votes}
              isLastContestant={isLastContestant}
            />
          ) : (
            <p className="mt-8 font-serif text-lavender">No current contestant.</p>
          ))}

        {show.status === "audience" && (
          <AudiencePanel showId={id} audienceBonusConfirmed={show.audienceBonusConfirmed} />
        )}

        {show.status === "complete" && (
          <div className="mt-8 rounded-xl border border-line bg-panel p-6">
            <h2 className="font-display text-xl uppercase tracking-[0.02em] text-white">
              Show complete
            </h2>
            <Link
              href={`/results/${show.slug}`}
              className="mt-3 inline-block font-serif text-gold underline"
            >
              View results
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
