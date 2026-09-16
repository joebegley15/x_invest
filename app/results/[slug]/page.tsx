import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { shows } from "@/lib/schema";
import { getScoreboard } from "@/lib/results";
import { Scoreboard } from "@/app/scoreboard";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [show] = await db.select().from(shows).where(eq(shows.slug, slug));
  if (!show) notFound();

  if (show.status !== "complete") {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-semibold">{show.name}</h1>
        <p className="text-zinc-500">Results are not final yet.</p>
      </main>
    );
  }

  const scoreboard = await getScoreboard(show.id);
  if (!scoreboard) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 p-8">
      <h1 className="text-3xl font-semibold">{scoreboard.showName}</h1>
      <Scoreboard rows={scoreboard.rows} winnerContestantId={scoreboard.winnerContestantId} />
    </main>
  );
}
