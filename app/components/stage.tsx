import { Starfield } from "./starfield";
import { IceStrip } from "./ice-strip";
import { Label } from "./label";

export function Stage({
  showName,
  label,
  itemCount = 1,
  children,
}: {
  showName?: string;
  label?: React.ReactNode;
  itemCount?: number;
  children?: React.ReactNode;
}) {
  const title = (showName || "Tastemakers").toUpperCase();
  // Calibrated so a ~17-char name (e.g. "TASTEMAKERS DEMO") hits 7vw; longer
  // names scale the vw coefficient down so they still fit on one line.
  const titleVw = (7 * 17) / Math.max(title.length, 1);
  const titleFontSize = `clamp(1.25rem, ${titleVw}vw, 8rem)`;
  const labelFontSize = "clamp(2rem, 3.5vw, 4rem)";
  // Shared by the judge tiles and the audience-vote cards so both render at
  // the exact same size for the same item count; shrinks as items grow past 4.
  const tileSize = `min(${Math.floor(88 / Math.max(itemCount, 1))}cqw, 45cqh, 26vw, 420px)`;

  return (
    <div className="relative grid h-dvh grid-rows-[auto_1fr_auto] overflow-hidden bg-navy">
      <Starfield />

      <header
        className="relative z-10 flex flex-col items-center px-6 text-center"
        style={{ paddingTop: "3vh" }}
      >
        <p className="font-serif text-ice pb-1 text-sm sm:text-base">
          Presented by Haha Hidalgo and Fabric
        </p>
        <h1
          className="title-gradient font-display uppercase tracking-[0.02em] leading-[0.9] whitespace-nowrap"
          style={{ fontSize: titleFontSize }}
        >
          {title}
        </h1>
        <div
          className="mt-3 flex items-center justify-center"
          style={{ minHeight: labelFontSize }}
        >
          {label ? (
            <Label style={{ fontSize: labelFontSize, lineHeight: 1 }}>{label}</Label>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 justify-center px-6 sm:px-8">
        <div
          className="h-full w-full"
          style={
            {
              maxWidth: "min(90vw, 1600px)",
              containerType: "size",
              "--tile-size": tileSize,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </main>

      <IceStrip />
    </div>
  );
}
