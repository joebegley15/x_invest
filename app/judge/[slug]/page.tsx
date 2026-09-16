import { requireJudge } from "@/lib/access";
import { getJudgeState } from "@/lib/judge-state";
import { JudgeVoting } from "./judge-voting";

export default async function JudgePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireJudge();

  const { slug } = await params;
  const state = await getJudgeState(slug);

  return <JudgeVoting slug={slug} initialState={state} />;
}
