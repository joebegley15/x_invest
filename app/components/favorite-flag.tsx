/** Small gold summit flag: one per judge pick on a favorite card. */
export function FavoriteFlag() {
  return (
    <svg viewBox="0 0 24 28" role="presentation" aria-hidden="true" className="h-full w-auto">
      <path d="M0 27 L12 13 L24 27 Z" fill="var(--color-dusk)" />
      <line x1="12" y1="2" x2="12" y2="16" stroke="#fff" strokeWidth="2" />
      <path d="M12 2 L23 6 L12 10 Z" fill="var(--color-gold)" />
    </svg>
  );
}
