import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { shows } from "@/lib/schema";
import { getScoreboard } from "@/lib/results";
import { Scoreboard } from "@/app/scoreboard";
import { Starfield } from "@/app/components/starfield";
import { ShowTitle } from "@/app/components/show-title";

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
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-navy p-8 text-center">
        <Starfield />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <ShowTitle size="sm" name={show.name} />
          <p className="font-serif text-ice">Results are not final yet.</p>
        </div>
      </main>
    );
  }

  const scoreboard = await getScoreboard(show.id);
  if (!scoreboard) notFound();

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-navy p-6 sm:p-8">
      <Starfield />
      <div className="relative z-10 flex w-full flex-col items-center gap-8 py-8">
        <Scoreboard
          showName={scoreboard.showName}
          rows={scoreboard.rows}
          winnerContestantId={scoreboard.winnerContestantId}
          titleSize="sm"
        />
      </div>
    </main>
  );
}
