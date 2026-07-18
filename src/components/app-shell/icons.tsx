/*
 * Tab icons inline SVG untuk AppShell — lokal untuk app-shell; jika icon
 * vocabulary tumbuh di area app, pindah ke src/components/app-shell/icons.tsx
 * mengikuti pola landing/icons.tsx.
 *
 * Konvensi: 24x24 viewBox, stroke 1.8 (konsisten dengan landing/icons.tsx).
 * Color via currentColor — konsumen temakan dengan text-primary / text-neutral-*.
 * Server-safe — tidak ada "use client".
 */
interface IconProps {
  className?: string;
}

/** House — tab Beranda (/app). */
export function HomeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 10.5L12 3l9 7.5M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Calendar — tab Jadwal. */
export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect height="18" width="18" rx={2} x={3} y={4} />
      <path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round" />
    </svg>
  );
}

/** Document with lines — tab Invoice. */
export function InvoiceIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v5h5M9 13h6M9 17h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ID card — tab Kartu. */
export function CardIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect height="15" width="20" rx={2} x={2} y={5} />
      <circle cx={8} cy={11} r={1.6} />
      <path
        d="M5 16c.5-1.4 1.7-2.2 3-2.2s2.5.8 3 2.2M14 10h4M14 13h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
