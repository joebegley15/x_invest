import { getPublicState } from "@/lib/public-state";
import { subscribeLiveState } from "@/lib/live-broadcast";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let unsubscribe: () => void;
  let poll: ReturnType<typeof setInterval>;
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let lastSent = "";

      const send = (json: string) => {
        lastSent = json;
        controller.enqueue(encoder.encode(`data: ${json}\n\n`));
      };

      send(JSON.stringify(await getPublicState()));
      unsubscribe = subscribeLiveState(send);

      // Safety net in case a broadcast is missed (e.g. the write landed on a different instance).
      poll = setInterval(async () => {
        const json = JSON.stringify(await getPublicState());
        if (json !== lastSent) send(json);
      }, 1500);

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15000);
    },
    cancel() {
      unsubscribe?.();
      clearInterval(poll);
      clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
