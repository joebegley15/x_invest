import { requireJudge } from "@/lib/access";
import { getJudgeState } from "@/lib/judge-state";
import { JudgeVoting } from "./judge-voting";

export default async function JudgePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireJudge(`/judge/${slug}`);

  const state = await getJudgeState(slug);

  return <JudgeVoting slug={slug} initialState={state} />;
}
