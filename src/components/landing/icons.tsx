/**
 * Shared icon vocabulary for the refreshed landing (issue #50).
 *
 * Single source of truth — every section author imports from
 * `@/components/landing/icons` rather than re-declaring inline SVGs. Replaces
 * the duplicated WhatsappIcon (footer + location-picker), the file-local
 * PinIcon / ShieldIcon / CalendarIcon / SteerIcon / CheckIcon / StarIcon /
 * InstagramIcon / TiktokIcon, and the inline ArrowRight / ChevronDown paths.
 *
 * Conventions:
 *   - Named exports only (no default) — matches the landing barrel rule.
 *   - Every icon is decorative by default (`aria-hidden="true"`). If an icon
 *     carries meaning, the consuming section must add an accessible label via
 *     adjacent text or `aria-label` on the parent.
 *   - Color via `currentColor` (fill or stroke) so consumers theme with
 *     `text-primary`, `text-accent`, etc. — never hardcode brand hex here.
 *   - Sizing via `className` (e.g. `"h-5 w-5"`). No default size so the
 *     consuming section controls the visual rhythm.
 *   - ViewBox 24x24 for general icons, 20x20 for the small check/star glyphs
 *     (matches the original path data — re-scaling would distort them).
 *
 * Path data for the migrated icons is copied verbatim from the original
 * inline SVGs so the swap is visually identical. New icons (transmission
 * pictograms, NumberBadge) follow the same stroke vocabulary.
 *
 *   Server-safe — no `"use client"` directive. SVG renderers are static.
 */

interface IconProps {
  className?: string;
}

/* ----------------------------------------------------------------------------
 * Brand / contact icons (fill, 24x24)
 * --------------------------------------------------------------------------*/

/**
 * WhatsApp glyph. Corporate green color is the caller's responsibility
 * (`text-[#25D366]` per AGENTS.md sanctioned arbitrary value) — this component
 * only carries the shape and inherits color via `currentColor`.
 */
export function WhatsappIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

/** Instagram glyph (camera-square). */
export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

/** TikTok glyph (musical note). */
export function TiktokIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * Trust / credibility icons (stroke 1.8, 24x24)
 * --------------------------------------------------------------------------*/

/** Location pin — used in the location picker branch cards. */
export function PinIcon({ className }: IconProps) {
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
        d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={12} cy={10} r={2.5} />
    </svg>
  );
}

/** Shield with check — KORLANTAS POLRI / Dishub registration trust signal. */
export function ShieldIcon({ className }: IconProps) {
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
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Calendar — "Sejak 2000" founding-year trust signal. */
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

/** Steering wheel — "Safe Drive Training" motto trust signal. */
export function SteerIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={9} />
      <circle cx={12} cy={12} r={2.5} />
      <path
        d="M12 3v6.5M3.5 11.5H10M14 11.5h6.5M7.5 19l3.5-5M16.5 19L13 14"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * Small glyphs (fill, 20x20)
 * --------------------------------------------------------------------------*/

/** Check mark — package feature bullets (20x20 to match original path data). */
export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        clipRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        fillRule="evenodd"
      />
    </svg>
  );
}

/** Star — Google Maps rating badge (20x20). */
export function StarIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M10 1.5l2.47 5.29 5.78.73-4.25 4.02 1.1 5.73L10 14.47l-5.1 2.8 1.1-5.73-4.25-4.02 5.78-.73L10 1.5z" />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * Navigation / disclosure icons (stroke 2, 24x24)
 * --------------------------------------------------------------------------*/

/** Arrow pointing up-right — external link / "learn more" affordance. */
export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7M17 7H7M17 7v10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Chevron pointing down — accordion disclosure indicator. */
export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * Transmission pictograms (issue #50 story #10) — package card glyphs.
 * Stroke vocabulary 1.8, 24x24. Designed for legibility at h-6 w-6.
 * --------------------------------------------------------------------------*/

/** Manual transmission — gear-stick H-pattern with knob. */
export function ManualTransmissionIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx={12} cy={5} r={1.6} />
      <path
        d="M12 6.6v6.4M5 13h14M5 13v6M19 13v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Automatic transmission — selector gate with slider (PRND-style). */
export function MaticTransmissionIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect height={6} rx={1} width={18} x={3} y={9} />
      <path d="M7 9v3M11 9v3M15 9v3" strokeLinecap="round" />
      <circle cx={11} cy={12} r={1.4} />
    </svg>
  );
}

/** Mixed transmission — gear stick + selector side by side (MT + AT). */
export function MixedTransmissionIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx={6} cy={5} r={1.3} />
      <path
        d="M6 6.3v5.4M2 12h8M2 12v5M10 12v5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect height={5} rx={0.8} width={9} x={13} y={9.5} />
      <path d="M16 9.5v2.5" strokeLinecap="round" />
      <circle cx={16} cy={12} r={1.1} />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * "Cara Kerja" step number badge (issue #50 story #4)
 * --------------------------------------------------------------------------*/

interface NumberBadgeProps {
  /** Step numeral — accepts 1, 2, 3 for the three-step Cara Kerja flow. */
  number: 1 | 2 | 3;
  className?: string;
}

/**
 * Circled numeral for the Cara Kerja steps. Decorative by default
 * (`aria-hidden="true"`) — the adjacent step title carries the meaning, so
 * screen readers do not need to announce "1 / 2 / 3" twice.
 */
export function NumberBadge({ number, className }: NumberBadgeProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={10} />
      <text
        x={12}
        y={16}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="currentColor"
        stroke="none"
        fontFamily="inherit"
      >
        {number}
      </text>
    </svg>
  );
}

/* ----------------------------------------------------------------------------
 * Credibility / transmission icon resolvers moved to `./icon-resolvers.ts`
 * (pure functions, .ts file) to satisfy react-doctor only-export-components.
 * Re-exported via the landing barrel — see src/components/landing/index.ts.
 * --------------------------------------------------------------------------*/
