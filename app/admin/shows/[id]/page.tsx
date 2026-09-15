import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows, judges, contestants } from "@/lib/schema";
import { ShowNameForm, JudgesForm, ContestantsForm } from "./forms";

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
    <main className="mx-auto max-w-3xl p-8">
      <p className="text-sm text-zinc-500">Status: {show.status}</p>

      <ShowNameForm showId={show.id} initialName={show.name} />

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Judges</h2>
        <JudgesForm
          showId={show.id}
          initialText={showJudges.map((j) => j.name).join("\n")}
          readOnly={!isSetup}
        />
        {showJudges.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1 text-sm">
            {showJudges.map((j) => (
              <li key={j.id}>
                <a
                  href={`/judge/${j.slug}`}
                  className="text-blue-600 underline dark:text-blue-400"
                >
                  {`/judge/${j.slug}`}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Contestants</h2>
        <ContestantsForm
          showId={show.id}
          initialText={showContestants.map((c) => c.startupName).join("\n")}
          readOnly={!isSetup}
        />
      </section>
    </main>
  );
}
