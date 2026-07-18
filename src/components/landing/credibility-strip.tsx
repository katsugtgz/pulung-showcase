/*
 * Strip kredibilitas — sinyal kepercayaan ringkas di bawah hero:
 * - Terdaftar KORLANTAS POLRI & Dishub Surabaya
 * - Sejak 2000 (lebih dari 25 tahun)
 * - Motto "Safe Drive Training"
 *
 * Mobile-first: sebelumnya `grid-cols-3` di semua breakpoint memaksa teks
 * jadi 12px banyak-baris yang tidak terbaca. Sekarang mobile memakai satu
 * kolom (vertikal, napas lega), `sm+` kembali ke 3 kolom. Setiap badge
 * memakai permukaan tonal bergantian (bg-primary/5 vs bg-white) supaya tidak
 * terlihat sebagai tiga kartu identik. Data ikon + label + supporting line +
 * tone semuanya dari `getCredibility()` — tidak ada string hardcoded.
 */
import { getCredibility } from "@/lib/copy";
import type { CredibilityItem } from "@/lib/copy";
import { credibilityIconByKey } from "@/components/landing";

const surfaceClass: Record<CredibilityItem["surface"], string> = {
  primary: "bg-primary/10",
  white: "bg-white border border-neutral-200 shadow-sm",
};

export function CredibilityStrip() {
  const items = getCredibility();

  return (
    <section
      aria-label="Kredibilitas"
      className="bg-neutral-50 px-6 pt-8 pb-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10"
    >
      <ul className="mx-auto grid max-w-md grid-cols-1 gap-3 sm:max-w-4xl sm:grid-cols-3 sm:gap-4 lg:gap-8">
        {items.map((item) => {
          const Icon = credibilityIconByKey(item.icon);
          return (
            <li
              key={item.id}
              className={`flex items-center gap-3 rounded-2xl p-4 sm:flex-col sm:items-center sm:gap-3 sm:p-5 sm:text-center ${surfaceClass[item.surface]}`}
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary lg:h-14 lg:w-14">
                <Icon className="h-6 w-6" />
              </span>
              <div className="sm:mt-1">
                <p className="text-sm font-semibold leading-tight text-neutral-900 lg:text-base">
                  {item.label}
                </p>
                {item.supportingLine ? (
                  <p className="mt-0.5 text-xs leading-snug text-neutral-600 sm:mt-1 lg:text-sm">
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
