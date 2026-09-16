import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows, contestants, judges, judgeVotes } from "@/lib/schema";
import { RunControls } from "./run-controls";
import { AudiencePanel } from "./audience-panel";

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
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">{show.name}</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        {showContestants.map((c) => (
          <div
            key={c.id}
            className={`rounded-lg border px-4 py-3 text-sm ${
              c.id === show.currentContestantId
                ? "border-zinc-900 dark:border-zinc-50"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <div className="font-medium">{c.startupName}</div>
            <div className="text-zinc-500">{c.status}</div>
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
          <p className="mt-8 text-zinc-500">No current contestant.</p>
        ))}

      {show.status === "audience" && (
        <AudiencePanel showId={id} audienceBonusConfirmed={show.audienceBonusConfirmed} />
      )}

      {show.status === "complete" && (
        <div className="mt-8 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">Show complete</h2>
          <Link
            href={`/results/${show.slug}`}
            className="mt-3 inline-block text-blue-600 underline dark:text-blue-400"
          >
            View results
          </Link>
        </div>
      )}
    </main>
  );
}
