export function ShowTitle({
  size,
  name,
}: {
  size: "lg" | "sm";
  name?: string;
}) {
  const title = (name || "Tastemakers").toUpperCase();

  if (size === "sm") {
    return (
      <span
        className="title-gradient font-display uppercase tracking-[0.02em]"
        style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}
      >
        {title}
      </span>
    );
  }

  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <p className="font-serif text-ice pb-6">Presented by Haha Hidalgo and Fabric</p>
      <h1
        className="title-gradient font-display uppercase tracking-[0.02em] leading-[0.9]"
        style={{ fontSize: "clamp(4rem, 12vw, 10rem)" }}
      >
        {title}
      </h1>
    </div>
  );
}
