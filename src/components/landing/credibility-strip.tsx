/*
 * Strip kredibilitas — sinyal kepercayaan ringkas di bawah hero:
 * - Terdaftar KORLANTAS POLRI & Dishub Surabaya
 * - Sejak 2000 (lebih dari 25 tahun)
 * - Motto "Safe Drive Training"
 *
 * Redesign "rambu": bukan tiga kartu seragam — satu pita putih dengan
 * pembatas garis rambut; ikon duduk di chip biru bujur sangkar
 * (seperti rambu petunjuk). Data ikon/label/supporting line dari
 * `getCredibility()` — tidak ada string hardcode.
 */
import { getCredibility } from "@/lib/copy";
import type { CredibilityItem } from "@/lib/copy";
import { credibilityIconByKey } from "@/components/landing";

export function CredibilityStrip() {
  const items = getCredibility();

  return (
    <section
      aria-label="Kredibilitas"
      className="border-b border-neutral-200 bg-white px-6 py-8 lg:px-8 lg:py-10"
    >
      <ul className="mx-auto grid max-w-md grid-cols-1 gap-y-6 sm:max-w-6xl sm:grid-cols-3 sm:gap-y-0 sm:divide-x sm:divide-neutral-200">
        {items.map((item) => {
          const Icon = credibilityIconByKey(item.icon);
          return (
            <li
              key={item.id}
              className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3 sm:px-6 sm:first:pl-0 sm:last:pr-0"
            >
              {/* Sign chip: blue square with white border ring, like a
                  blue direction sign (rambu petunjuk). */}
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-primary text-white ring-2 ring-white ring-offset-2 ring-offset-primary/20 lg:h-14 lg:w-14">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-base font-bold uppercase tracking-wide leading-tight text-neutral-900 lg:text-lg">
                  {item.label}
                </p>
                {item.supportingLine ? (
                  <p className="mt-1 text-xs leading-snug text-neutral-600 lg:text-sm">
                    {item.supportingLine}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
