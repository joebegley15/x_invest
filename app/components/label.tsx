export function Label({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`font-display uppercase tracking-[0.02em] text-lavender ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
