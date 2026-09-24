import type { AudienceCardState } from "@/lib/public-state";
import { AUDIENCE_BONUS_TOTAL } from "@/lib/scoring";
import { GreenlightPennant } from "./greenlight-pennant";

export function AudienceCard({
  data,
  mode,
}: {
  data: AudienceCardState;
  mode: "vote" | "bonus";
}) {
  const hasBonus = mode === "bonus" && data.audienceBonus > 0;
  const isDimmed = mode === "bonus" && data.audienceBonus === 0;
  const nameVw = Math.min(30, Math.max(8, 300 / Math.max(data.startupName.length, 1)));

  return (
    <div
      className={`flex flex-shrink-0 flex-col items-center justify-between gap-1 rounded-2xl px-3 py-3 text-center ${
        hasBonus
          ? "audience-card-gold border-[3px] border-white bg-gold"
          : isDimmed
            ? "audience-card-dim border border-line bg-panel opacity-60"
            : "border border-line bg-panel"
      }`}
      style={{
        width: "var(--tile-size)",
        height: "calc(var(--tile-size) * 1.35)",
        transform: hasBonus ? "scale(1.04)" : undefined,
      }}
    >
      <span
        className={`font-display uppercase leading-none tracking-[0.02em] ${hasBonus ? "text-navy" : "text-lavender"}`}
        style={{ fontSize: "clamp(0.7rem, 3cqw, 1.1rem)" }}
      >
        {data.position}
      </span>

      <span
        className={`line-clamp-2 flex-shrink-0 font-display uppercase leading-[0.95] tracking-[0.01em] ${
          hasBonus ? "text-navy" : "text-white"
        }`}
        style={{ fontSize: `clamp(0.9rem, ${nameVw}cqw, 2rem)` }}
      >
        {data.startupName}
      </span>

      <div className="flex flex-shrink-0 items-center gap-1.5" style={{ height: "clamp(14px, 5cqh, 28px)" }}>
        {Array.from({ length: Math.max(data.totalJudges, 1) }).map((_, i) => (
          <GreenlightPennant key={i} earned={i < data.yayPoints} muted={hasBonus} />
        ))}
      </div>

      <span
        className={`font-display uppercase leading-none tracking-[0.02em] ${hasBonus ? "text-navy" : "text-ice"}`}
        style={{ fontSize: "clamp(0.6rem, 2.4cqw, 1rem)" }}
      >
        {data.yayPoints} {data.yayPoints === 1 ? "Greenlight" : "Greenlights"}
      </span>

      <span
        className={`font-display uppercase leading-none tracking-[0.02em] ${hasBonus ? "text-navy" : "text-gold"}`}
        style={{ fontSize: "clamp(0.6rem, 2.4cqw, 1rem)" }}
      >
        {data.favoritePoints} {data.favoritePoints === 1 ? "Favorite" : "Favorites"}
      </span>

      {mode === "vote" && (
        <span
          className="rounded-full border border-gold px-2 py-1 font-display uppercase leading-none tracking-[0.02em] text-gold"
          style={{ fontSize: "clamp(0.55rem, 2cqw, 0.9rem)" }}
        >
          +{AUDIENCE_BONUS_TOTAL} up for grabs
        </span>
      )}

      {mode === "bonus" && (
        <>
          {hasBonus ? (
            <span
              className={`rounded-full bg-navy font-display uppercase leading-none tracking-[0.02em] text-gold ${
                data.audienceBonus === 2 ? "px-3 py-1.5" : "px-2.5 py-1"
              }`}
              style={{
                fontSize:
                  data.audienceBonus === 2 ? "clamp(0.7rem, 2.6cqw, 1.05rem)" : "clamp(0.58rem, 2.1cqw, 0.88rem)",
              }}
            >
              +{data.audienceBonus} audience
            </span>
          ) : (
            <span
              className="rounded-full border border-line px-2 py-1 font-display uppercase leading-none tracking-[0.02em] text-ice"
              style={{ fontSize: "clamp(0.55rem, 2cqw, 0.9rem)" }}
            >
              +0
            </span>
          )}

          <div className="flex items-baseline justify-center gap-2">
            <span
              className={`font-display uppercase leading-none tracking-[0.02em] ${hasBonus ? "text-navy" : "text-lavender"}`}
              style={{ fontSize: "clamp(0.55rem, 2cqw, 0.85rem)" }}
            >
              Total
            </span>
            <span
              className={`font-display ${hasBonus ? "text-navy" : "text-ice"}`}
              style={{ fontSize: "clamp(1.2rem, 5cqw, 2.5rem)", lineHeight: 1 }}
            >
              {data.total}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
