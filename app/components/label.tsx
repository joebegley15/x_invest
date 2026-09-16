export function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-display uppercase tracking-[0.02em] text-lavender ${className}`}
    >
      {children}
    </span>
  );
}
