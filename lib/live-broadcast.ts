import { getPublicState } from "@/lib/public-state";

type Listener = (json: string) => void;

const listeners = new Set<Listener>();

export function subscribeLiveState(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function broadcastLiveState() {
  const json = JSON.stringify(await getPublicState());
  for (const listener of listeners) listener(json);
}
