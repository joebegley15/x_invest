const styles: Record<string, string> = {
  setup: "border border-lavender text-lavender bg-transparent",
  live: "bg-vote-in text-navy",
  audience: "bg-lavender text-navy",
  complete: "bg-gold text-navy",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 font-display text-xs uppercase tracking-[0.02em] ${
        styles[status] ?? styles.setup
      }`}
    >
      {status}
    </span>
  );
}
