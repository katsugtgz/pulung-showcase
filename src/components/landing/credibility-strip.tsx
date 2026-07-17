/*
 * Strip kredibilitas — sinyal kepercayaan ringkas di bawah hero:
 * - Terdaftar KORLANTAS POLRI & Dishub Surabaya
 * - 25+ tahun pengalaman
 * - Motto "Safe Drive Training"
 *
 * Ikon dekoratif diberi aria-hidden; teks lengkap menjadi aksesibilitas
 * names. Latar netral, aksen biru/merah sparingly.
 */
function ShieldIcon() {
  return (
    <svg
      className="h-6 w-6 text-primary"
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

function CalendarIcon() {
  return (
    <svg
      className="h-6 w-6 text-primary"
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

function SteerIcon() {
  return (
    <svg
      className="h-6 w-6 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={9} />
      <circle cx={12} cy={12} r={2.5} />
      <path d="M12 3v6.5M3.5 11.5H10M14 11.5h6.5M7.5 19l3.5-5M16.5 19L13 14"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface BadgeProps {
  icon: React.ReactNode;
  label: React.ReactNode;
}

function Badge({ icon, label }: BadgeProps) {
  return (
    <li className="flex flex-col items-center gap-2 px-2 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </span>
      <span className="text-xs font-medium leading-tight text-neutral-700">
        {label}
      </span>
    </li>
  );
}

export function CredibilityStrip() {
  return (
    <section
      aria-label="Kredibilitas"
      className="bg-neutral-50 px-6 pt-8 pb-6"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3 gap-3">
        <Badge
          icon={<ShieldIcon />}
          label={
            <>
              Terdaftar
              <br />
              <span className="font-semibold text-neutral-900">
                KORLANTAS POLRI
              </span>
              <br />
              &amp; Dishub Surabaya
            </>
          }
        />
        <Badge
          icon={<CalendarIcon />}
          label={
            <>
              <span className="text-lg font-black text-accent">25+</span>
              <br />
              tahun
              <br />
              <span className="font-semibold text-neutral-900">pengalaman</span>
            </>
          }
        />
        <Badge
          icon={<SteerIcon />}
          label={
            <>
              <span className="font-semibold text-neutral-900">
                Safe Drive
              </span>
              <br />
              <span className="font-semibold text-neutral-900">Training</span>
              <br />
              motto kami
            </>
          }
        />
      </ul>
    </section>
  );
}
