import type { FavoriteCardState } from "@/lib/public-state";
import { FavoriteFlag } from "./favorite-flag";

export function FavoriteCard({ data, revealed }: { data: FavoriteCardState; revealed: boolean }) {
  const hasPicks = revealed && data.favorites > 0;
  const isDimmed = revealed && data.favorites === 0;
  const nameVw = Math.min(30, Math.max(8, 300 / Math.max(data.startupName.length, 1)));

  return (
    <div
      className={`flex flex-shrink-0 flex-col items-center justify-between gap-2 rounded-2xl px-3 py-4 text-center ${
        hasPicks
          ? "border-[3px] border-gold bg-panel"
          : isDimmed
            ? "border border-line bg-panel opacity-60"
            : "border border-line bg-panel"
      }`}
      style={{
        width: "var(--tile-size)",
        height: "calc(var(--tile-size) * 1.35)",
        transform: hasPicks ? "scale(1.04)" : undefined,
      }}
    >
      <span
        className="font-display uppercase tracking-[0.02em] text-lavender"
        style={{ fontSize: "clamp(1.4rem, 7cqw, 3.5rem)", lineHeight: 1 }}
      >
        {data.position}
      </span>

      <span
        className="line-clamp-2 font-display uppercase leading-[0.95] tracking-[0.01em] text-white"
        style={{ fontSize: `clamp(0.9rem, ${nameVw}cqw, 2rem)` }}
      >
        {data.startupName}
      </span>

      {revealed ? (
        <>
          <div
            className="flex flex-wrap items-end justify-center gap-1.5"
            style={{ height: "clamp(24px, 9cqh, 48px)" }}
          >
            {Array.from({ length: data.favorites }).map((_, i) => (
              <FavoriteFlag key={i} />
            ))}
          </div>
          <span
            className={`font-display uppercase tracking-[0.02em] ${hasPicks ? "text-gold" : "text-ice"}`}
            style={{ fontSize: "clamp(0.7rem, 2.6cqw, 1.2rem)" }}
          >
            {data.favorites} {data.favorites === 1 ? "Favorite" : "Favorites"}
          </span>
        </>
      ) : (
        <span
          className="font-display uppercase tracking-[0.02em] text-lavender"
          style={{ fontSize: "clamp(0.7rem, 2.6cqw, 1.2rem)" }}
        >
          Waiting
        </span>
      )}
    </div>
  );
}
