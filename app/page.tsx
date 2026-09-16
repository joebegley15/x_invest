import { getPublicState } from "@/lib/public-state";
import { LiveDisplay } from "./live-display";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await getPublicState();
  return <LiveDisplay initialState={state} />;
}
