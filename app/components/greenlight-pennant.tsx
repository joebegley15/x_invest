const C = {
  earned: "var(--color-vote-in)",
  unearned: "var(--color-line)",
  muted: "#b89a6e",
};

export function GreenlightPennant({
  earned,
  muted = false,
}: {
  earned: boolean;
  muted?: boolean;
}) {
  const color = earned ? C.earned : muted ? C.muted : C.unearned;
  const poleColor = earned ? "#fff" : color;

  return (
    <svg viewBox="0 0 22 26" role="presentation" aria-hidden="true" className="h-full w-auto">
      <line x1="4" y1="2" x2="4" y2="24" stroke={poleColor} strokeWidth="2" />
      <path d="M4 2 L19 7 L4 12 Z" fill={color} />
    </svg>
  );
}
